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

import type { Port } from '@podman-desktop/api';

// type of groups
export enum ContainerGroupInfoTypeUI {
  STANDALONE = 'standalone',
  COMPOSE = 'compose',
  POD = 'pod',
  DOCKER = 'docker',
  PODMAN = 'podman',
}

export interface ContainerGroupPartInfoUI {
  // The name and type of each group
  name: string;
  type: ContainerGroupInfoTypeUI;

  // Information regarding the entire group (ex. name of the pod)
  // as well as the "engine" running the group (ex. podman or docker)
  id?: string;
  engineId?: string;
  engineName?: string;
  engineType?: 'podman' | 'docker';
  shortId?: string;
  status?: string;
  humanCreationDate?: string;
  created?: string;
}

export interface ContainerInfoUI {
  id: string;
  shortId: string;
  name: string;
  image: string;
  shortImage: string;
  engineId: string;
  engineName: string;
  engineType: 'podman' | 'docker';
  state: string;
  uptime: string;
  startedAt: string;
  ports: Port[];
  portsAsString: string;
  displayPort: string;
  command?: string;
  hasPublicPort: boolean;
  openingUrl?: string;
  groupInfo: ContainerGroupPartInfoUI;
  selected: boolean;
  created: number;
  actionInProgress?: boolean;
  actionError?: string;
  labels: { [label: string]: string };
  icon?: unknown;
  imageBase64RepoTag: string;
  imageHref?: string;
}

export interface ContainerGroupInfoUI extends ContainerGroupPartInfoUI {
  // menu being expanded or collapsed
  expanded: boolean;

  selected: boolean;

  // can be different from containers.length when a filter is applied on containers
  allContainersCount: number;

  // list of containers in this group
  containers: ContainerInfoUI[];
}
