/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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

import * as fs from 'node:fs';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { PassThrough } from 'node:stream';

import type {
  Cluster,
  Context,
  KubernetesListObject,
  KubernetesObject,
  V1APIGroup,
  V1APIResource,
  V1ConfigMap,
  V1ContainerState,
  V1Deployment,
  V1Ingress,
  V1NamespaceList,
  V1Node,
  V1PersistentVolumeClaim,
  V1Pod,
  V1PodList,
  V1Secret,
  V1Service,
  V1Status,
} from '@kubernetes/client-node';
import {
  ApisApi,
  AppsV1Api,
  CoreV1Api,
  CustomObjectsApi,
  Exec,
  HttpError,
  KubeConfig,
  KubernetesObjectApi,
  Log,
  NetworkingV1Api,
  VersionApi,
  Watch,
} from '@kubernetes/client-node';
import type * as containerDesktopAPI from '@podman-desktop/api';
import * as jsYaml from 'js-yaml';
import { parseAllDocuments } from 'yaml';

import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import type { V1Route } from '/@api/openshift-types.js';

import type { ApiSenderType } from './api.js';
import type { PodInfo } from './api/pod-info.js';
import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry.js';
import { Emitter } from './events/emitter.js';
import type { FilesystemMonitoring } from './filesystem-monitoring.js';
import type { KubeContext } from './kubernetes-context.js';
import type { ContextGeneralState, ResourceName } from './kubernetes-context-state.js';
import { ContextsManager } from './kubernetes-context-state.js';
import { BufferedStreamWriter, ResizableTerminalWriter, StringLineReader } from './kubernetes-exec-transmitter.js';
import { Uri } from './types/uri.js';

interface KubernetesObjectWithKind extends KubernetesObject {
  kind: string;
}

function toContainerStatus(state: V1ContainerState | undefined): string {
  if (state) {
    if (state.running) {
      return 'running';
    } else if (state.terminated) {
      return 'terminated';
    } else if (state.waiting) {
      return 'waiting';
    }
  }
  return 'unknown';
}

function toPodInfo(pod: V1Pod, contextName?: string): PodInfo {
  const containers =
    pod.status?.containerStatuses?.map(status => {
      return {
        Id: status.containerID ?? '',
        Names: status.name,
        Status: toContainerStatus(status.state),
      };
    }) ?? [];
  return {
    Cgroup: '',
    Containers: containers,
    Created: (pod.metadata?.creationTimestamp ?? '').toString(),
    Id: pod.metadata?.uid ?? '',
    InfraId: '',
    Labels: pod.metadata?.labels ?? {},
    Name: pod.metadata?.name ?? '',
    Namespace: pod.metadata?.namespace ?? '',
    Networks: [],
    Status: pod.metadata?.deletionTimestamp ? 'DELETING' : pod.status?.phase ?? '',
    engineId: contextName ?? 'kubernetes',
    engineName: 'Kubernetes',
    kind: 'kubernetes',
    node: pod.spec?.nodeName,
  };
}

const OPENSHIFT_PROJECT_API_GROUP = 'project.openshift.io';

const DEFAULT_NAMESPACE = 'default';

const FIELD_MANAGER = 'podman-desktop';

/**
 * Handle calls to kubernetes API
 */
export class KubernetesClient {
  protected kubeConfig;

  private static readonly DEFAULT_KUBECONFIG_PATH = resolve(homedir(), '.kube', 'config');

  // Custom path to the location of the kubeconfig file
  private kubeconfigPath: string = KubernetesClient.DEFAULT_KUBECONFIG_PATH;

  protected currentNamespace: string | undefined;
  protected currentContextName: string | undefined;

  private kubeConfigWatcher: containerDesktopAPI.FileSystemWatcher | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private kubeWatcher: any | undefined;

  private apiGroups = new Array<V1APIGroup>();

  /*
   a Cache of API resources for the cluster. This is used to compute the plural when dealing
   with custom resources. The key is the apiGroup (including version) like 'networking.k8s.io/v1'
   */
  private apiResources = new Map<string, Array<V1APIResource>>();

  private contextsState: ContextsManager;

  private readonly _onDidUpdateKubeconfig = new Emitter<containerDesktopAPI.KubeconfigUpdateEvent>();
  readonly onDidUpdateKubeconfig: containerDesktopAPI.Event<containerDesktopAPI.KubeconfigUpdateEvent> =
    this._onDidUpdateKubeconfig.event;

  constructor(
    private readonly apiSender: ApiSenderType,
    private readonly configurationRegistry: ConfigurationRegistry,
    private readonly fileSystemMonitoring: FilesystemMonitoring,
    private readonly telemetry: Telemetry,
  ) {
    this.kubeConfig = new KubeConfig();
    this.contextsState = new ContextsManager(this.apiSender);
  }

  async init(): Promise<void> {
    // default
    const defaultKubeconfigPath = resolve(homedir(), '.kube', 'config');

    // add configuration
    const kubeconfigConfigurationNode: IConfigurationNode = {
      id: 'preferences.kubernetes',
      title: 'Kubernetes',
      type: 'object',
      properties: {
        ['kubernetes.Kubeconfig']: {
          description: 'Path to the Kubeconfig file for accessing clusters. (Default is usually ~/.kube/config)',
          type: 'string',
          default: defaultKubeconfigPath,
          format: 'file',
        },
      },
    };

    this.configurationRegistry.registerConfigurations([kubeconfigConfigurationNode]);

    // grab the value from the configuration
    const kubernetesConfiguration = this.configurationRegistry.getConfiguration('kubernetes');
    const userKubeconfigPath = kubernetesConfiguration.get<string>('Kubeconfig');
    if (userKubeconfigPath) {
      this.kubeconfigPath = userKubeconfigPath;
      this.setupWatcher(userKubeconfigPath);
      // check if path exists
      if (existsSync(userKubeconfigPath)) {
        this.refresh().catch(() => console.error('Refresh of kube resources on startup failed'));
      } else {
        console.error(`Kubeconfig path ${userKubeconfigPath} provided does not exist. Skipping.`);
      }
    }

    // Update the property on change
    this.configurationRegistry.onDidChangeConfiguration(async e => {
      if (e.key === 'kubernetes.Kubeconfig') {
        const val = e.value as string;
        this.setupWatcher(val);
        await this.setKubeconfig(Uri.file(val));
      }
    });
  }

  // The below methods (update, create, delete)
  // help send information to the renderer process to notify any
  // stores (in particular kube context store) as well as extensions (extensions/kube-context)
  setupWatcher(kubeconfigFile: string): void {
    // cancel the previous one (if any)
    this.kubeConfigWatcher?.dispose();

    // monitor the kube config file for changes
    this.kubeConfigWatcher = this.fileSystemMonitoring.createFileSystemWatcher(kubeconfigFile);

    const location = Uri.file(kubeconfigFile);

    // needs to refresh
    this.kubeConfigWatcher.onDidChange(async () => {
      this._onDidUpdateKubeconfig.fire({ type: 'UPDATE', location });
      await this.refresh();
      this.apiSender.send('kubernetes-context-update');
    });

    this.kubeConfigWatcher.onDidCreate(async () => {
      this._onDidUpdateKubeconfig.fire({ type: 'CREATE', location });
      await this.refresh();
      this.apiSender.send('kubernetes-context-update');
    });

    this.kubeConfigWatcher.onDidDelete(() => {
      this._onDidUpdateKubeconfig.fire({ type: 'DELETE', location });
      this.kubeConfig = new KubeConfig();
      this.apiSender.send('kubernetes-context-update');
    });
  }

  protected createWatchObject(): Watch {
    return new Watch(this.kubeConfig);
  }

  setupKubeWatcher(): void {
    this.kubeWatcher?.abort();
    const ns = this.currentNamespace;
    if (ns) {
      const watch = this.createWatchObject();

      watch
        .watch(
          '/api/v1/namespaces/' + ns + '/pods',
          {},
          () => this.apiSender.send('pod-event'),
          err => console.warn('Kube pod watch ended', String(err)),
        )
        .then(req => (this.kubeWatcher = req))
        .catch((err: unknown) => console.error('Kube pod event error', err));

      watch
        .watch(
          '/apis/apps/v1/namespaces/' + ns + '/deployments',
          {},
          () => this.apiSender.send('deployment-event'),
          err => console.warn('Kube deployment watch ended', String(err)),
        )
        .then(req => (this.kubeWatcher = req))
        .catch((err: unknown) => console.error('Kube deployment event error', err));
    }
  }

  async fetchAPIGroups(): Promise<void> {
    this.apiGroups = [];
    try {
      if (this.kubeConfig) {
        const result = await this.kubeConfig.makeApiClient(ApisApi).getAPIVersions();
        this.apiGroups = result?.body.groups;
      }
    } catch (err) {
      console.log(`Error while fetching API groups: ${err}`);
    }
  }

  async isAPIGroupSupported(group: string): Promise<boolean> {
    return this.apiGroups.filter(g => g.name === group).length > 0;
  }

  getContexts(): Context[] {
    return this.kubeConfig.contexts;
  }

  getCurrentContextName(): string | undefined {
    return this.currentContextName;
  }

  getClusters(): Cluster[] {
    return this.kubeConfig.clusters;
  }

  getCurrentNamespace(): string | undefined {
    return this.currentNamespace;
  }

  getDetailedContexts(): KubeContext[] {
    const kubeContexts: KubeContext[] = [];

    // Go through each context
    this.kubeConfig.contexts.forEach(context => {
      // Try and find the cluster
      const cluster = this.kubeConfig.clusters.find(c => c.name === context.cluster);

      // If the cluster is not found, just return undefined for clusterInfo
      // as sometimes in the context we have information, but nothing about
      // the cluster.
      kubeContexts.push({
        name: context.name,
        cluster: context.cluster,
        user: context.user,
        namespace: context.namespace,
        currentContext: context.name === this.currentContextName, // Set the current context to true if the name matches the current context name
        clusterInfo: cluster
          ? {
              name: cluster.name,
              server: cluster.server,
              skipTLSVerify: cluster.skipTLSVerify,
              tlsServerName: cluster.tlsServerName,
            }
          : undefined,
      });
    });
    return kubeContexts;
  }

  async deleteContext(contextName: string): Promise<Context[]> {
    const previousContexts = this.kubeConfig.contexts;
    const newContexts = this.kubeConfig.contexts.filter(ctx => ctx.name !== contextName);
    const newConfig = new KubeConfig();
    const newCurrentContextName: string | undefined =
      contextName !== this.currentContextName ? this.currentContextName : undefined;
    newConfig.loadFromOptions({
      contexts: newContexts,
      clusters: this.kubeConfig.clusters.filter(cluster => {
        // remove clusters not referenced anymore, except if there were already not referenced before
        return (
          newContexts.some(ctx => ctx.cluster === cluster.name) ||
          !previousContexts.some(ctx => ctx.cluster === cluster.name)
        );
      }),
      users: this.kubeConfig.users.filter(user => {
        // remove users not referenced anymore, except if there were already not referenced before
        return newContexts.some(ctx => ctx.user === user.name) || !previousContexts.some(ctx => ctx.user === user.name);
      }),
      currentContext: newCurrentContextName ?? '',
    });
    await this.saveKubeConfig(newConfig);
    // the config is saved back only if saving the file succeeds
    this.kubeConfig = newConfig;
    this.currentContextName = newCurrentContextName;
    // We send an update event here, even if another one will be sent after the file change is detected,
    // because that one can get some time to be sent (as cluster connectivity will be tested)
    this.apiSender.send('kubernetes-context-update');
    return this.getContexts();
  }

  // setContext takes a context name and sets it as the current context within the kubeconfig
  async setContext(contextName: string): Promise<void> {
    const newConfig = new KubeConfig();

    // Load the configuration with all the standard contexts, clusters, users, etc.
    // but change the currentContext to the provided contextName.
    newConfig.loadFromOptions({
      contexts: this.kubeConfig.contexts,
      clusters: this.kubeConfig.clusters,
      users: this.kubeConfig.users,
      currentContext: contextName,
    });

    // Save the configuration to the kubeconfig file and set the current context to the context name.
    await this.saveKubeConfig(newConfig);

    // If saving the file succeeds then set the kubeConfig to the newConfig & set the current context name.
    this.kubeConfig = newConfig;
    this.currentContextName = contextName;
    // We send an update event here, even if another one will be sent after the file change is detected,
    // because that one can get some time to be sent (as cluster connectivity will be tested)
    this.apiSender.send('kubernetes-context-update');
  }

  async saveKubeConfig(config: KubeConfig): Promise<void> {
    const jsonString = config.exportConfig();
    const yamlString = jsYaml.dump(JSON.parse(jsonString));
    await fs.promises.writeFile(this.kubeconfigPath, yamlString);
  }

  private async getDefaultNamespace(context: Context): Promise<string> {
    if (context.namespace) {
      return context.namespace;
    }
    const ctx = new KubeConfig();
    ctx.loadFromOptions({
      currentContext: context.name,
      clusters: this.kubeConfig.clusters,
      contexts: this.kubeConfig.contexts,
      users: this.kubeConfig.users,
    });
    let namespace;

    try {
      const projectGroupSupported = await this.isAPIGroupSupported(OPENSHIFT_PROJECT_API_GROUP);
      if (projectGroupSupported) {
        const projects = await ctx
          .makeApiClient(CustomObjectsApi)
          .listClusterCustomObject(OPENSHIFT_PROJECT_API_GROUP, 'v1', 'projects');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((projects?.body as any)?.items.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          namespace = (projects?.body as any)?.items[0].metadata?.name;
        }
      }
    } catch (err) {
      try {
        const namespaces = await ctx.makeApiClient(CoreV1Api).listNamespace();
        if (namespaces?.body?.items.length > 0) {
          namespace = namespaces?.body?.items[0].metadata?.name;
        }
      } catch (error) {
        // unable to list namespaces, can be due to a connection refused (cluster not up)
        console.trace('unable to list namespaces', error);
      }
    }
    if (!namespace) {
      namespace = 'default';
    }
    return namespace;
  }

  async refresh(): Promise<void> {
    // check the file is empty
    const fileContent = await fs.promises.readFile(this.kubeconfigPath);
    if (fileContent.length === 0) {
      console.error(`Kubeconfig file at ${this.kubeconfigPath} is empty. Skipping.`);
      return;
    }

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
    // Only update the namespace if we're able to actually connect to the cluster, otherwise we'll end up with a connection error.
    const connected = await this.checkConnection();
    if (currentContext && connected) {
      this.currentNamespace = await this.getDefaultNamespace(currentContext);
    }
    this.setupKubeWatcher();
    this.apiResources.clear();
    await this.fetchAPIGroups();
    this.apiSender.send('pod-event');
    this.apiSender.send('kubeconfig-update');
    const configCopy = new KubeConfig();
    configCopy.loadFromString(this.kubeConfig.exportConfig());
    await this.contextsState.update(configCopy);
  }

  newError(message: string, cause: Error): Error {
    const error = new Error(message);
    error.stack += `\nCause: ${cause.stack}`;
    return error;
  }

  async createPod(namespace: string, body: V1Pod): Promise<V1Pod> {
    let telemetryOptions = {};
    const k8sCoreApi = this.kubeConfig.makeApiClient(CoreV1Api);

    try {
      const createdPodData = await k8sCoreApi.createNamespacedPod(namespace, body);
      return createdPodData.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesCreatePod', telemetryOptions);
    }
  }

  async createService(namespace: string, body: V1Service): Promise<V1Service> {
    let telemetryOptions = {};
    const k8sCoreApi = this.kubeConfig.makeApiClient(CoreV1Api);

    try {
      const createdPodData = await k8sCoreApi.createNamespacedService(namespace, body);
      return createdPodData.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesCreateService', telemetryOptions);
    }
  }

  async createIngress(namespace: string, body: V1Ingress): Promise<V1Ingress> {
    let telemetryOptions = {};
    const k8sCoreApi = this.kubeConfig.makeApiClient(NetworkingV1Api);

    try {
      const createdIngressData = await k8sCoreApi.createNamespacedIngress(namespace, body);
      return createdIngressData.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesCreateIngress', telemetryOptions);
    }
  }

  async createOpenShiftRoute(namespace: string, body: V1Route): Promise<V1Route> {
    let telemetryOptions = {};
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
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesCreateRoute', telemetryOptions);
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
      if (res?.body) {
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
    // Only retrieve pods if valid namespace && valid connection, otherwise we will return an empty array
    const connected = await this.checkConnection();
    if (ns && connected) {
      const pods = await this.listNamespacedPod(ns);
      return pods.items.map(pod => toPodInfo(pod, this.getCurrentContextName()));
    }
    return [];
  }

  // List all deployments
  async listDeployments(): Promise<V1Deployment[]> {
    const ns = this.getCurrentNamespace();
    // Only retrieve deployments if valid namespace && valid connection, otherwise we will return an empty array
    const connected = await this.checkConnection();
    if (ns && connected) {
      // Get the deployments via the kubernetes api
      try {
        const k8sAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
        const deployments = await k8sAppsApi.listNamespacedDeployment(ns);
        return deployments.body.items;
      } catch (_) {
        // do nothing
      }
    }
    return [];
  }

  // List all ingresses
  async listIngresses(): Promise<V1Ingress[]> {
    const ns = this.getCurrentNamespace();
    // Only retrieve ingresses if valid namespace && valid connection, otherwise we will return an empty array
    const connected = await this.checkConnection();
    if (ns && connected) {
      // Get the ingresses via the kubernetes api
      try {
        const k8sNetworkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
        const ingresses = await k8sNetworkingApi.listNamespacedIngress(ns);
        return ingresses.body.items;
      } catch (_) {
        // do nothing
      }
    }
    return [];
  }

  // List all routes
  async listRoutes(): Promise<V1Route[]> {
    const ns = this.getCurrentNamespace();
    // Only retrieve routes if valid namespace && valid connection, otherwise we will return an empty array
    const connected = await this.checkConnection();
    if (ns && connected) {
      try {
        // Get the routes via the kubernetes api
        const customObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
        const routes = await customObjectsApi.listNamespacedCustomObject('route.openshift.io', 'v1', ns, 'routes');
        const body = routes.body as KubernetesListObject<V1Route>;
        return body.items;
      } catch (_) {
        // catch 404 error
        // do nothing
      }
    }
    return [];
  }

  // List all services
  async listServices(): Promise<V1Service[]> {
    const ns = this.getCurrentNamespace();
    // Only retrieve services if valid namespace && valid connection, otherwise we will return an empty array
    const connected = await this.checkConnection();
    if (ns && connected) {
      // Get the services via the kubernetes api
      try {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        const services = await k8sApi.listNamespacedService(ns);
        return services.body.items;
      } catch (_) {
        // do nothing
      }
    }
    return [];
  }

  async readPodLog(name: string, container: string, callback: (name: string, data: string) => void): Promise<void> {
    this.telemetry.track('kubernetesReadPodLog');
    const ns = this.currentNamespace;
    if (ns) {
      const log = new Log(this.kubeConfig);

      const logStream = new PassThrough();

      logStream.on('data', chunk => {
        // use write rather than console.log to prevent double line feed
        callback('data', chunk.toString('utf-8'));
      });

      await log.log(ns, name, container, logStream, { follow: true });
    }
  }

  async deletePod(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.currentNamespace;
      if (ns) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedPod(name, ns);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeletePod', telemetryOptions);
    }
  }

  async deleteDeployment(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      // Only delete deployment if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (ns && connected) {
        const k8sAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
        await k8sAppsApi.deleteNamespacedDeployment(name, ns);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeleteDeployment', telemetryOptions);
    }
  }

  async deleteConfigMap(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      // Only delete config map if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (ns && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedConfigMap(name, ns);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeleteConfigMap', telemetryOptions);
    }
  }

  async deleteSecret(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      // Only delete secret if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (ns && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedSecret(name, ns);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeleteSecret', telemetryOptions);
    }
  }

  async deletePersistentVolumeClaim(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      // Only delete PVC if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (ns && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedPersistentVolumeClaim(name, ns);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeletePersistentVolumeClaim', telemetryOptions);
    }
  }

  async deleteIngress(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      // Only delete ingress if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (ns && connected) {
        const networkingK8sApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
        await networkingK8sApi.deleteNamespacedIngress(name, ns);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeleteingress', telemetryOptions);
    }
  }

  async deleteRoute(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      // Only delete route if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (ns && connected) {
        const customObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
        await customObjectsApi.deleteNamespacedCustomObject('route.openshift.io', 'v1', ns, 'routes', name);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeleteRoute', telemetryOptions);
    }
  }

  async deleteService(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      // Only delete service if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (ns && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedService(name, ns);
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeleteService', telemetryOptions);
    }
  }

  async readNamespacedPod(name: string, namespace: string): Promise<V1Pod | undefined> {
    let telemetryOptions = {};
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedPod(name, namespace);
      if (res.body?.metadata?.managedFields) {
        delete res.body.metadata.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedPod', telemetryOptions);
    }
  }

  async readNamespacedDeployment(name: string, namespace: string): Promise<V1Deployment | undefined> {
    let telemetryOptions = {};
    const k8sAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
    try {
      const res = await k8sAppsApi.readNamespacedDeployment(name, namespace);
      if (res.body?.metadata?.managedFields) {
        delete res.body.metadata.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedDeployment', telemetryOptions);
    }
  }

  async readNamespacedPersistentVolumeClaim(
    name: string,
    namespace: string,
  ): Promise<V1PersistentVolumeClaim | undefined> {
    let telemetryOptions = {};
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedPersistentVolumeClaim(name, namespace);
      if (res?.body?.metadata?.managedFields) {
        delete res?.body.metadata?.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedPersistentVolumeClaim', telemetryOptions);
    }
  }

  async readNode(name: string): Promise<V1Node | undefined> {
    let telemetryOptions = {};
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNode(name);
      if (res.body?.metadata?.managedFields) {
        delete res.body.metadata.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNode', telemetryOptions);
    }
  }

  async readNamespacedIngress(name: string, namespace: string): Promise<V1Ingress | undefined> {
    let telemetryOptions = {};
    const k8sNetworkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
    try {
      const res = await k8sNetworkingApi.readNamespacedIngress(name, namespace);
      if (res.body?.metadata?.managedFields) {
        delete res.body.metadata.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedIngress', telemetryOptions);
    }
  }

  async readNamespacedRoute(name: string, namespace: string): Promise<V1Route | undefined> {
    let telemetryOptions = {};
    const k8sCustomObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const res = await k8sCustomObjectsApi.getNamespacedCustomObject(
        'route.openshift.io',
        'v1',
        namespace,
        'routes',
        name,
      );
      const route = res?.body as V1Route;
      if (route?.metadata?.managedFields) {
        delete route.metadata.managedFields;
      }
      return route;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedRoute', telemetryOptions);
    }
  }

  async readNamespacedService(name: string, namespace: string): Promise<V1Service | undefined> {
    let telemetryOptions = {};
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedService(name, namespace);
      if (res.body?.metadata?.managedFields) {
        delete res.body.metadata.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedService', telemetryOptions);
    }
  }

  async readNamespacedConfigMap(name: string, namespace: string): Promise<V1ConfigMap | undefined> {
    let telemetryOptions = {};
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedConfigMap(name, namespace);
      if (res.body?.metadata?.managedFields) {
        delete res.body.metadata.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedConfigMap', telemetryOptions);
    }
  }

  async readNamespacedSecret(name: string, namespace: string): Promise<V1Secret | undefined> {
    let telemetryOptions = {};
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedSecret(name, namespace);
      if (res.body?.metadata?.managedFields) {
        delete res.body.metadata.managedFields;
      }
      return res?.body;
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesReadNamespacedSecret', telemetryOptions);
    }
  }

  async listNamespaces(): Promise<V1NamespaceList> {
    try {
      const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
      const res = await k8sApi.listNamespace();
      if (res?.body) {
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

  // Check that we can connect to the cluster and return a Promise<boolean> of true or false depending on the result.
  // We will check via trying to retrieve a list of API Versions from the server.
  async checkConnection(): Promise<boolean> {
    try {
      const k8sApi = this.kubeConfig.makeApiClient(VersionApi);
      // getCode will error out if we're unable to connect to the cluster
      await k8sApi.getCode();
      return true;
    } catch (error) {
      return false;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private wrapK8sClientError(e: any): Error {
    if (e?.response?.body) {
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
    await this.refresh();
    // notify change
    this._onDidUpdateKubeconfig.fire({ type: 'UPDATE', location });
  }

  async stop(): Promise<void> {
    this.kubeConfigWatcher?.dispose();
  }

  /**
   * Convert a apiVersion value to an object with group and version field.
   *
   * @param apiVersion the apiVersion field from payload
   */
  groupAndVersion(apiVersion: string): { group: string; version: string } {
    const v = apiVersion.split('/');
    if (v.length === 1) {
      return { group: '', version: v[0] };
    } else {
      return { group: v[0], version: v[1] };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createV1Resource(client: CoreV1Api, manifest: any, optionalNamespace?: string): Promise<any> {
    if (manifest.kind === 'Namespace') {
      return client.createNamespace(manifest);
    } else if (manifest.kind === 'Pod') {
      return client.createNamespacedPod(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Service') {
      return client.createNamespacedService(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Binding') {
      return client.createNamespacedBinding(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Event') {
      return client.createNamespacedEvent(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Endpoints') {
      return client.createNamespacedEndpoints(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ConfigMap') {
      return client.createNamespacedConfigMap(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'LimitRange') {
      return client.createNamespacedLimitRange(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'PersistentVolumeClaim') {
      return client.createNamespacedPersistentVolumeClaim(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'PodBinding') {
      return client.createNamespacedPodBinding(
        manifest.metadata.name,
        optionalNamespace ?? manifest.metadata.namespace,
        manifest,
      );
    } else if (manifest.kind === 'PodEviction') {
      return client.createNamespacedPodEviction(
        manifest.metadata.name,
        optionalNamespace ?? manifest.metadata.namespace,
        manifest,
      );
    } else if (manifest.kind === 'PodTemplate') {
      return client.createNamespacedPodTemplate(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ReplicationController') {
      return client.createNamespacedReplicationController(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ResourceQuota') {
      return client.createNamespacedResourceQuota(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Secret') {
      return client.createNamespacedSecret(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ServiceAccount') {
      return client.createNamespacedServiceAccount(optionalNamespace ?? manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ServiceAccountToken') {
      return client.createNamespacedServiceAccountToken(
        manifest.metadata.name,
        optionalNamespace ?? manifest.metadata.namespace,
        manifest,
      );
    }
    return Promise.reject(new Error(`Unsupported kind ${manifest.kind}`));
  }

  createCustomResource(
    client: CustomObjectsApi,
    group: string,
    version: string,
    plural: string,
    namespace: string | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    manifest: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    if (namespace) {
      return client.createNamespacedCustomObject(group, version, namespace, plural, manifest);
    } else {
      return client.createClusterCustomObject(group, version, manifest.kind.toLowerCase() + 's', manifest);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getTags(tags: any[]): any[] {
    for (const tag of tags) {
      if (tag.tag === 'tag:yaml.org,2002:int') {
        const newTag = { ...tag };
        newTag.test = /^(0[0-7][0-7][0-7])$/;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        newTag.resolve = (str: any): number => parseInt(str, 8);
        tags.unshift(newTag);
        break;
      }
    }
    return tags;
  }

  async getAPIResource(
    client: CustomObjectsApi,
    apiGroup: { group: string; version: string },
    kind: string,
  ): Promise<V1APIResource> {
    let apiResources = this.apiResources.get(apiGroup.group + '/' + apiGroup.version);
    if (!apiResources) {
      const response = await client.listClusterCustomObject(apiGroup.group, apiGroup.version, '');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiResources = (response.body as any).resources;
      this.apiResources.set(apiGroup.group + '/' + apiGroup.version, apiResources as V1APIResource[]);
    }
    if (apiResources) {
      for (const apiResource of apiResources) {
        if (apiResource.kind === kind) {
          return apiResource;
        }
      }
    }
    throw new Error(`Unable to find API resource for ${apiGroup.group}/${apiGroup.version}/${kind}`);
  }

  // load yaml file and extract manifests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadManifestsFromFile(file: string): Promise<KubernetesObject[]> {
    // throw exception if file does not exist
    if (!fs.existsSync(file)) {
      throw new Error(`File ${file} does not exist`);
    }

    // load file and create resources
    const content = await fs.promises.readFile(file, 'utf-8');

    const manifests = parseAllDocuments(content, { customTags: this.getTags });
    // filter out null manifests
    return manifests.map(manifest => manifest.toJSON()).filter(manifest => !!manifest);
  }

  /**
   * Create a given yaml file on a context, i.e. 'kubectl create -f'. If the resources exists
   * an error will be thrown.
   *
   * @param context a context
   * @param filePath file system path to a YAML Kubernetes spec
   * @param namespace the namespace to use for any resources that don't include one
   */
  async createResourcesFromFile(context: string, filePath: string, namespace?: string): Promise<void> {
    const manifests = await this.loadManifestsFromFile(filePath);
    if (manifests.filter(s => s?.kind).length === 0) {
      throw new Error('No valid Kubernetes resources found in file');
    }
    await this.syncResources(context, manifests, 'create', namespace);
  }

  /**
   * Create Kubernetes resources on the specified cluster. Resources are created sequentially.
   *
   * @param context the context name to use
   * @param manifests the list of Kubernetes resources to create
   * @param namespace the namespace to use for any resources that don't include one
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createResources(context: string, manifests: any[], namespace?: string): Promise<void> {
    await this.syncResources(context, manifests, 'create', namespace);
  }

  /**
   * Apply a given yaml file to a context, i.e. 'kubectl apply -f'. Resources that exist
   * on the context are patched, and any new resources are created.
   *
   * @param context a context
   * @param filePath file system path to a YAML Kubernetes spec
   * @param namespace the namespace to use for any resources that don't include one
   * @return an array of resources created
   */
  async applyResourcesFromFile(context: string, filePath: string, namespace?: string): Promise<KubernetesObject[]> {
    const manifests = await this.loadManifestsFromFile(filePath);
    if (manifests.filter(s => s?.kind).length === 0) {
      throw new Error('No valid Kubernetes resources found in file');
    }
    return this.syncResources(context, manifests, 'apply', namespace);
  }

  /**
   * Load manifests from a YAML string.
   * @param yaml the YAML string
   * @return an array of Kubernetes resources
   */
  async loadManifestsFromYAML(yaml: string): Promise<KubernetesObject[]> {
    const manifests = parseAllDocuments(yaml, { customTags: this.getTags });
    // filter out any null manifests
    return manifests.map(manifest => manifest.toJSON()).filter(manifest => !!manifest);
  }

  /**
   * Similar to applyResourcesFromFile, but instead you can pass in a string that contains the YAML
   *
   * @param context a context
   * @param yaml content consisting of a stringified YAML
   * @return an array of resources created
   */
  async applyResourcesFromYAML(context: string, yaml: string): Promise<KubernetesObject[]> {
    const manifests = await this.loadManifestsFromYAML(yaml);
    return this.applyResources(context, manifests);
  }

  /**
   * Apply a given yaml file to a context, i.e. 'kubectl apply -f'. Resources that exist
   * on the context are patched, and any new resources are created.
   *
   * @param context a context
   * @param filePath file system path to a YAML Kubernetes spec
   * @param namespace the namespace to use for any resources that don't include one
   * @return an array of resources created
   */
  async applyResources(
    context: string,
    manifests: KubernetesObject[],
    namespace?: string,
  ): Promise<KubernetesObject[]> {
    return this.syncResources(context, manifests, 'apply', namespace);
  }

  /**
   * Applies or creates a set of resources to a context, via creation or patching.
   *
   * @param context a context
   * @param manifests a set of Kubernetes spec manifests
   * @param action 'create' (only create new resources, do not overwrite existing) or 'apply' (create or patch as necessary)
   * @param namespace the namespace to use for any resources that don't include one
   * @return an array of resources created
   *
   * Heavily influenced by the API example:
   * https://github.com/kubernetes-client/javascript/blob/0fbfd8fc2dcc7f4ec3e6fcd64a5c55169b6ef0b8/examples/typescript/apply/apply-example.ts
   */
  async syncResources(
    context: string,
    manifests: KubernetesObject[],
    action: 'create' | 'apply',
    namespace?: string,
  ): Promise<KubernetesObject[]> {
    const telemetryOptions: Record<string, unknown> = {
      manifestsSize: manifests?.length,
      action: action,
    };
    if (namespace) {
      telemetryOptions.namespace = namespace;
    }

    try {
      const ctx = new KubeConfig();
      ctx.loadFromFile(this.kubeconfigPath);
      ctx.currentContext = context;

      const validSpecs = manifests.filter(s => s?.kind) as KubernetesObjectWithKind[];

      const client = ctx.makeApiClient(KubernetesObjectApi);
      const created: KubernetesObject[] = [];
      for (const spec of validSpecs) {
        // this is to convince TypeScript that metadata exists
        spec.metadata = spec.metadata ?? {};
        spec.metadata.annotations = spec.metadata.annotations ?? {};

        delete spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'];
        spec.metadata.annotations['kubectl.kubernetes.io/last-applied-configuration'] = JSON.stringify(spec);

        if (!spec.metadata.namespace) {
          spec.metadata.namespace = namespace ?? DEFAULT_NAMESPACE;
        }
        try {
          // try to get the resource, if it does not exist an error will be thrown and we will
          // end up in the catch block
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await client.read(spec as any);
          // we got the resource, so it exists: patch it
          //
          // Note that this could fail if the spec refers to a custom resource. For custom resources
          // you may need to specify a different patch merge strategy in the content-type header
          //
          // See: https://github.com/kubernetes/kubernetes/issues/97423
          if (action === 'apply') {
            const response = await client.patch(
              spec,
              undefined /* pretty */,
              undefined /* dryRun */,
              FIELD_MANAGER /* fieldManager */,
            );
            created.push(response.body);
          }
        } catch (error) {
          // we did not get the resource, so it does not exist: create it
          const response = await client.create(spec);
          created.push(response.body);
        }
      }
      return created;
    } catch (error: unknown) {
      telemetryOptions.error = error;
      if (error instanceof HttpError) {
        const httpError = error as HttpError;

        // If there is a "message" in the body of the http error, throw that
        // as that's where Kubernetes tends to put the error message
        if (httpError.body?.message) {
          throw new Error(httpError.body.message);
        }

        // Otherwise, throw the "generic" HTTP error message
        if (httpError.message) {
          throw new Error(httpError.message);
        }

        // If all else fails, throw the body of the error
        throw new Error(httpError.body);
      }
      throw error;
    } finally {
      this.telemetry.track('kubernetesSyncResources', telemetryOptions);
    }
  }

  public getContextsGeneralState(): Map<string, ContextGeneralState> {
    return this.contextsState.getContextsGeneralState();
  }

  public getCurrentContextGeneralState(): ContextGeneralState {
    return this.contextsState.getCurrentContextGeneralState();
  }

  public registerGetCurrentContextResources(resourceName: ResourceName): KubernetesObject[] {
    return this.contextsState.registerGetCurrentContextResources(resourceName);
  }

  public unregisterGetCurrentContextResources(resourceName: ResourceName): KubernetesObject[] {
    return this.contextsState.unregisterGetCurrentContextResources(resourceName);
  }

  public dispose(): void {
    this.contextsState.dispose();
  }

  async execIntoContainer(
    podName: string,
    containerName: string,
    onStdOut: (data: Buffer) => void,
    onStdErr: (data: Buffer) => void,
    onClose: () => void,
  ): Promise<{ onStdIn: (data: string) => void; onResize: (columns: number, rows: number) => void }> {
    let telemetryOptions = {};
    try {
      const ns = this.getCurrentNamespace();
      const connected = await this.checkConnection();
      if (!ns) {
        throw new Error('no active namespace');
      }
      if (!connected) {
        throw new Error('not active connection');
      }

      const stdout = new ResizableTerminalWriter(new BufferedStreamWriter(onStdOut));
      const stderr = new ResizableTerminalWriter(new BufferedStreamWriter(onStdErr));
      const stdin = new StringLineReader();

      const exec = new Exec(this.kubeConfig);
      const conn = await exec.exec(
        ns,
        podName,
        containerName,
        ['/bin/sh', '-c', 'if command -v bash >/dev/null 2>&1; then bash; else sh; fi'],
        stdout,
        stderr,
        stdin,
        true,
        (_: V1Status) => {
          // need to think, maybe it would be better to pass exit code to the client, but on the other hand
          // if connection is idle for 15 minutes, websocket connection closes automatically and this handler
          // does not call. also need to separate SIGTERM signal (143) and normally exit signals to be able to
          // proper reconnect client terminal. at this moment we ignore status and rely on websocket close event
        },
      );

      //need to handle websocket idling, which causes the connection close which is not passed to the execution status
      //approx time for idling before closing socket is 15 minutes. code and reason are always undefined here.
      conn.on('close', () => {
        onClose();
      });

      return {
        onStdIn: (data: string): void => {
          stdin.readLine(data);
        },
        onResize: (columns: number, rows: number): void => {
          if (columns <= 0 || rows <= 0 || isNaN(columns) || isNaN(rows) || columns === Infinity || rows === Infinity) {
            throw new Error('resizing must be done using positive cols and rows');
          }

          (stdout as ResizableTerminalWriter).resize({ width: columns, height: rows });
        },
      };
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesExecIntoContainer', telemetryOptions);
    }
  }
}
