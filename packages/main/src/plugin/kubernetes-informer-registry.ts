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

import type { Context, Informer, KubernetesObject } from '@kubernetes/client-node';

import type { KubernetesInformerInfo, KubernetesInformerResourcesType } from './api/kubernetes-informer-info.js';

export class KubernetesInformerManager {
  private informerId = 0;

  private informers = new Map<number, KubernetesInformerInfo>();

  constructor() {}

  public addInformer(
    informer: Informer<KubernetesObject>,
    context: Context,
    resourcesType: KubernetesInformerResourcesType,
  ): number {
    this.informerId++;
    this.informers.set(this.informerId, {
      informer,
      context,
      resourcesType,
    });
    return this.informerId;
  }

  public updateInformer(id: number, informer: Informer<KubernetesObject>, context: Context): void {
    const informerSaved = this.getInformerInfo(id);
    if (informerSaved) {
      this.informers.set(id, {
        informer,
        context,
        resourcesType: informerSaved.resourcesType,
      });
    }
  }

  public getInformerInfo(id: number): KubernetesInformerInfo | undefined {
    return this.informers.get(id);
  }

  public async stopInformer(informerId: number): Promise<void> {
    const informer = this.informers.get(informerId);
    await informer?.informer.stop();
  }
}
