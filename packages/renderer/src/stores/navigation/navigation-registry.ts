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

import type { DisplayItem, GoToInfo } from '@desktop-framework/api';
import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import type { Component } from 'svelte';
import { type Writable, writable } from 'svelte/store';
import type { IconSize } from 'svelte-fa';

import { configurationProperties } from '/@/stores/configurationProperties';
import { EventStore } from '/@/stores/event-store';

import { createNavigationContainerEntry } from './navigation-registry-container.svelte';
import { createNavigationExtensionEntry, createNavigationExtensionGroup } from './navigation-registry-extension.svelte';
import { createNavigationImageEntry } from './navigation-registry-image.svelte';
import { createNavigationKubernetesGroup } from './navigation-registry-kubernetes.svelte';
import { createNavigationNetworkEntry } from './navigation-registry-network.svelte';
import { createNavigationPodEntry } from './navigation-registry-pod.svelte';
import { createNavigationSecretEntry } from './navigation-registry-secret.svelte';
import { createNavigationVolumeEntry } from './navigation-registry-volume.svelte';

export interface NavigationRegistryEntry {
  name: string;
  icon: {
    iconImage?: string | { readonly light: string; readonly dark: string };
    iconComponent?: Component;
    faIcon?: { definition: IconDefinition; size: IconSize };
  };
  tooltip: string;
  link: string;
  counter: number;
  destinations: Array<GoToInfo>;
  type: 'entry' | 'group' | 'submenu';
  enabled?: boolean;
  items?: NavigationRegistryEntry[];
  hidden?: boolean;
  index?: number;
}

const windowEvents: string[] = [];
const windowListeners = ['extensions-already-started', 'system-ready'];

export const navigationRegistry: Writable<NavigationRegistryEntry[]> = writable([]);

let hiddenItems: string[] = [];

let values: NavigationRegistryEntry[] = [];
let initialized = false;
const init = (): void => {
  values.push(createNavigationContainerEntry());
  values.push(createNavigationPodEntry());
  values.push(createNavigationImageEntry());
  values.push(createNavigationVolumeEntry());
  values.push(createNavigationNetworkEntry());
  values.push(createNavigationSecretEntry());
  values.push(createNavigationExtensionEntry());
  values.push(createNavigationExtensionGroup());
  handleKubernetesGroup();
  hideItems().catch((err: unknown) => console.error('Error hiding navigation items', err));
};

function collecItem(navigationRegistryEntry: NavigationRegistryEntry, items: DisplayItem[]): void {
  if (navigationRegistryEntry.items && navigationRegistryEntry.type === 'group') {
    navigationRegistryEntry.items.forEach(item => {
      collecItem(item, items);
    });
  }

  // add only if it does not exist
  if (items.find(i => i.name === navigationRegistryEntry.name)) {
    return;
  }

  items.push({
    name: navigationRegistryEntry.name,
    visible: navigationRegistryEntry.hidden ? false : true,
    index: navigationRegistryEntry.index ?? 0,
  });
}

// use helper here as window methods are initialized after the store in tests
const grabList = async (): Promise<NavigationRegistryEntry[]> => {
  if (!initialized) {
    init();
    initialized = true;
  }

  // override hidden property
  await hideItems();

  return values;
};

const navigationRegistryEventStore = new EventStore<NavigationRegistryEntry[]>(
  'navigation-registry',
  navigationRegistry,
  // should initialize when app is initializing
  () => Promise.resolve(true),
  windowEvents,
  windowListeners,
  grabList,
);
const navigationRegistryEventStoreInfo = navigationRegistryEventStore.setup();

export const fetchNavigationRegistries = async (): Promise<void> => {
  await navigationRegistryEventStoreInfo.fetch();
};

function hideSingleItem(navigationRegistryEntry: NavigationRegistryEntry): void {
  if (hiddenItems?.includes(navigationRegistryEntry.name)) {
    navigationRegistryEntry.hidden = true;
  } else {
    navigationRegistryEntry.hidden = false;
  }

  // iterate on all the items
  if (navigationRegistryEntry.items) {
    navigationRegistryEntry.items.forEach(item => {
      hideSingleItem(item);
    });
  }
}

async function hideItems(): Promise<void> {
  // for each item, set the hidden property to true
  values.forEach(item => {
    hideSingleItem(item);
  });

  // send to the main side the list of all items, items being displayed or hidden
  const navItems: DisplayItem[] = [];
  values.forEach(item => {
    collecItem(item, navItems);
  });

  await window.sendNavigationItems(navItems);
  values = [...values];
  navigationRegistry.set(values);
}

// update the items by looking at the disabled items each time we update the configuration properties
configurationProperties.subscribe(() => {
  if (window.getConfigurationValue) {
    window
      .getConfigurationValue<string[]>('navbar.disabledItems')
      ?.then(value => {
        if (value) {
          hiddenItems = value;
        }
      })
      .then(() => hideItems())
      .catch((err: unknown) => console.error('Error getting configuration value navbar.disabledItems', err));

    handleKubernetesGroup();
  }
});

function handleKubernetesGroup(): void {
  window
    .getConfigurationValue<boolean>('kubernetes.useInternalKubernetes')
    ?.then(value => {
      if (value) {
        if (!values.find(item => item.name === 'Kubernetes')) {
          const extensionsIndex = values.findIndex(item => item.name === 'Extensions');
          if (extensionsIndex !== -1) {
            values.splice(extensionsIndex, 0, createNavigationKubernetesGroup());
          }
        }
      } else {
        values = values.filter(item => item.name !== 'Kubernetes');
      }
    })
    .then(() => hideItems())
    .catch((err: unknown) => console.error('Error getting configuration value kubernetes.useInternalKubernetes', err));
}
