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

import type { Provider, ProviderLifecycle, ProviderOptions, ProviderStatus } from '@tmpwip/extension-api';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from './api/provider-info';
import type { ContainerProviderRegistry } from './container-registry';
import { ProviderImpl } from './provider-impl';
import { Disposable } from './types/disposable';

export type ProviderEventListener = (name: string, provider: ProviderImpl) => void;
export type ProviderLifecycleListener = (name: string, provider: ProviderImpl, lifecycle: ProviderLifecycle) => void;

/**
 * Manage creation of providers and their lifecycle.
 * subscribe to events to get notified about provider creation and lifecycle changes.
 */
export class ProviderRegistry {
  private count = 0;
  private providers: Map<string, ProviderImpl>;
  private providerStatuses = new Map<string, ProviderStatus>();

  private providerLifecycles: Map<string, ProviderLifecycle> = new Map();
  private listeners: ProviderEventListener[];
  private lifecycleListeners: ProviderLifecycleListener[];

  constructor(private containerRegistry: ContainerProviderRegistry) {
    this.providers = new Map();
    this.listeners = [];
    this.lifecycleListeners = [];

    setInterval(async () => {
      Array.from(this.providers.keys()).forEach(providerKey => {
        const provider = this.providers.get(providerKey);
        const providerLifecycle = this.providerLifecycles.get(providerKey);
        if (provider && providerLifecycle) {
          const status = providerLifecycle.status();
          if (status !== this.providerStatuses.get(providerKey)) {
            provider.setStatus(status);
            this.listeners.forEach(listener => listener('provider:update-status', provider));
            this.providerStatuses.set(providerKey, status);
          }
        }
      });
    }, 2000);
  }

  createProvider(providerOptions: ProviderOptions): Provider {
    const id = `${this.count}`;
    const providerImpl = new ProviderImpl(id, providerOptions, this, this.containerRegistry);
    this.count++;
    this.providers.set(id, providerImpl);
    this.listeners.forEach(listener => listener('provider:create', providerImpl));
    return providerImpl;
  }

  disposeProvider(providerImpl: ProviderImpl): void {
    this.providers.delete(providerImpl.id);
    this.listeners.forEach(listener => listener('provider:delete', providerImpl));
  }

  // need to call dispose() method to unregister the lifecycle
  registerLifecycle(providerImpl: ProviderImpl, lifecycle: ProviderLifecycle): Disposable {
    this.providerLifecycles.set(providerImpl.id, lifecycle);

    this.lifecycleListeners.forEach(listener => listener('provider:register-lifecycle', providerImpl, lifecycle));

    return Disposable.create(() => {
      this.providerLifecycles.delete(providerImpl.id);
      this.lifecycleListeners.forEach(listener => listener('provider:removal-lifecycle', providerImpl, lifecycle));
    });
  }

  addProviderListener(listener: ProviderEventListener): void {
    this.listeners.push(listener);
  }

  removeProviderListener(listener: ProviderEventListener): void {
    const index = this.listeners.indexOf(listener);
    if (index !== -1) {
      this.listeners.splice(index, 1);
    }
  }

  addProviderLifecycleListener(listener: ProviderLifecycleListener): void {
    this.lifecycleListeners.push(listener);
  }

  removeProviderLifecycleListener(listener: ProviderLifecycleListener): void {
    const index = this.lifecycleListeners.indexOf(listener);
    if (index !== -1) {
      this.lifecycleListeners.splice(index, 1);
    }
  }

  async startProviderLifecycle(providerId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerId);
    const providerLifecycle = this.getMatchingProviderLifecycle(providerId);

    this.lifecycleListeners.forEach(listener =>
      listener('provider:before-start-lifecycle', provider, providerLifecycle),
    );
    await providerLifecycle.start();
    this.lifecycleListeners.forEach(listener =>
      listener('provider:after-start-lifecycle', provider, providerLifecycle),
    );
  }

  async stopProviderLifecycle(providerId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerId);
    const providerLifecycle = this.getMatchingProviderLifecycle(providerId);

    this.lifecycleListeners.forEach(listener =>
      listener('provider:before-stop-lifecycle', provider, providerLifecycle),
    );
    await providerLifecycle.stop();
    this.lifecycleListeners.forEach(listener => listener('provider:after-stop-lifecycle', provider, providerLifecycle));
  }

  getProviderInfos(): ProviderInfo[] {
    return Array.from(this.providers.values()).map(provider => {
      const containerConnections: ProviderContainerConnectionInfo[] = provider.containerConnections.map(connection => {
        return {
          name: connection.name,
          status: connection.status(),
          endpoint: {
            socketPath: connection.endpoint.socketPath,
          },
        };
      });
      const kubernetesConnections: ProviderKubernetesConnectionInfo[] = provider.kubernetesConnections.map(
        connection => {
          return {
            name: connection.name,
            status: connection.status(),
            endpoint: {
              apiURL: connection.endpoint.apiURL,
            },
          };
        },
      );

      const providerInfo: ProviderInfo = {
        id: provider.id,
        name: provider.name,
        containerConnections,
        kubernetesConnections,
        status: provider.status,
      };

      // lifecycle ?
      if (this.providerLifecycles.has(provider.id)) {
        providerInfo.lifecycleMethods = ['start', 'stop'];
      }
      return providerInfo;
    });
  }

  // helper method
  protected getMatchingProviderLifecycle(providerId: string): ProviderLifecycle {
    // need to find the provider lifecycle
    const providerLifecycle = this.providerLifecycles.get(providerId);
    if (!providerLifecycle) {
      throw new Error(`no provider lifecycle matching provider id ${providerId}`);
    }
    return providerLifecycle;
  }

  // helper method
  protected getMatchingProvider(providerId: string): ProviderImpl {
    // need to find the provider
    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`no provider matching provider id ${providerId}`);
    }
    return provider;
  }
}
