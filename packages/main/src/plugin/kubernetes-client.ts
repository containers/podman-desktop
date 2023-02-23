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

import type {
  Context,
  V1Pod,
  V1ConfigMap,
  V1PodList,
  V1NamespaceList,
  V1Service,
  V1ContainerState,
} from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';
import { CoreV1Api, KubeConfig, Log, Watch } from '@kubernetes/client-node';
import type { V1Route } from './api/openshift-types';
import type * as containerDesktopAPI from '@tmpwip/extension-api';
import { Emitter } from './events/emitter';
import { Uri } from './types/uri';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry';
import type { FilesystemMonitoring } from './filesystem-monitoring';
import type { PodInfo } from './api/pod-info';
import { PassThrough } from 'node:stream';

function toContainerStatus(state: V1ContainerState | undefined): string {
  if (state) {
    if (state.running) {
      return 'Running';
    } else if (state.terminated) {
      return 'Terminated';
    } else if (state.waiting) {
      return 'Waiting';
    }
  }
  return 'Unknown';
}

function toPodInfo(pod: V1Pod): PodInfo {
  const containers =
    pod.status?.containerStatuses?.map(status => {
      return {
        Id: status.containerID || '',
        Names: status.name,
        Status: toContainerStatus(status.state),
      };
    }) || [];
  return {
    Cgroup: '',
    Containers: containers,
    Created: (pod.metadata?.creationTimestamp || '').toString(),
    Id: pod.metadata?.uid || '',
    InfraId: '',
    Labels: pod.metadata?.labels || {},
    Name: pod.metadata?.name || '',
    Namespace: pod.metadata?.namespace || '',
    Networks: [],
    Status: pod.status?.phase || '',
    engineId: 'kubernetes',
    engineName: 'Kubernetes',
    kind: 'kubernetes',
  };
}

/**
 * Handle calls to kubernetes API
 */
export class KubernetesClient {
  private kubeConfig;

  private static readonly DEFAULT_KUBECONFIG_PATH = resolve(homedir(), '.kube', 'config');

  // Custom path to the location of the kubeconfig file
  private kubeconfigPath: string = KubernetesClient.DEFAULT_KUBECONFIG_PATH;

  private currrentNamespace: string | undefined;
  private currentContextName: string | undefined;

  private kubeConfigWatcher: containerDesktopAPI.FileSystemWatcher | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private kubeWatcher: any | undefined;

  private readonly _onDidUpdateKubeconfig = new Emitter<containerDesktopAPI.KubeconfigUpdateEvent>();
  readonly onDidUpdateKubeconfig: containerDesktopAPI.Event<containerDesktopAPI.KubeconfigUpdateEvent> =
    this._onDidUpdateKubeconfig.event;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private apiSender: any,
    private configurationRegistry: ConfigurationRegistry,
    private fileSystemMonitoring: FilesystemMonitoring,
  ) {
    this.kubeConfig = new KubeConfig();
  }

  async init(): Promise<void> {
    // default
    const defaultKubeconfigPath = resolve(homedir(), '.kube', 'config');

    // add configuration
    const kubeconfigConfigurationNode: IConfigurationNode = {
      id: 'preferences.Kubernetes.Kubeconfig',
      title: 'Path to the kubeconfig file',
      type: 'object',
      properties: {
        ['kubernetes.Kubeconfig']: {
          description: 'Kubeconfig path to use for accessing clusters. (Default is usually ~/.kube/config)',
          type: 'string',
          default: defaultKubeconfigPath,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([kubeconfigConfigurationNode]);

    // grab the value from the configuration
    // grab value
    const kubernetesConfiguration = this.configurationRegistry.getConfiguration('kubernetes');
    const userKubeconfigPath = kubernetesConfiguration.get<string>('Kubeconfig');
    if (userKubeconfigPath) {
      this.setupWatcher(userKubeconfigPath);
      // check if path exists
      if (existsSync(userKubeconfigPath)) {
        this.kubeconfigPath = userKubeconfigPath;
        this.refresh();
      } else {
        console.error(`Kubeconfig path ${userKubeconfigPath} provided does not exist. Skipping.`);
      }
    }

    // Update the property on change
    this.configurationRegistry.onDidChangeConfiguration(e => {
      if (e.key === 'kubernetes.Kubeconfig') {
        const val = e.value as string;
        this.setupWatcher(val);
        this.setKubeconfig(Uri.file(val));
      }
    });
  }

  setupWatcher(kubeconfigFile: string): void {
    // cancel the previous one (if any)
    this.kubeConfigWatcher?.dispose();

    // monitor the kube config file for changes
    this.kubeConfigWatcher = this.fileSystemMonitoring.createFileSystemWatcher(kubeconfigFile);

    const location = Uri.file(kubeconfigFile);

    // needs to refresh
    this.kubeConfigWatcher.onDidChange(() => {
      this._onDidUpdateKubeconfig.fire({ type: 'UPDATE', location });
      this.refresh();
    });

    this.kubeConfigWatcher.onDidCreate(() => {
      this._onDidUpdateKubeconfig.fire({ type: 'CREATE', location });
      this.refresh();
    });

    this.kubeConfigWatcher.onDidDelete(() => {
      this._onDidUpdateKubeconfig.fire({ type: 'DELETE', location });
      this.kubeConfig = new KubeConfig();
    });
  }

  setupKubeWatcher() {
    this.kubeWatcher?.abort();
    const ns = this.currrentNamespace;
    if (ns) {
      const watch = new Watch(this.kubeConfig);
      watch
        .watch(
          '/api/v1/namespaces/' + ns + '/pods',
          {},
          () => this.apiSender.send('pod-event'),
          (err: unknown) => console.error('Kube event error', err),
        )
        .then(req => (this.kubeWatcher = req));
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
    // perform it under a try/catch block as the file may not be valid for the kubernetes-javascript client library
    try {
      this.kubeConfig.loadFromFile(this.kubeconfigPath);
    } catch (error) {
      console.error(`An error happened when loading kubeconfig file at ${this.kubeconfigPath}`, error);
      return;
    }

    // get the current context
    this.currentContextName = this.kubeConfig.getCurrentContext();
    const currentContext = this.kubeConfig.contexts.find(context => context.name === this.currentContextName);
    if (currentContext) {
      this.currrentNamespace = currentContext.namespace;
    }
    this.setupKubeWatcher();
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

  async listPods(): Promise<PodInfo[]> {
    const ns = this.getCurrentNamespace();
    if (ns) {
      const pods = await this.listNamespacedPod(ns);
      return pods.items.map(pod => toPodInfo(pod));
    }
    return [];
  }

  async readPodLog(name: string, container: string, callback: (name: string, data: string) => void): Promise<void> {
    const ns = this.currrentNamespace;
    if (ns) {
      const log = new Log(this.kubeConfig);

      const logStream = new PassThrough();

      logStream.on('data', chunk => {
        // use write rather than console.log to prevent double line feed
        callback('data', chunk.toString('utf-8'));
      });

      log.log(ns, name, container, logStream, { follow: true });
    }
  }

  async deletePod(name: string): Promise<void> {
    const ns = this.currrentNamespace;
    if (ns) {
      const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
      k8sApi.deleteNamespacedPod(name, ns);
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

  getKubeconfig(): containerDesktopAPI.Uri {
    return Uri.file(this.kubeconfigPath);
  }

  async setKubeconfig(location: containerDesktopAPI.Uri): Promise<void> {
    this.kubeconfigPath = location.fsPath;
    this.refresh();
    // notify change
    this._onDidUpdateKubeconfig.fire({ type: 'UPDATE', location });
  }

  async stop(): Promise<void> {
    this.kubeConfigWatcher?.dispose();
  }
}
