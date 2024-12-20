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
  RequestContext,
  ResponseContext,
  V1APIGroup,
  V1APIResource,
  V1ConfigMap,
  V1ContainerState,
  V1Deployment,
  V1Ingress,
  V1NamespaceList,
  V1Node,
  V1ObjectMeta,
  V1OwnerReference,
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
  BatchV1Api,
  CoreV1Api,
  createConfiguration,
  CustomObjectsApi,
  Exec,
  FetchError,
  KubeConfig,
  KubernetesObjectApi,
  Log,
  NetworkingV1Api,
  VersionApi,
  Watch,
} from '@kubernetes/client-node';
import { PromiseMiddlewareWrapper } from '@kubernetes/client-node/dist/gen/middleware.js';
import type * as containerDesktopAPI from '@podman-desktop/api';
import * as jsYaml from 'js-yaml';
import type { WebSocket } from 'ws';
import { parseAllDocuments } from 'yaml';

import type { KubernetesPortForwardService } from '/@/plugin/kubernetes/kubernetes-port-forward-service.js';
import { KubernetesPortForwardServiceProvider } from '/@/plugin/kubernetes/kubernetes-port-forward-service.js';
import type { KubeContext } from '/@api/kubernetes-context.js';
import type { ContextHealth } from '/@api/kubernetes-contexts-healths.js';
import type { ContextPermission } from '/@api/kubernetes-contexts-permissions.js';
import type { ContextGeneralState, ResourceName } from '/@api/kubernetes-contexts-states.js';
import type { ForwardConfig, ForwardOptions } from '/@api/kubernetes-port-forward-model.js';
import type { V1Route } from '/@api/openshift-types.js';

import type { ApiSenderType } from '../api.js';
import type { PodInfo } from '../api/pod-info.js';
import type { ConfigurationRegistry, IConfigurationNode } from '../configuration-registry.js';
import { Emitter } from '../events/emitter.js';
import type { FilesystemMonitoring } from '../filesystem-monitoring.js';
import type { Telemetry } from '../telemetry/telemetry.js';
import { Uri } from '../types/uri.js';
import { ContextsManager } from './contexts-manager.js';
import { ContextsManagerExperimental } from './contexts-manager-experimental.js';
import { ContextsStatesDispatcher } from './contexts-states-dispatcher.js';
import {
  BufferedStreamWriter,
  ExecStreamWriter,
  ResizableTerminalWriter,
  StringLineReader,
} from './kubernetes-exec-transmitter.js';

interface ContextsManagerInterface {
  // indicate to the manager that the kubeconfig has changed
  update(kubeconfig: KubeConfig): Promise<void>;
  // get the general state of contexts
  getContextsGeneralState(): Map<string, ContextGeneralState>;
  // get the general state of the current context
  getCurrentContextGeneralState(): ContextGeneralState;
  // register for `resource` state in current context
  registerGetCurrentContextResources(resourceName: ResourceName): KubernetesObject[];
  // unregister from `resource` state in current context
  unregisterGetCurrentContextResources(resourceName: ResourceName): KubernetesObject[];
  // dispose resources created by the manager
  dispose(): void;
  // force the manager to refresh the state for the given context
  refreshContextState(contextName: string): Promise<void>;
}

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
    Status: pod.metadata?.deletionTimestamp ? 'DELETING' : (pod.status?.phase ?? ''),
    engineId: contextName ?? 'kubernetes',
    engineName: 'Kubernetes',
    kind: 'kubernetes',
    node: pod.spec?.nodeName,
  };
}

const OPENSHIFT_PROJECT_API_GROUP = 'project.openshift.io';

const DEFAULT_NAMESPACE = 'default';

const FIELD_MANAGER = 'podman-desktop';

const SCALABLE_CONTROLLER_TYPES = ['Deployment', 'ReplicaSet', 'StatefulSet'];
export type ScalableControllerType = (typeof SCALABLE_CONTROLLER_TYPES)[number];
export type ControllerType = ScalableControllerType | 'Job' | 'DaemonSet' | 'CronJob' | undefined;
function isScalableControllerType(string: unknown): string is ScalableControllerType {
  return typeof string === 'string' && SCALABLE_CONTROLLER_TYPES.includes(string);
}

export interface PodCreationSource {
  isManuallyCreated: boolean;
  controllerType: ControllerType;
}

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

  private contextsState: ContextsManagerInterface;
  private contextsStatesDispatcher: ContextsStatesDispatcher | undefined;

  private readonly _onDidUpdateKubeconfig = new Emitter<containerDesktopAPI.KubeconfigUpdateEvent>();
  readonly onDidUpdateKubeconfig: containerDesktopAPI.Event<containerDesktopAPI.KubeconfigUpdateEvent> =
    this._onDidUpdateKubeconfig.event;

  static readonly portForwardServiceProvider = new KubernetesPortForwardServiceProvider();

  #portForwardService?: KubernetesPortForwardService;

  #execs: Map<
    string,
    { stdout: ExecStreamWriter; stderr: ExecStreamWriter; stdin: StringLineReader; conn: WebSocket }
  > = new Map();

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
          readonly: false,
        },
        ['kubernetes.statesExperimental']: {
          description: 'Use new version of Kubernetes states',
          type: 'boolean',
          default: false,
          hidden: true,
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

    const statesExperimental = kubernetesConfiguration.get<boolean>('statesExperimental');
    if (statesExperimental) {
      const manager = new ContextsManagerExperimental();
      this.contextsState = manager;
      this.contextsStatesDispatcher = new ContextsStatesDispatcher(manager, this.apiSender);
      this.contextsStatesDispatcher.init();
    }

    // Update the property on change
    this.configurationRegistry.onDidChangeConfiguration(async e => {
      if (e.key === 'kubernetes.Kubeconfig') {
        let val = e.value as string;
        if (!val?.trim()) {
          val = defaultKubeconfigPath;
        }
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
        this.apiGroups = result?.groups;
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

  getKubeConfig(): KubeConfig {
    return this.kubeConfig;
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
          .listClusterCustomObject({ group: OPENSHIFT_PROJECT_API_GROUP, version: 'v1', plural: 'projects' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((projects?.body as any)?.items.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          namespace = (projects?.body as any)?.items[0].metadata?.name;
        }
      }
    } catch (err) {
      try {
        const namespaces = await ctx.makeApiClient(CoreV1Api).listNamespace();
        if (namespaces?.items.length > 0) {
          namespace = namespaces?.items[0]?.metadata?.name;
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
    this.#portForwardService?.dispose();
    this.#execs.forEach(entry => entry.conn.close());
    this.#execs.clear();
    this.#portForwardService = KubernetesClient.portForwardServiceProvider.getService(this, this.apiSender);
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
      return await k8sCoreApi.createNamespacedPod({ namespace, body });
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
      return await k8sCoreApi.createNamespacedService({ namespace, body });
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
      return await k8sCoreApi.createNamespacedIngress({ namespace, body });
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
      return await k8sCustomObjectsApi.createNamespacedCustomObject({
        group: 'route.openshift.io',
        version: 'v1',
        namespace,
        plural: 'routes',
        body,
      });
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
      return await k8sApi.listNamespacedPod({
        namespace,
        fieldSelector,
        labelSelector,
      });
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

  // List all routes
  async listRoutes(): Promise<V1Route[]> {
    const namespace = this.getCurrentNamespace();
    // Only retrieve routes if valid namespace && valid connection, otherwise we will return an empty array
    const connected = await this.checkConnection();
    if (namespace && connected) {
      try {
        // Get the routes via the kubernetes api
        const customObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
        const routes = await customObjectsApi.listNamespacedCustomObject({
          group: 'route.openshift.io',
          version: 'v1',
          namespace,
          plural: 'routes',
        });
        const body = routes as KubernetesListObject<V1Route>;
        return body.items;
      } catch (_) {
        // catch 404 error
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
      const namespace = this.currentNamespace;
      if (namespace) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedPod({ name, namespace });
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
      const namespace = this.getCurrentNamespace();
      // Only delete deployment if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (namespace && connected) {
        const k8sAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
        await k8sAppsApi.deleteNamespacedDeployment({ name, namespace });
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
      const namespace = this.getCurrentNamespace();
      // Only delete config map if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (namespace && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedConfigMap({ name, namespace });
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
      const namespace = this.getCurrentNamespace();
      // Only delete secret if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (namespace && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedSecret({ name, namespace });
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
      const namespace = this.getCurrentNamespace();
      // Only delete PVC if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (namespace && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedPersistentVolumeClaim({ name, namespace });
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
      const namespace = this.getCurrentNamespace();
      // Only delete ingress if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (namespace && connected) {
        const networkingK8sApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
        await networkingK8sApi.deleteNamespacedIngress({ name, namespace });
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
      const namespace = this.getCurrentNamespace();
      // Only delete route if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (namespace && connected) {
        const customObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
        await customObjectsApi.deleteNamespacedCustomObject({
          group: 'route.openshift.io',
          version: 'v1',
          namespace,
          plural: 'routes',
          name,
        });
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
      const namespace = this.getCurrentNamespace();
      // Only delete service if valid namespace && valid connection
      const connected = await this.checkConnection();
      if (namespace && connected) {
        const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
        await k8sApi.deleteNamespacedService({ name, namespace });
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesDeleteService', telemetryOptions);
    }
  }

  async readNamespacedPod(name: string, namespace: string): Promise<V1Pod> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedPod({ name, namespace });
      if (res?.metadata?.managedFields) {
        delete res.metadata.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedPod.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedDeployment(name: string, namespace: string): Promise<V1Deployment> {
    const k8sAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
    try {
      const res = await k8sAppsApi.readNamespacedDeployment({ name, namespace });
      if (res?.metadata?.managedFields) {
        delete res.metadata.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedDeployment.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedPersistentVolumeClaim(
    name: string,
    namespace: string,
  ): Promise<V1PersistentVolumeClaim | undefined> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedPersistentVolumeClaim({ name, namespace });
      if (res?.metadata?.managedFields) {
        delete res?.metadata?.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedPersistentVolumeClaim.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNode(name: string): Promise<V1Node | undefined> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNode({ name });
      if (res?.metadata?.managedFields) {
        delete res.metadata.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNode.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedIngress(name: string, namespace: string): Promise<V1Ingress | undefined> {
    const k8sNetworkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
    try {
      const res = await k8sNetworkingApi.readNamespacedIngress({ name, namespace });
      if (res?.metadata?.managedFields) {
        delete res.metadata.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedIngress.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedRoute(name: string, namespace: string): Promise<V1Route | undefined> {
    const k8sCustomObjectsApi = this.kubeConfig.makeApiClient(CustomObjectsApi);
    try {
      const res = await k8sCustomObjectsApi.getNamespacedCustomObject({
        group: 'route.openshift.io',
        version: 'v1',
        namespace,
        plural: 'routes',
        name,
      });
      const route = res?.body as V1Route;
      if (route?.metadata?.managedFields) {
        delete route.metadata.managedFields;
      }
      return route;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedRoute.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedService(name: string, namespace: string): Promise<V1Service> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedService({ name, namespace });
      if (res?.metadata?.managedFields) {
        delete res.metadata.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedService.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedConfigMap(name: string, namespace: string): Promise<V1ConfigMap | undefined> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedConfigMap({ name, namespace });
      if (res?.metadata?.managedFields) {
        delete res.metadata.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedConfigMap.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async readNamespacedSecret(name: string, namespace: string): Promise<V1Secret | undefined> {
    const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
    try {
      const res = await k8sApi.readNamespacedSecret({ name, namespace });
      if (res?.metadata?.managedFields) {
        delete res.metadata.managedFields;
      }
      return res;
    } catch (error) {
      this.telemetry.track('kubernetesReadNamespacedSecret.error', error);
      throw this.wrapK8sClientError(error);
    }
  }

  async listNamespaces(): Promise<V1NamespaceList> {
    try {
      const k8sApi = this.kubeConfig.makeApiClient(CoreV1Api);
      return await k8sApi.listNamespace();
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
  async applyResourcesFromFile(
    context: string,
    filePath: string | string[],
    namespace?: string,
  ): Promise<KubernetesObject[]> {
    const manifests: KubernetesObject[] = [];
    if (typeof filePath === 'string') {
      manifests.push(...(await this.loadManifestsFromFile(filePath)));
    } else {
      for (const path of filePath) {
        manifests.push(...(await this.loadManifestsFromFile(path)));
      }
    }
    if (manifests.filter(s => s?.kind).length === 0) {
      throw new Error('No valid Kubernetes resources found');
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
      telemetryOptions['namespace'] = namespace;
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
            // When patching a resource, we do not need certain metadata fields to be present such as resourceVersion, uid, selfLink, and creationTimestamp
            // these cause conflicts when patching a resource since client.patch will serialize these fields and the server will reject the request
            // this change is due to changes on how client.patch / client.create works with the latest serialization changes in:
            // https://github.com/kubernetes-client/javascript/pull/1695 with regards to date.
            // we also remove resourceVersion so we may apply multiple edits to the same resource without having to entirely retrieve and reload the YAML
            // from the server before applying.
            delete spec.metadata?.resourceVersion;
            delete spec.metadata?.uid;
            delete spec.metadata?.selfLink;
            delete spec.metadata?.creationTimestamp;

            const response = await client.patch(
              spec,
              undefined /* pretty */,
              undefined /* dryRun */,
              FIELD_MANAGER /* fieldManager */,
            );
            created.push(response);
          }
        } catch (error) {
          // we did not get the resource, so it does not exist: create it
          const response = await client.create(spec);
          created.push(response);
        }
      }
      return created;
    } catch (error: unknown) {
      telemetryOptions['error'] = error;
      if (error instanceof FetchError) {
        const httpError = error as FetchError;

        // If there is a "message" in the body of the http error, throw that
        // as that's where Kubernetes tends to put the error message
        if (httpError.message) {
          throw new Error(httpError.message);
        }

        // Otherwise, throw the "generic" HTTP error message
        if (httpError.message) {
          throw new Error(httpError.message);
        }

        // If all else fails, throw the body of the error
        throw new Error(httpError.message);
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
    let stdin: StringLineReader;
    let stdout: ExecStreamWriter;
    let stderr: ExecStreamWriter;
    const entry = this.#execs.get(`${podName}-${containerName}`);
    if (entry) {
      stdin = entry.stdin;
      stdout = entry.stdout;
      stdout.delegate = new ResizableTerminalWriter(new BufferedStreamWriter(onStdOut));
      stderr = entry.stderr;
      stderr.delegate = new ResizableTerminalWriter(new BufferedStreamWriter(onStdErr));
      entry.conn.on('close', () => {
        onClose();
      });
    } else {
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

        stdout = new ExecStreamWriter(new ResizableTerminalWriter(new BufferedStreamWriter(onStdOut)));
        stderr = new ExecStreamWriter(new ResizableTerminalWriter(new BufferedStreamWriter(onStdErr)));
        stdin = new StringLineReader();

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
          this.#execs.delete(`${podName}-${containerName}`);
        });
        this.#execs.set(`${podName}-${containerName}`, { stdin, stdout, stderr, conn });
      } catch (error) {
        telemetryOptions = { error: error };
        throw this.wrapK8sClientError(error);
      } finally {
        this.telemetry.track('kubernetesExecIntoContainer', telemetryOptions);
      }
    }

    return {
      onStdIn: (data: string): void => {
        stdin.readLine(data);
      },
      onResize: (columns: number, rows: number): void => {
        if (columns <= 0 || rows <= 0 || isNaN(columns) || isNaN(rows) || columns === Infinity || rows === Infinity) {
          throw new Error('resizing must be done using positive cols and rows');
        }

        ((stdout as ExecStreamWriter).delegate as ResizableTerminalWriter).resize({ width: columns, height: rows });
      },
    };
  }

  async restartPod(name: string): Promise<void> {
    let telemetryOptions = {};
    try {
      const ns = this.currentNamespace;
      const connected = await this.checkConnection();
      if (!ns) {
        throw new Error('no active namespace');
      }
      if (!connected) {
        throw new Error('not active connection');
      }

      const pod = await this.readNamespacedPod(name, ns);
      if (!pod?.metadata) {
        throw new Error('no metadata found');
      }

      const creationSource = this.checkPodCreationSource(pod.metadata);
      if (creationSource.isManuallyCreated) {
        await this.restartManuallyCreatedPod(name, ns, pod);
      } else {
        if (!creationSource.controllerType) {
          throw new Error('unable to restart controlled pod');
        }

        const controller = this.getPodController(pod.metadata);
        const controllerName = controller!.name;

        if (isScalableControllerType(creationSource.controllerType)) {
          await this.scaleControllerToRestartPods(ns, controllerName, creationSource.controllerType);
        } else if (creationSource.controllerType === 'Job') {
          await this.restartJob(controllerName, ns);
        }
      }
    } catch (error) {
      telemetryOptions = { error: error };
      throw this.wrapK8sClientError(error);
    } finally {
      this.telemetry.track('kubernetesRestartPod', telemetryOptions);
    }
  }

  protected async restartManuallyCreatedPod(name: string, namespace: string, pod: V1Pod): Promise<void> {
    const coreApi = this.kubeConfig.makeApiClient(CoreV1Api);
    await coreApi.deleteNamespacedPod({ name, namespace });

    const isDeleted = await this.waitForPodDeletion(coreApi, name, namespace);
    if (!isDeleted) {
      throw new Error(`pod "${name}" in namespace "${namespace}" was not deleted within the expected timeframe`);
    }

    delete pod.metadata?.resourceVersion;
    delete pod.metadata?.uid;
    delete pod.metadata?.selfLink;
    delete pod.metadata?.creationTimestamp;
    delete pod.status;

    const newPod: V1Pod = { ...pod };
    await coreApi.createNamespacedPod({ namespace, body: newPod });
  }

  protected async waitForPodDeletion(
    coreApi: CoreV1Api,
    name: string,
    namespace: string,
    timeout: number = 60000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await coreApi.readNamespacedPodStatus({ name, namespace });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        const error = e ?? {};
        if (typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { statusCode: number } };
          if (axiosError.response.statusCode === 404) {
            return true;
          }
        }
        throw e;
      }
    }

    return false;
  }

  protected async scaleControllerToRestartPods(
    namespace: string,
    controllerName: string,
    controllerType: ScalableControllerType,
    timeout: number = 10000,
  ): Promise<void> {
    const appsApi = this.kubeConfig.makeApiClient(AppsV1Api);

    let currentReplicas = 0;
    if (controllerType === 'Deployment') {
      const currentDeployment = await appsApi.readNamespacedDeployment({ name: controllerName, namespace });
      currentReplicas = currentDeployment.spec?.replicas ?? 1;
    } else if (controllerType === 'ReplicaSet') {
      const currentReplicaSet = await appsApi.readNamespacedReplicaSet({ name: controllerName, namespace });
      currentReplicas = currentReplicaSet.spec?.replicas ?? 1;
    } else if (controllerType === 'StatefulSet') {
      const currentStatefulSet = await appsApi.readNamespacedStatefulSet({ name: controllerName, namespace });
      currentReplicas = currentStatefulSet.spec?.replicas ?? 1;
    }

    await this.scaleController(appsApi, namespace, controllerName, controllerType, 0);

    await new Promise(resolve => setTimeout(resolve, timeout));

    await this.scaleController(appsApi, namespace, controllerName, controllerType, currentReplicas);
  }

  protected async scaleController(
    appsApi: AppsV1Api,
    namespace: string,
    controllerName: string,
    controllerType: ScalableControllerType,
    replicas: number,
  ): Promise<void> {
    const headerPatchMiddleware = new PromiseMiddlewareWrapper({
      pre: async (requestContext: RequestContext): Promise<RequestContext> => {
        requestContext.setHeaderParam('Content-type', 'application/json-patch+json');
        return requestContext;
      },
      post: async (context: ResponseContext): Promise<ResponseContext> => {
        return context;
      },
    });

    const configuration = createConfiguration({ middleware: [headerPatchMiddleware] });

    if (controllerType === 'Deployment') {
      await appsApi.patchNamespacedDeploymentScale(
        { name: controllerName, namespace, body: { spec: { replicas } } },
        configuration,
      );
    } else if (controllerType === 'ReplicaSet') {
      await appsApi.patchNamespacedReplicaSetScale(
        {
          name: controllerName,
          namespace,
          body: { spec: { replicas } },
        },
        configuration,
      );
    } else if (controllerType === 'StatefulSet') {
      await appsApi.patchNamespacedStatefulSetScale(
        { name: controllerName, namespace, body: { spec: { replicas } } },
        configuration,
      );
    }
  }

  protected async restartJob(name: string, namespace: string): Promise<void> {
    const batchApi = this.kubeConfig.makeApiClient(BatchV1Api);
    const coreApi = this.kubeConfig.makeApiClient(CoreV1Api);

    const existingJob = await batchApi.readNamespacedJob({ name, namespace });
    await batchApi.deleteNamespacedJob({
      name,
      namespace,
      pretty: 'true',
      propagationPolicy: 'Background',
    });

    const isJobDeleted = await this.waitForJobDeletion(batchApi, name, namespace);
    if (!isJobDeleted) {
      throw new Error(`job "${name}" in namespace "${namespace}" was not deleted within the expected timeframe`);
    }

    const labelSelector = `job-name=${name}`;
    const isPodsDeleted = await this.waitForPodsDeletion(coreApi, namespace, labelSelector);
    if (!isPodsDeleted) {
      throw new Error(
        `not all pods with selector "${labelSelector}" in namespace "${namespace}" were deleted within the expected timeframe`,
      );
    }
    delete existingJob.metadata!.creationTimestamp;
    delete existingJob.metadata!.resourceVersion;
    delete existingJob.metadata!.selfLink;
    delete existingJob.metadata!.uid;
    delete existingJob.metadata!.ownerReferences;
    delete existingJob.status;
    delete existingJob.spec!.selector;
    if (existingJob.spec!.template.metadata!.labels) {
      delete existingJob.spec!.template.metadata!.labels['controller-uid'];
      delete existingJob.spec!.template.metadata!.labels['batch.kubernetes.io/controller-uid'];
      delete existingJob.spec!.template.metadata!.labels['batch.kubernetes.io/job-name'];
      delete existingJob.spec!.template.metadata!.labels['job-name'];
    }
    if (existingJob.metadata?.labels) {
      delete existingJob.metadata.labels['controller-uid'];
      delete existingJob.metadata.labels['batch.kubernetes.io/controller-uid'];
      delete existingJob.metadata.labels['batch.kubernetes.io/job-name'];
      delete existingJob.metadata.labels['job-name'];
    }

    await batchApi.createNamespacedJob({ namespace, body: existingJob });
  }

  protected async waitForJobDeletion(
    batchApi: BatchV1Api,
    name: string,
    namespace: string,
    timeout: number = 60000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        await batchApi.readNamespacedJobStatus({ name, namespace });
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        const error = e ?? {};
        if (typeof error === 'object' && 'response' in error) {
          const axiosError = error as { response: { statusCode: number } };
          if (axiosError.response.statusCode === 404) {
            return true;
          }
        }
        throw e;
      }
    }

    return false;
  }

  protected async waitForPodsDeletion(
    coreApi: CoreV1Api,
    namespace: string,
    selector: string,
    timeout: number = 60000,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const podList = await coreApi.listNamespacedPod({ namespace, labelSelector: selector });
      if (podList.items.length === 0) {
        return true;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return false;
  }

  protected checkPodCreationSource(podMetadata: V1ObjectMeta): PodCreationSource {
    const controller = this.getPodController(podMetadata);
    if (controller) {
      return {
        isManuallyCreated: false,
        controllerType: controller.kind,
      };
    }

    return {
      isManuallyCreated: true,
      controllerType: undefined,
    };
  }

  protected getPodController(podMetadata: V1ObjectMeta): V1OwnerReference | undefined {
    // possible check is also in pod-template-hash label:
    // pod.metadata?.labels && 'pod-template-hash' in pod.metadata.labels
    return podMetadata.ownerReferences?.find((ref: V1OwnerReference) => ref.controller === true);
  }

  /**
   * Ask for getting the state of the context as soon as possible.
   *
   * Because the connection to a context is tested with a backoff,
   * it can take time to know if a context is reachable or not.
   * By calling this method, the connection will be tested immediately,
   * and the result sent as soon as the connection status is known.
   *
   * @param context name of the context for which we want to get state ASAP
   * @returns
   */
  public async refreshContextState(context: string): Promise<void> {
    return this.contextsState.refreshContextState(context);
  }

  protected ensurePortForwardService(): KubernetesPortForwardService {
    if (!this.#portForwardService) {
      this.#portForwardService = KubernetesClient.portForwardServiceProvider.getService(this, this.apiSender);
    }
    return this.#portForwardService;
  }

  public async getPortForwards(): Promise<ForwardConfig[]> {
    return this.ensurePortForwardService().listForwards();
  }

  public async createPortForward(config: ForwardOptions): Promise<ForwardConfig> {
    const service = this.ensurePortForwardService();
    const newConfig = await service.createForward(config);
    try {
      await service.startForward(newConfig);
      return newConfig;
    } catch (err: unknown) {
      await service.deleteForward(newConfig);
      throw err;
    }
  }

  public async deletePortForward(config: ForwardConfig): Promise<void> {
    return this.ensurePortForwardService().deleteForward(config);
  }

  public getContextsHealths(): ContextHealth[] {
    if (!this.contextsStatesDispatcher) {
      throw new Error('contextsStatesDispatcher is undefined. This should not happen in Kubernetes experimental');
    }
    return this.contextsStatesDispatcher?.getContextsHealths();
  }

  public getContextsPermissions(): ContextPermission[] {
    if (!this.contextsStatesDispatcher) {
      throw new Error('contextsStatesDispatcher is undefined. This should not happen in Kubernetes experimental');
    }
    return this.contextsStatesDispatcher.getContextsPermissions();
  }
}
