/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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

import type { KubeContext } from '../../../main/src/plugin/kubernetes-context';
import { addIconToContexts } from '../lib/kube/KubeContextUI';
import { EventStore } from './event-store';

const windowEvents: string[] = ['extensions-started', 'kubernetes-context-update'];
const windowListeners = ['extensions-already-started'];

// Do not update until all extensions are started (since we want to make sure kube-context has been loaded)
let readyToUpdate = false;
export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const kubernetesContexts: Writable<KubeContext[]> = writable([]);

const eventStore = new EventStore<KubeContext[]>(
  'kubernetes contexts',
  kubernetesContexts,
  checkForUpdate,
  windowEvents,
  windowListeners,
  grabKubernetesContexts,
);
eventStore.setup();

export async function grabKubernetesContexts(): Promise<KubeContext[]> {
  // Retrieve the detailed contexts which includes cluster information, current context, etc.
  const contexts = await window.kubernetesGetDetailedContexts();

  // Add the icon to each context and return it
  return addIconToContexts(contexts);
}
