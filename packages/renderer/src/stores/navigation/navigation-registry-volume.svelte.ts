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

import VolumeIcon from '/@/lib/images/VolumeIcon.svelte';
import { volumeListInfos } from '/@/stores/volumes';

import type { NavigationRegistryEntry } from './navigation-registry';

let count = $state(0);
let destinations = $state<GoToInfo[]>([]);

export function createNavigationVolumeEntry(): NavigationRegistryEntry {
  volumeListInfos.subscribe(volumes => {
    count = volumes.length;
    destinations = [
      ...volumes.map(volume => ({
        page: NavigationPage.VOLUME as const,
        parameters: { engineId: volume.engineId, name: volume.name },
        icon: { iconComponent: VolumeIcon },
        name: `Volume: ${volume.name.substring(0, 12)}`,
      })),
      {
        page: NavigationPage.VOLUMES as const,
        icon: { iconComponent: VolumeIcon },
        name: `Volumes (${count})`,
      },
    ];
  });

  const registry: NavigationRegistryEntry = {
    name: 'Volumes',
    icon: { iconComponent: VolumeIcon },
    link: '/volumes',
    tooltip: 'Volumes',
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
