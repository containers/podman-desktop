/**********************************************************************
 * Copyright (C) 2022-2025 Red Hat, Inc.
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
  Event,
  LifecycleMethod,
  PreflightChecksCallback,
  ProviderCleanupActionInfo,
  ProviderConnectionInfo,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
  ProviderVmConnectionInfo,
} from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type {
  AuditRequestItems,
  AuditResult,
  CancellationToken,
  ConnectionFactory,
  ConnectionFactoryDetails,
  ContainerProviderConnection,
  KubernetesProviderConnection,
  Logger,
  Provider,
  ProviderAutostart,
  ProviderCleanup,
  ProviderCleanupAction,
  ProviderCleanupExecuteOptions,
  ProviderConnection,
  ProviderConnectionFactory,
  ProviderConnectionShellAccess,
  ProviderConnectionShellAccessSession,
  ProviderConnectionShellDimensions,
  ProviderConnectionStatus,
  ProviderContainerConnection,
  ProviderDetectionCheck,
  ProviderEvent,
  ProviderInformation,
  ProviderInstallation,
  ProviderLifecycle,
  ProviderOptions,
  ProviderStatus,
  ProviderUpdate,
  RegisterContainerConnectionEvent,
  RegisterKubernetesConnectionEvent,
  RegisterVmConnectionEvent,
  UnregisterContainerConnectionEvent,
  UnregisterKubernetesConnectionEvent,
  UnregisterVmConnectionEvent,
  UpdateContainerConnectionEvent,
  UpdateKubernetesConnectionEvent,
  UpdateVmConnectionEvent,
  VmProviderConnection,
} from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';

import type { AutostartEngine } from './autostart-engine.js';
import { ContainerProviderRegistry } from './container-registry.js';
import { Emitter } from './events/emitter.js';
import { LifecycleContextImpl, LoggerImpl } from './lifecycle-context.js';
import { ProviderImpl } from './provider-impl.js';
import { Telemetry } from './telemetry/telemetry.js';
import { Disposable } from './types/disposable.js';

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
@injectable()
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
  private providerCleanup: Map<string, ProviderCleanup> = new Map();
  private autostartEngine: AutostartEngine | undefined = undefined;

  private connectionLifecycleContexts: Map<ProviderConnection, LifecycleContextImpl> = new Map();
  private connectionErrors: Map<ProviderConnection, string> = new Map();
  private listeners: ProviderEventListener[];
  private lifecycleListeners: ProviderLifecycleListener[];
  private containerConnectionLifecycleListeners: ContainerConnectionProviderLifecycleListener[];

  protected kubernetesProviders: Map<string, KubernetesProviderConnection> = new Map();
  protected vmProviders: Map<string, VmProviderConnection> = new Map();

  private readonly _onDidUpdateProvider = new Emitter<ProviderEvent>();
  readonly onDidUpdateProvider: Event<ProviderEvent> = this._onDidUpdateProvider.event;

  private readonly _onBeforeDidUpdateContainerConnection = new Emitter<UpdateContainerConnectionEvent>();
  readonly onBeforeDidUpdateContainerConnection: Event<UpdateContainerConnectionEvent> =
    this._onBeforeDidUpdateContainerConnection.event;
  private readonly _onDidUpdateContainerConnection = new Emitter<UpdateContainerConnectionEvent>();
  readonly onDidUpdateContainerConnection: Event<UpdateContainerConnectionEvent> =
    this._onDidUpdateContainerConnection.event;
  private readonly _onAfterDidUpdateContainerConnection = new Emitter<UpdateContainerConnectionEvent>();
  readonly onAfterDidUpdateContainerConnection: Event<UpdateContainerConnectionEvent> =
    this._onAfterDidUpdateContainerConnection.event;

  private readonly _onDidUpdateKubernetesConnection = new Emitter<UpdateKubernetesConnectionEvent>();
  readonly onDidUpdateKubernetesConnection: Event<UpdateKubernetesConnectionEvent> =
    this._onDidUpdateKubernetesConnection.event;

  private readonly _onDidUpdateVmConnection = new Emitter<UpdateVmConnectionEvent>();
  readonly onDidUpdateVmConnection: Event<UpdateVmConnectionEvent> = this._onDidUpdateVmConnection.event;

  private readonly _onDidUnregisterContainerConnection = new Emitter<UnregisterContainerConnectionEvent>();
  readonly onDidUnregisterContainerConnection: Event<UnregisterContainerConnectionEvent> =
    this._onDidUnregisterContainerConnection.event;

  private readonly _onDidUnregisterKubernetesConnection = new Emitter<UnregisterKubernetesConnectionEvent>();
  readonly onDidUnregisterKubernetesConnection: Event<UnregisterKubernetesConnectionEvent> =
    this._onDidUnregisterKubernetesConnection.event;

  private readonly _onDidUnregisterVmConnection = new Emitter<UnregisterVmConnectionEvent>();
  readonly onDidUnregisterVmConnection: Event<UnregisterVmConnectionEvent> = this._onDidUnregisterVmConnection.event;

  private readonly _onDidRegisterKubernetesConnection = new Emitter<RegisterKubernetesConnectionEvent>();
  readonly onDidRegisterKubernetesConnection: Event<RegisterKubernetesConnectionEvent> =
    this._onDidRegisterKubernetesConnection.event;

  private readonly _onDidRegisterVmConnection = new Emitter<RegisterVmConnectionEvent>();
  readonly onDidRegisterVmConnection: Event<RegisterVmConnectionEvent> = this._onDidRegisterVmConnection.event;

  private readonly _onDidRegisterContainerConnection = new Emitter<RegisterContainerConnectionEvent>();
  readonly onDidRegisterContainerConnection: Event<RegisterContainerConnectionEvent> =
    this._onDidRegisterContainerConnection.event;

  private readonly _onDidSetConnectionFactory = new Emitter<ConnectionFactoryDetails>();
  readonly onDidSetConnectionFactory: Event<ConnectionFactoryDetails> = this._onDidSetConnectionFactory.event;

  private readonly _onDidUnsetConnectionFactory = new Emitter<ConnectionFactory>();
  readonly onDidUnsetConnectionFactory: Event<ConnectionFactory> = this._onDidUnsetConnectionFactory.event;

  constructor(
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(ContainerProviderRegistry)
    private containerRegistry: ContainerProviderRegistry,
    @inject(Telemetry)
    private telemetryService: Telemetry,
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
  ) {
    this.providers = new Map();
    this.listeners = [];
    this.lifecycleListeners = [];
    this.containerConnectionLifecycleListeners = [];

    // Every 2 seconds, we will check:
    // * The status of the providers
    // * Any new warnings or information for each provider
    setInterval(() => {
      for (const [providerKey] of this.providers) {
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
            this.listeners.forEach(listener => listener('provider:update-status', this.toProviderInfo(provider)));
            this.providerStatuses.set(providerKey, status);
          }
        }

        // Update the warnings of the provider
        // If the warnings do not match the current cache, we will send an update event to the renderer
        // and update the local warnings cache
        if (provider && JSON.stringify(providerWarnings) !== JSON.stringify(provider?.warnings)) {
          this.apiSender.send('provider:update-warnings', provider.id);
          this.providerWarnings.set(providerKey, provider.warnings);
        }
      }
    }, 2000);
  }

  init(): void {
    const providerConfiguration: IConfigurationNode = {
      id: 'preferences.providers',
      title: 'Providers',
      type: 'object',
      properties: {
        'providers.allowUpdate': {
          description:
            'List of extension IDs permitted to register provider engine updates. Use ["*"] to allow all extensions (default). Use [] to block all updates.',
          type: 'array',
          default: ['*'],
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([providerConfiguration]);
  }

  createProvider(extensionId: string, extensionDisplayName: string, providerOptions: ProviderOptions): Provider {
    const id = `${this.count}`;
    const providerImpl = new ProviderImpl(
      id,
      extensionId,
      extensionDisplayName,
      providerOptions,
      this,
      this.containerRegistry,
    );
    this.count++;
    this.providers.set(id, providerImpl);
    this.listeners.forEach(listener => listener('provider:create', this.toProviderInfo(providerImpl)));
    const trackOpts: { name: string; status: string; version?: string } = {
      name: providerOptions.name,
      status: providerOptions.status.toString(),
    };
    if (providerOptions.version) {
      trackOpts.version = providerOptions.version;
    }
    this.telemetryService.aggregateTrack('createProviders', trackOpts);
    this.apiSender.send('provider-create', id);
    providerImpl.onDidUpdateVersion(() => this.apiSender.send('provider:update-version'));
    providerImpl.onDidUpdateStatus((status: ProviderStatus) => {
      const provider = this.getMatchingProvider(id);
      this.listeners.forEach(listener =>
        listener('provider:update-status', { ...this.toProviderInfo(provider), status: status }),
      );
    });
    return providerImpl;
  }

  disposeProvider(providerImpl: ProviderImpl): void {
    this.providers.delete(providerImpl.internalId);
    this.listeners.forEach(listener => listener('provider:delete', this.toProviderInfo(providerImpl)));
    this.apiSender.send('provider-delete', providerImpl.id);
  }

  // need to call dispose() method to unregister the lifecycle
  registerLifecycle(providerImpl: ProviderImpl, lifecycle: ProviderLifecycle): Disposable {
    this.providerLifecycles.set(providerImpl.internalId, lifecycle);
    this.providerLifecycleContexts.set(providerImpl.internalId, new LifecycleContextImpl());

    this.lifecycleListeners.forEach(listener =>
      listener('provider:register-lifecycle', this.toProviderInfo(providerImpl), lifecycle),
    );

    return Disposable.create(() => {
      this.providerLifecycles.delete(providerImpl.internalId);
      this.providerLifecycleContexts.delete(providerImpl.internalId);
      this.lifecycleListeners.forEach(listener =>
        listener('provider:removal-lifecycle', this.toProviderInfo(providerImpl), lifecycle),
      );
    });
  }

  registerInstallation(providerImpl: ProviderImpl, installation: ProviderInstallation): Disposable {
    this.providerInstallations.set(providerImpl.internalId, installation);

    this.apiSender.send('provider-change', {});
    return Disposable.create(() => {
      this.providerInstallations.delete(providerImpl.internalId);
      // need to refresh the provider
      this.apiSender.send('provider-change', {});
    });
  }

  registerUpdate(providerImpl: ProviderImpl, update: ProviderUpdate): Disposable {
    const allowUpdate = this.configurationRegistry.getConfiguration('providers').get<string[]>('allowUpdate') ?? ['*'];
    if (!allowUpdate.includes('*') && !allowUpdate.includes(providerImpl.extensionId)) {
      console.log(
        `Provider update registration blocked for extension '${providerImpl.extensionId}' by providers.allowUpdate configuration`,
      );
      return Disposable.create(() => {});
    }

    this.providerUpdates.set(providerImpl.internalId, update);

    // need to refresh the provider
    this.apiSender.send('provider-change', {});

    return Disposable.create(() => {
      this.providerUpdates.delete(providerImpl.internalId);
      // need to refresh the provider
      this.apiSender.send('provider-change', {});
    });
  }

  registerAutostartEngine(engine: AutostartEngine): void {
    this.autostartEngine = engine;
  }

  registerAutostart(providerImpl: ProviderImpl, autostart: ProviderAutostart): Disposable {
    if (!this.autostartEngine) {
      throw new Error('no autostart engine has been registered. Autostart feature is disabled');
    }

    this.providerAutostarts.set(providerImpl.internalId, autostart);
    const disposable = this.autostartEngine.registerProvider(
      providerImpl.extensionId,
      providerImpl.extensionDisplayName,
      providerImpl.internalId,
    );
    return Disposable.create(() => {
      this.providerAutostarts.delete(providerImpl.internalId);
      disposable.dispose();
    });
  }

  registerCleanup(providerImpl: ProviderImpl, cleanup: ProviderCleanup): Disposable {
    this.providerCleanup.set(providerImpl.internalId, cleanup);

    return Disposable.create(() => {
      this.providerCleanup.delete(providerImpl.internalId);
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
      listener('provider:before-initialize-lifecycle', this.toProviderInfo(provider), providerLifecycle),
    );

    await providerLifecycle.initialize(context);
    this.lifecycleListeners.forEach(listener =>
      listener('provider:after-initialize-lifecycle', this.toProviderInfo(provider), providerLifecycle),
    );
  }

  async startProviderLifecycle(providerId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerId);
    const providerLifecycle = this.getMatchingProviderLifecycle(providerId);
    const context = this.getMatchingLifecycleContext(providerId);

    this.lifecycleListeners.forEach(listener =>
      listener('provider:before-start-lifecycle', this.toProviderInfo(provider), providerLifecycle),
    );

    await providerLifecycle.start(context);
    this.lifecycleListeners.forEach(listener =>
      listener('provider:after-start-lifecycle', this.toProviderInfo(provider), providerLifecycle),
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
      listener('provider:before-stop-lifecycle', this.toProviderInfo(provider), providerLifecycle),
    );
    await providerLifecycle.stop(context);
    this.lifecycleListeners.forEach(listener =>
      listener('provider:after-stop-lifecycle', this.toProviderInfo(provider), providerLifecycle),
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
  async runAutostart(internalId: string): Promise<void> {
    // grab auto start provider
    const autoStart = this.providerAutostarts.get(internalId);
    if (!autoStart) {
      throw new Error(`no autostart matching provider id ${internalId}`);
    }

    // grab the provider
    const provider = this.getMatchingProvider(internalId);

    const context = Object.freeze({
      updateContainerConnection: (containerProviderConnection: ContainerProviderConnection): void => {
        if (!this.isContainerProviderConnectionRegistered(provider, containerProviderConnection)) {
          throw new Error(
            `container connection ${containerProviderConnection.name} is not registered by provider ${provider.name}`,
          );
        }
        const providerConnectionInfo = this.getProviderConnectionInfo(containerProviderConnection);
        if (this.isProviderContainerConnection(providerConnectionInfo)) {
          this.fireUpdateContainerConnectionEvents(provider.id, providerConnectionInfo);
        }
      },
    });
    await autoStart.start(new LoggerImpl(), context);
    // send the event
    this._onDidUpdateProvider.fire({
      id: provider.id,
      name: provider.name,
      status: provider.status,
    });
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
          severity: checkResult.severity,
          description: checkResult.description,
          docLinksDescription: checkResult.docLinksDescription,
          docLinks: checkResult.docLinks,
        });

        if (!checkResult.successful && checkResult.severity !== 'warning') {
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

  async executeCleanupActions(logger: Logger, providerIds: string[], token?: CancellationToken): Promise<void> {
    // first, grab all matching actions
    const actions = await this.getCleanupActions(providerIds);

    const cleanupErrors: string[] = [];
    // now, execute them
    for (const action of actions) {
      // get all actions
      const providerActions = await action.actions;

      // execute them
      for (const providerAction of providerActions) {
        try {
          const options: ProviderCleanupExecuteOptions = {
            logger,
            token,
          };
          logger.log('executing action ', providerAction.name);
          await providerAction.execute.apply(action.instance, [options]);
        } catch (err) {
          cleanupErrors.push(String(err));
          logger.error(`Error while executing cleanup action ${providerAction.name}: ${err}`);
        }
      }
    }
    const telemetryOptions: { error?: string[]; success?: boolean } = {};
    if (cleanupErrors.length > 0) {
      telemetryOptions.error = cleanupErrors;
      telemetryOptions.success = false;
    } else {
      telemetryOptions.success = true;
    }
    this.telemetryService.track('executeCleanupActions', telemetryOptions);
  }

  async getCleanupActions(providerIds?: string[]): Promise<ProviderCleanupActionInfo[]> {
    if (!providerIds || providerIds.length === 0) {
      // grab from all providers
      return Array.from(this.providerCleanup.entries()).map(([providerInternalId, providerCleanup]) => {
        const provider = this.getMatchingProvider(providerInternalId);
        return {
          providerId: providerInternalId,
          providerName: provider.name,
          actions: providerCleanup.getActions(),
          instance: providerCleanup,
        };
      });
    } else {
      // grab from the list of providers
      return providerIds.map(providerInternalId => {
        const provider = this.getMatchingProvider(providerInternalId);
        const providerCleanup = this.providerCleanup.get(providerInternalId);
        if (!providerCleanup) {
          throw new Error(`No matching cleanup for provider ${provider.internalId}`);
        }
        return {
          providerId: providerInternalId,
          providerName: provider.name,
          instance: providerCleanup,
          actions: providerCleanup.getActions(),
        };
      });
    }
  }

  async getCleanupActionsFromProvider(providerInternalId: string): Promise<ProviderCleanupAction[]> {
    const providerCleanup = this.providerCleanup.get(providerInternalId);
    // empty if not defined
    if (!providerCleanup) {
      return [];
    }
    return providerCleanup.getActions();
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
    // do we have a lifecycle attached to the provider ?
    if (this.providerLifecycles.has(providerInternalId)) {
      return this.startProviderLifecycle(providerInternalId);
    }

    const provider = this.getMatchingProvider(providerInternalId);
    let connection: ProviderConnection | undefined;

    if (provider.containerConnections && provider.containerConnections.length > 0) {
      connection = provider.containerConnections[0];
    } else if (provider.kubernetesConnections && provider.kubernetesConnections.length > 0) {
      connection = provider.kubernetesConnections[0];
    } else if (provider.vmConnections && provider.vmConnections.length > 0) {
      connection = provider.vmConnections[0];
    }

    if (!connection) {
      throw new Error('The provider does not have any connection to start');
    }

    const lifecycle = connection.lifecycle;
    if (!lifecycle?.start) {
      throw new Error(`The connection ${connection.name} does not support start lifecycle`);
    }

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error(`The connection ${connection.name} does not have context to start`);
    }

    return lifecycle.start(context);
  }

  // Initialize the provider (if there is something to initialize)
  async initializeProvider(providerInternalId: string): Promise<void> {
    const provider = this.getMatchingProvider(providerInternalId);

    provider.updateStatus('configuring');
    try {
      // do we have a lifecycle attached to the provider ?
      if (
        this.providerLifecycles.has(providerInternalId) &&
        this.providerLifecycles.get(providerInternalId)?.initialize
      ) {
        return await this.intializeProviderLifecycle(providerInternalId);
      }

      if (provider?.containerProviderConnectionFactory?.initialize) {
        this.telemetryService.track('initializeProvider', {
          name: provider.name,
        });

        return await provider.containerProviderConnectionFactory.initialize();
      }

      if (provider?.kubernetesProviderConnectionFactory?.initialize) {
        this.telemetryService.track('initializeProvider', {
          name: provider.name,
        });

        return await provider.kubernetesProviderConnectionFactory.initialize();
      }

      if (provider?.vmProviderConnectionFactory?.initialize) {
        this.telemetryService.track('initializeProvider', {
          name: provider.name,
        });

        return await provider.vmProviderConnectionFactory.initialize();
      }
    } catch (error: unknown) {
      provider.updateStatus('installed');
      throw error;
    }
    throw new Error('No initialize implementation found for this provider');
  }

  public getProviderContainerConnectionInfo(connection: ContainerProviderConnection): ProviderContainerConnectionInfo {
    return this.getProviderConnectionInfo(connection) as ProviderContainerConnectionInfo;
  }

  public getProviderKubernetesConnectionInfo(
    connection: KubernetesProviderConnection,
  ): ProviderKubernetesConnectionInfo {
    return this.getProviderConnectionInfo(connection) as ProviderKubernetesConnectionInfo;
  }

  public getProviderVmConnectionInfo(connection: VmProviderConnection): ProviderVmConnectionInfo {
    return this.getProviderConnectionInfo(connection) as ProviderVmConnectionInfo;
  }

  private getProviderConnectionInfo(connection: ProviderConnection): ProviderConnectionInfo {
    let providerConnection: ProviderConnectionInfo;
    const lifecycleError = this.connectionErrors.get(connection);
    const error = connection.error ?? lifecycleError;

    if (this.isContainerConnection(connection)) {
      providerConnection = {
        connectionType: 'container',
        name: connection.name,
        displayName: connection.displayName ?? connection.name,
        status: connection.status(),
        error,
        type: connection.type,
        endpoint: {
          socketPath: connection.endpoint.socketPath,
        },
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: false,
        shellAccess: !!connection.shellAccess,
        vmType: connection.vmType
          ? {
              id: connection.vmType,
              name: connection.vmTypeDisplayName ?? connection.vmType,
            }
          : undefined,
      };
    } else if (this.isKubernetesConnection(connection)) {
      providerConnection = {
        connectionType: 'kubernetes',
        name: connection.name,
        status: connection.status(),
        error,
        endpoint: {
          apiURL: connection.endpoint.apiURL,
        },
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: false,
      };
    } else {
      providerConnection = {
        connectionType: 'vm',
        name: connection.name,
        status: connection.status(),
        error,
        canStart: false,
        canStop: false,
        canEdit: false,
        canDelete: false,
      };
    }
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
      if (connection.lifecycle.edit) {
        lifecycleMethods.push('edit');
      }
      providerConnection.lifecycleMethods = lifecycleMethods;
      providerConnection.canStart = !!connection.lifecycle.start;
      providerConnection.canStop = !!connection.lifecycle.stop;
      providerConnection.canEdit = !!connection.lifecycle.edit;
      providerConnection.canDelete = !!connection.lifecycle.delete;
    }
    return providerConnection;
  }

  protected toProviderInfo(provider: ProviderImpl): ProviderInfo {
    const containerConnections: ProviderContainerConnectionInfo[] = provider.containerConnections.map(connection => {
      return this.getProviderContainerConnectionInfo(connection);
    });
    const kubernetesConnections: ProviderKubernetesConnectionInfo[] = provider.kubernetesConnections.map(connection => {
      return this.getProviderKubernetesConnectionInfo(connection);
    });
    const vmConnections: ProviderVmConnectionInfo[] = provider.vmConnections.map(connection => {
      return this.getProviderVmConnectionInfo(connection);
    });

    // container connection factory ?
    let containerProviderConnectionInitialization = false;
    if (provider?.containerProviderConnectionFactory?.initialize) {
      containerProviderConnectionInitialization = true;
    }

    // kubernetes connection factory ?
    let kubernetesProviderConnectionCreation = false;
    if (provider?.kubernetesProviderConnectionFactory?.create) {
      kubernetesProviderConnectionCreation = true;
    }

    // VM connection factory ?
    let vmProviderConnectionCreation = false;
    if (provider?.vmProviderConnectionFactory?.create) {
      vmProviderConnectionCreation = true;
    }

    // container connection factory ?
    let containerProviderConnectionCreation = false;
    const containerProviderConnectionCreationDisplayName =
      provider.containerProviderConnectionFactory?.creationDisplayName;
    const containerProviderConnectionCreationButtonTitle =
      provider.containerProviderConnectionFactory?.creationButtonTitle;
    if (provider.containerProviderConnectionFactory) {
      containerProviderConnectionCreation = true;
    }

    // kubernetes connection factory ?
    let kubernetesProviderConnectionInitialization = false;
    const kubernetesProviderConnectionCreationDisplayName =
      provider.kubernetesProviderConnectionFactory?.creationDisplayName;
    const kubernetesProviderConnectionCreationButtonTitle =
      provider.kubernetesProviderConnectionFactory?.creationButtonTitle;
    if (provider?.kubernetesProviderConnectionFactory?.initialize) {
      kubernetesProviderConnectionInitialization = true;
    }

    // VM connection factory ?
    let vmProviderConnectionInitialization = false;
    const vmProviderConnectionCreationDisplayName = provider.vmProviderConnectionFactory?.creationDisplayName;
    const vmProviderConnectionCreationButtonTitle = provider.vmProviderConnectionFactory?.creationButtonTitle;
    if (provider?.vmProviderConnectionFactory?.initialize) {
      vmProviderConnectionInitialization = true;
    }

    const emptyConnectionMarkdownDescription = provider.emptyConnectionMarkdownDescription;

    // handle installation
    let installationSupport = false;
    if (this.providerInstallations.has(provider.internalId)) {
      installationSupport = true;
    }

    // cleanup supported ?
    let cleanupSupport = false;
    if (this.providerCleanup.has(provider.internalId)) {
      cleanupSupport = true;
    }

    const providerInfo: ProviderInfo = {
      id: provider.id,
      internalId: provider.internalId,
      extensionId: provider.extensionId,
      name: provider.name,
      containerConnections,
      kubernetesConnections,
      vmConnections,
      status: provider.status,
      containerProviderConnectionCreation,
      kubernetesProviderConnectionCreation,
      vmProviderConnectionCreation,
      containerProviderConnectionInitialization,
      containerProviderConnectionCreationDisplayName,
      containerProviderConnectionCreationButtonTitle,
      kubernetesProviderConnectionInitialization,
      kubernetesProviderConnectionCreationDisplayName,
      kubernetesProviderConnectionCreationButtonTitle,
      vmProviderConnectionInitialization,
      vmProviderConnectionCreationDisplayName,
      vmProviderConnectionCreationButtonTitle,
      emptyConnectionMarkdownDescription,
      links: provider.links,
      detectionChecks: provider.detectionChecks,
      images: provider.images,
      version: provider.version,
      warnings: provider.warnings,
      installationSupport,
      cleanupSupport,
      canStart: false,
      canStop: false,
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
    const hasLifecycle = this.providerLifecycles.has(provider.internalId);
    providerInfo.canStart = hasLifecycle;
    providerInfo.canStop = hasLifecycle;
    return providerInfo;
  }

  // providers are sort in reverse alphabetical order
  getProviderInfos(): ProviderInfo[] {
    return Array.from(this.providers.values())
      .map(provider => {
        return this.toProviderInfo(provider);
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
  protected getMatchingProvider(internalId: string): ProviderImpl {
    // need to find the provider
    const provider = this.providers.get(internalId);
    if (!provider) {
      throw new Error(`no provider matching provider id ${internalId}`);
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

  getMatchingConnectionLifecycleContext(
    internalId: string,
    providerContainerConnectionInfo: ProviderConnectionInfo | ContainerProviderConnection,
  ): LifecycleContextImpl {
    const connection = this.getMatchingConnectionFromProvider(internalId, providerContainerConnectionInfo);

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error('The connection does not have context to start');
    }

    return context;
  }

  getMatchingProviderInternalId(providerId: string): string {
    // need to find the provider
    const provider = Array.from(this.providers.values()).find(prov => prov.id === providerId);
    if (!provider) {
      throw new Error(`no provider matching provider id ${providerId}`);
    }
    return provider.internalId;
  }

  getMatchingProviderLifecycleContextByProviderId(
    providerId: string,
    providerConnectionInfo:
      | ProviderContainerConnectionInfo
      | ProviderKubernetesConnectionInfo
      | ContainerProviderConnection,
  ): LifecycleContextImpl {
    const internalId = this.getMatchingProviderInternalId(providerId);
    return this.getMatchingConnectionLifecycleContext(internalId, providerConnectionInfo);
  }

  async createContainerProviderConnection(
    internalProviderId: string,
    params: { [key: string]: unknown },
    logHandler: Logger,
    token?: CancellationToken,
  ): Promise<void> {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);
    const telemetryData: {
      providerId: string;
      error?: unknown;
      name: string;
    } = {
      providerId: provider.id,
      name: provider.name,
    };
    try {
      if (!provider.containerProviderConnectionFactory) {
        throw new Error('The provider does not support container connection creation');
      }
      // create a logger
      return provider.containerProviderConnectionFactory.create(params, logHandler, token);
    } catch (err) {
      telemetryData.error = err;
      throw err;
    } finally {
      this.telemetryService.track('createProviderConnection', telemetryData);
    }
  }

  async auditConnectionParameters(internalProviderId: string, params: AuditRequestItems): Promise<AuditResult> {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);
    const emptyAuditResult: AuditResult = { records: [] };

    if (!provider.connectionAuditor) {
      return emptyAuditResult;
    }

    return provider.connectionAuditor.auditItems(params);
  }

  async createKubernetesProviderConnection(
    internalProviderId: string,
    params: { [key: string]: unknown },
    logHandler: Logger,
    token?: CancellationToken,
  ): Promise<void> {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    if (!provider.kubernetesProviderConnectionFactory?.create) {
      throw new Error('The provider does not support kubernetes connection creation');
    }
    return provider.kubernetesProviderConnectionFactory.create(params, logHandler, token);
  }

  async createVmProviderConnection(
    internalProviderId: string,
    params: { [key: string]: unknown },
    logHandler: Logger,
    token?: CancellationToken,
  ): Promise<void> {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    if (!provider.vmProviderConnectionFactory?.create) {
      throw new Error('The provider does not support VM connection creation');
    }
    return provider.vmProviderConnectionFactory.create(params, logHandler, token);
  }

  // helper method
  protected getMatchingContainerConnectionFromProvider(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderContainerConnectionInfo | ContainerProviderConnection,
  ): ContainerProviderConnection {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    // grab the correct container connection
    const containerConnection = provider.containerConnections.find(
      connection =>
        connection.endpoint.socketPath === providerContainerConnectionInfo.endpoint.socketPath &&
        connection.name === providerContainerConnectionInfo.name,
    );
    if (!containerConnection) {
      throw new Error(`no container connection matching provider id ${internalProviderId}`);
    }
    return containerConnection;
  }

  protected getMatchingKubernetesConnectionFromProvider(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderKubernetesConnectionInfo,
  ): KubernetesProviderConnection {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    // grab the correct kubernetes connection
    const kubernetesConnection = provider.kubernetesConnections.find(
      connection =>
        connection.endpoint.apiURL === providerContainerConnectionInfo.endpoint.apiURL &&
        connection.name === providerContainerConnectionInfo.name,
    );
    if (!kubernetesConnection) {
      throw new Error(`no kubernetes connection matching provider id ${internalProviderId}`);
    }
    return kubernetesConnection;
  }

  protected getMatchingVmConnectionFromProvider(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderVmConnectionInfo,
  ): VmProviderConnection {
    // grab the correct provider
    const provider = this.getMatchingProvider(internalProviderId);

    // grab the correct kubernetes connection
    const vmConnection = provider.vmConnections.find(
      connection => connection.name === providerContainerConnectionInfo.name,
    );
    if (!vmConnection) {
      throw new Error(`no VM connection matching provider id ${internalProviderId}`);
    }
    return vmConnection;
  }

  getMatchingConnectionFromProvider(
    internalProviderId: string,
    providerContainerConnectionInfo: ProviderConnectionInfo | ContainerProviderConnection,
  ): ProviderConnection {
    // Check if this is a ProviderConnectionInfo with connectionType discriminator
    if ('connectionType' in providerContainerConnectionInfo) {
      const info = providerContainerConnectionInfo as ProviderConnectionInfo;
      switch (info.connectionType) {
        case 'container':
          return this.getMatchingContainerConnectionFromProvider(internalProviderId, info);
        case 'kubernetes':
          return this.getMatchingKubernetesConnectionFromProvider(internalProviderId, info);
        case 'vm':
          return this.getMatchingVmConnectionFromProvider(internalProviderId, info);
        default: {
          const _exhaustiveCheck: never = info;
          throw new Error(`Unknown connection type: ${JSON.stringify(_exhaustiveCheck)}`);
        }
      }
    }

    // Fallback for ContainerProviderConnection (API object without connectionType)
    if (this.isProviderContainerConnection(providerContainerConnectionInfo)) {
      return this.getMatchingContainerConnectionFromProvider(internalProviderId, providerContainerConnectionInfo);
    }

    throw new Error(`Unable to determine connection type for provider ${internalProviderId}`);
  }

  isProviderContainerConnection(
    connection: ProviderConnectionInfo | ContainerProviderConnection,
  ): connection is ProviderContainerConnectionInfo | ContainerProviderConnection {
    // Check connectionType discriminator first if available
    if ('connectionType' in connection) {
      return connection.connectionType === 'container';
    }
    // Fallback to structural check for ContainerProviderConnection
    return (connection as ContainerProviderConnection).endpoint?.socketPath !== undefined;
  }

  isProviderKubernetesConnectionInfo(
    connection: ProviderConnectionInfo | ContainerProviderConnection,
  ): connection is ProviderKubernetesConnectionInfo {
    // Check connectionType discriminator first if available
    if ('connectionType' in connection) {
      return connection.connectionType === 'kubernetes';
    }
    // Fallback to structural check
    return (
      !this.isProviderContainerConnection(connection) &&
      (connection as ProviderKubernetesConnectionInfo).endpoint !== undefined
    );
  }

  isProviderVmConnectionInfo(
    connection: ProviderConnectionInfo | ContainerProviderConnection,
  ): connection is ProviderVmConnectionInfo {
    return 'connectionType' in connection && connection.connectionType === 'vm';
  }

  isContainerConnection(connection: ProviderConnection): connection is ContainerProviderConnection {
    return (connection as ContainerProviderConnection).endpoint?.socketPath !== undefined;
  }

  isKubernetesConnection(connection: ProviderConnection): connection is KubernetesProviderConnection {
    return (
      !this.isContainerConnection(connection) && (connection as ContainerProviderConnection).endpoint !== undefined
    );
  }

  async startProviderConnection(
    internalProviderId: string,
    providerConnectionInfo: ProviderConnectionInfo,
    logHandler?: Logger,
  ): Promise<void> {
    // grab the correct provider
    const connection = this.getMatchingConnectionFromProvider(internalProviderId, providerConnectionInfo);

    const lifecycle = connection.lifecycle;
    if (!lifecycle?.start) {
      throw new Error('The container connection does not support start lifecycle');
    }

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error('The connection does not have context to start');
    }

    const provider = this.providers.get(internalProviderId);
    if (!provider) {
      throw new Error('Cannot find provider');
    }

    try {
      await lifecycle.start(context, logHandler);
      this.connectionErrors.delete(connection);
      if (this.isProviderContainerConnection(providerConnectionInfo)) {
        this.fireUpdateContainerConnectionEvents(provider.id, providerConnectionInfo);
      } else {
        this.fireConnectionUpdateEvent(provider.id, providerConnectionInfo, 'started');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.connectionErrors.set(connection, errorMessage);
      this.fireConnectionUpdateEvent(provider.id, providerConnectionInfo, 'starting', errorMessage);
      throw err;
    }
  }

  // call callback after api is attached to the connection
  public onProviderConnectionApiAttached(providerId: string, callback: () => void): void {
    if (this.containerRegistry.isApiAttached(providerId)) {
      callback();
      return;
    }
    const disposable = this.containerRegistry.onApiAttached((id: string) => {
      if (id === providerId) {
        callback();
        disposable.dispose();
      }
    });
  }

  async editProviderConnection(
    internalProviderId: string,
    providerConnectionInfo: ProviderConnectionInfo,
    params: { [key: string]: unknown },
    logHandler?: Logger,
    token?: CancellationToken,
  ): Promise<void> {
    // grab the correct provider
    const connection = this.getMatchingConnectionFromProvider(internalProviderId, providerConnectionInfo);

    const lifecycle = connection.lifecycle;
    if (!lifecycle?.edit) {
      throw new Error('The container connection does not support edit lifecycle');
    }

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error('The connection does not have context to edit');
    }

    const provider = this.providers.get(internalProviderId);
    if (!provider) {
      throw new Error('Cannot find provider');
    }

    try {
      await lifecycle.edit(context, params, logHandler, token);
    } catch (err) {
      console.warn(`Can't edit connection ${provider.id}.${providerConnectionInfo.name}`, err);
      throw err;
    }
  }

  async stopProviderConnection(
    internalProviderId: string,
    providerConnectionInfo: ProviderConnectionInfo,
    logHandler?: Logger,
  ): Promise<void> {
    // grab the correct provider
    const connection = this.getMatchingConnectionFromProvider(internalProviderId, providerConnectionInfo);

    const lifecycle = connection.lifecycle;
    if (!lifecycle?.stop) {
      throw new Error('The container connection does not support stop lifecycle');
    }

    const context = this.connectionLifecycleContexts.get(connection);
    if (!context) {
      throw new Error('The connection does not have context to start');
    }

    const provider = this.providers.get(internalProviderId);
    if (!provider) {
      throw new Error('Cannot find provider');
    }

    try {
      this.fireConnectionUpdateEvent(provider.id, providerConnectionInfo, 'stopped');
      await lifecycle.stop(context, logHandler);
      this.connectionErrors.delete(connection);
    } catch (err) {
      console.warn(`Can't stop connection ${provider.id}.${providerConnectionInfo.name}`, err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      this.connectionErrors.set(connection, errorMessage);
    }
  }

  async deleteProviderConnection(
    internalProviderId: string,
    providerConnectionInfo: ProviderConnectionInfo,
    logHandler?: Logger,
  ): Promise<void> {
    // grab the correct provider
    const connection = this.getMatchingConnectionFromProvider(internalProviderId, providerConnectionInfo);

    const lifecycle = connection.lifecycle;
    if (!lifecycle?.delete) {
      throw new Error('The container connection does not support delete lifecycle');
    }
    this.telemetryService.track('deleteProviderConnection', { name: providerConnectionInfo.name });
    return lifecycle.delete(logHandler);
  }

  onDidRegisterContainerConnectionCallback(
    provider: ProviderImpl,
    containerProviderConnection: ContainerProviderConnection,
  ): void {
    this.connectionLifecycleContexts.set(containerProviderConnection, new LifecycleContextImpl());
    // notify listeners
    this.containerConnectionLifecycleListeners.forEach(listener => {
      listener(
        'provider-container-connection:register',
        this.toProviderInfo(provider),
        this.getProviderContainerConnectionInfo(containerProviderConnection),
      );
    });
    this._onDidRegisterContainerConnection.fire({ providerId: provider.id, connection: containerProviderConnection });
  }

  onDidRegisterKubernetesConnectionCallback(
    provider: ProviderImpl,
    kubernetesProviderConnection: KubernetesProviderConnection,
  ): void {
    this.connectionLifecycleContexts.set(kubernetesProviderConnection, new LifecycleContextImpl());
    this.apiSender.send('provider-register-kubernetes-connection', { name: kubernetesProviderConnection.name });
    this._onDidRegisterKubernetesConnection.fire({ providerId: provider.id });
  }

  onDidSetConnectionFactoryCallback(
    provider: ProviderImpl,
    factory: ProviderConnectionFactory,
    factoryType: 'container' | 'kubernetes' | 'vm',
  ): void {
    this._onDidSetConnectionFactory.fire({
      providerId: provider.id,
      type: factoryType,
      creationDisplayName: factory.creationDisplayName,
      creationButtonTitle: factory.creationButtonTitle,
      emptyConnectionMarkdownDescription: provider.emptyConnectionMarkdownDescription,
      images: provider.images,
    });
  }

  onDidUnsetConnectionFactoryCallback(provider: ProviderImpl, factoryType: 'container' | 'kubernetes' | 'vm'): void {
    this._onDidUnsetConnectionFactory.fire({
      providerId: provider.id,
      type: factoryType,
    });
  }

  getConnectionFactories(): ConnectionFactoryDetails[] {
    const factories: ConnectionFactoryDetails[] = [];
    this.providers.forEach(provider => {
      if (provider.containerProviderConnectionFactory?.create) {
        factories.push({
          providerId: provider.id,
          type: 'container',
          creationDisplayName: provider.containerProviderConnectionFactory?.creationDisplayName,
          creationButtonTitle: provider.containerProviderConnectionFactory?.creationButtonTitle,
          emptyConnectionMarkdownDescription: provider.emptyConnectionMarkdownDescription,
          images: provider.images,
        });
      }
      if (provider.kubernetesProviderConnectionFactory?.create) {
        factories.push({
          providerId: provider.id,
          type: 'kubernetes',
          creationDisplayName: provider.kubernetesProviderConnectionFactory?.creationDisplayName,
          creationButtonTitle: provider.kubernetesProviderConnectionFactory?.creationButtonTitle,
          emptyConnectionMarkdownDescription: provider.emptyConnectionMarkdownDescription,
          images: provider.images,
        });
      }
      if (provider.vmProviderConnectionFactory?.create) {
        factories.push({
          providerId: provider.id,
          type: 'vm',
          creationDisplayName: provider.vmProviderConnectionFactory?.creationDisplayName,
          creationButtonTitle: provider.vmProviderConnectionFactory?.creationButtonTitle,
          emptyConnectionMarkdownDescription: provider.emptyConnectionMarkdownDescription,
          images: provider.images,
        });
      }
    });
    return factories;
  }

  onDidRegisterVmConnectionCallback(provider: ProviderImpl, vmProviderConnection: VmProviderConnection): void {
    this.connectionLifecycleContexts.set(vmProviderConnection, new LifecycleContextImpl());
    this.apiSender.send('provider-register-vm-connection', { name: vmProviderConnection.name });
    this._onDidRegisterVmConnection.fire({ providerId: provider.id });
  }

  onDidChangeContainerProviderConnectionStatus(
    provider: ProviderImpl,
    containerConnection: ContainerProviderConnection,
  ): void {
    // notify listeners
    const providerInfo = this.toProviderInfo(provider);
    const providerConnectionInfo = this.getProviderContainerConnectionInfo(containerConnection);
    this.containerConnectionLifecycleListeners.forEach(listener => {
      listener('provider-container-connection:update-status', providerInfo, providerConnectionInfo);
    });
    const event = {
      providerId: provider.id,
      connection: containerConnection,
      status: containerConnection.status(),
    };
    this._onDidUpdateContainerConnection.fire(event);
    this._onAfterDidUpdateContainerConnection.fire(event);
    this.apiSender.send('provider-container-connection-update-status');
  }

  onDidUnregisterContainerConnectionCallback(
    provider: ProviderImpl,
    containerConnection: ContainerProviderConnection,
  ): void {
    // notify listeners
    this.containerConnectionLifecycleListeners.forEach(listener => {
      listener(
        'provider-container-connection:unregister',
        this.toProviderInfo(provider),
        this.getProviderContainerConnectionInfo(containerConnection),
      );
    });
    this._onDidUnregisterContainerConnection.fire({ providerId: provider.id });
  }

  onDidUnregisterKubernetesConnectionCallback(
    provider: ProviderImpl,
    kubernetesProviderConnection: KubernetesProviderConnection,
  ): void {
    this.apiSender.send('provider-unregister-kubernetes-connection', { name: kubernetesProviderConnection.name });
    this._onDidUnregisterKubernetesConnection.fire({ providerId: provider.id });
  }

  onDidUnregisterVmConnectionCallback(provider: ProviderImpl, vmProviderConnection: VmProviderConnection): void {
    this.apiSender.send('provider-unregister-vm-connection', { name: vmProviderConnection.name });
    this._onDidUnregisterVmConnection.fire({ providerId: provider.id });
  }

  onDidUpdateProviderStatus(providerId: string, callback: (providerInfo: ProviderInfo) => void): void {
    // add callback for the given providerId
    const provider = this.getMatchingProvider(providerId);

    provider.onDidUpdateStatus(() => {
      callback(this.toProviderInfo(provider));
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

  registerKubernetesConnection(
    provider: Provider,
    kubernetesProviderConnection: KubernetesProviderConnection,
  ): Disposable {
    const providerName = kubernetesProviderConnection.name;
    const id = `${provider.id}.${providerName}`;
    this.kubernetesProviders.set(id, kubernetesProviderConnection);
    this.telemetryService.track('registerKubernetesProviderConnection', {
      name: kubernetesProviderConnection.name,
      total: this.kubernetesProviders.size,
    });

    let previousStatus = kubernetesProviderConnection.status();

    // track the status of the provider
    const timer = setInterval(() => {
      const newStatus = kubernetesProviderConnection.status();
      if (newStatus !== previousStatus) {
        this.apiSender.send('provider-change', {});
        previousStatus = newStatus;
      }
    }, 2000);

    // listen to events
    return Disposable.create(() => {
      clearInterval(timer);
      this.kubernetesProviders.delete(id);
      this.apiSender.send('provider-change', {});
    });
  }

  registerVmConnection(provider: Provider, vmProviderConnection: VmProviderConnection): Disposable {
    const providerName = vmProviderConnection.name;
    const id = `${provider.id}.${providerName}`;
    this.vmProviders.set(id, vmProviderConnection);
    this.telemetryService.track('registerVmProviderConnection', {
      name: vmProviderConnection.name,
      total: this.vmProviders.size,
    });

    let previousStatus = vmProviderConnection.status();

    // track the status of the provider
    const timer = setInterval(() => {
      const newStatus = vmProviderConnection.status();
      if (newStatus !== previousStatus) {
        this.apiSender.send('provider-change', {});
        previousStatus = newStatus;
      }
    }, 2000);

    return Disposable.create(() => {
      clearInterval(timer);
      this.vmProviders.delete(id);
      this.apiSender.send('provider-change', {});
    });
  }

  async shellInProviderConnection(
    internalProviderId: string,
    providerConnectionInfo: ProviderConnectionInfo,
    onData: (data: string) => void,
    onError: (error: string) => void,
    onEnd: () => void,
  ): Promise<{
    write: (param: string) => void;
    resize: (dimensions: ProviderConnectionShellDimensions) => void;
    close: () => void;
  }> {
    try {
      const containerConnection = this.getMatchingConnectionFromProvider(internalProviderId, providerConnectionInfo);
      let shellAccess: ProviderConnectionShellAccess | undefined;
      let connection: ProviderConnectionShellAccessSession | undefined;
      const disposables: Disposable[] = [];
      if (!this.isKubernetesConnection(containerConnection) && providerConnectionInfo.status === 'started') {
        shellAccess = containerConnection.shellAccess;
        connection = shellAccess?.open();
        connection?.onData(
          data => {
            onData(data.data);
          },
          {},
          disposables,
        );

        connection?.onError(
          error => {
            onError(error.error);
          },
          {},
          disposables,
        );

        connection?.onEnd(onEnd, {}, disposables);
      }

      return {
        write: (data: string): void => {
          connection?.write(data);
        },
        resize: (dimension: ProviderConnectionShellDimensions): void => {
          connection?.resize(dimension);
        },
        close: (): void => {
          disposables.forEach(dispose => {
            dispose.dispose();
          });
          connection?.close();
        },
      };
    } catch (error) {
      this.telemetryService.track('shellInProviderConnection.error', error);
      throw error;
    }
  }

  getProviderInfo(internalProviderId: string): ProviderInfo | undefined {
    const provider = this.providers.get(internalProviderId);
    if (provider) {
      return this.toProviderInfo(provider);
    }
    return undefined;
  }

  protected fireConnectionUpdateEvent(
    providerId: string,
    providerConnectionInfo: ProviderConnectionInfo,
    status: ProviderConnectionStatus,
    error?: string,
  ): void {
    if (this.isProviderContainerConnection(providerConnectionInfo)) {
      const event = {
        providerId,
        connection: {
          displayName: providerConnectionInfo.displayName,
          name: providerConnectionInfo.name,
          type: providerConnectionInfo.type,
          endpoint: providerConnectionInfo.endpoint,
          status: (): ProviderConnectionStatus => status,
          error,
        },
        status,
        error,
      };
      this._onBeforeDidUpdateContainerConnection.fire(event);
      this._onDidUpdateContainerConnection.fire(event);
      this._onAfterDidUpdateContainerConnection.fire(event);
    } else if (this.isProviderKubernetesConnectionInfo(providerConnectionInfo)) {
      this._onDidUpdateKubernetesConnection.fire({
        providerId,
        connection: {
          name: providerConnectionInfo.name,
          endpoint: providerConnectionInfo.endpoint,
          status: (): ProviderConnectionStatus => status,
          error,
        },
        status,
        error,
      });
    } else {
      this._onDidUpdateVmConnection.fire({
        providerId,
        connection: {
          name: providerConnectionInfo.name,
          status: (): ProviderConnectionStatus => status,
          error,
        },
        status,
        error,
      });
    }
  }

  protected fireUpdateContainerConnectionEvents(
    providerId: string,
    providerConnectionInfo: ProviderContainerConnectionInfo,
  ): void {
    const sendEvents = (status: ProviderConnectionStatus): void => {
      const event = {
        providerId: providerId,
        connection: {
          displayName: providerConnectionInfo.displayName,
          name: providerConnectionInfo.name,
          type: providerConnectionInfo.type,
          endpoint: providerConnectionInfo.endpoint,
          status: (): ProviderConnectionStatus => {
            return status;
          },
        },
        status: status as ProviderConnectionStatus,
      };
      this._onBeforeDidUpdateContainerConnection.fire(event);
      this._onDidUpdateContainerConnection.fire(event);
      this._onAfterDidUpdateContainerConnection.fire(event);
    };
    sendEvents('starting');
    this.onProviderConnectionApiAttached(`${providerId}.${providerConnectionInfo.name}`, () => sendEvents('started'));
  }

  isContainerProviderConnectionRegistered(
    provider: ProviderImpl,
    containerProviderConnection: ContainerProviderConnection,
  ): boolean {
    const connections = provider.containerConnections;
    for (const connection of connections) {
      if (connection.name === containerProviderConnection.name) {
        return true;
      }
    }
    return false;
  }
}
