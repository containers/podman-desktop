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

import type {
  Informer,
  KubernetesObject,
  ListPromise,
  ObjectCache,
  V1Deployment,
  V1DeploymentList,
  V1Pod,
  V1PodList,
  V1Service,
  V1ServiceList,
} from '@kubernetes/client-node';
import { AppsV1Api, CoreV1Api, KubeConfig, makeInformer } from '@kubernetes/client-node';
import type { KubeContext } from './kubernetes-context.js';
import type { ApiSenderType } from './api.js';
import {
  backoffInitialValue,
  backoffJitter,
  backoffLimit,
  connectTimeout,
  dispatchTimeout,
} from './kubernetes-context-state-constants.js';
import type { IncomingMessage } from 'node:http';

// ContextInternalState stores informers for a kube context
interface ContextInternalState {
  podInformer?: Informer<V1Pod> & ObjectCache<V1Pod>;
  deploymentInformer?: Informer<V1Deployment> & ObjectCache<V1Deployment>;
}

// ContextState stores information for the user about a kube context: is the cluster reachable, the number
// of instances of different resources
interface ContextState {
  error?: string;
  reachable: boolean;
  resources: ContextStateResources;
}

// All resources managed by podman desktop
// This is where to add new resources when adding new informers
export type ResourceName = 'pods' | 'deployments' | 'services';

// A selection of resources, to indicate the 'general' status of a context
type SelectedResourceName = 'pods' | 'deployments';

export type ContextStateResources = {
  [resourceName in ResourceName]: KubernetesObject[];
};

// information sent: status and count of selected resources
export interface ContextGeneralState {
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
  // add new resources here when adding new informers
};

interface DispatchOptions {
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

class ContextsStates {
  private state = new Map<string, ContextState>();
  private informers = new Map<string, ContextInternalState>();

  has(name: string): boolean {
    return this.informers.has(name);
  }

  setInformers(name: string, informers: ContextInternalState | undefined): void {
    if (informers) {
      this.informers.set(name, informers);
    }
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

  getCurrentContextResources(current: string, resourceName: ResourceName): KubernetesObject[] {
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

  safeSetState(name: string, update: (previous: ContextState) => void): void {
    if (!this.state.has(name)) {
      this.state.set(name, {
        error: undefined,
        reachable: false,
        resources: {
          pods: [],
          deployments: [],
          services: [],
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
    await this.informers.get(name)?.podInformer?.stop();
    await this.informers.get(name)?.deploymentInformer?.stop();
    this.informers.delete(name);
    this.state.delete(name);
  }
}

// the ContextsState singleton (instantiated by the kubernetes-client singleton)
// manages the state of the different kube contexts
export class ContextsManager {
  private kubeConfig = new KubeConfig();
  private states = new ContextsStates();
  private currentContext: string | undefined;

  constructor(private readonly apiSender: ApiSenderType) {}

  // update is the reconcile function, it gets as input the last known kube config
  // and starts/stops informers for different kube contexts, depending on these inputs
  async update(kubeconfig: KubeConfig): Promise<void> {
    this.kubeConfig = kubeconfig;
    let contextChanged = false;
    if (kubeconfig.currentContext !== this.currentContext) {
      contextChanged = true;
      this.currentContext = kubeconfig.currentContext;
    }
    // Add informers for new contexts
    let added = false;
    for (const context of this.kubeConfig.contexts) {
      if (!this.states.has(context.name)) {
        const informers = this.createKubeContextInformers(context);
        this.states.setInformers(context.name, informers);
        added = true;
      }
    }
    // Delete informers for removed contexts
    let removed = false;
    for (const name of this.states.getContextsNames()) {
      if (!this.kubeConfig.contexts.find(c => c.name === name)) {
        await this.states.dispose(name);
        removed = true;
      }
    }
    if (added || removed || contextChanged) {
      this.dispatch({
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
    return {
      podInformer: this.createPodInformer(kc, ns, context),
      deploymentInformer: this.createDeploymentInformer(kc, ns, context),
    };
  }

  private createPodInformer(kc: KubeConfig, ns: string, context: KubeContext): Informer<V1Pod> & ObjectCache<V1Pod> {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<{ response: IncomingMessage; body: V1PodList }> => k8sApi.listNamespacedPod(ns);
    const path = `/api/v1/namespaces/${ns}/pods`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    return this.createInformer<V1Pod>(kc, context, path, listFn, {
      resource: 'pods',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, true, { pods: true }, state => state.resources.pods.push(obj));
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, true, { pods: true }, state => {
          state.resources.pods = state.resources.pods.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.pods.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          true,
          { pods: true },
          state => (state.resources.pods = state.resources.pods.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        );
      },
      onReachable: reachable => {
        this.setStateAndDispatch(context.name, true, dispatchAllResources, state => {
          state.reachable = reachable;
          state.error = reachable ? undefined : state.error; // if reachable we remove error
        });
      },
      onConnectionError: error => {
        this.setStateAndDispatch(context.name, true, dispatchAllResources, state => (state.error = error));
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
    return this.createInformer<V1Deployment>(kc, context, path, listFn, {
      resource: 'deployments',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, true, { deployments: true }, state =>
          state.resources.deployments.push(obj),
        );
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, true, { deployments: true }, state => {
          state.resources.deployments = state.resources.deployments.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.deployments.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
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
    return this.createInformer<V1Service>(kc, context, path, listFn, {
      resource: 'services',
      timer: timer,
      backoff: new Backoff(backoffInitialValue, backoffLimit, backoffJitter),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.setStateAndDispatch(context.name, false, { services: true }, state => state.resources.services.push(obj));
      },
      onUpdate: obj => {
        this.setStateAndDispatch(context.name, false, { services: true }, state => {
          state.resources.services = state.resources.services.filter(o => o.metadata?.uid !== obj.metadata?.uid);
          state.resources.services.push(obj);
        });
      },
      onDelete: obj => {
        this.setStateAndDispatch(
          context.name,
          false,
          { services: true },
          state =>
            (state.resources.services = state.resources.services.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
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
      options.timer = setTimeout(() => {
        this.restartInformer<T>(informer, context, options);
      }, nextTimeout);
    });
  }

  private setStateAndDispatch(
    name: string,
    sendGeneral: boolean,
    options: ResourcesDispatchOptions,
    update: (previous: ContextState) => void,
  ): void {
    this.states.safeSetState(name, update);
    this.dispatch({
      contextsGeneralState: sendGeneral,
      currentContextGeneralState: sendGeneral,
      resources: options,
    });
  }

  dispatchTimer: NodeJS.Timeout | undefined;
  private dispatch(options: DispatchOptions): void {
    clearTimeout(this.dispatchTimer);
    this.dispatchTimer = setTimeout(() => {
      if (options.contextsGeneralState) {
        this.dispatchContextsGeneralState();
      }
      if (options.currentContextGeneralState) {
        this.dispatchCurrentContextGeneralState();
      }
      Object.keys(options.resources).forEach(res => {
        const resname = res as ResourceName;
        if (options.resources[resname]) {
          this.dispatchCurrentContextResource(resname);
        }
      });
    }, dispatchTimeout);
  }

  private dispatchContextsGeneralState(): void {
    this.apiSender.send(`kubernetes-contexts-general-state-update`, this.states.getContextsGeneralState());
  }

  public getContextsGeneralState(): Map<string, ContextGeneralState> {
    return this.states.getContextsGeneralState();
  }

  private dispatchCurrentContextGeneralState(): void {
    this.apiSender.send(
      `kubernetes-current-context-general-state-update`,
      this.states.getCurrentContextGeneralState(this.kubeConfig.currentContext),
    );
  }

  public getCurrentContextGeneralState(): ContextGeneralState {
    return this.states.getCurrentContextGeneralState(this.kubeConfig.currentContext);
  }

  private dispatchCurrentContextResource(resourceName: ResourceName): void {
    this.apiSender.send(
      `kubernetes-current-context-${resourceName}-update`,
      this.states.getCurrentContextResources(this.kubeConfig.currentContext, resourceName),
    );
  }

  public getCurrentContextResources(resourceName: ResourceName): KubernetesObject[] {
    return this.states.getCurrentContextResources(this.kubeConfig.currentContext, resourceName);
  }
}
