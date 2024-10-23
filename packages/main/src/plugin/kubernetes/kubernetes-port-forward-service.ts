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

import type { ApiSenderType } from '/@/plugin/api.js';
import type { KubernetesClient } from '/@/plugin/kubernetes/kubernetes-client.js';
import { PortForwardConnectionService } from '/@/plugin/kubernetes/kubernetes-port-forward-connection.js';
import { ConfigManagementService, MemoryBasedStorage } from '/@/plugin/kubernetes/kubernetes-port-forward-storage.js';
import { ForwardConfigRequirements } from '/@/plugin/kubernetes/kubernetes-port-forward-validation.js';
import type { IDisposable } from '/@/plugin/types/disposable.js';
import { isFreePort } from '/@/plugin/util/port.js';
import type { ForwardConfig, UserForwardConfig } from '/@api/kubernetes-port-forward-model.js';

/**
 * Service provider for Kubernetes port forwarding.
 * Entrypoint for the third party services to operate with port forwards.
 * @see KubernetesPortForwardServiceProvider.getService
 */
export class KubernetesPortForwardServiceProvider {
  /**
   * Gets the port forward service for the given Kubernetes configuration.
   * @param kubeClient the Kubernetes client
   * @param apiSender the api sender object
   * @returns The port forward service.
   */
  getService(kubeClient: KubernetesClient, apiSender: ApiSenderType): KubernetesPortForwardService {
    const forwardingConnectionService = new PortForwardConnectionService(
      kubeClient,
      new ForwardConfigRequirements(isFreePort),
    );
    const forwardConfigStorage = new MemoryBasedStorage();
    const configManagementService = new ConfigManagementService(forwardConfigStorage);
    return new KubernetesPortForwardService(configManagementService, forwardingConnectionService, apiSender);
  }

  /**
   * Gets the configuration key for the given Kubernetes configuration.
   * The key is used for caching services and also for storing information about created forwards linked to each service.
   *
   * @param kubeConfig - The Kubernetes configuration.
   * @returns The configuration key.
   */
  protected getKubeConfigKey(kubeConfig: KubeConfig): string {
    return kubeConfig.currentContext;
  }
}

/**
 * Service for managing Kubernetes port forwarding.
 * @see KubernetesPortForwardServiceProvider.getService
 */
export class KubernetesPortForwardService implements IDisposable {
  #disposables: IDisposable[] = [];

  /**
   * Creates an instance of KubernetesPortForwardService.
   * @param configManagementService - The configuration management service.
   * @param forwardingConnectionService - The port forward connection service.
   */
  constructor(
    private configManagementService: ConfigManagementService,
    private forwardingConnectionService: PortForwardConnectionService,
    private apiSender: ApiSenderType,
  ) {
    this.apiSender.send('kubernetes-port-forwards-update');
  }

  dispose(): void {
    this.#disposables.forEach(disposable => disposable.dispose());
  }

  /**
   * Creates a new forward configuration.
   * @param config - The forward configuration to create.
   * @returns The created forward configuration.
   * @see UserForwardConfig
   */
  async createForward(config: UserForwardConfig): Promise<ForwardConfig> {
    const forwardConfig = await this.configManagementService.createForward(config);
    this.apiSender.send('kubernetes-port-forwards-update', this.listForwards());
    return forwardConfig;
  }

  /**
   * Deletes an existing forward configuration.
   * @param config - The forward configuration to delete.
   * @returns Void if the operation successful.
   * @see UserForwardConfig
   */
  async deleteForward(config: UserForwardConfig): Promise<void> {
    await this.configManagementService.deleteForward(config);
    this.apiSender.send('kubernetes-port-forwards-update', this.listForwards());
  }

  /**
   * Lists all forward configurations.
   * @returns A list of forward configurations.
   * @see UserForwardConfig
   */
  async listForwards(): Promise<UserForwardConfig[]> {
    return this.configManagementService.listForwards();
  }

  /**
   * Starts the port forwarding for the given configuration.
   * @param config - The forward configuration.
   * @returns A disposable resource to stop the forwarding.
   * @see ForwardConfig
   */
  async startForward(config: ForwardConfig): Promise<IDisposable> {
    const disposable = await this.forwardingConnectionService.startForward(config);
    this.#disposables.push(disposable);
    return disposable;
  }
}
