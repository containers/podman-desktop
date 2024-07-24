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

import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';

import type { ContributionInfo } from '/@api/contribution-info';
import type { WebviewInfo } from '/@api/webview-info';

import ExtensionIcon from '../../lib/images/ExtensionIcon.svelte';
import { contributions } from '../contribs';
import { webviews } from '../webviews';
import type { NavigationRegistryEntry } from './navigation-registry';

export function createNavigationExtensionEntry(): NavigationRegistryEntry {
  const registry: NavigationRegistryEntry = {
    name: 'Extensions',
    icon: { iconComponent: ExtensionIcon },
    link: '/extensions',
    tooltip: 'Extensions',
    type: 'entry',
    get counter() {
      return 0;
    },
  };
  return registry;
}

let extensionNavigationGroupItems: NavigationRegistryEntry[] = $state([]);

export function createNavigationExtensionGroup(): NavigationRegistryEntry {
  const mainGroupEntry: NavigationRegistryEntry = {
    name: 'Extensions',
    icon: { iconComponent: ExtensionIcon },
    link: `/extensions`,
    tooltip: 'Extensions',
    type: 'group',
    get counter() {
      return 0;
    },
    get items() {
      return extensionNavigationGroupItems;
    },
  };

  let allContribs: ContributionInfo[] = [];

  let allWebviews: WebviewInfo[] = [];

  const refresh = () => {
    const newItems: NavigationRegistryEntry[] = [];
    allContribs.forEach(contrib => {
      const registry: NavigationRegistryEntry = {
        name: contrib.name,
        icon: {
          iconImage: contrib.icon,
        },
        link: `/contribs/${contrib.name}`,
        type: 'entry',
        tooltip: contrib.name,
        get counter() {
          return 0;
        },
      };
      newItems.push(registry);
    });

    allWebviews.forEach(webview => {
      const icon = webview.icon ? { iconImage: webview.icon } : { faIconImage: faPuzzlePiece, size: '1.5x' };

      const registry: NavigationRegistryEntry = {
        name: webview.name,
        icon,
        link: `/webviews/${webview.id}`,
        tooltip: webview.name,
        type: 'entry',
        get counter() {
          return 0;
        },
      };
      newItems.push(registry);
    });

    extensionNavigationGroupItems = newItems;
  };

  contributions.subscribe(contribs => {
    allContribs = [...contribs];
    refresh();
  });

  webviews.subscribe(webviews => {
    allWebviews = [...webviews];
    refresh();
  });

  return mainGroupEntry;
}
