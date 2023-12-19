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

// eslint-disable-next-line import/no-duplicates
import type { KubernetesInformerWritable } from './kubernetesInformerWritable';

// Helper to manage store updated from events
export class EventStoreWithKubernetesInformer<T> {
  constructor(
    // The store to actually update / return the data
    private store: KubernetesInformerWritable<T>,

    // The list of informer events to listen for to trigger an update or to refresh the informer, for example:
    // Informer event: 'kubernetes-ingress-add'
    // Informer refresh listener: 'kubeconfig-update'
    private informerEvents: string[],
    private informerRefreshEvents: string[],

    // The informerListener function that will be called when the informer send an event.
    // It can be used to handle the different events received by an informer and update the store
    private informerListener: (...args: unknown[]) => void,
  ) {}

  setup() {
    this.informerEvents.forEach(eventName => {
      window.events?.receive(eventName, async (args?: unknown[]) => {
        this.informerListener(eventName, args);
      });
    });

    this.informerRefreshEvents.forEach(eventName => {
      window.events?.receive(eventName, async (_args?: unknown[]) => {
        const informerId = this.store.getInformerId();
        if (informerId) {
          window.kubernetesRefreshInformer(informerId);
        }
      });
    });

    window.events?.receive(`kubernetes-informer-refresh`, async (id: number) => {
      const informerId = this.store.getInformerId();
      // if informer has been refreshed we reset the store, most probably the kubeconfig changed and we're connected to a new namespace/cluster
      if (informerId === id) {
        this.store.set([] as T);
      }
    });
  }
}
