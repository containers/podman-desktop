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

import type { V1Deployment } from '@kubernetes/client-node';
import { customWritable, type KubernetesInformerWritable } from './kubernetesInformerWritable';
import { EventStoreWithKubernetesInformer } from './kubernetes-informer-event-store';
import { writable, derived } from 'svelte/store';
import { findMatchInLeaves } from './search-util';

const informerEvents = ['kubernetes-deployment-add', 'kubernetes-deployment-update', 'kubernetes-deployment-deleted'];
const informerRefreshEvents = ['provider-change', 'kubeconfig-update'];

export const deployments: KubernetesInformerWritable<V1Deployment[]> = customWritable([], startInformer);

export const deploymentsEventStore = new EventStoreWithKubernetesInformer<V1Deployment[]>(
  deployments,
  informerEvents,
  informerRefreshEvents,
  informerListener,
);

deploymentsEventStore.setup();

export const searchPattern = writable('');

export const filtered = derived([searchPattern, deployments], ([$searchPattern, $deployments]) =>
  $deployments.filter(deployment => findMatchInLeaves(deployment, $searchPattern.toLowerCase())),
);

function informerListener(...args: unknown[]) {
  const event = args[0];
  const deployment = args[1] as V1Deployment;
  deployments.update(deploymentsList => {
    if (event === 'kubernetes-deployment-add') {
      if (
        !deploymentsList.find(
          ing =>
            ing.metadata?.name === deployment.metadata?.name &&
            ing.metadata?.namespace === deployment.metadata?.namespace,
        )
      ) {
        deploymentsList.push(deployment);
      }
    } else if (event === 'kubernetes-deployment-deleted') {
      deploymentsList = deploymentsList.filter(
        ing =>
          ing.metadata?.name !== deployment.metadata?.name ||
          ing.metadata?.namespace !== deployment.metadata?.namespace,
      );
    } else if (event === 'kubernetes-deployment-update') {
      const index = deploymentsList.findIndex(
        ing =>
          ing.metadata?.name === deployment.metadata?.name &&
          ing.metadata?.namespace === deployment.metadata?.namespace,
      );
      if (index > -1) {
        deploymentsList[index] = deployment;
      }
    }
    return deploymentsList;
  });
}

async function startInformer(): Promise<number> {
  return window.kubernetesStartInformer('DEPLOYMENT');
}
