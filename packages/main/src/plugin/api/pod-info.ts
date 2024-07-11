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

import type { ContainerProviderConnection, PodCreatePortOptions } from '@podman-desktop/api';

import type { ProviderContainerConnectionInfo } from '/@api/provider-info.js';

import type {
  PodInfo as LibPodPodInfo,
  PodInspectInfo as LibPodPodInspectInfo,
} from '../dockerode/libpod-dockerode.js';

export interface PodInfo extends LibPodPodInfo {
  engineId: string;
  engineName: string;
  kind: 'kubernetes' | 'podman';
  // Optional information only used by Kubernetes
  node?: string;
}

export interface PodInspectInfo extends LibPodPodInspectInfo {
  engineId: string;
  engineName: string;
}

export interface PodCreateOptions {
  name?: string;
  portmappings?: PodCreatePortOptions[];
  labels?: { [key: string]: string };
  // Set the provider to use, if not we will try select the first one available (sorted in favor of Podman).
  provider?: ProviderContainerConnectionInfo | ContainerProviderConnection;
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
