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
  Auditor,
  ContainerProviderConnection,
  ContainerProviderConnectionFactory,
  Event,
  KubernetesProviderConnection,
  KubernetesProviderConnectionFactory,
  Provider,
  ProviderAutostart,
  ProviderCleanup,
  ProviderConnectionStatus,
  ProviderDetectionCheck,
  ProviderImages,
  ProviderInformation,
  ProviderInstallation,
  ProviderLifecycle,
  ProviderLinks,
  ProviderOptions,
  ProviderStatus,
  ProviderUpdate,
} from '@podman-desktop/api';

import type { ContainerProviderRegistry } from './container-registry.js';
import { Emitter } from './events/emitter.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { IDisposable } from './types/disposable.js';
import { Disposable } from './types/disposable.js';

export class ProviderImpl implements Provider, IDisposable {
  private containerProviderConnections: Set<ContainerProviderConnection>;
  private containerProviderConnectionsStatuses: Map<string, ProviderConnectionStatus>;
  private kubernetesProviderConnections: Set<KubernetesProviderConnection>;
  // optional factory
  private _containerProviderConnectionFactory: ContainerProviderConnectionFactory | undefined = undefined;
  private _kubernetesProviderConnectionFactory: KubernetesProviderConnectionFactory | undefined = undefined;

  private _connectionAuditor: Auditor | undefined = undefined;

  private _status: ProviderStatus;

  private readonly _onDidUpdateStatus = new Emitter<ProviderStatus>();
  readonly onDidUpdateStatus: Event<ProviderStatus> = this._onDidUpdateStatus.event;

  private _version: string | undefined;
  private readonly _onDidUpdateVersion = new Emitter<string>();
  readonly onDidUpdateVersion: Event<string> = this._onDidUpdateVersion.event;

  private _links: ProviderLinks[];
  private _images: ProviderImages;

  private _detectionChecks: ProviderDetectionCheck[];
  private readonly _onDidUpdateDetectionChecks = new Emitter<ProviderDetectionCheck[]>();
  readonly onDidUpdateDetectionChecks: Event<ProviderDetectionCheck[]> = this._onDidUpdateDetectionChecks.event;

  private _warnings: ProviderInformation[];
  private readonly _onDidUpdateWarnings = new Emitter<ProviderInformation[]>();
  readonly onDidUpdateWarnings: Event<ProviderInformation[]> = this._onDidUpdateWarnings.event;

  constructor(
    private _internalId: string,
    readonly extensionId: string,
    readonly extensionDisplayName: string,
    private providerOptions: ProviderOptions,
    private providerRegistry: ProviderRegistry,
    private containerRegistry: ContainerProviderRegistry,
  ) {
    this.containerProviderConnectionsStatuses = new Map();
    this.containerProviderConnections = new Set();
    this.kubernetesProviderConnections = new Set();
    this._status = providerOptions.status;
    this._version = providerOptions.version;

    this._links = providerOptions.links ?? [];
    this._detectionChecks = providerOptions.detectionChecks ?? [];
    this._images = providerOptions.images ?? {};
    this._warnings = providerOptions.warnings ?? [];

    // monitor connection statuses
    setInterval(() => {
      for (const providerConnection of this.containerProviderConnections) {
        const status = providerConnection.status();
        // key can't be socket path as for some providers it can be the same
        const key = `${providerConnection.name}.${providerConnection.endpoint.socketPath}`;
        if (status !== this.containerProviderConnectionsStatuses.get(key)) {
          this.providerRegistry.onDidChangeContainerProviderConnectionStatus(this, providerConnection);
          this.containerProviderConnectionsStatuses.set(key, status);
        }
      }
    }, 2000);
  }

  get kubernetesProviderConnectionFactory(): KubernetesProviderConnectionFactory | undefined {
    return this._kubernetesProviderConnectionFactory;
  }

  get containerProviderConnectionFactory(): ContainerProviderConnectionFactory | undefined {
    return this._containerProviderConnectionFactory;
  }

  get connectionAuditor(): Auditor | undefined {
    return this._connectionAuditor;
  }

  get name(): string {
    return this.providerOptions.name;
  }

  get emptyConnectionMarkdownDescription(): string | undefined {
    return this.providerOptions.emptyConnectionMarkdownDescription;
  }

  get version(): string | undefined {
    return this._version;
  }
  get links(): ProviderLinks[] {
    return this._links;
  }
  get detectionChecks(): ProviderDetectionCheck[] {
    return this._detectionChecks;
  }

  get warnings(): ProviderInformation[] {
    return this._warnings;
  }

  get images(): ProviderImages {
    return this._images;
  }

  updateStatus(status: ProviderStatus): void {
    if (status !== this._status) {
      this._onDidUpdateStatus.fire(status);
    }
    this._status = status;
  }

  updateVersion(version: string): void {
    if (version !== this._version) {
      this._onDidUpdateVersion.fire(version);
    }
    this._version = version;
  }

  updateDetectionChecks(detectionChecks: ProviderDetectionCheck[]): void {
    this._detectionChecks = detectionChecks;
    this._onDidUpdateDetectionChecks.fire(detectionChecks);
  }

  // Update the warnings
  updateWarnings(warnings: ProviderInformation[]): void {
    this._warnings = warnings;
    this._onDidUpdateWarnings.fire(warnings);
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

  dispose(): void {
    this.providerRegistry.disposeProvider(this);
  }

  setContainerProviderConnectionFactory(
    containerProviderConnectionFactory: ContainerProviderConnectionFactory,
    connectionAuditor?: Auditor,
  ): Disposable {
    this._containerProviderConnectionFactory = containerProviderConnectionFactory;
    this._connectionAuditor = connectionAuditor;
    return Disposable.create(() => {
      this._containerProviderConnectionFactory = undefined;
      this._connectionAuditor = undefined;
    });
  }

  setKubernetesProviderConnectionFactory(
    kubernetesProviderConnectionFactory: KubernetesProviderConnectionFactory,
    connectionAuditor?: Auditor,
  ): Disposable {
    this._kubernetesProviderConnectionFactory = kubernetesProviderConnectionFactory;
    this._connectionAuditor = connectionAuditor;
    return Disposable.create(() => {
      this._kubernetesProviderConnectionFactory = undefined;
      this._connectionAuditor = undefined;
    });
  }

  registerKubernetesProviderConnection(kubernetesProviderConnection: KubernetesProviderConnection): Disposable {
    this.kubernetesProviderConnections.add(kubernetesProviderConnection);
    const disposable = this.providerRegistry.registerKubernetesConnection(this, kubernetesProviderConnection);
    this.providerRegistry.onDidRegisterKubernetesConnectionCallback(this, kubernetesProviderConnection);
    return Disposable.create(() => {
      this.kubernetesProviderConnections.delete(kubernetesProviderConnection);
      disposable.dispose();
      this.providerRegistry.onDidUnregisterKubernetesConnectionCallback(this, kubernetesProviderConnection);
    });
  }

  registerContainerProviderConnection(containerProviderConnection: ContainerProviderConnection): Disposable {
    this.containerProviderConnections.add(containerProviderConnection);
    const disposable = this.containerRegistry.registerContainerConnection(
      this,
      containerProviderConnection,
      this.providerRegistry,
    );
    this.providerRegistry.onDidRegisterContainerConnectionCallback(this, containerProviderConnection);

    return Disposable.create(() => {
      this.containerProviderConnections.delete(containerProviderConnection);
      disposable.dispose();
      this.providerRegistry.onDidUnregisterContainerConnectionCallback(this, containerProviderConnection);
    });
  }

  registerLifecycle(lifecycle: ProviderLifecycle): Disposable {
    return this.providerRegistry.registerLifecycle(this, lifecycle);
  }

  registerInstallation(installation: ProviderInstallation): Disposable {
    return this.providerRegistry.registerInstallation(this, installation);
  }

  registerUpdate(update: ProviderUpdate): Disposable {
    return this.providerRegistry.registerUpdate(this, update);
  }

  registerAutostart(update: ProviderAutostart): Disposable {
    return this.providerRegistry.registerAutostart(this, update);
  }

  registerCleanup(cleanup: ProviderCleanup): Disposable {
    return this.providerRegistry.registerCleanup(this, cleanup);
  }
}
