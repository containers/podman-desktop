/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type { Context, V1Pod, V1ConfigMap, V1PodList, V1NamespaceList, V1Service } from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';
import { CoreV1Api, KubeConfig } from '@kubernetes/client-node';
import type { V1Route } from './api/openshift-types';

/**
 * Handle calls to kubernetes API
 */
export class KubernetesClient {
  private kubeConfig;

  private currrentNamespace: string | undefined;
  private currentContextName: string | undefined;

  constructor() {
    this.kubeConfig = new KubeConfig();
    try {
      this.refresh();
    } catch (error) {
      console.error('Error while loading Kube Configuration', error);
    }
  }

  getContexts(): Context[] {
    return this.kubeConfig.contexts;
  }

  getCurrentContextName(): string | undefined {
    return this.currentContextName;
  }

  getCurrentNamespace(): string | undefined {
    return this.currrentNamespace;
  }

  refresh() {
    this.kubeConfig.loadFromDefault();

    // get the current context
    this.currentContextName = this.kubeConfig.getCurrentContext();
    const currentContext = this.kubeConfig.contexts.find(context => context.name === this.currentContextName);
    if (currentContext) {
      this.currrentNamespace = currentContext.namespace;
    }
  }

  newError(message: string, cause: Error): Error {
    const error = new Error(message);
    error.stack += `\nCause: ${cause.stack}`;
    return error;
  }

  async createPod(namespace: string, body: V1Pod): Promise<V1Pod> {
    const k8sCoreApi = this.kubeConfig.makeApiClient(CoreV1Api);

    try {
      const createdPodData = await k8sCoreApi.createNamespacedPod(namespace, body);
      return createdPodData.body;
    } catch (error) {
      throw this.wrapK8sClientError(error);
    }
  }

  async createService(namespace: string, body: V1Service): Promise<V1Service> {
    const k8sCoreApi = this.kubeConfig.makeApiClient(CoreV1Api);

    try {
      const createdPodData = await k8sCoreApi.createNamespacedService(namespace, body);
      return createdPodData.body;
    } catch (error) {
      throw this.wrapK8sClientError(error);
    }
  }

  async createOpenShiftRoute(namespace: string, body: V1Route): Promise<V1Route> {
    const k8sCustomObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);

    try {
      const createdPodData = await k8sCustomObjectsApi.createNamespacedCustomObject(
        'route.openshift.io',
        'v1',
        namespace,
        'routes',
        body,
      );
      return createdPodData.body as V1Route;
    } catch (error) {
      throw this.wrapK8sClientError(error);
    }
  }

  async listNamespacedPod(namespace: string, fieldSelector?: string, labelSelector?: string): Promise<V1PodList> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.listNamespacedPod(
        namespace,
        undefined,
        undefined,
        undefined,
        fieldSelector,
        labelSelector,
      );
      if (res && res.body) {
        return res.body;
      } else {
        return {
          items: [],
        };
      }
    } catch (error) {
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedPod(name: string, namespace: string): Promise<V1Pod | undefined> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedPod(name, namespace);
      if (res && res.body) {
        return res.body;
      } else {
        return undefined;
      }
    } catch (error) {
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedConfigMap(name: string, namespace: string): Promise<V1ConfigMap | undefined> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedConfigMap(name, namespace);
      if (res && res.body) {
        return res.body;
      } else {
        return undefined;
      }
    } catch (error) {
      throw this.wrapK8sClientError(error);
    }
  }

  async listNamespaces(): Promise<V1NamespaceList> {
    try {
      const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
      const res = await k8sApi.listNamespace();
      if (res && res.body) {
        return res.body;
      } else {
        return {
          items: [],
        };
      }
    } catch (error) {
      throw this.wrapK8sClientError(error);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private wrapK8sClientError(e: any): Error {
    if (e.response && e.response.body) {
      if (e.response.body.message) {
        return this.newError(e.response.body.message, e);
      }
      return this.newError(e.response.body, e);
    }
    return e;
  }
}
