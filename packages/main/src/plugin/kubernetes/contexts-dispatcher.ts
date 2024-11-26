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

import type { KubeConfig } from '@kubernetes/client-node';

import type { Event } from '../events/emitter.js';
import { Emitter } from '../events/emitter.js';
import { KubeConfigSingleContext } from './kubeconfig-single-context.js';

export interface DispatcherEvent {
  contextName: string;
  config: KubeConfig;
}

/**
 * ContextsDispatcher gets new Kubeconfig values with the `update` method
 * and fires Add/Update/Delete events
 * for contexts added/updated/deleted since previous update
 *
 * the KubeConfig values emitted by add/update contain
 * a single context and its related information (user, cluster),
 * and is set as the current context for the KubeConfig
 */
export class ContextsDispatcher {
  #contexts = new Map<string, KubeConfigSingleContext>();

  #onAdd = new Emitter<DispatcherEvent>();
  #onUpdate = new Emitter<DispatcherEvent>();
  #onDelete = new Emitter<DispatcherEvent>();

  onAdd: Event<DispatcherEvent> = this.#onAdd.event;
  onUpdate: Event<DispatcherEvent> = this.#onUpdate.event;
  onDelete: Event<DispatcherEvent> = this.#onDelete.event;

  update(kubeconfig: KubeConfig): void {
    const contextsDiff = new Set<string>(this.#contexts.keys());
    for (const kubeContext of kubeconfig.getContexts()) {
      contextsDiff.delete(kubeContext.name);
      const kubeconfigSingleContext = new KubeConfigSingleContext(kubeconfig, kubeContext);

      if (!this.#contexts.has(kubeContext.name)) {
        this.#onAdd.fire({ contextName: kubeContext.name, config: kubeconfigSingleContext.get() });
        this.#contexts.set(kubeContext.name, kubeconfigSingleContext);
        continue;
      }
      if (kubeconfigSingleContext.equals(this.#contexts.get(kubeContext.name))) {
        // already exists and is the same, nothing to declare
        continue;
      }

      // context has changed
      this.#onUpdate.fire({ contextName: kubeContext.name, config: kubeconfigSingleContext.get() });
      this.#contexts.set(kubeContext.name, kubeconfigSingleContext);
    }

    for (const nameOfRemainingContext of contextsDiff.keys()) {
      const ctxToRemove = this.#contexts.get(nameOfRemainingContext);
      if (!ctxToRemove) {
        throw new Error(`config for ${nameOfRemainingContext} not found, should not happen`);
      }
      this.#onDelete.fire({ contextName: nameOfRemainingContext, config: ctxToRemove.get() });
      this.#contexts.delete(nameOfRemainingContext);
    }
  }
}
