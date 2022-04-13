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
  ContainerProviderConnectionFactory,
  LogProvider,
  Provider,
  ProviderLifecycle,
  ProviderOptions,
  ProviderStatus,
  ProviderConnectionStatus,
} from '@tmpwip/extension-api';
import type { ProviderRegistry } from './provider-registry';
import type { LogRegistry } from './log-registry';

export class ProviderImpl implements Provider, IDisposable {
  private containerProviderConnections: Set<ContainerProviderConnection>;
  private containerProviderConnectionsStatuses: Map<string, ProviderConnectionStatus>;
  private kubernetesProviderConnections: Set<KubernetesProviderConnection>;
  private containerNameLogProviders: Map<string, string>;
  // optional factory
  private _containerProviderConnectionFactory: ContainerProviderConnectionFactory | undefined = undefined;
  private _status: ProviderStatus;

  constructor(
    private _internalId: string,
    private providerOptions: ProviderOptions,
    private providerRegistry: ProviderRegistry,
    private containerRegistry: ContainerProviderRegistry,
    private logRegistry: LogRegistry,
  ) {
    this.containerProviderConnectionsStatuses = new Map();
    this.containerProviderConnections = new Set();
    this.kubernetesProviderConnections = new Set();
    this.containerNameLogProviders = new Map();
    this._status = providerOptions.status;

    // monitor connection statuses
    setInterval(async () => {
      this.containerProviderConnections.forEach(providerConnection => {
        const status = providerConnection.status();
        const key = providerConnection.endpoint.socketPath;
        if (status !== this.containerProviderConnectionsStatuses.get(key)) {
          this.providerRegistry.onDidChangeContainerProviderConnectionStatus(this, providerConnection);
          this.containerProviderConnectionsStatuses.set(key, status);
        }
      });
    }, 2000);
  }

  get containerProviderConnectionFactory(): ContainerProviderConnectionFactory | undefined {
    return this._containerProviderConnectionFactory;
  }
  registerLogProvider(logProvider: LogProvider, connection?: ContainerProviderConnection): Disposable {
    let id: string;
    if(connection) {
      id = `${this._internalId}.${connection.name}`;
      this.containerNameLogProviders.set(connection.name, id);
    } else {
      id = this.internalId;
      this.containerNameLogProviders.set(id, id);
    }
    this.logRegistry.addProvider(id, logProvider);

    return Disposable.create(() => {
      this.logRegistry.deleteProvider(id);
      if(connection){
        this.containerNameLogProviders.delete(connection.name);
      } else {
        this.containerNameLogProviders.delete(id);
      }
    });
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

  get internalId(): string {
    return this._internalId;
  }

  get id(): string {
    return this.providerOptions.id;
  }

  get containerConnections(): ContainerProviderConnection[] {
    return Array.from(this.containerProviderConnections.values());
  }

  get kubernetesConnections(): KubernetesProviderConnection[] {
    return Array.from(this.kubernetesProviderConnections.values());
  }

  get logProviderIds(): Map<string, string> {
    return this.containerNameLogProviders;
  }

  dispose(): void {
    this.providerRegistry.disposeProvider(this);
  }

  setContainerProviderConnectionFactory(
    containerProviderConnectionFactory: ContainerProviderConnectionFactory,
  ): Disposable {
    this._containerProviderConnectionFactory = containerProviderConnectionFactory;
    return Disposable.create(() => {
      this._containerProviderConnectionFactory = undefined;
    });
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
    this.providerRegistry.onDidRegisterContainerConnection(this, containerProviderConnection);

    return Disposable.create(() => {
      this.containerProviderConnections.delete(containerProviderConnection);
      disposable.dispose();
      this.providerRegistry.onDidUnregisterContainerConnection(this, containerProviderConnection);
    });
  }

  registerLifecycle(lifecycle: ProviderLifecycle): Disposable {
    return this.providerRegistry.registerLifecycle(this, lifecycle);
  }
}
