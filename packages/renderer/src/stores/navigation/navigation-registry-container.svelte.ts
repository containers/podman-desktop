/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { type GoToInfo, NavigationPage } from '@desktop-framework/api';
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';

import { containersInfos } from '/@/stores/containers';

import type { NavigationRegistryEntry } from './navigation-registry';

let count = $state(0);
let destinations = $state<GoToInfo[]>([]);

export function createNavigationContainerEntry(): NavigationRegistryEntry {
  containersInfos.subscribe(containers => {
    count = containers.length;
    destinations = [
      ...containers.map(container => ({
        page: NavigationPage.CONTAINER_SUMMARY as const,
        parameters: { id: container.id },
        icon: { iconComponent: ContainerIcon },
        // deliberately not `container.name`: getName also strips the compose project
        // prefix, which would relabel navigation entries for every compose container
        name: `Container: ${container.names?.[0]?.replace(/^\//, '') ?? container.name}`,
      })),
      {
        page: NavigationPage.CONTAINERS as const,
        icon: { iconComponent: ContainerIcon },
        name: `Containers (${count})`,
      },
    ];
  });

  const registry: NavigationRegistryEntry = {
    name: 'Containers',
    icon: { iconComponent: ContainerIcon },
    link: '/containers',
    tooltip: 'Containers',
    type: 'entry',
    get destinations() {
      return destinations;
    },
    get counter() {
      return count;
    },
  };
  return registry;
}
