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

export enum PodGroupInfoTypeUI {
  KUBERNETES = 'kubernetes',
  PODMAN = 'podman',
}
export interface PodInfoContainerUI {
  Id: string;
  Names: string;

  // This is a bit odd at the moment as we use the same PodInfoContainerUI for both Kubernetes and Podman Pods.
  // For PODS:
  // Status will either be: stopped, running, paused, exited, dead, created, degraded
  // https://docs.podman.io/en/latest/_static/api.html#tag/pods/operation/PodListLibpod
  // For Kubernetes:
  // Status will either be: running, waiting, terminated
  // see the toContainerStatus function in kubernetes-client.ts
  Status: string;
}

export interface PodInfoUI {
  id: string;
  shortId: string;
  name: string;
  engineId: string;
  engineName: string;
  status: string;
  age: string;
  created: string;
  selected: boolean;
  containers: PodInfoContainerUI[];
  actionInProgress?: boolean;
  actionError?: string;
  node?: string;
  namespace?: string;
  kind: 'kubernetes' | 'podman';
}
