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

import type { ManifestCreateOptions, ManifestInspectInfo } from '@podman-desktop/api';
import type { VolumeCreateOptions, VolumeCreateResponse } from 'dockerode';
import Dockerode from 'dockerode';

import type { ImageInfo, PodmanListImagesOptions } from '/@api/image-info.js';

export interface PodContainerInfo {
  Id: string;
  Names: string;
  Status: string;
}

export interface PodInfo {
  Cgroup: string;
  Containers: PodContainerInfo[];
  Created: string;
  Id: string;
  InfraId: string;
  Labels: { [key: string]: string };
  Name: string;
  Namespace: string;
  Networks: string[];
  Status: string;
}

export interface PodInspectInfo {
  CgroupParent: string;
  CgroupPath: string;
  Containers: PodContainerInfo[];
  Created: string;
  Hostname: string;
  Id: string;
  InfraContainerId: string;
  memory_limit: number;
  memory_swap: number;
  Name: string;
  Namespace: string;
  NumContainers: number;
  security_opt: string[];
  SharedNamespaces: string[];
  State: string;
  volumes_from: string[];
}

export interface PlayKubePodInfo {
  ContainerErrors: string[];
  Containers: string[];
  Id: string;
  InitContainers: string[];
  Logs: string[];
}

export interface PlayKubeInfo {
  Pods: PlayKubePodInfo[];
  RmReport: { Err: string; Id: string }[];
  Secrets: { CreateReport: { ID: string } }[];
  StopReport: { Err: string; Id: string }[];
  Volumes: { Name: string }[];
}

export interface PodCreatePortOptions {
  host_ip: string;
  container_port: number;
  host_port: number;
  protocol: string;
  range: number;
}

export interface PodCreateOptions {
  name?: string;
  portmappings?: PodCreatePortOptions[];
  labels?: { [key: string]: string };
  Networks?: {
    [key: string]: {
      aliases?: string[];
      interface_name?: string;
    };
  };
  exit_policy?: string;
  netns?: {
    nsmode: string;
  };
}

export interface ContainerCreateMountOption {
  Name?: string;
  Type: string;
  Source: string;
  Destination: string;
  Driver?: string;
  RW: boolean;
  Propagation: string;
  Options?: string[];
}

export interface ContainerCreateHealthConfigOption {
  Test?: string[];
  Interval?: number;
  Timeout?: number;
  StartPeriod?: number;
  Retries?: number;
}

export interface ContainerCreatePortMappingOption {
  container_port: number;
  host_ip?: string;
  host_port?: number;
  protocol?: string;
  range?: number;
}

export interface ContainerCreateNetNSOption {
  nsmode: string;
  value?: string;
}

export interface ContainerCreateOptions {
  command?: string[];
  entrypoint?: string | string[];
  env?: { [key: string]: string };
  pod?: string;
  hostname?: string;
  image?: string;
  name?: string;
  mounts?: Array<ContainerCreateMountOption>;
  user?: string;
  labels?: { [label: string]: string };
  work_dir?: string;
  portmappings?: Array<ContainerCreatePortMappingOption>;
  stop_timeout?: number;
  healthconfig?: ContainerCreateHealthConfigOption;
  restart_policy?: string;
  restart_tries?: number;
  remove?: boolean;
  seccomp_policy?: string;
  seccomp_profile_path?: string;
  cap_add?: Array<string>;
  cap_drop?: Array<string>;
  privileged?: boolean;
  netns?: ContainerCreateNetNSOption;
  read_only_filesystem?: boolean;
  dns_server?: Array<Array<number>>;
  hostadd?: Array<string>;
  userns?: string;
}

export interface PodRemoveOptions {
  force: boolean;
}

export interface PodmanContainerInfo {
  Id: string;
  Names: string[];
  ImageID: string;
  Image: string;
  Created: string;
  State: string;
  StartedAt: number;
  Command: string[];
  Labels: { [label: string]: string };
  Ports: { host_ip: string; container_port: number; host_port: number; range?: string; protocol: string }[];
}

export interface Info {
  host: Host;
  store: Store;
  registries: Registries;
  plugins: Plugins;
  version: Version;
}

export interface Host {
  arch: string;
  buildahVersion: string;
  cgroupManager: string;
  cgroupVersion: string;
  cgroupControllers: unknown[];
  conmon: Conmon;
  cpus: number;
  cpuUtilization: CpuUtilization;
  databaseBackend: string;
  distribution: Distribution;
  eventLogger: string;
  hostname: string;
  idMappings: IdMappings;
  kernel: string;
  logDriver: string;
  memFree: number;
  memTotal: number;
  networkBackend: string;
  ociRuntime: OciRuntime;
  os: string;
  remoteSocket: RemoteSocket;
  serviceIsRemote: boolean;
  security: Security;
  slirp4netns: Slirp4netns;
  swapFree: number;
  swapTotal: number;
  uptime: string;
  linkmode: string;
}

export interface Conmon {
  package: string;
  path: string;
  version: string;
}

export interface CpuUtilization {
  userPercent: number;
  systemPercent: number;
  idlePercent: number;
}

export interface Distribution {
  distribution: string;
  variant: string;
  version: string;
}

export interface IdMappings {
  gidmap: Gidmap[];
  uidmap: Uidmap[];
}

export interface Gidmap {
  container_id: number;
  host_id: number;
  size: number;
}

export interface Uidmap {
  container_id: number;
  host_id: number;
  size: number;
}

export interface OciRuntime {
  name: string;
  package: string;
  path: string;
  version: string;
}

export interface RemoteSocket {
  path: string;
  exists: boolean;
}

export interface Security {
  apparmorEnabled: boolean;
  capabilities: string;
  rootless: boolean;
  seccompEnabled: boolean;
  seccompProfilePath: string;
  selinuxEnabled: boolean;
}

export interface Slirp4netns {
  executable: string;
  package: string;
  version: string;
}

export interface Store {
  configFile: string;
  containerStore: ContainerStore;
  graphDriverName: string;
  graphOptions: GraphOptions;
  graphRoot: string;
  graphRootAllocated: number;
  graphRootUsed: number;
  graphStatus: GraphStatus;
  imageCopyTmpDir: string;
  imageStore: ImageStore;
  runRoot: string;
  volumePath: string;
  transientStore: boolean;
}

export interface ContainerStore {
  number: number;
  paused: number;
  running: number;
  stopped: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GraphOptions {}

export interface GraphStatus {
  'Backing Filesystem': string;
  'Native Overlay Diff': string;
  'Supports d_type': string;
  'Using metacopy': string;
}

export interface ImageStore {
  number: number;
}

export interface Registries {
  search: string[];
}

export interface Plugins {
  volume: string[];
  network: string[];
  log: string[];
  authorization: unknown;
}

export interface Version {
  APIVersion: string;
  Version: string;
  GoVersion: string;
  GitCommit: string;
  BuiltTime: string;
  Built: number;
  OsArch: string;
  Os: string;
}

export interface GetImagesOptions {
  names: string[];
}

// API of libpod that we want to expose on our side
export interface LibPod {
  createPod(podOptions: PodCreateOptions): Promise<{ Id: string }>;
  createPodmanContainer(containerCreateOptions: ContainerCreateOptions): Promise<{ Id: string; Warnings: string[] }>;
  listPods(): Promise<PodInfo[]>;
  listPodmanContainers(opts?: { all: boolean }): Promise<PodmanContainerInfo[]>;
  prunePods(): Promise<void>;
  podmanAttach(containerId: string): Promise<NodeJS.ReadWriteStream>;
  getPodInspect(podId: string): Promise<PodInspectInfo>;
  startPod(podId: string): Promise<void>;
  stopPod(podId: string): Promise<void>;
  removePod(podId: string, options?: PodRemoveOptions): Promise<void>;
  restartPod(podId: string): Promise<void>;
  generateKube(names: string[]): Promise<string>;
  playKube(yamlContentFilePath: string): Promise<PlayKubeInfo>;
  pruneAllImages(dangling: boolean): Promise<void>;
  podmanInfo(): Promise<Info>;
  getImages(options: GetImagesOptions): Promise<NodeJS.ReadableStream>;
  podmanListImages(options?: PodmanListImagesOptions): Promise<ImageInfo[]>;
  podmanCreateManifest(manifestOptions: ManifestCreateOptions): Promise<{ engineId: string; Id: string }>;
  podmanInspectManifest(manifestName: string): Promise<ManifestInspectInfo>;
  podmanRemoveManifest(manifestName: string): Promise<void>;
}

// tweak Dockerode by adding the support of libpod API
// WARNING: make sure to not override existing functions
export class LibpodDockerode {
  // setup the libpod API
  enhancePrototypeWithLibPod(): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prototypeOfDockerode = Dockerode.prototype as any;
    // add listPodmanContainers
    prototypeOfDockerode.listPodmanContainers = function (opts?: { all: boolean }): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/containers/json?',
        method: 'GET',
        options: opts,
        statusCodes: {
          200: true,
          400: 'bad parameter',
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add createPodmanContainer
    prototypeOfDockerode.createPodmanContainer = function (
      containerCreateOptions: ContainerCreateOptions,
    ): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/containers/create',
        method: 'POST',
        options: containerCreateOptions,
        statusCodes: {
          201: true,
          204: true,
          400: 'bad parameter in request',
          404: 'no such container',
          409: 'status conflict',
          500: 'server error',
        },
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add listImages
    prototypeOfDockerode.podmanListImages = function (options?: PodmanListImagesOptions): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/images/json',
        method: 'GET',
        options: options,
        statusCodes: {
          200: true,
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add listPods
    prototypeOfDockerode.listPods = function (): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/pods/json',
        method: 'GET',
        options: {},
        statusCodes: {
          200: true,
          400: 'bad parameter',
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add attach
    prototypeOfDockerode.podmanAttach = function (containerId: string): Promise<unknown> {
      const optsf = {
        path: `/v4.2.0/libpod/containers/${containerId}/attach?stdin=true&stdout=true&stderr=true&`,
        method: 'POST',
        isStream: true,
        openStdin: true,
        allowEmpty: true,
        statusCodes: {
          200: true,
          404: 'no such container',
          500: 'server error',
        },
        options: {},
      };

      // patch the modem to not send any data. By default dockerode send query parameters as JSON payload
      // but podman REST API will then echo the response, so send empty data '' instead
      const originalBuildRequest = this.modem.buildRequest;
      this.modem.buildRequest = function (
        options: unknown,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        context: any,
        data: unknown,
        callback: unknown,
      ): Promise<unknown> {
        if (context.allowEmpty && context.path.includes('/attach?')) {
          data = '';
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return originalBuildRequest.call(this, options, context, data, callback);
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, stream: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(stream);
        });
      });
    };

    // add pruneAllImages
    prototypeOfDockerode.pruneAllImages = function (): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/images/prune?all=true&', // this works
        // For some reason the below doesn't work? TODO / help / fixme
        // options: {all: 'true'}, // this doesn't work
        method: 'POST',
        statusCodes: {
          200: true,
          400: 'bad parameter',
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // replace createVolume call by not wrapping the result into an object named Volume
    // we need the raw data
    prototypeOfDockerode.createVolume = function (opts: VolumeCreateOptions): Promise<VolumeCreateResponse> {
      const optsf = {
        path: '/volumes/create?',
        method: 'POST',
        allowEmpty: true,
        options: opts,
        abortSignal: opts.abortSignal,
        statusCodes: {
          200: true, // unofficial, but proxies may return it
          201: true,
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data as VolumeCreateResponse);
        });
      });
    };

    // add createPod
    prototypeOfDockerode.createPod = function (podOptions: PodCreateOptions): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/pods/create',
        method: 'POST',
        options: podOptions,
        statusCodes: {
          201: true,
          204: true,
          400: 'bad parameter in request',
          409: 'status conflict',
          500: 'server error',
        },
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add getPodInspect
    prototypeOfDockerode.getPodInspect = function (podId: string): Promise<unknown> {
      const optsf = {
        path: `/v4.2.0/libpod/pods/${podId}/json`,
        method: 'GET',
        statusCodes: {
          200: true,
          204: true,
          404: 'no such pod',
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add startPod
    prototypeOfDockerode.startPod = function (podId: string): Promise<unknown> {
      const optsf = {
        path: `/v4.2.0/libpod/pods/${podId}/start?`,
        method: 'POST',
        statusCodes: {
          200: true,
          204: true,
          304: 'pod already stopped',
          404: 'no such pod',
          409: 'unexpected error',
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.modem.dial(optsf, (err: any, data: unknown) => {
          if (err) {
            // check that err.json is a JSON
            if (err?.statusCode === 409 && err?.json?.Errs) {
              return reject(err.json.Errs.join(' '));
            }

            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add stopPod
    prototypeOfDockerode.stopPod = function (podId: string): Promise<unknown> {
      const optsf = {
        path: `/v4.2.0/libpod/pods/${podId}/stop?`,
        method: 'POST',
        statusCodes: {
          200: true,
          204: true,
          304: 'pod already stopped',
          404: 'no such pod',
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add restartPod
    prototypeOfDockerode.restartPod = function (podId: string): Promise<unknown> {
      const optsf = {
        path: `/v4.2.0/libpod/pods/${podId}/restart?`,
        method: 'POST',
        statusCodes: {
          200: true,
          204: true,
          304: 'pod already stopped',
          404: 'no such pod',
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add removePod
    prototypeOfDockerode.removePod = function (podId: string, options?: { force: boolean }): Promise<unknown> {
      const optsf = {
        path: `/v4.2.0/libpod/pods/${podId}?`,
        method: 'DELETE',
        statusCodes: {
          200: true,
          204: true,
          304: 'pod already stopped',
          404: 'no such pod',
          500: 'server error',
        },
        options: options ?? {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add prunePods
    prototypeOfDockerode.prunePods = function (): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/pods/prune',
        method: 'POST',
        statusCodes: {
          200: true,
          500: 'server error',
        },
        options: {},
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add generateKube
    prototypeOfDockerode.generateKube = function (names: string[]): Promise<unknown> {
      // transform array into a list of queries
      const queries = names
        .map(name => {
          return `names=${name}`;
        })
        .join('&');

      const path = `/v4.2.0/libpod/generate/kube?${queries}`;
      const optsf = {
        path,
        method: 'GET',
        options: {},
        statusCodes: {
          200: true,
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          if (Buffer.isBuffer(data)) {
            resolve((data as Buffer).toString());
          } else {
            resolve(data);
          }
        });
      });
    };

    // add playKube
    prototypeOfDockerode.playKube = function (yamlContentFilePath: string): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/play/kube',
        method: 'POST',
        file: yamlContentFilePath,
        statusCodes: {
          200: true,
          204: true,
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // info
    prototypeOfDockerode.podmanInfo = function (): Promise<unknown> {
      const optsf = {
        path: '/v4.2.0/libpod/info',
        method: 'GET',
        statusCodes: {
          200: true,
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // info
    prototypeOfDockerode.getImages = function (options: GetImagesOptions): Promise<NodeJS.ReadableStream> {
      // let's create the query using the names list.
      // N.B: last ? will be cut by the modem dial call
      const query = `names=${options.names.join('&names=')}?`;

      const optsf = {
        path: `/images/get?${query}`,
        method: 'GET',
        options: {},
        abortSignal: undefined,
        isStream: true,
        statusCodes: {
          200: true,
          400: 'bad parameter',
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: NodeJS.ReadableStream) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add createManifest
    prototypeOfDockerode.podmanCreateManifest = function (manifestOptions: ManifestCreateOptions): Promise<unknown> {
      // make sure encodeURI component for the name ex. domain.com/foo/bar:latest
      const encodedManifestName = encodeURIComponent(manifestOptions.name);

      const optsf = {
        path: `/v4.2.0/libpod/manifests/${encodedManifestName}`,
        method: 'POST',
        options: manifestOptions,
        statusCodes: {
          201: true,
          400: 'bad parameter in request',
          404: 'no such image',
          500: 'server error',
        },
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // add inspectManifest
    prototypeOfDockerode.podmanInspectManifest = function (manifestName: string): Promise<unknown> {
      // make sure encodeURI component for the name ex. domain.com/foo/bar:latest
      const encodedManifestName = encodeURIComponent(manifestName);

      const optsf = {
        path: `/v4.2.0/libpod/manifests/${encodedManifestName}/json`,
        method: 'GET',

        // Match the status codes from https://docs.podman.io/en/latest/_static/api.html#tag/manifests/operation/ManifestInspectLibpod
        statusCodes: {
          200: true,
          404: 'no such manifest',
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };

    // remove manifest
    prototypeOfDockerode.podmanRemoveManifest = function (manifestName: string): Promise<unknown> {
      // make sure encodeURI component for the name ex. domain.com/foo/bar:latest
      const encodedManifestName = encodeURIComponent(manifestName);

      const optsf = {
        path: `/v4.2.0/libpod/manifests/${encodedManifestName}`,
        method: 'DELETE',
        statusCodes: {
          200: true,
          404: 'no such manifest',
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    };
  }
}
