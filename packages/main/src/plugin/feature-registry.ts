/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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
import { Event } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { inject, injectable } from 'inversify';

import { IPCHandle } from '/@/plugin/api.js';
import { Emitter } from '/@/plugin/events/emitter.js';

import { Disposable } from './types/disposable.js';

@injectable()
export class FeatureRegistry {
  private extFeaturesContribution: Map<string, string[]>;

  private readonly _onFeaturesUpdated = new Emitter<string[]>();
  readonly onFeaturesUpdated: Event<string[]> = this._onFeaturesUpdated.event;

  constructor(
    @inject(IPCHandle)
    private readonly ipcHandle: IPCHandle,
    @inject(ApiSenderType)
    private readonly apiSender: ApiSenderType,
  ) {
    this.extFeaturesContribution = new Map();
  }

  init(): void {
    this.ipcHandle('feature-registry:getRegisteredFeatures', async (): Promise<string[]> => {
      return this.listFeatures();
    });

    this.onFeaturesUpdated(features => {
      this.apiSender.send('feature-registry:features-updated', features);
    });
  }

  registerFeatures(extensionId: string, features: string[]): Disposable {
    this.extFeaturesContribution.set(extensionId, features);
    this._onFeaturesUpdated.fire(this.listFeatures());

    return Disposable.create(() => {
      this.unregisterFeatures(extensionId);
    });
  }

  unregisterFeatures(extensionId: string): void {
    this.extFeaturesContribution.delete(extensionId);
    this._onFeaturesUpdated.fire(this.listFeatures());
  }

  protected listFeatures(): string[] {
    return Array.from(this.extFeaturesContribution.values()).flat();
  }
}
