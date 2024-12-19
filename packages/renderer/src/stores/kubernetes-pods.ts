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

import { type Writable, writable } from 'svelte/store';

import type { KubernetesContextResources } from '/@api/kubernetes-resources';

import { EventStore } from './event-store';

const windowEvents = ['kubernetes-pods', 'extension-stopped', 'extensions-started'];
const windowListeners = ['extensions-already-started'];

let experimentalStates: boolean | undefined = undefined;
let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  // check for update only in experimental states mode
  if (experimentalStates === undefined) {
    experimentalStates = (await window.getConfigurationValue<boolean>('kubernetes.statesExperimental')) ?? false;
  }
  if (experimentalStates === false) {
    return false;
  }

  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }
  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const kubernetesPods: Writable<KubernetesContextResources[]> = writable([]);

// use helper here as window methods are initialized after the store in tests
const listPods = (): Promise<KubernetesContextResources[]> => {
  return window.kubernetesGetResources('pods');
};

export const kubernetesPodsStore = new EventStore<KubernetesContextResources[]>(
  'kubernetes pods',
  kubernetesPods,
  checkForUpdate,
  windowEvents,
  windowListeners,
  listPods,
);
kubernetesPodsStore.setup();
