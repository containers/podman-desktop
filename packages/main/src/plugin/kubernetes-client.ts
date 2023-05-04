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

import * as fs from 'node:fs';
import type {
  Context,
  V1Pod,
  V1ConfigMap,
  V1PodList,
  V1NamespaceList,
  V1Service,
  V1Ingress,
  V1ContainerState,
  V1APIResource,
  V1APIGroup,
} from '@kubernetes/client-node';
import { ApisApi, NetworkingV1Api } from '@kubernetes/client-node';
import { AppsV1Api } from '@kubernetes/client-node';
import { CustomObjectsApi } from '@kubernetes/client-node';
import { CoreV1Api, KubeConfig, Log, Watch, VersionApi } from '@kubernetes/client-node';
import type { V1Route } from './api/openshift-types';
import type * as containerDesktopAPI from '@podman-desktop/api';
import { Emitter } from './events/emitter';
import { Uri } from './types/uri';
import { homedir } from 'node:os';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry';
import type { FilesystemMonitoring } from './filesystem-monitoring';
import type { PodInfo } from './api/pod-info';
import { PassThrough } from 'node:stream';
import type { ApiSenderType } from './api';
import { parseAllDocuments } from 'yaml';

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

const OPENSHIFT_PROJECT_API_GROUP = 'project.openshift.io';

/**
 * Handle calls to kubernetes API
 */
export class KubernetesClient {
  private kubeConfig;

  private static readonly DEFAULT_KUBECONFIG_PATH = resolve(homedir(), '.kube', 'config');

  // Custom path to the location of the kubeconfig file
  private kubeconfigPath: string = KubernetesClient.DEFAULT_KUBECONFIG_PATH;

  private currentNamespace: string | undefined;
  private currentContextName: string | undefined;

  private kubeConfigWatcher: containerDesktopAPI.FileSystemWatcher | undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private kubeWatcher: any | undefined;

  private apiGroups = new Array<V1APIGroup>();

  /*
   a Cache of API resources for the cluster. This is used to compute the plural when dealing
   with custom resources. The key is the apiGroup (including version) like 'networking.k8s.io/v1'
   */
  private apiResources = new Map<string, Array<V1APIResource>>();

  private readonly _onDidUpdateKubeconfig = new Emitter<containerDesktopAPI.KubeconfigUpdateEvent>();
  readonly onDidUpdateKubeconfig: containerDesktopAPI.Event<containerDesktopAPI.KubeconfigUpdateEvent> =
    this._onDidUpdateKubeconfig.event;

  constructor(
    private apiSender: ApiSenderType,
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
          format: 'file',
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
        await this.refresh();
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
    this.kubeConfigWatcher.onDidChange(async () => {
      this._onDidUpdateKubeconfig.fire({ type: 'UPDATE', location });
      await this.refresh();
    });

    this.kubeConfigWatcher.onDidCreate(async () => {
      this._onDidUpdateKubeconfig.fire({ type: 'CREATE', location });
      await this.refresh();
    });

    this.kubeConfigWatcher.onDidDelete(() => {
      this._onDidUpdateKubeconfig.fire({ type: 'DELETE', location });
      this.kubeConfig = new KubeConfig();
    });
  }

  setupKubeWatcher() {
    this.kubeWatcher?.abort();
    const ns = this.currentNamespace;
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

  async fetchAPIGroups() {
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

  getCurrentNamespace(): string | undefined {
    return this.currentNamespace;
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

  async refresh() {
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

  async createIngress(namespace: string, body: V1Ingress): Promise<V1Ingress> {
    const k8sCoreApi = this.kubeConfig.makeApiClient(NetworkingV1Api);

    try {
      const createdIngressData = await k8sCoreApi.createNamespacedIngress(namespace, body);
      return createdIngressData.body;
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
    // Only retrieve pods if valid namespace && valid connection, otherwise we will return an empty array
    const connected = await this.checkConnection();
    if (ns && connected) {
      const pods = await this.listNamespacedPod(ns);
      return pods.items.map(pod => toPodInfo(pod));
    }
    return [];
  }

  async readPodLog(name: string, container: string, callback: (name: string, data: string) => void): Promise<void> {
    const ns = this.currentNamespace;
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
    const ns = this.currentNamespace;
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
      return client.createNamespacedPod(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Service') {
      return client.createNamespacedService(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Binding') {
      return client.createNamespacedBinding(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Event') {
      return client.createNamespacedEvent(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Endpoints') {
      return client.createNamespacedEndpoints(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ConfigMap') {
      return client.createNamespacedConfigMap(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'LimitRange') {
      return client.createNamespacedLimitRange(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'PersistentVolumeClaim') {
      return client.createNamespacedPersistentVolumeClaim(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'PodBinding') {
      return client.createNamespacedPodBinding(
        manifest.metadata.name,
        optionalNamespace || manifest.metadata.namespace,
        manifest,
      );
    } else if (manifest.kind === 'PodEviction') {
      return client.createNamespacedPodEviction(
        manifest.metadata.name,
        optionalNamespace || manifest.metadata.namespace,
        manifest,
      );
    } else if (manifest.kind === 'PodTemplate') {
      return client.createNamespacedPodTemplate(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ReplicationController') {
      return client.createNamespacedReplicationController(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ResourceQuota') {
      return client.createNamespacedResourceQuota(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'Secret') {
      return client.createNamespacedSecret(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ServiceAccount') {
      return client.createNamespacedServiceAccount(optionalNamespace || manifest.metadata.namespace, manifest);
    } else if (manifest.kind === 'ServiceAccountToken') {
      return client.createNamespacedServiceAccountToken(
        manifest.metadata.name,
        optionalNamespace || manifest.metadata.namespace,
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
        newTag.resolve = (str: any) => parseInt(str, 8);
        tags.unshift(newTag);
        break;
      }
    }
    return tags;
  }

  // load yaml file and extract manifests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadManifestsFromFile(file: string): Promise<any[]> {
    // throw exception if file does not exist
    if (!fs.existsSync(file)) {
      throw new Error(`File ${file} does not exist`);
    }

    // load file and create resources
    const content = await fs.promises.readFile(file, 'utf-8');

    const manifests = parseAllDocuments(content, { customTags: this.getTags });
    // filter out null manifests
    return manifests.map(manifest => manifest.toJSON()).filter(manifest => manifest !== null);
  }

  async createResourcesFromFile(context: string, filePath: string, namespace: string): Promise<void> {
    const manifests = await this.loadManifestsFromFile(filePath);
    try {
      await this.createResources(context, manifests, namespace);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error.response && error.response.body) {
        if (error.response.body.message) {
          throw new Error(error.response.body.message);
        }
        throw new Error(error.response.body);
      }
      throw error;
    }
  }

  async getPlural(
    client: CustomObjectsApi,
    apiGroup: { group: string; version: string },
    kind: string,
  ): Promise<string> {
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
          return apiResource.name;
        }
      }
    }
    throw new Error(`Unable to find API resource for ${apiGroup.group}/${apiGroup.version}/${kind}`);
  }

  /**
   * Create Kubernetes resources on the specified cluster. Resources are create sequentially.
   *
   * @param context the context name to use
   * @param manifests the list of Kubernetes resources to create
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async createResources(context: string, manifests: any[], optionalNamespace?: string): Promise<void> {
    const ctx = new KubeConfig();
    ctx.loadFromFile(this.kubeconfigPath);
    ctx.currentContext = context;
    for (const manifest of manifests) {
      // https://github.com/kubernetes-client/javascript/issues/487
      if (manifest?.metadata?.creationTimestamp) {
        manifest.metadata.creationTimestamp = new Date(manifest.metadata.creationTimestamp);
      }
      const groupVersion = this.groupAndVersion(manifest.apiVersion);
      if (groupVersion.group === '') {
        const client = ctx.makeApiClient(CoreV1Api);
        await this.createV1Resource(client, manifest, optionalNamespace);
      } else if (groupVersion.group === 'apps') {
        const k8sAppsApi = this.kubeConfig.makeApiClient(AppsV1Api);
        const namespaceToUse = optionalNamespace || manifest.metadata?.namespace || 'default';
        if (manifest.kind === 'Deployment') {
          await k8sAppsApi.createNamespacedDeployment(namespaceToUse, manifest);
        } else if (manifest.kind === 'DaemonSet') {
          await k8sAppsApi.createNamespacedDaemonSet(namespaceToUse, manifest);
        }
      } else if (groupVersion.group === 'networking.k8s.io') {
        // Add networking object support (Ingress for now)
        const k8sNetworkingApi = this.kubeConfig.makeApiClient(NetworkingV1Api);
        const namespaceToUse = optionalNamespace || manifest.metadata?.namespace || 'default';
        if (manifest.kind === 'Ingress') {
          await k8sNetworkingApi.createNamespacedIngress(namespaceToUse, manifest);
        }
      } else {
        const client = ctx.makeApiClient(CustomObjectsApi);
        await this.createCustomResource(
          client,
          groupVersion.group,
          groupVersion.version,
          await this.getPlural(client, groupVersion, manifest.kind),
          optionalNamespace || manifest.metadata?.namespace,
          manifest,
        );
      }
    }
    return undefined;
  }
}
