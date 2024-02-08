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

import type { Informer, KubernetesObject, ObjectCache, V1Deployment, V1Pod } from '@kubernetes/client-node';
import { AppsV1Api, CoreV1Api, KubeConfig, makeInformer } from '@kubernetes/client-node';
import type { KubeContext } from './kubernetes-context.js';
import type { ApiSenderType } from './api.js';

// ContextInternalState stores informers for a kube context
interface ContextInternalState {
  podInformer?: Informer<V1Pod> & ObjectCache<V1Pod>;
  deploymentInformer?: Informer<V1Deployment> & ObjectCache<V1Deployment>;
}

// ContextState stores information for the user about a kube context: is the cluster reachable, the number
// of instances of different resources
export interface ContextState {
  reachable: boolean;
  podsCount: number;
  deploymentsCount: number;
}

// the ContextsState singleton (instantiated by the kubernetes-client singleton)
// manages the state of the different kube contexts
export class ContextsState {
  private kubeConfig = new KubeConfig();
  private contextsState = new Map<string, ContextState>();
  private contextsInternalState = new Map<string, ContextInternalState>();

  constructor(private readonly apiSender: ApiSenderType) {}

  // update is the reconcile function, it gets as input:
  // - the user preference indicating if the user wants to get live information about kube contexts
  // - the last known kube config
  // and starts/stops informers for different kube contexts, depending on these inputs
  async update(kubeconfig: KubeConfig) {
    this.kubeConfig = kubeconfig;
    // Add informers for new contexts
    for (const context of this.kubeConfig.contexts) {
      if (this.contextsInternalState.get(context.name) === undefined) {
        this.contextsState.set(context.name, {
          reachable: false,
          podsCount: 0,
          deploymentsCount: 0,
        });
        const informers = this.createKubeContextInformers(context);
        if (informers) {
          this.contextsInternalState.set(context.name, informers);
        }
      }
    }
    // Delete informers for removed contexts
    let removed = false;
    for (const [name, state] of this.contextsInternalState) {
      if (!this.kubeConfig.contexts.find(c => c.name === name)) {
        await state.podInformer?.stop();
        await state.deploymentInformer?.stop();
        this.contextsInternalState.delete(name);
        this.contextsState.delete(name);
        removed = true;
      }
    }
    if (removed) {
      this.dispatchContextsState();
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
    const listFn = () => k8sApi.listNamespacedPod(ns);
    const informer = makeInformer(kc, `/api/v1/namespaces/${ns}/pods`, listFn);

    informer.on('add', () => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.podsCount++;
        previous.reachable = true;
      }
      this.dispatchContextsState();
    });

    informer.on('delete', () => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.podsCount--;
        previous.reachable = true;
      }
      this.dispatchContextsState();
    });
    informer.on('error', (err: unknown) => {
      if (err !== undefined) {
        console.error(`pod informer error for context ${context.name}: `, String(err));
      }
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.reachable = err === undefined;
      }
      this.dispatchContextsState();
      // Restart informer after 5sec
      setTimeout(() => {
        this.restartInformer(informer, context);
      }, 5000);
    });
    informer.on('connect', (err: unknown) => {
      if (err !== undefined) {
        console.error(`pod informer connect error for context ${context.name}: `, String(err));
      }
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.reachable = err === undefined;
      }
      this.dispatchContextsState();
    });
    this.restartInformer(informer, context);
    return informer;
  }

  private createDeploymentInformer(
    kc: KubeConfig,
    ns: string,
    context: KubeContext,
  ): Informer<V1Deployment> & ObjectCache<V1Deployment> {
    const k8sApi = kc.makeApiClient(AppsV1Api);
    const listFn = () => k8sApi.listNamespacedDeployment(ns);
    const informer = makeInformer(kc, `/apis/apps/v1/namespaces/${ns}/deployments`, listFn);

    informer.on('add', () => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.deploymentsCount++;
      }
      this.dispatchContextsState();
    });

    informer.on('delete', () => {
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.deploymentsCount--;
      }
      this.dispatchContextsState();
    });
    informer.on('error', () => {
      // Restart informer after 5sec
      setTimeout(() => {
        this.restartInformer(informer, context);
      }, 5000);
    });
    this.restartInformer(informer, context);
    return informer;
  }

  private restartInformer(informer: Informer<KubernetesObject> & ObjectCache<KubernetesObject>, context: KubeContext) {
    informer.start().catch((err: unknown) => {
      if (err !== undefined) {
        console.log('informer start error: ', String(err));
      }
      const previous = this.contextsState.get(context.name);
      if (previous) {
        previous.reachable = err === undefined;
      }
      this.dispatchContextsState();
      // Restart informer after 5sec
      setTimeout(() => {
        this.restartInformer(informer, context);
      }, 5000);
    });
  }

  private timeoutId: NodeJS.Timeout | undefined;
  private dispatchContextsState() {
    // Debounce: send only the latest value if several values are sent in a short period
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = setTimeout(() => {
      this.apiSender.send(`kubernetes-contexts-state-update`, this.contextsState);
    }, 100);
  }

  public getContextsState(): Map<string, ContextState> {
    return this.contextsState;
  }
}
