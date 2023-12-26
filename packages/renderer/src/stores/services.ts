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

import type { V1Service } from '@kubernetes/client-node';
import { customWritable, type KubernetesInformerWritable } from './kubernetesInformerWritable';
import { EventStoreWithKubernetesInformer } from './kubernetes-informer-event-store';
import { writable, derived } from 'svelte/store';
import { findMatchInLeaves } from './search-util';

const informerEvents = ['kubernetes-service-add', 'kubernetes-service-update', 'kubernetes-service-deleted'];
const informerRefreshEvents = ['provider-change', 'kubeconfig-update'];

export const services: KubernetesInformerWritable<V1Service[]> = customWritable([], startInformer);

export const servicesEventStore = new EventStoreWithKubernetesInformer<V1Service[]>(
  services,
  informerEvents,
  informerRefreshEvents,
  informerListener,
);

servicesEventStore.setup();

export const searchPattern = writable('');

export const filtered = derived([searchPattern, services], ([$searchPattern, $services]) =>
  $services.filter(service => findMatchInLeaves(service, $searchPattern.toLowerCase())),
);

function informerListener(...args: unknown[]) {
  const event = args[0];
  const service = args[1] as V1Service;
  services.update(servicesList => {
    if (event === 'kubernetes-service-add') {
      if (
        !servicesList.find(
          svc =>
            svc.metadata?.name === service.metadata?.name && svc.metadata?.namespace === service.metadata?.namespace,
        )
      ) {
        servicesList.push(service);
      }
    } else if (event === 'kubernetes-service-deleted') {
      servicesList = servicesList.filter(
        svc => svc.metadata?.name !== service.metadata?.name || svc.metadata?.namespace !== service.metadata?.namespace,
      );
    } else if (event === 'kubernetes-service-update') {
      const index = servicesList.findIndex(
        svc => svc.metadata?.name === service.metadata?.name && svc.metadata?.namespace === service.metadata?.namespace,
      );
      if (index > -1) {
        servicesList[index] = service;
      }
    }
    return servicesList;
  });
}

async function startInformer(): Promise<number> {
  return window.kubernetesStartInformer('SERVICE');
}
