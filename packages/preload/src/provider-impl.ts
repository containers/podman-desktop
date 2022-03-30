/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import { Disposable } from './types/disposable';
import type { IDisposable } from './types/disposable';
import type { ContainerProviderRegistry } from './container-registry';
import type {
  ContainerProviderConnection,
  KubernetesProviderConnection,
  Provider,
  ProviderLifecycle,
  ProviderOptions,
  ProviderStatus,
} from '@tmpwip/extension-api';
import type { ProviderRegistry } from './provider-registry';

export class ProviderImpl implements Provider, IDisposable {
  private containerProviderConnections: Set<ContainerProviderConnection>;
  private kubernetesProviderConnections: Set<KubernetesProviderConnection>;
  private _status: ProviderStatus;

  constructor(
    private _id: string,
    private providerOptions: ProviderOptions,
    private providerRegistry: ProviderRegistry,
    private containerRegistry: ContainerProviderRegistry,
  ) {
    this.containerProviderConnections = new Set();
    this.kubernetesProviderConnections = new Set();
    this._status = providerOptions.status;
  }

  get name(): string {
    return this.providerOptions.name;
  }

  setStatus(status: ProviderStatus): void {
    this._status = status;
  }

  get status(): ProviderStatus {
    return this._status;
  }

  get id(): string {
    return this._id;
  }

  get containerConnections(): ContainerProviderConnection[] {
    return Array.from(this.containerProviderConnections.values());
  }

  get kubernetesConnections(): KubernetesProviderConnection[] {
    return Array.from(this.kubernetesProviderConnections.values());
  }

  dispose(): void {
    this.providerRegistry.disposeProvider(this);
  }

  registerKubernetesProviderConnection(kubernetesProviderConnection: KubernetesProviderConnection): Disposable {
    this.kubernetesProviderConnections.add(kubernetesProviderConnection);
    return Disposable.create(() => {
      this.kubernetesProviderConnections.delete(kubernetesProviderConnection);
    });
  }

  registerContainerProviderConnection(containerProviderConnection: ContainerProviderConnection): Disposable {
    this.containerProviderConnections.add(containerProviderConnection);
    const disposable = this.containerRegistry.registerContainerConnection(this, containerProviderConnection);

    return Disposable.create(() => {
      this.containerProviderConnections.delete(containerProviderConnection);
      disposable.dispose();
    });
  }

  registerLifecycle(lifecycle: ProviderLifecycle): Disposable {
    return this.providerRegistry.registerLifecycle(this, lifecycle);
  }
}
