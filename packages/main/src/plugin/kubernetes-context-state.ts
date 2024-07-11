/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type { IncomingMessage } from 'node:http';

import type {
  Cluster,
  Context,
  Informer,
  KubernetesListObject,
  KubernetesObject,
  ListPromise,
  ObjectCache,
  User,
  V1ConfigMap,
  V1ConfigMapList,
  V1Deployment,
  V1DeploymentList,
  V1Ingress,
  V1IngressList,
  V1Node,
  V1NodeList,
  V1ObjectMeta,
  V1PersistentVolumeClaim,
  V1PersistentVolumeClaimList,
  V1Pod,
  V1PodList,
  V1Secret,
  V1SecretList,
  V1Service,
  V1ServiceList,
} from '@kubernetes/client-node';
import {
  AppsV1Api,
  CoreV1Api,
  CustomObjectsApi,
  KubeConfig,
  makeInformer,
  NetworkingV1Api,
} from '@kubernetes/client-node';

import type { V1Route } from '/@api/openshift-types.js';

import type { ApiSenderType } from './api.js';
import type { KubeContext } from './kubernetes-context.js';
import {
  backoffInitialValue,
  backoffJitter,
  backoffLimit,
  connectTimeout,
  dispatchTimeout,
} from './kubernetes-context-state-constants.js';

// If the number of contexts in the kubeconfig file is greater than this number,
// only the connectivity to the current context will be checked
const MAX_NON_CURRENT_CONTEXTS_TO_CHECK = 10;

// ContextInternalState stores informers for a kube context
type ContextInternalState = Map<ResourceName, Informer<KubernetesObject> & ObjectCache<KubernetesObject>>;

// CheckingState indicates the state of the check for a context
export interface CheckingState {
  state: 'waiting' | 'checking' | 'gaveup';
}

// ContextState stores information for the user about a kube context: is the cluster reachable, the number
// of instances of different resources
interface ContextState {
  checking: CheckingState;
  error?: string;
  reachable: boolean;
  resources: ContextStateResources;
}

// A selection of resources, to indicate the 'general' status of a context
const selectedResources = ['pods', 'deployments'] as const;

// resources managed by podman desktop, excepted the primary ones
// This is where to add new resources when adding new informers
const secondaryResources = [
  'services',
  'ingresses',
  'routes',
  'configmaps',
  'secrets',
  'nodes',
  'persistentvolumeclaims',
] as const;

export type SelectedResourceName = (typeof selectedResources)[number];
export type SecondaryResourceName = (typeof secondaryResources)[number];
export type ResourceName = SelectedResourceName | SecondaryResourceName;

function isSecondaryResourceName(value: string): value is SecondaryResourceName {
  return secondaryResources.includes(value as SecondaryResourceName);
}

export type ContextStateResources = {
  [resourceName in ResourceName]: KubernetesObject[];
};

// information sent: status and count of selected resources
export interface ContextGeneralState {
  checking?: CheckingState;
  error?: string;
  reachable: boolean;
  resources: SelectedResourcesCount;
}

export type SelectedResourcesCount = {
  [resourceName in SelectedResourceName]: number;
};

interface CreateInformerOptions<T> {
  // resource name, for logging
  resource: string;
  // indicate if the informer for this resource will be used to compute if the context is reachable
  checkReachable?: boolean;
  // called when a new resource addition is detected by the informer
  onAdd?: (obj: T) => void;
  // called when a new resource update is detected by the informer
  onUpdate?: (obj: T) => void;
  // called when a new resource deletion is detected by the informer
  onDelete?: (obj: T) => void;
  // called when the context is considered as reachable / non reachable
  onReachable?: (reachable: boolean) => void;
  // called when an error occurs during connection attempt and an error message is available
  onConnectionError?: (error: string) => void;
  // used to retry connection when connection fails
  timer: NodeJS.Timeout | undefined;
  // increments the time between two connections attempts
  backoff: Backoff;
  // used to delay setting the context reachable after the 'connect' event
  connectionDelay: NodeJS.Timeout | undefined;
}

type ResourcesDispatchOptions = {
  [resourceName in ResourceName]?: boolean;
};

const dispatchAllResources: ResourcesDispatchOptions = {
  pods: true,
  deployments: true,
  services: true,
  nodes: true,
  persistentvolumeclaims: true,
  ingresses: true,
  routes: true,
  configmaps: true,
  secrets: true,
  // add new resources here when adding new informers
};

interface DispatchOptions {
  // do we send information about contexts connectivity checking?
  checkingState: boolean;
  // do we send general context for all contexts?
  contextsGeneralState: boolean;
  // do we send general context for current context?
  currentContextGeneralState: boolean;
  // do we send resources data for each resource kind? default false for all resources
  resources: ResourcesDispatchOptions;
}

class Backoff {
  private readonly initial: number;
  constructor(
    public value: number,
    private readonly max: number,
    private readonly jitter: number,
  ) {
    this.initial = value;
    this.value += this.getJitter();
  }
  get(): number {
    const current = this.value;
    if (this.value < this.max) {
      this.value *= 2;
      this.value += this.getJitter();
    }
    return current;
  }
  reset(): void {
    this.value = this.initial + this.getJitter();
  }

  private getJitter(): number {
    return Math.floor(this.jitter * Math.random());
  }
}

export class ContextsStates {
  private state = new Map<string, ContextState>();
  private informers = new Map<string, ContextInternalState>();

  hasContext(name: string): boolean {
    return this.informers.has(name);
  }

  hasInformer(context: string, resourceName: ResourceName): boolean {
    const informers = this.informers.get(context);
    return !!informers?.get(resourceName);
  }

  setInformers(name: string, informers: ContextInternalState | undefined): void {
    if (informers) {
      this.informers.set(name, informers);
    }
  }

  setResourceInformer(
    contextName: string,
    resourceName: ResourceName,
    informer: Informer<KubernetesObject> & ObjectCache<KubernetesObject>,
  ): void {
    const informers = this.informers.get(contextName);
    if (!informers) {
      throw new Error(`watchers for context ${contextName} not found`);
    }
    informers.set(resourceName, informer);
  }

  getContextsNames(): Iterable<string> {
    return this.informers.keys();
  }

  getContextsGeneralState(): Map<string, ContextGeneralState> {
    const result = new Map<string, ContextGeneralState>();
    this.state.forEach((val, key) => {
      result.set(key, {
        ...val,
        resources: {
          pods: val.reachable ? val.resources.pods.length : 0,
          deployments: val.reachable ? val.resources.deployments.length : 0,
        },
      });
    });
    return result;
  }

  getContextsCheckingState(): Map<string, CheckingState> {
    const result = new Map<string, CheckingState>();
    this.state.forEach((val, key) => {
      result.set(key, val.checking);
    });
    return result;
  }

  getCurrentContextGeneralState(current: string): ContextGeneralState {
    if (current) {
      const state = this.state.get(current);
      if (state) {
        return {
          ...state,
          resources: {
            pods: state.reachable ? state.resources.pods.length : 0,
            deployments: state.reachable ? state.resources.deployments.length : 0,
          },
        };
      }
    }
    return {
      reachable: false,
      error: 'no current context',
      resources: { pods: 0, deployments: 0 },
    };
  }

  getContextResources(current: string, resourceName: ResourceName): KubernetesObject[] {
    if (current) {
      const state = this.state.get(current);
      if (!state?.reachable) {
        return [];
      }
      if (state) {
        return state.resources[resourceName];
      }
    }
    return [];
  }

  isReachable(contextName: string): boolean {
    return this.state.get(contextName)?.reachable ?? false;
  }

  safeSetState(name: string, update: (previous: ContextState) => void): void {
    if (!this.state.has(name)) {
      this.state.set(name, {
        checking: { state: 'waiting' },
        error: undefined,
        reachable: false,
        resources: {
          pods: [],
          deployments: [],
          nodes: [],
          persistentvolumeclaims: [],
          services: [],
          ingresses: [],
          routes: [],
          configmaps: [],
          secrets: [],
          // add new resources here when adding new informers
        },
      });
    }
    const val = this.state.get(name);
    if (!val) {
      throw new Error('value not correctly set in map');
    }
    update(val);
  }

  async dispose(name: string): Promise<void> {
    const informers = this.informers.get(name);
    if (informers) {
      for (const informer of informers.values()) {
        await informer.stop();
      }
    }
    this.informers.delete(name);
    this.state.delete(name);
  }

  async disposeSecondaryInformers(contextName: string): Promise<void> {
    const informers = this.informers.get(contextName);
    if (informers) {
      for (const [resourceName, informer] of informers) {
        if (isSecondaryResourceName(resourceName)) {
          await informer?.stop();
          // We clear the informer and the local state
          informers.delete(resourceName);
          const state = this.state.get(contextName);
          if (state) {
            state.resources[resourceName] = [];
          }
        }
      }
    }
  }
}

class SecondaryResourceWatchersRegistry {
  // Map resourceName to number of watchers
  private watchingSecondaryResource = new Map<string, number>();

  subscribe(resourceName: string): void {
    let count = this.watchingSecondaryResource.get(resourceName);
    if (count === undefined) {
      this.watchingSecondaryResource.set(resourceName, 0);
      count = 0;
    }
    this.watchingSecondaryResource.set(resourceName, count + 1);
  }

  unsubscribe(resourceName: string): void {
    const count = this.watchingSecondaryResource.get(resourceName);
    if (count === undefined) {
      throw new Error(`unsubscribe before subscribe on resource ${resourceName}`);
    }
    this.watchingSecondaryResource.set(resourceName, count - 1);
  }

  hasSubscribers(resourceName: string): boolean {
    const count = this.watchingSecondaryResource.get(resourceName);
    return !!count;
  }
}

// the ContextsState singleton (instantiated by the kubernetes-client singleton)
// manages the state of the different kube contexts
export class ContextsManager {
  private kubeConfig = new KubeConfig();
  private states = new ContextsStates();
  private currentContext: KubeContext | undefined;
  private secondaryWatchers = new SecondaryResourceWatchersRegistry();

  private dispatchContextsGeneralStateTimer: NodeJS.Timeout | undefined;
  private dispatchCurrentContextGeneralStateTimer: NodeJS.Timeout | undefined;
  private dispatchCurrentContextResourceTimers = new Map<string, NodeJS.Timeout | undefined>();

  private connectTimers = new Map<ResourceName, NodeJS.Timeout | undefined>();
  private connectionDelayTimers = new Map<string, NodeJS.Timeout | undefined>();

  private disposed = false;

  constructor(private readonly apiSender: ApiSenderType) {}

  setConnectionTimers(
    resourceName: ResourceName,
    timer: NodeJS.Timeout | undefined,
    connectionDelay: NodeJS.Timeout | undefined,
  ): void {
    this.connectTimers.set(resourceName, timer);
    this.connectionDelayTimers.set(resourceName, connectionDelay);
  }

  isContextInKubeconfig(context: KubeContext): boolean {
    // if there is no cluster on the kubeconfig with
    // the value of context.cluster -> false
    const cluster = this.kubeConfig.getCluster(context.cluster);
    if (!cluster || cluster.server !== context.clusterInfo?.server) {
      return false;
    }

    // if there is no user on the kubeconfig with the value of context.user -> false
    const user = this.kubeConfig.getUser(context.user);
    if (!user) {
      return false;
    }

    // if there is no context on the kubeconfig with the value of context.context -> false
    const contextObj = this.kubeConfig.getContextObject(context.name);
    /* eslint-disable-next-line no-null/no-null */
    return contextObj !== null && contextObj.cluster === context.cluster && contextObj.user === context.user;
  }

  isContextChanged(kubeconfig: KubeConfig): boolean {
    // if the current context name in the kubeconfig is different from the latest context we saved -> true
    if (kubeconfig.currentContext !== this.currentContext?.name) {
      return true;
    }

    // by retrieving the context from the kubeconfig, if the user is different from the latest context we saved -> true
    const user = kubeconfig.getCurrentUser();
    if (user?.name !== this.currentContext?.user) {
      return true;
    }

    const ns = kubeconfig.getContexts()?.find(c => c.name === kubeconfig.currentContext)?.namespace;
    if (ns !== this.currentContext.namespace) {
      return true;
    }

    // by retrieving the cluster from the kubeconfig, if the name or server url are different from the latest context we saved -> true
    const cluster = kubeconfig.getCurrentCluster();
    return (
      cluster?.name !== this.currentContext?.cluster || cluster?.server !== this.currentContext?.clusterInfo?.server
    );
  }

  compareObjects<T extends User | Cluster | null>(o1: T, o2: T): boolean {
    const o = {};
    const obj1 = o1 ?? o;
    const obj2 = o2 ?? o;
    return (
      obj1 === obj2 ||
      (Object.keys(obj1).length === Object.keys(obj2).length &&
        Object.keys(obj1)
          .filter(key => key !== 'name')
          .every(
            key =>
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (obj1 as any)[key] === (obj2 as any)[key],
          ))
    );
  }

  compareContexts(name: string, newc: KubeConfig, oldc: KubeConfig): boolean {
    const newContext = newc.getContextObject(name);
    const oldContext = oldc.getContextObject(name);
    return (
      newContext?.namespace === oldContext?.namespace && // do not compare user and cluster names
      !!newContext &&
      !!oldContext &&
      this.compareObjects(newc.getUser(newContext.user), oldc.getUser(oldContext.user)) &&
      this.compareObjects(newc.getCluster(newContext.cluster), oldc.getCluster(oldContext.cluster))
    );
  }

  async update(kubeconfig: KubeConfig): Promise<void> {
    const checkOnlyCurrentContext = kubeconfig.contexts.length > MAX_NON_CURRENT_CONTEXTS_TO_CHECK;
    const previousKubeConfig = this.kubeConfig;
    this.kubeConfig = kubeconfig;
    let contextChanged = false;
    if (this.isContextChanged(kubeconfig)) {
      contextChanged = true;
      const currentCluster = kubeconfig.getCurrentCluster();
      this.currentContext = {
        name: kubeconfig.currentContext,
        user: kubeconfig.getCurrentUser()?.name ?? '',
        cluster: currentCluster?.name ?? '',
        clusterInfo: {
          name: currentCluster?.name ?? '',
          server: currentCluster?.server ?? '',
        },
        namespace: kubeconfig.getContexts().find(c => c.name === kubeconfig.currentContext)?.namespace,
      };
    }

    // Delete informers for removed contexts
    // We also remove the state of the current context if it has changed. It may happen that the name of the context is the same but it is pointing to a different cluster
    // We also delete informers for non-current contexts wif we are checking only current context
    let removed = false;
    for (const name of this.states.getContextsNames()) {
      if (
        !this.kubeConfig.contexts.find(c => c.name === name) ||
        (contextChanged && name === this.currentContext?.name) ||
        (checkOnlyCurrentContext && name !== this.currentContext?.name)
      ) {
        await this.states.dispose(name);
        removed = true;
      }
    }

    // Add informers for new contexts (only current context if we are checking only it)
    const added: string[] = [];
    for (const context of this.kubeConfig.contexts) {
      if (checkOnlyCurrentContext && context.name !== this.currentContext?.name) {
        continue;
      }
      if (!this.states.hasContext(context.name)) {
        const kubeContext: KubeContext = this.getKubeContext(context);
        const informers = this.createKubeContextInformers(kubeContext);
        this.states.setInformers(context.name, informers);
        added.push(context.name);
      }
    }

    // Delete secondary informers (others than pods/deployments) on non-current contexts
    if (contextChanged) {
      const nonCurrentContexts = this.kubeConfig.contexts.filter(ctx => ctx.name !== this.currentContext?.name);
      for (const ctx of nonCurrentContexts) {
        const contextName = ctx.name;
        await this.states.disposeSecondaryInformers(contextName);
      }

      // Restart informers for secondary resources if watchers are subscribing for this resource
      if (this.currentContext?.name) {
        for (const resourceName of secondaryResources) {
          if (this.secondaryWatchers.hasSubscribers(resourceName)) {
            console.debug(`start watching ${resourceName} in context ${this.currentContext}`);
            this.startResourceInformer(this.currentContext.name, resourceName);
          }
        }
      }
    }

    if (previousKubeConfig && !checkOnlyCurrentContext) {
      // added and removed contexts were taken care of above
      // lets find changed ones
      for (const context of this.kubeConfig.contexts) {
        if (added.includes(context.name)) continue;
        if (!this.compareContexts(context.name, this.kubeConfig, previousKubeConfig)) {
          await this.states.dispose(context.name);
          const kubeContext: KubeContext = this.getKubeContext(context);
          const informers = this.createKubeContextInformers(kubeContext);
          this.states.setInformers(context.name, informers);
        }
      }
    }

    if (added.length || removed || contextChanged) {
      this.dispatch({
        checkingState: false,
        contextsGeneralState: true,
        currentContextGeneralState: true,
        resources: dispatchAllResources,
      });
    }
  }

  createKubeContextInformers(context: KubeContext): ContextInternalState | undefined {
    const kc = new KubeConfig();
    const cluster = this.kubeConfig.clusters.find(c => c.name === context.cluster);
    if (!cluster) {
      return;
    }
    const user = this.kubeConfig.users.find(u => u.name === context.user);
    if (!user) {
      return;
    }
    kc.loadFromOptions({
      clusters: [cluster],
      users: [user],
      contexts: [context],
      currentContext: context.name,
    });

    const ns = context.namespace ?? 'default';
    const result = new Map<ResourceName, Informer<KubernetesObject> & ObjectCache<KubernetesObject>>();
    result.set('pods', this.createPodInformer(kc, ns, context));
    result.set('deployments', this.createDeploymentInformer(kc, ns, context));
    return result;
  }

  startResourceInformer(contextName: string, resourceName: ResourceName): void {
    const context = this.kubeConfig.contexts.find(c => c.name === contextName);
    if (!context) {
      throw new Error(`context ${contextName} not found`);
    }
    const kubeContext: KubeContext = this.getKubeContext(context);
    const ns = context.namespace ?? 'default';
    let informer: Informer<KubernetesObject> & ObjectCache<KubernetesObject>;
    switch (resourceName) {
      case 'services':
        informer = this.createServiceInformer(this.kubeConfig, ns, kubeContext);
        break;
      case 'nodes':
        informer = this.createNodeInformer(this.kubeConfig, ns, kubeContext);
        break;
      case 'persistentvolumeclaims':
        informer = this.createPersistentVolumeClaimInformer(this.kubeConfig, ns, context);
        break;
      case 'ingresses':
        informer = this.createIngressInformer(this.kubeConfig, ns, kubeContext);
        break;
      case 'routes':
        informer = this.createRouteInformer(this.kubeConfig, ns, kubeContext);
        break;
      case 'configmaps':
        informer = this.createConfigMapInformer(this.kubeConfig, ns, context);
        break;
      case 'secrets':
        informer = this.createSecretInformer(this.kubeConfig, ns, context);
        break;
      default:
        console.debug(`unable to watch ${resourceName} in context ${contextName}, as this resource is not supported`);
        return;
    }
    this.states.setResourceInformer(contextName, resourceName, informer);
  }

  private getKubeContext(context: Context): KubeContext {
    const clusterObj = this.kubeConfig.getCluster(context.cluster);
    return {
      ...context,
      clusterInfo: {
        name: clusterObj?.name ?? '',
        server: clusterObj?.server ?? '',
      },
    };
  }

  private createPodInformer(kc: KubeConfig, ns: string, context: KubeContext): Informer<V1Pod> & ObjectCache<V1Pod> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<{ response: IncomingMessage; body: V1PodList }> => k8sApi.listNamespacedPod(ns);
    const path = `/api/v1/namespaces/${ns}/pods`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('pods', timer, connectionDelay);

    this.setStateAndDispatch(context.name, true, false, {}, state => {
      state.checking = { state: 'checking' };
    });

    return this.createInformer<V1Pod>(kc, context, path, listFn, {
      checkReachable: true,
      resource: 'pods',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, true, { pods: true }, state => state.resources.pods.push(obj));
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, true, { pods: true }, state => {
          state.resources.pods = state.resources.pods.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.pods.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          true,
          { pods: true },
          state => (state.resources.pods = state.resources.pods.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        );
      },
      onReachable: reachable => {
        this.setStateAndDispatch(context.name, true, true, dispatchAllResources, state => {
          state.checking = { state: 'waiting' };
          state.reachable = reachable;
          state.error = reachable ? undefined : state.error; // if reachable we remove error
        });
      },
      onConnectionError: error => {
        this.setStateAndDispatch(context.name, true, true, dispatchAllResources, state => {
          state.checking = { state: 'waiting' };
          state.error = error;
        });
      },
    });
  }

  private createDeploymentInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1Deployment> & ObjectCache<V1Deployment> {
    const k8sApi = kc.makeApiClient(AppsV1Api);
    const listFn = (): Promise<{
      response: IncomingMessage;
      body: V1DeploymentList;
    }> => k8sApi.listNamespacedDeployment(ns);
    const path = `/apis/apps/v1/namespaces/${ns}/deployments`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('deployments', timer, connectionDelay);
    return this.createInformer<V1Deployment>(kc, context, path, listFn, {
      resource: 'deployments',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, true, { deployments: true }, state =>
          state.resources.deployments.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, true, { deployments: true }, state => {
          state.resources.deployments = state.resources.deployments.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.deployments.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          true,
          { deployments: true },
          state =>
            (state.resources.deployments = state.resources.deployments.filter(
              d => d.metadata?.uid !== obj.metadata?.uid,
            )),
        );
      },
    });
  }

  public createConfigMapInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1ConfigMap> & ObjectCache<V1ConfigMap> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<{ response: IncomingMessage; body: V1ConfigMapList }> =>
      k8sApi.listNamespacedConfigMap(ns);
    const path = `/api/v1/namespaces/${ns}/configmaps`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('configmaps', timer, connectionDelay);
    return this.createInformer<V1ConfigMap>(kc, context, path, listFn, {
      resource: 'configmaps',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, false, { configmaps: true }, state =>
          state.resources.configmaps.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, false, { configmaps: true }, state => {
          state.resources.configmaps = state.resources.configmaps.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.configmaps.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          false,
          { configmaps: true },
          state =>
            (state.resources.configmaps = state.resources.configmaps.filter(
              d => d.metadata?.uid !== obj.metadata?.uid,
            )),
        );
      },
    });
  }

  public createSecretInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1Secret> & ObjectCache<V1Secret> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<{ response: IncomingMessage; body: V1SecretList }> => k8sApi.listNamespacedSecret(ns);
    const path = `/api/v1/namespaces/${ns}/secrets`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('secrets', timer, connectionDelay);
    return this.createInformer<V1Secret>(kc, context, path, listFn, {
      resource: 'secrets',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, false, { secrets: true }, state =>
          state.resources.secrets.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, false, { secrets: true }, state => {
          state.resources.secrets = state.resources.secrets.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.secrets.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          false,
          { secrets: true },
          state =>
            (state.resources.secrets = state.resources.secrets.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        );
      },
    });
  }

  public createPersistentVolumeClaimInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1PersistentVolumeClaim> & ObjectCache<V1PersistentVolumeClaim> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<{ response: IncomingMessage; body: V1PersistentVolumeClaimList }> =>
      k8sApi.listNamespacedPersistentVolumeClaim(ns);
    const path = `/api/v1/namespaces/${ns}/persistentvolumeclaims`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('persistentvolumeclaims', timer, connectionDelay);
    return this.createInformer<V1PersistentVolumeClaim>(kc, context, path, listFn, {
      resource: 'persistentvolumeclaims',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, false, { persistentvolumeclaims: true }, state =>
          state.resources.persistentvolumeclaims.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, false, { persistentvolumeclaims: true }, state => {
          state.resources.persistentvolumeclaims = state.resources.persistentvolumeclaims.filter(
            o => o.metadata?.uid !== obj.metadata?.uid,
          );
          state.resources.persistentvolumeclaims.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          false,
          { persistentvolumeclaims: true },
          state =>
            (state.resources.persistentvolumeclaims = state.resources.persistentvolumeclaims.filter(
              d => d.metadata?.uid !== obj.metadata?.uid,
            )),
        );
      },
    });
  }

  public createNodeInformer(kc: KubeConfig, ns: string, context: KubeContext): Informer<V1Node> & ObjectCache<V1Node> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<{ response: IncomingMessage; body: V1NodeList }> => k8sApi.listNode();
    const path = '/api/v1/nodes';
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('nodes', timer, connectionDelay);
    return this.createInformer<V1Node>(kc, context, path, listFn, {
      resource: 'nodes',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, false, { nodes: true }, state => state.resources.nodes.push(obj));
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, false, { nodes: true }, state => {
          state.resources.nodes = state.resources.nodes.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.nodes.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          false,
          { nodes: true },
          state => (state.resources.nodes = state.resources.nodes.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        );
      },
    });
  }

  public createServiceInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1Service> & ObjectCache<V1Service> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<{
      response: IncomingMessage;
      body: V1ServiceList;
    }> => k8sApi.listNamespacedService(ns);
    const path = `/api/v1/namespaces/${ns}/services`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('services', timer, connectionDelay);
    return this.createInformer<V1Service>(kc, context, path, listFn, {
      resource: 'services',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, false, { services: true }, state =>
          state.resources.services.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, false, { services: true }, state => {
          state.resources.services = state.resources.services.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.services.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          false,
          { services: true },
          state =>
            (state.resources.services = state.resources.services.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        );
      },
    });
  }

  public createIngressInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1Ingress> & ObjectCache<V1Ingress> {
    const k8sNetworkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
    const listFn = (): Promise<{
      response: IncomingMessage;
      body: V1IngressList;
    }> => k8sNetworkingApi.listNamespacedIngress(ns);
    const path = `/apis/networking.k8s.io/v1/namespaces/${ns}/ingresses`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('ingresses', timer, connectionDelay);
    return this.createInformer<V1Ingress>(kc, context, path, listFn, {
      resource: 'ingresses',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, false, { ingresses: true }, state =>
          state.resources.ingresses.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, false, { ingresses: true }, state => {
          state.resources.ingresses = state.resources.ingresses.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.ingresses.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          false,
          { ingresses: true },
          state =>
            (state.resources.ingresses = state.resources.ingresses.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        );
      },
    });
  }

  public createRouteInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1Route> & ObjectCache<V1Route> {
    const customObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
    const listFn = (): Promise<{
      response: IncomingMessage;
      body: KubernetesListObject<V1Route>;
    }> =>
      customObjectsApi.listNamespacedCustomObject('route.openshift.io', 'v1', ns, 'routes') as Promise<{
        response: IncomingMessage;
        body: KubernetesListObject<V1Route>;
      }>;
    const path = `/apis/route.openshift.io/v1/namespaces/${ns}/routes`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('routes', timer, connectionDelay);
    return this.createInformer<V1Route>(kc, context, path, listFn, {
      resource: 'routes',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, false, { routes: true }, state =>
          state.resources.routes.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, false, { routes: true }, state => {
          state.resources.routes = state.resources.routes.filter(
            o => o.metadata?.uid !== (obj.metadata as V1ObjectMeta)?.uid,
          );
          state.resources.routes.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          false,
          { routes: true },
          state =>
            (state.resources.routes = state.resources.routes.filter(
              d => d.metadata?.uid !== (obj.metadata as V1ObjectMeta)?.uid,
            )),
        );
      },
    });
  }

  private createInformer<T extends KubernetesObject>(
    kc: KubeConfig,
    context: KubeContext,
    path: string,
    listPromiseFn: ListPromise<T>,
    options: CreateInformerOptions<T>,
  ): Informer<T> & ObjectCache<T> {
    const informer = makeInformer(kc, path, listPromiseFn);

    informer.on('add', (obj: T) => {
      options.onAdd?.(obj);
      this.setReachableNow(options, true);
    });

    informer.on('update', (obj: T) => {
      options.onUpdate?.(obj);
      this.setReachableNow(options, true);
    });

    informer.on('delete', (obj: T) => {
      options.onDelete?.(obj);
      this.setReachableNow(options, true);
    });
    informer.on('error', (err: unknown) => {
      const nextTimeout = options.backoff.get();
      if (err !== undefined) {
        console.debug(
          `Trying to watch ${options.resource} on the kubernetes context named "${context.name}" but got a connection refused, retrying the connection in ${Math.round(nextTimeout / 1000)}s. ${String(err)})`,
        );
        options.onConnectionError?.(String(err));
      }
      this.setReachableNow(options, false);

      // Restart informer later
      clearTimeout(options.timer);
      if (this.disposed) {
        return;
      }
      options.timer = setTimeout(() => {
        this.restartInformer<T>(informer, context, options);
      }, nextTimeout);
    });

    if (options.onReachable) {
      informer.on('connect', (err: unknown) => {
        if (err !== undefined) {
          console.error(`informer connect error on path ${path} for context ${context.name}: `, String(err));
          options.onConnectionError?.(String(err));
        }
        if (err) {
          this.setReachableNow(options, false);
        } else {
          this.setReachableDelay(options, true);
        }
      });
    }
    this.restartInformer<T>(informer, context, options);
    return informer;
  }

  private setReachableDelay<T extends KubernetesObject>(options: CreateInformerOptions<T>, reachable: boolean): void {
    this.setReachable(options, reachable, connectTimeout);
  }

  private setReachableNow<T extends KubernetesObject>(options: CreateInformerOptions<T>, reachable: boolean): void {
    this.setReachable(options, reachable, 0);
  }

  private setReachable<T extends KubernetesObject>(
    options: CreateInformerOptions<T>,
    reachable: boolean,
    delay: number,
  ): void {
    clearTimeout(options.connectionDelay);
    if (this.disposed) {
      return;
    }
    options.connectionDelay = setTimeout(() => {
      options.onReachable?.(reachable);
      if (reachable) {
        this.resetConnectionAttempts(options);
      }
    }, delay);
  }

  private resetConnectionAttempts<T extends KubernetesObject>(options: CreateInformerOptions<T>): void {
    options.backoff.reset();
    clearTimeout(options.timer);
    options.timer = undefined;
  }

  private restartInformer<T extends KubernetesObject>(
    informer: Informer<KubernetesObject> & ObjectCache<KubernetesObject>,
    context: KubeContext,
    options: CreateInformerOptions<T>,
  ): void {
    if (options.checkReachable) {
      this.setStateAndDispatch(context.name, true, false, {}, state => {
        state.checking = { state: 'checking' };
      });
    }
    informer.start().catch((err: unknown) => {
      const nextTimeout = options.backoff.get();
      if (err !== undefined) {
        console.debug(
          `Trying to watch ${options.resource} on the kubernetes context named "${context.name}" but got a connection refused, retrying the connection in ${Math.round(nextTimeout / 1000)}s. ${String(err)})`,
        );
        options.onConnectionError?.(String(err));
      }
      this.setReachableNow(options, false);
      // Restart informer later
      clearTimeout(options.timer);
      if (this.disposed) {
        return;
      }
      options.timer = setTimeout(() => {
        // before restarting the failed informer we should check if the context is still present in the kubeconfig.
        // It is possible that if we start an informer on an old cluster it will keep failing without any chance to be stopped.
        // That happens bc, in the library, when executing the listFn
        // it throws here (as the cluster is not reachable) https://github.com/kubernetes-client/javascript/blob/b8b0ec522bf42086f7c2e1b8648b478b3f584fa8/src/cache.ts#L161
        // so the watch request is not initialized -> https://github.com/kubernetes-client/javascript/blob/b8b0ec522bf42086f7c2e1b8648b478b3f584fa8/src/cache.ts#L181
        // and then the stop action cannot be executed -> https://github.com/kubernetes-client/javascript/blob/b8b0ec522bf42086f7c2e1b8648b478b3f584fa8/src/cache.ts#L134
        if (this.isContextInKubeconfig(context)) {
          this.restartInformer<T>(informer, context, options);
        }
      }, nextTimeout);
    });
  }

  private setStateAndDispatch(
    name: string,
    checkingState: boolean,
    sendGeneral: boolean,
    options: ResourcesDispatchOptions,
    update: (previous: ContextState) => void,
  ): void {
    this.states.safeSetState(name, update);
    this.dispatch({
      checkingState,
      contextsGeneralState: sendGeneral,
      currentContextGeneralState: sendGeneral,
      resources: options,
    });
  }

  private dispatch(options: DispatchOptions): void {
    if (options.checkingState) {
      this.dispatchCheckingState(this.states.getContextsCheckingState());
    }
    if (options.contextsGeneralState) {
      this.dispatchGeneralState(this.states.getContextsGeneralState());
    }
    if (options.currentContextGeneralState) {
      this.dispatchCurrentContextGeneralState(
        this.states.getCurrentContextGeneralState(this.kubeConfig.currentContext),
      );
    }
    Object.keys(options.resources).forEach(res => {
      const resname = res as ResourceName;
      if (options.resources[resname]) {
        this.dispatchCurrentContextResource(
          resname,
          this.states.getContextResources(this.kubeConfig.currentContext, resname),
        );
      }
    });
  }

  public dispatchCheckingState(val: Map<string, CheckingState>): void {
    this.apiSender.send(`kubernetes-contexts-checking-state-update`, val);
  }

  public dispatchGeneralState(val: Map<string, ContextGeneralState>): void {
    this.dispatchContextsGeneralStateTimer = this.dispatchDebounce(
      `kubernetes-contexts-general-state-update`,
      val,
      this.dispatchContextsGeneralStateTimer,
      dispatchTimeout,
    );
  }

  public dispatchCurrentContextGeneralState(val: ContextGeneralState): void {
    this.dispatchCurrentContextGeneralStateTimer = this.dispatchDebounce(
      `kubernetes-current-context-general-state-update`,
      val,
      this.dispatchCurrentContextGeneralStateTimer,
      dispatchTimeout,
    );
  }

  public dispatchCurrentContextResource(resname: ResourceName, val: KubernetesObject[]): void {
    this.dispatchCurrentContextResourceTimers.set(
      resname,
      this.dispatchDebounce(
        `kubernetes-current-context-${resname}-update`,
        val,
        this.dispatchCurrentContextResourceTimers.get(resname),
        dispatchTimeout,
      ),
    );
  }

  private dispatchDebounce(
    eventName: string,
    value: Map<string, ContextGeneralState> | ContextGeneralState | KubernetesObject[] | Map<string, boolean>,
    timer: NodeJS.Timeout | undefined,
    timeout: number,
  ): NodeJS.Timeout | undefined {
    clearTimeout(timer);
    if (this.disposed) {
      return undefined;
    }
    return setTimeout(() => {
      this.apiSender.send(eventName, value);
    }, timeout);
  }

  public getContextsGeneralState(): Map<string, ContextGeneralState> {
    return this.states.getContextsGeneralState();
  }

  public getCurrentContextGeneralState(): ContextGeneralState {
    return this.states.getCurrentContextGeneralState(this.kubeConfig.currentContext);
  }

  public registerGetCurrentContextResources(resourceName: ResourceName): KubernetesObject[] {
    if (isSecondaryResourceName(resourceName)) {
      this.secondaryWatchers.subscribe(resourceName);
    }
    if (!this.currentContext?.name) {
      return [];
    }
    if (this.states.hasInformer(this.currentContext.name, resourceName)) {
      console.debug(`already watching ${resourceName} in context ${this.currentContext}`);
      return this.states.getContextResources(this.kubeConfig.currentContext, resourceName);
    }
    if (!this.states.isReachable(this.currentContext.name)) {
      console.debug(`skip watching ${resourceName} in context ${this.currentContext}, as the context is not reachable`);
      return [];
    }
    console.debug(`start watching ${resourceName} in context ${this.currentContext}`);
    this.startResourceInformer(this.currentContext.name, resourceName);
    return [];
  }

  public unregisterGetCurrentContextResources(resourceName: ResourceName): KubernetesObject[] {
    if (isSecondaryResourceName(resourceName)) {
      this.secondaryWatchers.unsubscribe(resourceName);
    }
    return [];
  }

  // for tests
  public getContextResources(contextName: string, resourceName: ResourceName): KubernetesObject[] {
    return this.states.getContextResources(contextName, resourceName);
  }

  public dispose(): void {
    this.disposed = true;
    clearTimeout(this.dispatchContextsGeneralStateTimer);
    clearTimeout(this.dispatchCurrentContextGeneralStateTimer);
    for (const timer of this.dispatchCurrentContextResourceTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.connectTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.connectionDelayTimers.values()) {
      clearTimeout(timer);
    }
  }
}
