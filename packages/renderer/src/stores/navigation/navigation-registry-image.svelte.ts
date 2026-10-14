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

import { ImageUtils } from '/@/lib/image/image-utils';
import ImageIcon from '/@/lib/images/ImageIcon.svelte';
import { imagesInfos } from '/@/stores/images';

import type { NavigationRegistryEntry } from './navigation-registry';

let count = $state(0);
let destinations = $state<GoToInfo[]>([]);

const imageUtils = new ImageUtils();

export function createNavigationImageEntry(): NavigationRegistryEntry {
  imagesInfos.subscribe(images => {
    count = images.length;
    destinations = [
      ...images.map(image => ({
        page: NavigationPage.IMAGE as const,
        parameters: { id: image.Id, engineId: image.engineId, tag: image.RepoTags?.[0] ?? '<none>' },
        icon: { iconComponent: ImageIcon },
        name: `Image: ${image.RepoTags?.[0] ?? imageUtils.getShortId(image.Id)}`,
      })),
      {
        page: NavigationPage.IMAGES as const,
        icon: { iconComponent: ImageIcon },
        name: `Images (${count})`,
      },
    ];
  });

  const registry: NavigationRegistryEntry = {
    name: 'Images',
    icon: { iconComponent: ImageIcon },
    link: '/images',
    tooltip: 'Images',
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
