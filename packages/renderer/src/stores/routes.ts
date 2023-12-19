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

import type { V1Route } from '../../../main/src/plugin/api/openshift-types';
import { customWritable, type KubernetesInformerWritable } from './kubernetesInformerWritable';
import { EventStoreWithKubernetesInformer } from './kubernetes-informer-event-store';
import { writable, derived } from 'svelte/store';
import { findMatchInLeaves } from './search-util';

const informerEvents = ['kubernetes-route-add', 'kubernetes-route-update', 'kubernetes-route-deleted'];
const informerRefreshEvents = ['provider-change', 'kubeconfig-update'];

export const routes: KubernetesInformerWritable<V1Route[]> = customWritable([], startInformer);

export const routesEventStore = new EventStoreWithKubernetesInformer<V1Route[]>(
  routes,
  informerEvents,
  informerRefreshEvents,
  informerListener,
);

routesEventStore.setup();

export const searchPattern = writable('');

export const filtered = derived([searchPattern, routes], ([$searchPattern, $routes]) =>
  $routes.filter(route => findMatchInLeaves(route, $searchPattern.toLowerCase())),
);

function informerListener(...args: unknown[]) {
  const event = args[0];
  const route = args[1] as V1Route;
  routes.update(routesList => {
    if (event === 'kubernetes-route-add') {
      if (
        !routesList.find(
          rte => rte.metadata?.name === route.metadata?.name && rte.metadata?.namespace === route.metadata?.namespace,
        )
      ) {
        routesList.push(route);
      }
    } else if (event === 'kubernetes-route-deleted') {
      routesList = routesList.filter(
        rte => rte.metadata?.name !== route.metadata?.name || rte.metadata?.namespace !== route.metadata?.namespace,
      );
    } else if (event === 'kubernetes-route-update') {
      const index = routesList.findIndex(
        rte => rte.metadata?.name === route.metadata?.name && rte.metadata?.namespace === route.metadata?.namespace,
      );
      if (index > -1) {
        routesList[index] = route;
      }
    }
    return routesList;
  });
}

async function startInformer(): Promise<number> {
  return window.kubernetesStartInformer('ROUTE');
}
