/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import type { Writable } from 'svelte/store';
import { writable, derived } from 'svelte/store';
import { findMatchInLeaves } from './search-util';
import type { DeploymentUIInfo } from '../../../main/src/plugin/api/kubernetes-info';
import type { V1Deployment } from '@kubernetes/client-node';
import moment from 'moment';
import humanizeDuration from 'humanize-duration';

let readyToUpdate = false;

// Create function that converts an array of V1Deployment to DeploymentUIInfo
function convertDeploymentsToDeploymentUIInfo(deployments: V1Deployment[]): DeploymentUIInfo[] {
  const result: DeploymentUIInfo[] = [];
  deployments.forEach(deployment => {
    const deploymentUIInfo: DeploymentUIInfo = {
      name: deployment.metadata?.name || '',
      namespace: deployment.metadata?.namespace || '',
      age: humanizeAge((deployment.metadata?.creationTimestamp || '').toString()),
      // number of replicas
      replicas: deployment.status?.replicas || 0,
      // ready pods
      ready: deployment.status?.readyReplicas || 0,
    };
    result.push(deploymentUIInfo);
  });
  return result;
}

function humanizeAge(started: string): string {
  // get start time in ms
  const uptimeInMs = moment().diff(started);
  // make it human friendly
  return humanizeDuration(uptimeInMs, { round: true, largest: 1 });
}

export async function fetchDeployments() {
  // do not fetch until extensions are all started
  if (!readyToUpdate) {
    return;
  }

  console.log('Fetching deployments');
  // Retrieve the deployments from
  const deployments = await window.kubernetesListDeployments();
  kubernetesDeploymentsInfos.set(convertDeploymentsToDeploymentUIInfo(deployments));
}

export const kubernetesDeploymentsInfos: Writable<DeploymentUIInfo[]> = writable([]);

export const searchPattern = writable('');

export const filtered = derived([searchPattern, kubernetesDeploymentsInfos], ([$searchPattern, $infos]) => {
  return $infos.filter(deploymentInfo => findMatchInLeaves(deploymentInfo, $searchPattern.toLowerCase()));
});

// need to refresh when extension is started or stopped
window.events?.receive('extension-started', async () => {
  await fetchDeployments();
});
window.events?.receive('extension-stopped', async () => {
  await fetchDeployments();
});

window.events?.receive('provider-change', async () => {
  await fetchDeployments();
});

window?.events?.receive('extensions-started', async () => {
  readyToUpdate = true;
  await fetchDeployments();
});

// if client is doing a refresh, we will receive this event and we need to update the data
window.addEventListener('extensions-already-started', () => {
  readyToUpdate = true;
  fetchDeployments().catch((error: unknown) => {
    console.error('Failed to fetch deployments', error);
  });
});
