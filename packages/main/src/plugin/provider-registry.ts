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

import type {
  ContainerProviderConnection,
  Provider,
  ProviderAutostart,
  ProviderDetectionCheck,
  ProviderInstallation,
  ProviderLifecycle,
  ProviderOptions,
  ProviderStatus,
  ProviderUpdate,
  ProviderEvent,
  UnregisterContainerConnectionEvent,
  RegisterContainerConnectionEvent,
  KubernetesProviderConnection,
  UnregisterKubernetesConnectionEvent,
  RegisterKubernetesConnectionEvent,
  Logger,
  ProviderInformation,
  ProviderContainerConnection,
  CancellationToken,
} from '@podman-desktop/api';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
  LifecycleMethod,
  PreflightChecksCallback,
} from './api/provider-info';
import type { ContainerProviderRegistry } from './container-registry';
import type { Event } from './events/emitter';
import { Emitter } from './events/emitter';
import { LifecycleContextImpl, LoggerImpl } from './lifecycle-context';
import { ProviderImpl } from './provider-impl';
import type { Telemetry } from './telemetry/telemetry';
import { Disposable } from './types/disposable';

export type ProviderEventListener = (name: string, providerInfo: ProviderInfo) => void;
export type ProviderLifecycleListener = (
  name: string,
  providerInfo: ProviderInfo,
  lifecycle: ProviderLifecycle,
) => void;
export type ContainerConnectionProviderLifecycleListener = (
  name: string,
  providerInfo: ProviderInfo,
  providerContainerConnectionInfo: ProviderContainerConnectionInfo,
) => void;

/**
 * Manage creation of providers and their lifecycle.
 * subscribe to events to get notified about provider creation and lifecycle changes.
 */
export class ProviderRegistry {
  private count = 0;
  private providers: Map<string, ProviderImpl>;
  private providerStatuses = new Map<string, ProviderStatus>();
  private providerWarnings = new Map<string, ProviderInformation[]>();

  private providerLifecycles: Map<string, ProviderLifecycle> = new Map();
  private providerLifecycleContexts: Map<string, LifecycleContextImpl> = new Map();
  private providerInstallations: Map<string, ProviderInstallation> = new Map();
  private providerUpdates: Map<string, ProviderUpdate> = new Map();
  private providerAutostarts: Map<string, ProviderAutostart> = new Map();

  private connectionLifecycleContexts: Map<ContainerProviderConnection, LifecycleContextImpl> = new Map();
  private listeners: ProviderEventListener[];
  private lifecycleListeners: ProviderLifecycleListener[];
  private containerConnectionLifecycleListeners: ContainerConnectionProviderLifecycleListener[];

  private readonly _onDidUpdateProvider = new Emitter<ProviderEvent>();
  readonly onDidUpdateProvider: Event<ProviderEvent> = this._onDidUpdateProvider.event;

  private readonly _onDidUnregisterContainerConnection = new Emitter<UnregisterContainerConnectionEvent>();
  readonly onDidUnregisterContainerConnection: Event<UnregisterContainerConnectionEvent> =
    this._onDidUnregisterContainerConnection.event;

  private readonly _onDidUnregisterKubernetesConnection = new Emitter<UnregisterKubernetesConnectionEvent>();
  readonly onDidUnregisterKubernetesConnection: Event<UnregisterKubernetesConnectionEvent> =
    this._onDidUnregisterKubernetesConnection.event;

  private readonly _onDidRegisterKubernetesConnection = new Emitter<RegisterKubernetesConnectionEvent>();
  readonly onDidRegisterKubernetesConnection: Event<RegisterKubernetesConnectionEvent> =
    this._onDidRegisterKubernetesConnection.event;

  private readonly _onDidRegisterContainerConnection = new Emitter<RegisterContainerConnectionEvent>();
  readonly onDidRegisterContainerConnection: Event<RegisterContainerConnectionEvent> =
    this._onDidRegisterContainerConnection.event;

  constructor(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private apiSender: any,
    private containerRegistry: ContainerProviderRegistry,
    private telemetryService: Telemetry,
  ) {
    this.providers = new Map();
    this.listeners = [];
    this.lifecycleListeners = [];
    this.containerConnectionLifecycleListeners = [];

    // Every 2 seconds, we will check:
    // * The status of the providers
    // * Any new warnings or informations for each provider
    setInterval(async () => {
      Array.from(this.providers.keys()).forEach(providerKey => {
        // Get the provider and its lifecycle
        const provider = this.providers.get(providerKey);
        const providerLifecycle = this.providerLifecycles.get(providerKey);
        const providerWarnings = this.providerWarnings.get(providerKey);

        // If the provider and its lifecycle exist, we will check
        if (provider && providerLifecycle) {
          // Get the status
          const status = providerLifecycle.status();

          // If the status does not match the current one, we will send a listener event and update the status
          if (status !== this.providerStatuses.get(providerKey)) {
            provider.updateStatus(status);
            this.listeners.forEach(listener => listener('provider:update-status', this.getProviderInfo(provider)));
            this.providerStatuses.set(providerKey, status);
          }
        }

        // Update the warnings of the provider
        if (provider) {
          // If the warnings do not match the current cache, we will send an update event to the renderer
          // and update the local warnings cache
          if (JSON.stringify(providerWarnings) !== JSON.stringify(provider?.warnings)) {
            this.apiSender.send('provider:update-warnings', provider.id);
            this.providerWarnings.set(providerKey, provider.warnings);
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
    this.listeners.forEach(listener => listener('provider:create', this.getProviderInfo(providerImpl)));
    const trackOpts: { name: string; status: string; version?: string } = {
      name: providerOptions.name,
      status: providerOptions.status.toString(),
    };
    if (providerOptions.version) {
      trackOpts.version = providerOptions.version;
    }
    this.telemetryService.track('createProvider', trackOpts);
    this.apiSender.send('provider-create', id);
    return providerImpl;
  }

  disposeProvider(providerImpl: ProviderImpl): void {
    this.providers.delete(providerImpl.internalId);
    this.listeners.forEach(listener => listener('provider:delete', this.getProviderInfo(providerImpl)));
    this.apiSender.send('provider-delete', providerImpl.id);
  }

  // need to call dispose() method to unregister the lifecycle
  registerLifecycle(providerImpl: ProviderImpl, lifecycle: ProviderLifecycle): Disposable {
    this.providerLifecycles.set(providerImpl.internalId, lifecycle);
    this.providerLifecycleContexts.set(providerImpl.internalId, new LifecycleContextImpl());

    this.lifecycleListeners.forEach(listener =>
      listener('provider:register-lifecycle', this.getProviderInfo(providerImpl), lifecycle),
    );

    return Disposable.create(() => {
      this.providerLifecycles.delete(providerImpl.internalId);
      this.providerLifecycleContexts.delete(providerImpl.internalId);
      this.lifecycleListeners.forEach(listener =>
        listener('provider:removal-lifecycle', this.getProviderInfo(providerImpl), lifecycle),
      );
    });
  }

  registerInstallation(providerImpl: ProviderImpl, installation: ProviderInstallation): Disposable {
    this.providerInstallations.set(providerImpl.internalId, installation);

    return Disposable.create(() => {
      this.providerInstallations.delete(providerImpl.internalId);
    });
  }

  registerUpdate(providerImpl: ProviderImpl, update: ProviderUpdate): Disposable {
    this.providerUpdates.set(providerImpl.internalId, update);

    return Disposable.create(() => {
      this.providerUpdates.delete(providerImpl.internalId);
    });
  }

  registerAutostart(providerImpl: ProviderImpl, autostart: ProviderAutostart): Disposable {
    this.providerAutostarts.set(providerImpl.internalId, autostart);

    return Disposable.create(() => {
      this.providerAutostarts.delete(providerImpl.internalId);
    });
  }

  getProviderLifecycle(providerInternalId: string): ProviderLifecycle | undefined {
    return this.providerLifecycles.get(providerInternalId);
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

  addProviderContainerConnectionLifecycleListener(listener: ContainerConnectionProviderLifecycleListener): void {
    this.containerConnectionLifecycleListeners.push(listener);
  }

  removeProviderContainerConnectionLifecycleListener(listener: ContainerConnectionProviderLifecycleListener): void {
    const index = this.containerConnectionLifecycleListeners.indexOf(listener);
    if (index !== -1) {
      this.lifecycleListeners.splice(index, 1);
    }
  }

  async intializeProviderLifecycle(providerId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerId);
    const providerLifecycle = this.getMatchingProviderLifecycle(providerId);
    const context = this.getMatchingLifecycleContext(providerId);

    if (!providerLifecycle.initialize) {
      return;
    }

    this.lifecycleListeners.forEach(listener =>
      listener('provider:before-initialize-lifecycle', this.getProviderInfo(provider), providerLifecycle),
    );

    await providerLifecycle.initialize(context);
    this.lifecycleListeners.forEach(listener =>
      listener('provider:after-initialize-lifecycle', this.getProviderInfo(provider), providerLifecycle),
    );
  }

  async startProviderLifecycle(providerId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerId);
    const providerLifecycle = this.getMatchingProviderLifecycle(providerId);
    const context = this.getMatchingLifecycleContext(providerId);

    this.lifecycleListeners.forEach(listener =>
      listener('provider:before-start-lifecycle', this.getProviderInfo(provider), providerLifecycle),
    );

    await providerLifecycle.start(context);
    this.lifecycleListeners.forEach(listener =>
      listener('provider:after-start-lifecycle', this.getProviderInfo(provider), providerLifecycle),
    );
    this._onDidUpdateProvider.fire({
      id: providerId,
      name: provider.name,
      status: provider.status,
    });
  }

  async stopProviderLifecycle(providerId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerId);
    const providerLifecycle = this.getMatchingProviderLifecycle(providerId);
    const context = this.getMatchingLifecycleContext(providerId);

    this.lifecycleListeners.forEach(listener =>
      listener('provider:before-stop-lifecycle', this.getProviderInfo(provider), providerLifecycle),
    );
    await providerLifecycle.stop(context);
    this.lifecycleListeners.forEach(listener =>
      listener('provider:after-stop-lifecycle', this.getProviderInfo(provider), providerLifecycle),
    );
    this._onDidUpdateProvider.fire({
      id: providerId,
      name: provider.name,
      status: provider.status,
    });
  }

  async getProviderDetectionChecks(providerInternalId: string): Promise<ProviderDetectionCheck[]> {
    const provider = this.getMatchingProvider(providerInternalId);
    return provider.detectionChecks;
  }

  // run autostart on all providers supporting this option
  async runAutostart(): Promise<void[]> {
    // grab auto start providers
    const autostartValues = Array.from(this.providerAutostarts.values());
    return Promise.all(autostartValues.map(autoStart => autoStart.start(new LoggerImpl())));
  }

  async runPreflightChecks(
    providerInternalId: string,
    statusCallback: PreflightChecksCallback,
    runUpdateChecks: boolean,
  ): Promise<boolean> {
    const installOrUpdate = runUpdateChecks
      ? this.providerUpdates.get(providerInternalId)
      : this.providerInstallations.get(providerInternalId);

    if (!installOrUpdate) {
      throw new Error(`No matching installation for provider ${providerInternalId}`);
    }

    if (!installOrUpdate.preflightChecks) {
      return true;
    }

    const checks = installOrUpdate.preflightChecks();
    for (const check of checks) {
      statusCallback.startCheck({ name: check.title });
      try {
        const checkResult = await check.execute();

        statusCallback.endCheck({
          name: check.title,
          successful: checkResult.successful,
          description: checkResult.description,
          docLinks: checkResult.docLinks,
        });

        if (!checkResult.successful) {
          return false;
        }
      } catch (err) {
        console.error(err);
        statusCallback.endCheck({
          name: check.title,
          successful: false,
          description: err instanceof Error ? err.message : typeof err === 'object' ? err?.toString() : 'unknown error',
        });
        return false;
      }
    }
    return true;
  }

  async installProvider(providerInternalId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerInternalId);

    const providerInstall = this.providerInstallations.get(providerInternalId);
    if (!providerInstall) {
      throw new Error(`No matching installation for provider ${provider.internalId}`);
    }
    this.telemetryService.track('installProvider', {
      name: provider.name,
    });
    return providerInstall.install(new LoggerImpl());
  }

  async updateProvider(providerInternalId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerInternalId);

    const providerUpdate = this.providerUpdates.get(providerInternalId);
    if (!providerUpdate) {
      throw new Error(`No matching update for provider ${provider.internalId}`);
    }

    this.telemetryService.track('updateProvider', {
      name: provider.name,
    });
    return providerUpdate.update(new LoggerImpl());
  }

  // start anything from the provider
  async startProvider(providerInternalId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerInternalId);

    // do we have a lifecycle attached to the provider ?
    if (this.providerLifecycles.has(providerInternalId)) {
      return this.startProviderLifecycle(providerInternalId);
    }

    if (provider.containerConnections && provider.containerConnections.length > 0) {
      const connection = provider.containerConnections[0];
      const lifecycle = connection.lifecycle;
      if (!lifecycle || !lifecycle.start) {
        throw new Error('The container connection does not support start lifecycle');
      }

      const context = this.connectionLifecycleContexts.get(connection);
      if (!context) {
        throw new Error('The connection does not have context to start');
      }

      return lifecycle.start(context);
    } else {
      throw new Error('No container connection found for provider');
    }
  }

  // Initialize the provider (if there is something to initialize)
  async initializeProvider(providerInternalId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerInternalId);

    // do we have a lifecycle attached to the provider ?
    if (this.providerLifecycles.has(providerInternalId)) {
      if (this.providerLifecycles.get(providerInternalId)?.initialize) {
        return this.intializeProviderLifecycle(providerInternalId);
      }
    }

    if (provider.containerProviderConnectionFactory) {
      this.telemetryService.track('initializeProvider', {
        name: provider.name,
      });

      return provider.containerProviderConnectionFactory.initialize();
    }
    throw new Error('No initialize implementation found for this provider');
  }

  public getProviderContainerConnectionInfo(connection: ContainerProviderConnection): ProviderContainerConnectionInfo {
    const containerProviderConnection: ProviderContainerConnectionInfo = {
      name: connection.name,
      status: connection.status(),
      type: connection.type,
      endpoint: {
        socketPath: connection.endpoint.socketPath,
      },
    };
    if (connection.lifecycle) {
      const lifecycleMethods: LifecycleMethod[] = [];
      if (connection.lifecycle.delete) {
        lifecycleMethods.push('delete');
      }
      if (connection.lifecycle.start) {
        lifecycleMethods.push('start');
      }
      if (connection.lifecycle.stop) {
        lifecycleMethods.push('stop');
      }
      containerProviderConnection.lifecycleMethods = lifecycleMethods;
    }
    return containerProviderConnection;
  }

  protected getProviderInfo(provider: ProviderImpl): ProviderInfo {
    const containerConnections: ProviderContainerConnectionInfo[] = provider.containerConnections.map(connection => {
      return this.getProviderContainerConnectionInfo(connection);
    });
    const kubernetesConnections: ProviderKubernetesConnectionInfo[] = provider.kubernetesConnections.map(connection => {
      return {
        name: connection.name,
        status: connection.status(),
        endpoint: {
          apiURL: connection.endpoint.apiURL,
        },
      };
    });

    // container connection factory ?
    let containerProviderConnectionCreation = false;
    if (provider.containerProviderConnectionFactory) {
      containerProviderConnectionCreation = true;
    }

    // kubernetes connection factory ?
    let kubernetesProviderConnectionCreation = false;
    if (provider.kubernetesProviderConnectionFactory) {
      kubernetesProviderConnectionCreation = true;
    }

    // handle installation
    let installationSupport = false;
    if (this.providerInstallations.has(provider.internalId)) {
      installationSupport = true;
    }

    const providerInfo: ProviderInfo = {
      id: provider.id,
      internalId: provider.internalId,
      name: provider.name,
      containerConnections,
      kubernetesConnections,
      status: provider.status,
      containerProviderConnectionCreation,
      kubernetesProviderConnectionCreation,
      links: provider.links,
      detectionChecks: provider.detectionChecks,
      images: provider.images,
      version: provider.version,
      warnings: provider.warnings,
      installationSupport,
    };

    // handle update
    const updateData = this.providerUpdates.get(provider.internalId);
    if (updateData) {
      providerInfo.updateInfo = { version: updateData.version };
    }

    // lifecycle ?
    if (this.providerLifecycles.has(provider.internalId)) {
      providerInfo.lifecycleMethods = ['start', 'stop'];
    }
    return providerInfo;
  }

  // providers are sort in reverse alphabetical order
  getProviderInfos(): ProviderInfo[] {
    return Array.from(this.providers.values())
      .map(provider => {
        return this.getProviderInfo(provider);
      })
      .sort((provider1, provider2) => provider2.name.localeCompare(provider1.name));
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

  getMatchingLifecycleContext(providerId: string): LifecycleContextImpl {
    const context = this.providerLifecycleContexts.get(providerId);
    if (!context) {
      throw new Error(`no lifecycle context matching provider id ${providerId}`);
    }

    return context;
  }

  getMatchingContainerLifecycleContext(
    providerId: string,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): LifecycleContextImpl {
    const connection = this.getMatchingContainerConnectionFromProvider(providerId, providerContainerConnectionInfo);

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error('The connection does not have context to start');
    }

    return context;
  }

  async createContainerProviderConnection(
    internalProviderId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: { [key: string]: any },
    logHandler: Logger,
    token?: CancellationToken,
  ): Promise<void> {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    if (!provider.containerProviderConnectionFactory) {
      throw new Error('The provider does not support container connection creation');
    }

    // create a logger
    return provider.containerProviderConnectionFactory.create(params, logHandler, token);
  }

  async createKubernetesProviderConnection(
    internalProviderId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    params: { [key: string]: any },
    logHandler: Logger,
  ): Promise<void> {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    if (!provider.kubernetesProviderConnectionFactory) {
      throw new Error('The provider does not support kubernetes connection creation');
    }
    return provider.kubernetesProviderConnectionFactory.create(params, logHandler);
  }

  // helper method
  protected getMatchingContainerConnectionFromProvider(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): ContainerProviderConnection {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    // grab the correct container connection
    const containerConnection = provider.containerConnections.find(
      connection => connection.endpoint.socketPath === providerContainerConnectionInfo.endpoint.socketPath,
    );
    if (!containerConnection) {
      throw new Error(`no container connection matching provider id ${internalProviderId}`);
    }
    return containerConnection;
  }

  async startProviderConnection(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): Promise<void> {
    // grab the correct provider
    const connection = this.getMatchingContainerConnectionFromProvider(
      internalProviderId,
      providerContainerConnectionInfo,
    );

    const lifecycle = connection.lifecycle;
    if (!lifecycle || !lifecycle.start) {
      throw new Error('The container connection does not support start lifecycle');
    }

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error('The connection does not have context to start');
    }

    return lifecycle.start(context);
  }

  async stopProviderConnection(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): Promise<void> {
    // grab the correct provider
    const connection = this.getMatchingContainerConnectionFromProvider(
      internalProviderId,
      providerContainerConnectionInfo,
    );

    const lifecycle = connection.lifecycle;
    if (!lifecycle || !lifecycle.stop) {
      throw new Error('The container connection does not support stop lifecycle');
    }

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error('The connection does not have context to start');
    }

    return lifecycle.stop(context);
  }

  async deleteProviderConnection(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo,
  ): Promise<void> {
    // grab the correct provider
    const connection = this.getMatchingContainerConnectionFromProvider(
      internalProviderId,
      providerContainerConnectionInfo,
    );

    const lifecycle = connection.lifecycle;
    if (!lifecycle || !lifecycle.delete) {
      throw new Error('The container connection does not support delete lifecycle');
    }
    this.telemetryService.track('deleteProviderConnection', { name: providerContainerConnectionInfo.name });
    return lifecycle.delete();
  }

  onDidRegisterContainerConnectionCallback(
    provider: ProviderImpl,
    containerProviderConnection: ContainerProviderConnection,
  ) {
    this.connectionLifecycleContexts.set(containerProviderConnection, new LifecycleContextImpl());
    // notify listeners
    this.containerConnectionLifecycleListeners.forEach(listener => {
      listener(
        'provider-container-connection:register',
        this.getProviderInfo(provider),
        this.getProviderContainerConnectionInfo(containerProviderConnection),
      );
    });
    this._onDidRegisterContainerConnection.fire({ providerId: provider.id, connection: containerProviderConnection });
  }

  onDidRegisterKubernetesConnectionCallback(
    provider: ProviderImpl,
    kubernetesProviderConnection: KubernetesProviderConnection,
  ) {
    this.apiSender.send('provider-register-kubernetes-connection', { name: kubernetesProviderConnection.name });
    this._onDidRegisterKubernetesConnection.fire({ providerId: provider.id });
  }

  onDidChangeContainerProviderConnectionStatus(
    provider: ProviderImpl,
    containerConnection: ContainerProviderConnection,
  ) {
    // notify listeners
    this.containerConnectionLifecycleListeners.forEach(listener => {
      listener(
        'provider-container-connection:update-status',
        this.getProviderInfo(provider),
        this.getProviderContainerConnectionInfo(containerConnection),
      );
    });
  }

  onDidUnregisterContainerConnectionCallback(provider: ProviderImpl, containerConnection: ContainerProviderConnection) {
    // notify listeners
    this.containerConnectionLifecycleListeners.forEach(listener => {
      listener(
        'provider-container-connection:unregister',
        this.getProviderInfo(provider),
        this.getProviderContainerConnectionInfo(containerConnection),
      );
    });
    this._onDidUnregisterContainerConnection.fire({ providerId: provider.id });
  }

  onDidUnregisterKubernetesConnectionCallback(
    provider: ProviderImpl,
    kubernetesProviderConnection: KubernetesProviderConnection,
  ) {
    this.apiSender.send('provider-unregister-kubernetes-connection', { name: kubernetesProviderConnection.name });
    this._onDidUnregisterKubernetesConnection.fire({ providerId: provider.id });
  }

  onDidUpdateProviderStatus(providerId: string, callback: (providerInfo: ProviderInfo) => void) {
    // add callback for the given providerId
    const provider = this.getMatchingProvider(providerId);

    provider.onDidUpdateStatus(() => {
      callback(this.getProviderInfo(provider));
    });

    this._onDidUpdateProvider.fire({
      id: providerId,
      name: provider.name,
      status: provider.status,
    });
  }

  getContainerConnections(): ProviderContainerConnection[] {
    const connections: ProviderContainerConnection[] = [];
    this.providers.forEach(provider => {
      provider.containerConnections.forEach(connection => {
        connections.push({
          providerId: provider.id,
          connection,
        });
      });
    });
    return connections;
  }
}
