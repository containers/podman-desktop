/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { IDisposable } from '@desktop-framework/api';
import type { CoreV1Event, KubernetesObject } from '@kubernetes/client-node';
import { type Writable, writable } from 'svelte/store';
import { vi } from 'vitest';

import { listenResources } from '/@/lib/kube/resources-listen';

export type initListsReturnType = {
  updateResources: (objects: KubernetesObject[]) => void;
  updateEvents?: (objects: CoreV1Event[]) => void;
};

interface InitListsNonExperimentalOptions {
  onResourcesStore: (store: Writable<KubernetesObject[]>) => void;
  onEventsStore?: (store: Writable<CoreV1Event[]>) => void;
}

export function initListsNonExperimental(
  options: InitListsNonExperimentalOptions,
): (resources: KubernetesObject[], events?: CoreV1Event[]) => initListsReturnType {
  return (resources: KubernetesObject[], events?: CoreV1Event[]): initListsReturnType => {
    const resourcesStore = writable<KubernetesObject[]>(resources);
    options.onResourcesStore(resourcesStore);
    let eventsStore: Writable<CoreV1Event[]>;
    if (options.onEventsStore) {
      eventsStore = writable<CoreV1Event[]>(events);
      options.onEventsStore(eventsStore);
    }
    return {
      updateResources: (resources: KubernetesObject[]): void => {
        resourcesStore.set(resources);
      },
      updateEvents: options.onEventsStore
        ? (events: CoreV1Event[]): void => {
            eventsStore.set(events);
          }
        : undefined,
    };
  };
}

export function initListExperimental(options: {
  resourceName: string;
}): (resources: KubernetesObject[], events?: CoreV1Event[]) => initListsReturnType {
  return (resources: KubernetesObject[], events?: CoreV1Event[]): initListsReturnType => {
    let resourcesCallback: (resources: KubernetesObject[]) => void;
    let eventsCallback: (resources: CoreV1Event[]) => void;
    vi.mocked(listenResources).mockImplementation(async (listenedResourceName, _options, cb): Promise<IDisposable> => {
      if (listenedResourceName === options.resourceName) {
        resourcesCallback = cb;
        setTimeout(() => resourcesCallback(resources));
        return {
          dispose: (): void => {},
        };
      } else {
        if (events) {
          eventsCallback = cb;
          setTimeout(() => eventsCallback(events));
        }
        return {
          dispose: (): void => {},
        };
      }
    });
    return {
      updateResources: (updatedObjects: KubernetesObject[]): void => {
        resourcesCallback(updatedObjects);
      },
      updateEvents: events
        ? (updatedObjects: CoreV1Event[]): void => {
            eventsCallback(updatedObjects);
          }
        : undefined,
    };
  };
}
