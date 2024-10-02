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

import type { Informer, KubernetesObject } from '@kubernetes/client-node';

import type { ResourceName } from '/@api/kubernetes-contexts-states.js';

import type { ContextInternalState } from './contexts-states-registry.js';
import { isSecondaryResourceName } from './contexts-states-registry.js';

export class ContextsInformersRegistry {
  private informers = new Map<string, ContextInternalState>();

  hasContext(name: string): boolean {
    return this.informers.has(name);
  }

  hasInformer(context: string, resourceName: ResourceName): boolean {
    const informers = this.informers.get(context);
    return !!informers?.get(resourceName);
  }

  setInformers(name: string, informers: ContextInternalState | undefined): void {
    if (informers) {
      this.informers.set(name, informers);
    }
  }

  setResourceInformer(contextName: string, resourceName: ResourceName, informer: Informer<KubernetesObject>): void {
    const informers = this.informers.get(contextName);
    if (!informers) {
      throw new Error(`watchers for context ${contextName} not found`);
    }
    informers.set(resourceName, informer);
  }

  getContextsNames(): Iterable<string> {
    return this.informers.keys();
  }

  async disposeSecondaryInformers(contextName: string): Promise<void> {
    const informers = this.informers.get(contextName);
    if (informers) {
      for (const [resourceName, informer] of informers) {
        if (isSecondaryResourceName(resourceName)) {
          await informer?.stop();
          informers.delete(resourceName);
        }
      }
    }
  }

  async deleteContextInformers(name: string): Promise<void> {
    const informers = this.informers.get(name);
    if (informers) {
      for (const informer of informers.values()) {
        await informer.stop();
      }
    }
    this.informers.delete(name);
  }
}
