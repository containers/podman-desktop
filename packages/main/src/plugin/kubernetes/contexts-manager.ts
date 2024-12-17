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
  Context,
  CoreV1Event,
  CoreV1EventList,
  Informer,
  KubernetesListObject,
  KubernetesObject,
  ListPromise,
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

import type { KubeContext } from '/@api/kubernetes-context.js';
import type { ContextGeneralState, ResourceName } from '/@api/kubernetes-contexts-states.js';
import { secondaryResources } from '/@api/kubernetes-contexts-states.js';
import type { V1Route } from '/@api/openshift-types.js';

import type { ApiSenderType } from '../api.js';
import { Backoff } from './backoff.js';
import {
  backoffInitialValue,
  backoffJitter,
  backoffLimit,
  backoffLimitCurrentContext,
  backoffMultiplier,
  backoffMultiplierCurrentContext,
  connectTimeout,
} from './contexts-constants.js';
import { ContextsInformersRegistry } from './contexts-informers-registry.js';
import type { CancellableInformer, ContextInternalState } from './contexts-states-registry.js';
import { ContextsStatesRegistry, dispatchAllResources, isSecondaryResourceName } from './contexts-states-registry.js';
import { ResourceWatchersRegistry } from './resource-watchers-registry.js';

const KINDS_WITH_EVENTS: Array<string | undefined> = ['Deployment', 'Pod', 'Node', 'Service'];

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
  // set to true when informer has been canceled
  canceled?: boolean;
}

// the ContextsState singleton (instantiated by the kubernetes-client singleton)
// manages the state of the different kube contexts
export class ContextsManager {
  private kubeConfig = new KubeConfig();
  protected states: ContextsStatesRegistry;
  protected informers = new ContextsInformersRegistry();
  private currentContext: KubeContext | undefined;
  private secondaryWatchers = new ResourceWatchersRegistry();

  private connectTimers = new Map<ResourceName, NodeJS.Timeout | undefined>();
  private connectionDelayTimers = new Map<string, NodeJS.Timeout | undefined>();

  private disposed = false;

  constructor(readonly apiSender: ApiSenderType) {
    this.states = new ContextsStatesRegistry(apiSender);
  }

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

  async update(kubeconfig: KubeConfig): Promise<void> {
    // do nothing if the kubeconfig file has not changed since last time
    if (JSON.stringify(kubeconfig) === JSON.stringify(this.kubeConfig)) {
      return;
    }
    this.kubeConfig = kubeconfig;

    // get current context
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

    // Delete all informers and states
    for (const name of this.informers.getContextsNames()) {
      // primaries
      await this.informers.deleteContextInformers(name);
      await this.states.deleteContextState(name);
      // secondaries
      await this.informers.disposeSecondaryInformers(name);
      await this.states.disposeSecondaryStates(name);
      // Delete state completely
      await this.states.deleteContextState(name);
    }

    // Add primary informers for contexts (only for the current context if the number of contexts is too high)
    for (const context of this.kubeConfig.contexts) {
      if (context.name !== this.currentContext?.name) {
        continue;
      }
      if (!this.informers.hasContext(context.name)) {
        const kubeContext: KubeContext = this.getKubeContext(context);
        const informers = this.createKubeContextInformers(kubeContext);
        this.informers.setInformers(context.name, informers);
      }
    }

    this.states.dispatch({
      checkingState: false,
      contextsGeneralState: true,
      currentContextGeneralState: true,
      currentContext: this.kubeConfig.currentContext,
      resources: dispatchAllResources,
    });
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
    const result = new Map<ResourceName, CancellableInformer>();
    result.set('pods', this.createPodInformer(kc, ns, context));
    result.set('deployments', this.createDeploymentInformer(kc, ns, context));
    return result;
  }

  startResourceInformer(contextName: string, resourceName: ResourceName): void {
    // this function is called from many places, we cannot guarantee
    // it is called only once, let's do nothing if the informer is already running
    if (this.informers.hasInformer(contextName, resourceName)) {
      return;
    }
    const context = this.kubeConfig.contexts.find(c => c.name === contextName);
    if (!context) {
      throw new Error(`context ${contextName} not found`);
    }
    const kubeContext: KubeContext = this.getKubeContext(context);
    const ns = context.namespace ?? 'default';
    let informer: CancellableInformer;
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
      case 'events':
        informer = this.createEventInformer(this.kubeConfig, ns, context);
        break;
      default:
        console.debug(`unable to watch ${resourceName} in context ${contextName}, as this resource is not supported`);
        return;
    }
    this.informers.setResourceInformer(contextName, resourceName, informer);
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

  private createPodInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<V1PodList> => k8sApi.listNamespacedPod({ namespace });
    const path = `/api/v1/namespaces/${namespace}/pods`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('pods', timer, connectionDelay);

    this.states.setStateAndDispatch(context.name, {
      checkingState: true,
      currentContext: this.kubeConfig.currentContext,
      update: state => {
        state.checking = { state: 'checking' };
      },
    });

    return this.createInformer<V1Pod>(kc, context, path, listFn, {
      checkReachable: true,
      resource: 'pods',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: { pods: true },
          update: state => {
            if (state.resources.pods.some(o => o.metadata?.uid !== obj.metadata?.uid)) {
              console.debug(`pod ${obj.metadata?.name} already added in context ${context.name}`);
            }
            state.resources.pods = state.resources.pods.filter(o => o.metadata?.uid !== obj.metadata?.uid);
            state.resources.pods.push(obj);
          },
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: { pods: true },
          update: state => {
            state.resources.pods = state.resources.pods.filter(o => o.metadata?.uid !== obj.metadata?.uid);
            state.resources.pods.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: { pods: true },
          update: state =>
            (state.resources.pods = state.resources.pods.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        });
      },
      onReachable: reachable => {
        this.states.setStateAndDispatch(context.name, {
          checkingState: true,
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: dispatchAllResources,
          update: state => {
            state.checking = { state: 'waiting' };
            state.reachable = reachable;
            state.error = reachable ? undefined : state.error; // if reachable we remove error
            if (reachable) {
              // start secondary informers, for current context only
              if (this.kubeConfig.currentContext === context.name) {
                for (const resourceName of secondaryResources) {
                  if (this.secondaryWatchers.hasSubscribers(resourceName)) {
                    this.startResourceInformer(context.name, resourceName);
                  }
                }
              }
            } else {
              // Delete secondary informers
              this.informers
                .disposeSecondaryInformers(context.name)
                .catch((err: unknown) =>
                  console.error(`error disposing secondary informers for context ${context.name}: ${String(err)}`),
                );
              this.states
                .disposeSecondaryStates(context.name)
                .catch((err: unknown) =>
                  console.error(`error disposing secondary states for context ${context.name}: ${String(err)}`),
                );
            }
          },
        });
      },
      onConnectionError: error => {
        this.states.setStateAndDispatch(context.name, {
          checkingState: true,
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: dispatchAllResources,
          update: state => {
            state.checking = { state: 'waiting' };
            state.error = error;
          },
        });
      },
    });
  }

  private createDeploymentInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const k8sApi = kc.makeApiClient(AppsV1Api);
    const listFn = (): Promise<V1DeploymentList> => k8sApi.listNamespacedDeployment({ namespace });
    const path = `/apis/apps/v1/namespaces/${namespace}/deployments`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('deployments', timer, connectionDelay);
    return this.createInformer<V1Deployment>(kc, context, path, listFn, {
      resource: 'deployments',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: { deployments: true },
          update: state => state.resources.deployments.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: { deployments: true },
          update: state => {
            state.resources.deployments = state.resources.deployments.filter(
              o => o.metadata?.uid !== obj.metadata?.uid,
            );
            state.resources.deployments.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          sendGeneral: true,
          currentContext: this.kubeConfig.currentContext,
          resources: { deployments: true },
          update: state =>
            (state.resources.deployments = state.resources.deployments.filter(
              d => d.metadata?.uid !== obj.metadata?.uid,
            )),
        });
      },
    });
  }

  public createConfigMapInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<V1ConfigMapList> => k8sApi.listNamespacedConfigMap({ namespace });
    const path = `/api/v1/namespaces/${namespace}/configmaps`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('configmaps', timer, connectionDelay);
    return this.createInformer<V1ConfigMap>(kc, context, path, listFn, {
      resource: 'configmaps',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { configmaps: true },
          update: state => state.resources.configmaps.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { configmaps: true },
          update: state => {
            state.resources.configmaps = state.resources.configmaps.filter(o => o.metadata?.uid !== obj.metadata?.uid);
            state.resources.configmaps.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { configmaps: true },
          update: state =>
            (state.resources.configmaps = state.resources.configmaps.filter(
              d => d.metadata?.uid !== obj.metadata?.uid,
            )),
        });
      },
    });
  }

  public createSecretInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<V1SecretList> => k8sApi.listNamespacedSecret({ namespace });
    const path = `/api/v1/namespaces/${namespace}/secrets`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('secrets', timer, connectionDelay);
    return this.createInformer<V1Secret>(kc, context, path, listFn, {
      resource: 'secrets',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          resources: { secrets: true },
          currentContext: this.kubeConfig.currentContext,
          update: state => state.resources.secrets.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { secrets: true },
          update: state => {
            state.resources.secrets = state.resources.secrets.filter(o => o.metadata?.uid !== obj.metadata?.uid);
            state.resources.secrets.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { secrets: true },
          update: state =>
            (state.resources.secrets = state.resources.secrets.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        });
      },
    });
  }

  public createPersistentVolumeClaimInformer(
    kc: KubeConfig,
    namespace: string,
    context: KubeContext,
  ): CancellableInformer {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<V1PersistentVolumeClaimList> =>
      k8sApi.listNamespacedPersistentVolumeClaim({ namespace });
    const path = `/api/v1/namespaces/${namespace}/persistentvolumeclaims`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('persistentvolumeclaims', timer, connectionDelay);
    return this.createInformer<V1PersistentVolumeClaim>(kc, context, path, listFn, {
      resource: 'persistentvolumeclaims',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { persistentvolumeclaims: true },
          update: state => state.resources.persistentvolumeclaims.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { persistentvolumeclaims: true },
          update: state => {
            state.resources.persistentvolumeclaims = state.resources.persistentvolumeclaims.filter(
              o => o.metadata?.uid !== obj.metadata?.uid,
            );
            state.resources.persistentvolumeclaims.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { persistentvolumeclaims: true },
          update: state =>
            (state.resources.persistentvolumeclaims = state.resources.persistentvolumeclaims.filter(
              d => d.metadata?.uid !== obj.metadata?.uid,
            )),
        });
      },
    });
  }

  public createNodeInformer(kc: KubeConfig, _ns: string, context: KubeContext): CancellableInformer {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<V1NodeList> => k8sApi.listNode();
    const path = '/api/v1/nodes';
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('nodes', timer, connectionDelay);
    return this.createInformer<V1Node>(kc, context, path, listFn, {
      resource: 'nodes',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { nodes: true },
          update: state => state.resources.nodes.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { nodes: true },
          update: state => {
            state.resources.nodes = state.resources.nodes.filter(o => o.metadata?.uid !== obj.metadata?.uid);
            state.resources.nodes.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { nodes: true },
          update: state =>
            (state.resources.nodes = state.resources.nodes.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        });
      },
    });
  }

  public createServiceInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<V1ServiceList> => k8sApi.listNamespacedService({ namespace });
    const path = `/api/v1/namespaces/${namespace}/services`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('services', timer, connectionDelay);
    return this.createInformer<V1Service>(kc, context, path, listFn, {
      resource: 'services',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { services: true },
          update: state => state.resources.services.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { services: true },
          update: state => {
            state.resources.services = state.resources.services.filter(o => o.metadata?.uid !== obj.metadata?.uid);
            state.resources.services.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { services: true },
          update: state =>
            (state.resources.services = state.resources.services.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        });
      },
    });
  }

  public createIngressInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const k8sNetworkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
    const listFn = (): Promise<V1IngressList> => k8sNetworkingApi.listNamespacedIngress({ namespace });
    const path = `/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('ingresses', timer, connectionDelay);
    return this.createInformer<V1Ingress>(kc, context, path, listFn, {
      resource: 'ingresses',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { ingresses: true },
          update: state => state.resources.ingresses.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { ingresses: true },
          update: state => {
            state.resources.ingresses = state.resources.ingresses.filter(o => o.metadata?.uid !== obj.metadata?.uid);
            state.resources.ingresses.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { ingresses: true },
          update: state =>
            (state.resources.ingresses = state.resources.ingresses.filter(d => d.metadata?.uid !== obj.metadata?.uid)),
        });
      },
    });
  }

  public createRouteInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const customObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
    const listFn = (): Promise<KubernetesListObject<V1Route>> =>
      customObjectsApi.listNamespacedCustomObject({
        group: 'route.openshift.io',
        version: 'v1',
        namespace,
        plural: 'routes',
      }) as Promise<KubernetesListObject<V1Route>>;
    const path = `/apis/route.openshift.io/v1/namespaces/${namespace}/routes`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('routes', timer, connectionDelay);
    return this.createInformer<V1Route>(kc, context, path, listFn, {
      resource: 'routes',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { routes: true },
          update: state => state.resources.routes.push(obj),
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { routes: true },
          update: state => {
            state.resources.routes = state.resources.routes.filter(
              o => o.metadata?.uid !== (obj.metadata as V1ObjectMeta)?.uid,
            );
            state.resources.routes.push(obj);
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { routes: true },
          update: state =>
            (state.resources.routes = state.resources.routes.filter(
              d => d.metadata?.uid !== (obj.metadata as V1ObjectMeta)?.uid,
            )),
        });
      },
    });
  }

  public createEventInformer(kc: KubeConfig, namespace: string, context: KubeContext): CancellableInformer {
    const k8sApi = kc.makeApiClient(CoreV1Api);
    const listFn = (): Promise<CoreV1EventList> => k8sApi.listNamespacedEvent({ namespace });
    const path = `/api/v1/namespaces/${namespace}/events`;
    let timer: NodeJS.Timeout | undefined;
    let connectionDelay: NodeJS.Timeout | undefined;
    this.setConnectionTimers('events', timer, connectionDelay);
    return this.createInformer<CoreV1Event>(kc, context, path, listFn, {
      resource: 'events',
      timer: timer,
      backoff: this.getBackoffForContext(context.name),
      connectionDelay: connectionDelay,
      onAdd: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { events: true },
          update: state => {
            if (KINDS_WITH_EVENTS.includes(obj.involvedObject.kind)) {
              state.resources.events.push(obj);
            }
          },
        });
      },
      onUpdate: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { events: true },
          update: state => {
            if (KINDS_WITH_EVENTS.includes(obj.involvedObject.kind)) {
              state.resources.events = state.resources.events.filter(
                o => o.metadata?.uid !== (obj.metadata as V1ObjectMeta)?.uid,
              );
              state.resources.events.push(obj);
            }
          },
        });
      },
      onDelete: obj => {
        this.states.setStateAndDispatch(context.name, {
          currentContext: this.kubeConfig.currentContext,
          resources: { events: true },
          update: state => {
            if (KINDS_WITH_EVENTS.includes(obj.involvedObject.kind)) {
              state.resources.events = state.resources.events.filter(
                d => d.metadata?.uid !== (obj.metadata as V1ObjectMeta)?.uid,
              );
            }
          },
        });
      },
    });
  }

  private createInformer<T extends KubernetesObject>(
    kc: KubeConfig,
    context: KubeContext,
    path: string,
    listPromiseFn: ListPromise<T>,
    options: CreateInformerOptions<T>,
  ): CancellableInformer {
    const informer = makeInformer(kc, path, listPromiseFn);

    const onAdd = (obj: T): void => {
      options.onAdd?.(obj);
      this.setReachableNow(options, true);
    };
    informer.on('add', onAdd);

    const onUpdate = (obj: T): void => {
      options.onUpdate?.(obj);
      this.setReachableNow(options, true);
    };
    informer.on('update', onUpdate);

    const onDelete = (obj: T): void => {
      options.onDelete?.(obj);
      this.setReachableNow(options, true);
    };
    informer.on('delete', onDelete);

    const onError = (err: unknown): void => {
      const nextTimeout = options.backoff.get();
      if (err !== undefined) {
        console.debug(
          `Trying to watch ${options.resource} on the kubernetes context named "${context.name}" but got a connection refused, retrying the connection in ${Math.round(nextTimeout / 1000)}s.`,
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
    };
    informer.on('error', onError);

    const onConnect = (err: unknown): void => {
      if (err !== undefined) {
        console.error(`informer connect error on path ${path} for context ${context.name}: `, String(err));
        options.onConnectionError?.(String(err));
      }
      if (err) {
        this.setReachableNow(options, false);
      } else {
        this.setReachableDelay(options, true);
      }
    };
    if (options.onReachable) {
      informer.on('connect', onConnect);
    }
    this.restartInformer<T>(informer, context, options);
    return {
      informer,
      cancel: (): void => {
        options.canceled = true;
        clearTimeout(options.timer);
        clearTimeout(options.connectionDelay);
        informer.off('add', onAdd);
        informer.off('update', onUpdate);
        informer.off('delete', onDelete);
        informer.off('error', onError);
        informer.off('connect', onConnect);
      },
    };
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
    informer: Informer<T>,
    context: KubeContext,
    options: CreateInformerOptions<T>,
  ): void {
    if (options.checkReachable) {
      this.states.setStateAndDispatch(context.name, {
        checkingState: true,
        currentContext: this.kubeConfig.currentContext,
        update: state => {
          state.checking = { state: 'checking' };
        },
      });
    }
    informer.start().catch((err: unknown) => {
      if (options.canceled) {
        return;
      }
      const nextTimeout = options.backoff.get();
      if (err !== undefined) {
        console.debug(
          `Trying to watch ${options.resource} on the kubernetes context named "${context.name}" but got a connection refused, retrying the connection in ${Math.round(nextTimeout / 1000)}s.`,
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
    if (this.informers.hasInformer(this.currentContext.name, resourceName)) {
      console.debug(`already watching ${resourceName} in kubernetes context named "${this.currentContext.name}"`);
      return this.states.getContextResources(this.kubeConfig.currentContext, resourceName);
    }
    // start secondary informers only if current context is reachable
    if (this.states.isReachable(this.currentContext.name)) {
      console.debug(`start watching ${resourceName} in kubernetes context named "${this.currentContext.name}"`);
      this.startResourceInformer(this.currentContext.name, resourceName);
    } else {
      console.debug(
        `skip watching ${resourceName} in kubernetes context named "${this.currentContext.name}", as the context is not reachable`,
      );
    }
    return [];
  }

  public unregisterGetCurrentContextResources(resourceName: ResourceName): KubernetesObject[] {
    if (isSecondaryResourceName(resourceName)) {
      this.secondaryWatchers.unsubscribe(resourceName);
    }
    return [];
  }

  /**
   * Ask for getting the state of the context as soon as possible.
   *
   * This is done by stopping all the informers for this context
   * and restarting the primary informers.
   *
   * @param contextName the context for which to refresh the state
   */
  public async refreshContextState(contextName: string): Promise<void> {
    const context = this.kubeConfig.getContexts().find(c => c.name === contextName);
    if (!context) {
      throw new Error(`context ${contextName} not found`);
    }
    // stop previous ones
    // primaries
    await this.informers.deleteContextInformers(contextName);
    await this.states.deleteContextState(contextName);
    // secondaries
    await this.informers.disposeSecondaryInformers(contextName);
    await this.states.disposeSecondaryStates(contextName);

    // start new ones
    const kubeContext: KubeContext = this.getKubeContext(context);
    const informers = this.createKubeContextInformers(kubeContext);
    this.informers.setInformers(contextName, informers);
  }

  // for tests
  public getContextResources(contextName: string, resourceName: ResourceName): KubernetesObject[] {
    return this.states.getContextResources(contextName, resourceName);
  }

  public dispose(): void {
    this.disposed = true;
    this.states.dispose();
    for (const timer of this.connectTimers.values()) {
      clearTimeout(timer);
    }
    for (const timer of this.connectionDelayTimers.values()) {
      clearTimeout(timer);
    }
  }

  private getBackoffForContext(contextName: string): Backoff {
    if (contextName === this.kubeConfig.currentContext) {
      return new Backoff({
        value: backoffInitialValue,
        multiplier: backoffMultiplierCurrentContext,
        max: backoffLimitCurrentContext,
        jitter: backoffJitter,
      });
    } else {
      return new Backoff({
        value: backoffInitialValue,
        multiplier: backoffMultiplier,
        max: backoffLimit,
        jitter: backoffJitter,
      });
    }
  }
}
