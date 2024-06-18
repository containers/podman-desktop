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

import type { ContainerProviderConnection } from '@podman-desktop/api';
import type * as Dockerode from 'dockerode';

import type { ProviderContainerConnectionInfo } from './provider-info.js';

export interface ImageInfo extends Dockerode.ImageInfo {
  engineId: string;
  engineName: string;
  History?: string[];
  Digest: string;
  isManifest?: boolean;
  manifests?: { digest?: string }[];
}

export interface BuildImageOptions {
  /**
   * Specifies a Containerfile which contains instructions for building the image
   */
  containerFile?: string;

  /**
   * Specifies the name which is assigned to the resulting image if the build process completes successfully
   */
  tag?: string;

  /**
   * Set the os/arch of the built image (and its base image, when using one) to the provided value instead of using the current operating system and architecture of the host
   */
  platform?: string;

  /**
   * Set the provider to use, if not we will try select the first one available (sorted in favor of Podman)
   */
  provider?: ProviderContainerConnectionInfo | ContainerProviderConnection;

  /**
   * The abort controller for running the build image operation
   */
  abortController?: AbortController;

  /**
   * Extra hosts to add to /etc/hosts
   */
  extrahosts?: string;

  /**
   * A Git repository URI or HTTP/HTTPS context URI. If the URI points to a single text file, the file’s contents are
   * placed into a file called Dockerfile and the image is built from that file. If the URI points to a tarball, the
   * file is downloaded by the daemon and the contents therein used as the context for the build. If the URI points
   * to a tarball and the dockerfile parameter is also specified, there must be a file with the corresponding path
   * inside the tarball.
   */
  remote?: string;

  /**
   * Default: false
   *
   * Suppress verbose build output.
   */
  q?: boolean;

  /**
   *  JSON array of images used for build cache resolution.
   */
  cachefrom?: string;

  /**
   * Attempt to pull the image even if an older image exists locally.
   */
  pull?: string;

  /**
   * Default: true
   *
   * Remove intermediate containers after a successful build.
   */
  rm?: boolean;

  /**
   * Default: false
   *
   * Always remove intermediate containers, even upon failure.
   */
  forcerm?: boolean;

  /**
   * Set memory limit for build.
   */
  memory?: number;

  /**
   * Total memory (memory + swap). Set as -1 to disable swap.
   */
  memswap?: number;

  /**
   * CPU shares (relative weight).
   */
  cpushares?: number;

  /**
   * CPUs in which to allow execution (e.g., 0-3, 0,1).
   */
  cpusetcpus?: number;

  /**
   * The length of a CPU period in microseconds.
   */
  cpuperiod?: number;

  /**
   * Microseconds of CPU time that the container can get in a CPU period.
   */
  cpuquota?: number;

  /**
   * JSON map of string pairs for build-time variables. Users pass these values at build-time. Docker uses the
   * buildargs as the environment context for commands run via the `Dockerfile` RUN instruction, or for variable
   * expansion in other `Dockerfilev` instructions. This is not meant for passing secret values.
   * For example, the build arg `FOO=bar` would become `{"FOO":"bar"}` in JSON. This would result in the query
   * parameter `buildargs={"FOO":"bar"}`. Note that `{"FOO":"bar"}` should be URI component encoded.
   */
  buildargs?: { [key: string]: string };

  /**
   * Size of `/dev/shm` in bytes. The size must be greater than 0. If omitted the system uses 64MB.
   */
  shmsize?: number;

  /**
   * Squash the resulting images layers into a single layer.
   */
  squash?: boolean;

  /**
   * Arbitrary key/value labels to set on the image, as a JSON map of string pairs.
   */
  labels?: { [key: string]: string };

  /**
   * Sets the networking mode for the run commands during build. Supported standard values are: `bridge`,
   * `host`, `none`, and `container:<name|id>`. Any other value is taken as a custom network's name or ID
   * to which this container should connect to.
   */
  networkmode?: string;

  /**
   * Default: ""
   *
   * Target build stage
   */
  target?: string;

  /**
   * Default: ""
   *
   * BuildKit output configuration
   */
  outputs?: string;

  /**
   * Default: false
   *
   * Do not use the cache when building the image.
   */
  nocache?: boolean;
}

export interface ListImagesOptions {
  /**
   * The provider we want to list the images. If not provided, will return all container images across all container engines.
   *
   * @defaultValue undefined
   */
  provider?: ContainerProviderConnection;
}

export interface PodmanListImagesOptions {
  /**
   * Show all images. By default all images from a final layer (no children) are shown.
   * @defaultValue false
   */
  all?: boolean;

  /**
   * A JSON encoded value of the filters (a map[string][]string) to process on the images list. Available filters:
   * - before=(<image-name>[:<tag>], <image id> or <image@digest>)
   * - dangling=true
   * - label=key or label="key=value" of an image label
   * - reference=(<image-name>[:<tag>])
   * - since=(<image-name>[:<tag>], <image id> or <image@digest>)
   *
   * @defaultValue undefined
   */
  filters?: string;

  /**
   * The provider we want to list the images. If not provided, will return all container images across all container engines.
   *
   * @defaultValue undefined
   */
  provider?: ContainerProviderConnection;
}
