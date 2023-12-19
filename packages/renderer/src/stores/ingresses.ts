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

import type { V1Ingress } from '@kubernetes/client-node';
import { customWritable, type KubernetesInformerWritable } from './kubernetesInformerWritable';
import { EventStoreWithKubernetesInformer } from './kubernetes-informer-event-store';

const informerEvents = ['kubernetes-ingress-add', 'kubernetes-ingress-update', 'kubernetes-ingress-deleted'];
const informerRefreshEvents = ['provider-change', 'kubeconfig-update'];

export const ingresses: KubernetesInformerWritable<V1Ingress[]> = customWritable([], startInformer);

export const ingressesEventStore = new EventStoreWithKubernetesInformer<V1Ingress[]>(
  ingresses,
  informerEvents,
  informerRefreshEvents,
  informerListener,
);

ingressesEventStore.setup();

function informerListener(...args: unknown[]) {
  const event = args[0];
  const ingress = args[1] as V1Ingress;
  ingresses.update(ingressesList => {
    if (event === 'kubernetes-ingress-add') {
      if (
        !ingressesList.find(
          ing =>
            ing.metadata?.name === ingress.metadata?.name && ing.metadata?.namespace === ingress.metadata?.namespace,
        )
      ) {
        ingressesList.push(ingress);
      }
    } else if (event === 'kubernetes-ingress-deleted') {
      ingressesList = ingressesList.filter(
        ing => ing.metadata?.name !== ingress.metadata?.name || ing.metadata?.namespace !== ingress.metadata?.namespace,
      );
    } else if (event === 'kubernetes-ingress-update') {
      const index = ingressesList.findIndex(
        ing => ing.metadata?.name === ingress.metadata?.name && ing.metadata?.namespace === ingress.metadata?.namespace,
      );
      if (index > -1) {
        ingressesList[index] = ingress;
      }
    }
    return ingressesList;
  });
}

async function startInformer(): Promise<number> {
  return window.kubernetesStartInformer('INGRESS');
}
