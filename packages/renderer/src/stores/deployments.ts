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

import { writable, derived, type Writable } from 'svelte/store';
import type { V1Deployment } from '@kubernetes/client-node';

import { findMatchInLeaves } from './search-util';
import { EventStore } from './event-store';
import DeploymentIcon from '../lib/images/DeploymentIcon.svelte';

const windowEvents = [
  'extension-started',
  'extension-stopped',
  'provider-change',
  'extensions-started',
  'deployment-event',
];
const windowListeners = ['extensions-already-started'];

let readyToUpdate = false;

export async function checkForUpdate(eventName: string): Promise<boolean> {
  if ('extensions-already-started' === eventName) {
    readyToUpdate = true;
  }

  // do not fetch until extensions are all started
  return readyToUpdate;
}

export const deployments: Writable<V1Deployment[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, deployments], ([$searchPattern, $deploymentInfos]) =>
  $deploymentInfos.filter(deployment => findMatchInLeaves(deployment, $searchPattern.toLowerCase())),
);

const eventStore = new EventStore<V1Deployment[]>(
  'deployments',
  deployments,
  checkForUpdate,
  windowEvents,
  windowListeners,
  grabAllDeployments,
  DeploymentIcon,
);
eventStore.setupWithDebounce();

export async function grabAllDeployments(): Promise<V1Deployment[]> {
  return window.kubernetesListDeployments();
}
