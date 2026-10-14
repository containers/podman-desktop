/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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

import type { RequestOptions } from 'node:http';

import type { ImageInfo, LibPodPodInfo, LibPodPodInspectInfo, ListImagesOptions } from '@desktop-framework/api';
import type { ContainerCreateOptions, PlayKubeInfo, PodCreatePortOptions } from '@desktop-framework/api/libpod';
import type { ManifestCreateOptions, ManifestInspectInfo, ManifestPushOptions } from '@desktop-framework/extension-api';
import type DockerModem from 'docker-modem';
import type { DialOptions } from 'docker-modem';
import type { VolumeCreateOptions, VolumeCreateResponse } from 'dockerode';
import Dockerode from 'dockerode';

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

export interface PodRemoveOptions {
  force: boolean;
}

export interface PodmanContainerInfo {
  Id: string;
  Names: string[];
  ImageID: string;
  Image: string;
  IsInfra: boolean;
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

interface Host {
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
  // This property is being set in Podman 6.1.0+
  // https://github.com/podman-container-tools/podman/issues/29116
  memAvailable?: number;
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

interface Conmon {
  package: string;
  path: string;
  version: string;
}

interface CpuUtilization {
  userPercent: number;
  systemPercent: number;
  idlePercent: number;
}

interface Distribution {
  distribution: string;
  variant: string;
  version: string;
}

interface IdMappings {
  gidmap: Gidmap[];
  uidmap: Uidmap[];
}

interface Gidmap {
  container_id: number;
  host_id: number;
  size: number;
}

interface Uidmap {
  container_id: number;
  host_id: number;
  size: number;
}

interface OciRuntime {
  name: string;
  package: string;
  path: string;
  version: string;
}

interface RemoteSocket {
  path: string;
  exists: boolean;
}

interface Security {
  apparmorEnabled: boolean;
  capabilities: string;
  rootless: boolean;
  seccompEnabled: boolean;
  seccompProfilePath: string;
  selinuxEnabled: boolean;
}

interface Slirp4netns {
  executable: string;
  package: string;
  version: string;
}

interface Store {
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

interface ContainerStore {
  number: number;
  paused: number;
  running: number;
  stopped: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface GraphOptions {}

interface GraphStatus {
  'Backing Filesystem': string;
  'Native Overlay Diff': string;
  'Supports d_type': string;
  'Using metacopy': string;
}

interface ImageStore {
  number: number;
}

interface Registries {
  search: string[];
}

interface Plugins {
  volume: string[];
  network: string[];
  log: string[];
  authorization: unknown;
}

interface Version {
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

export interface NetworkUpdateOptions {
  adddnsservers?: string[];
  removednsservers?: string[];
}

// API of libpod that we want to expose on our side
export interface LibPod {
  createPod(podOptions: PodCreateOptions): Promise<{ Id: string }>;
  createPodmanContainer(containerCreateOptions: ContainerCreateOptions): Promise<{ Id: string; Warnings: string[] }>;
  listPods(): Promise<LibPodPodInfo[]>;
  listPodmanContainers(opts?: { all: boolean }): Promise<PodmanContainerInfo[]>;
  prunePods(): Promise<void>;
  podmanAttach(containerId: string): Promise<NodeJS.ReadWriteStream>;
  getPodInspect(podId: string): Promise<LibPodPodInspectInfo>;
  startPod(podId: string): Promise<void>;
  unpausePod(podId: string): Promise<void>;
  stopPod(podId: string): Promise<void>;
  removePod(podId: string, options?: PodRemoveOptions): Promise<void>;
  resolveShortnameImage(shortname: string): Promise<{ Names: string[] }>;
  restartPod(podId: string): Promise<void>;
  generateKube(names: string[]): Promise<string>;
  playKube(
    file: string | NodeJS.ReadableStream,
    options?: { build?: boolean; replace?: boolean; abortSignal?: AbortSignal },
  ): Promise<PlayKubeInfo>;
  pruneAllImages(dangling: boolean): Promise<void>;
  podmanInfo(): Promise<Info>;
  getImages(options: GetImagesOptions): Promise<NodeJS.ReadableStream>;
  podmanListImages(options?: ListImagesOptions): Promise<ImageInfo[]>;
  podmanCreateManifest(manifestOptions: ManifestCreateOptions): Promise<{ engineId: string; Id: string }>;
  podmanInspectManifest(manifestName: string): Promise<ManifestInspectInfo>;
  podmanPushManifest(manifestOptions: ManifestPushOptions, authInfo?: Dockerode.AuthConfig): Promise<void>;
  podmanRemoveManifest(manifestName: string): Promise<void>;
  updateNetwork(networkId: string, addDNSServer: string[], removeDNSServer: string[]): Promise<void>;
  /**
   * The compatibility endpoint to delete a secret on the podman service has an issue where the path is not recognised;
   * Therefore, we need to use the official libpod api to be able to remove a secret
   *
   * Ref https://github.com/containers/podman/issues/27548
   * This has been fixed in podman >=5.7
   * @param secretId
   */
  removeSecret(secretId: string): Promise<void>;
}

// change the method from private to public as we're overriding it
interface DockerodeInternalsModem extends Omit<DockerModem, 'buildRequest'> {
  buildRequest(
    options: RequestOptions,
    context: DockerModem.DialOptions,
    data: string | Buffer | NodeJS.ReadableStream | undefined,
    callback?: DockerModem.RequestCallback,
  ): void;
}

// add the ability to patch some modem methods
export interface DockerodeInternals extends Omit<Dockerode, 'modem'>, LibPod {
  modem: DockerodeInternalsModem;
}

const wrapAs = <T>(data: unknown): T => {
  return data as T;
};

// tweak Dockerode by adding the support of libpod API
// WARNING: make sure to not override existing functions
export class LibpodDockerode {
  // setup the libpod API
  enhancePrototypeWithLibPod(): void {
    const prototypeOfDockerode = Dockerode.prototype as unknown as DockerodeInternals;
    // add listPodmanContainers
    prototypeOfDockerode.listPodmanContainers = function (opts?: { all: boolean }): Promise<PodmanContainerInfo[]> {
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
          resolve(wrapAs<PodmanContainerInfo[]>(data));
        });
      });
    };

    // add createPodmanContainer
    prototypeOfDockerode.createPodmanContainer = function (
      containerCreateOptions: ContainerCreateOptions,
    ): Promise<{ Id: string; Warnings: string[] }> {
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
          resolve(wrapAs<{ Id: string; Warnings: string[] }>(data));
        });
      });
    };

    // add listImages
    prototypeOfDockerode.podmanListImages = function (options?: ListImagesOptions): Promise<ImageInfo[]> {
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
          resolve(wrapAs<ImageInfo[]>(data));
        });
      });
    };

    // add listPods
    prototypeOfDockerode.listPods = function (): Promise<LibPodPodInfo[]> {
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
          resolve(wrapAs<LibPodPodInfo[]>(data));
        });
      });
    };

    // add attach
    prototypeOfDockerode.podmanAttach = function (containerId: string): Promise<NodeJS.ReadWriteStream> {
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
        options: RequestOptions,
        context: DialOptions,
        data?: string | Buffer | NodeJS.ReadableStream,
        callback?: DockerModem.RequestCallback,
      ): void {
        if (context.allowEmpty && context.path.includes('/attach?')) {
          data = '';
        }
        originalBuildRequest.call(this, options, context, data, callback);
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, stream: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<NodeJS.ReadWriteStream>(stream));
        });
      });
    };

    // add pruneAllImages
    prototypeOfDockerode.pruneAllImages = function (all: boolean): Promise<void> {
      const optsf = {
        path: '/v4.2.0/libpod/images/prune',
        method: 'POST',
        statusCodes: {
          200: true,
          400: 'bad parameter',
          500: 'server error',
        },
      };
      if (all) {
        optsf.path += '?all=true&';
        // For some reason the below doesn't work
        // options: {all: 'true'}, // this doesn't work
      }

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<void>(data));
        });
      });
    };

    // replace createVolume call by not wrapping the result into an object named Volume
    // we need the raw data
    prototypeOfDockerode.createVolume = function (opts: unknown): Promise<VolumeCreateResponse> {
      const optsf: DialOptions = {
        path: '/volumes/create?',
        method: 'POST',
        allowEmpty: true,
        statusCodes: {
          200: true, // unofficial, but proxies may return it
          201: true,
          500: 'server error',
        },
      };
      if (opts && typeof opts === 'object') {
        optsf.options = opts as VolumeCreateOptions;
        if ('abortSignal' in opts) {
          optsf.abortSignal = opts.abortSignal as AbortSignal;
        }
      }
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<VolumeCreateResponse>(data));
        });
      });
    };

    // add createPod
    prototypeOfDockerode.createPod = function (podOptions: PodCreateOptions): Promise<{ Id: string }> {
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
          resolve(wrapAs<{ Id: string }>(data));
        });
      });
    };

    // add getPodInspect
    prototypeOfDockerode.getPodInspect = function (podId: string): Promise<LibPodPodInspectInfo> {
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
          resolve(wrapAs<LibPodPodInspectInfo>(data));
        });
      });
    };

    // add startPod
    prototypeOfDockerode.startPod = function (podId: string): Promise<void> {
      const optsf = {
        path: `/v4.2.0/libpod/pods/${podId}/start?`,
        method: 'POST',
        statusCodes: {
          200: true,
          204: true,
          304: 'pod already started',
          404: 'no such pod',
          409: 'unexpected error',
          500: 'server error',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            // check that err.json is a JSON
            if (
              typeof err === 'object' &&
              'statusCode' in err &&
              err.statusCode === 409 &&
              'json' in err &&
              err.json &&
              typeof err.json === 'object' &&
              'Errs' in err.json &&
              err.json.Errs &&
              Array.isArray(err.json.Errs)
            ) {
              return reject(err.json.Errs.join(' '));
            }

            return reject(err);
          }
          resolve(wrapAs<void>(data));
        });
      });
    };

    // add unpausePod
    prototypeOfDockerode.unpausePod = function (podId: string): Promise<void> {
      const optsf = {
        path: `/v4.2.0/libpod/pods/${podId}/unpause`,
        method: 'POST',
        statusCodes: {
          200: true,
          404: 'no such pod',
          409: 'unexpected error',
          500: 'server error',
        },
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<void>(data));
        });
      });
    };

    // add stopPod
    prototypeOfDockerode.stopPod = function (podId: string): Promise<void> {
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
          resolve(wrapAs<void>(data));
        });
      });
    };

    // add restartPod
    prototypeOfDockerode.restartPod = function (podId: string): Promise<void> {
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
          resolve(wrapAs<void>(data));
        });
      });
    };

    // add removePod
    prototypeOfDockerode.removePod = function (podId: string, options?: { force: boolean }): Promise<void> {
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
          resolve(wrapAs<void>(data));
        });
      });
    };

    // add prunePods
    prototypeOfDockerode.prunePods = function (): Promise<void> {
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
          resolve(wrapAs<void>(data));
        });
      });
    };

    // add generateKube
    prototypeOfDockerode.generateKube = function (names: string[]): Promise<string> {
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
            resolve(wrapAs<string>(data));
          }
        });
      });
    };

    // add playKube
    prototypeOfDockerode.playKube = function (
      file: string | NodeJS.ReadableStream,
      options?: { build?: boolean; replace?: boolean; abortSignal?: AbortSignal },
    ): Promise<PlayKubeInfo> {
      const queries: string[] = [];
      if (options?.replace === true) {
        queries.push(`replace=true`);
      }

      const optsf = {
        // N.B: last ? will be cut by the modem dial call
        path: `/v4.2.0/libpod/play/kube?${queries.join('&')}?`,
        method: 'POST',
        file: file,
        abortSignal: options?.abortSignal,
        statusCodes: {
          200: true,
          204: true,
          500: 'server error',
        },
        headers: {
          // if we don't build - we should send Content-Type application/yaml
          // application/tar is not supported
          'Content-Type': options?.build ? 'application/x-tar' : 'application/yaml',
        },
        options: {},
      };

      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<PlayKubeInfo>(data));
        });
      });
    };

    // info
    prototypeOfDockerode.podmanInfo = function (): Promise<Info> {
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
          resolve(wrapAs<Info>(data));
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
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<NodeJS.ReadableStream>(data));
        });
      });
    };

    // push manifest to the registry
    prototypeOfDockerode.podmanPushManifest = function (
      manifestOptions: ManifestPushOptions,
      authInfo?: Dockerode.AuthConfig,
    ): Promise<void> {
      const encodedManifestName = encodeURIComponent(manifestOptions.name);
      const encodedDestinationName = encodeURIComponent(manifestOptions.destination);

      // If there is an authInfo, we need to add it as a Header named 'X-Registry-Auth' with the base64 encoded value
      // in order to provide the credentials needed to push to the registry.
      const headers = authInfo
        ? {
            'Content-Type': 'application/json', // Ensuring Content-Type is set
            'X-Registry-Auth': Buffer.from(JSON.stringify(authInfo)).toString('base64'),
          }
        : {};

      const optsf = {
        path: `/v4.2.0/libpod/manifests/${encodedManifestName}/registry/${encodedDestinationName}?`,
        method: 'POST',
        statusCodes: {
          200: true,
          400: 'bad parameter in request',
          404: 'no such manifest',
          500: 'server error',
        },
        headers: headers,
        // We require all=true to always be present in the URL in order for the manifest to be pushed correctly.
        // If you do not provide it, it will return a "unknown manifest blob" error as it's trying to push a manifest blob with no images.
        options: {
          all: 'true',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<void>(data));
        });
      });
    };

    // add createManifest
    prototypeOfDockerode.podmanCreateManifest = function (
      manifestOptions: ManifestCreateOptions,
    ): Promise<{ engineId: string; Id: string }> {
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
          resolve(wrapAs<{ engineId: string; Id: string }>(data));
        });
      });
    };

    // add inspectManifest
    prototypeOfDockerode.podmanInspectManifest = function (manifestName: string): Promise<ManifestInspectInfo> {
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
          resolve(wrapAs<ManifestInspectInfo>(data));
        });
      });
    };

    // remove manifest
    prototypeOfDockerode.podmanRemoveManifest = function (manifestName: string): Promise<void> {
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
          resolve(wrapAs<void>(data));
        });
      });
    };

    prototypeOfDockerode.resolveShortnameImage = function (shortname: string): Promise<{
      Names: string[];
    }> {
      const optsf = {
        path: `/v5.0.0/libpod/images/${shortname}/resolve`,
        method: 'GET',
        statusCodes: {
          // in the documentation it says code 204, but only code 200 works as intended
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
          resolve(wrapAs<{ Names: string[] }>(data));
        });
      });
    };

    prototypeOfDockerode.updateNetwork = function (
      networkId: string,
      addDNSServer: string[],
      removeDNSServer: string[],
    ): Promise<void> {
      const options: NetworkUpdateOptions = { adddnsservers: addDNSServer, removednsservers: removeDNSServer };
      const optsf = {
        path: `/v4.2.0/libpod/networks/${networkId}/update`,
        method: 'POST',
        options: options,
        statusCodes: {
          200: true,
          204: true,
          400: 'bad parameter',
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<void>(data));
        });
      });
    };

    prototypeOfDockerode.removeSecret = function (secretId: string): Promise<void> {
      const optsf = {
        path: `/v4.2.0/libpod/secrets/${secretId}`,
        method: 'DELETE',
        statusCodes: {
          200: true,
          204: true,
          400: 'bad parameter',
          500: 'server error',
        },
      };
      return new Promise((resolve, reject) => {
        this.modem.dial(optsf, (err: unknown, data: unknown) => {
          if (err) {
            return reject(err);
          }
          resolve(wrapAs<void>(data));
        });
      });
    };
  }
}
