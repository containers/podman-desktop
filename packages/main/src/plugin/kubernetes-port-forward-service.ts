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

import { Directories } from '/@/plugin/directories.js';
import { PortForwardConnectionService } from '/@/plugin/kubernetes-port-forward-connection.js';
import type { ForwardConfig, UserForwardConfig } from '/@/plugin/kubernetes-port-forward-model.js';
import {
  ConfigManagementService,
  FileBasedConfigStorage,
  PreferenceFolderBasedStorage,
} from '/@/plugin/kubernetes-port-forward-storage.js';
import { ForwardConfigRequirements } from '/@/plugin/kubernetes-port-forward-validation.js';
import type { IDisposable } from '/@/plugin/types/disposable.js';
import { isFreePort } from '/@/plugin/util/port.js';

/**
 * Service provider for Kubernetes port forwarding.
 * Entrypoint for the third party services to operate with port forwards.
 * @see KubernetesPortForwardServiceProvider.getService
 */
export class KubernetesPortForwardServiceProvider {
  protected _serviceMap = new Map<string, KubernetesPortForwardService>();

  /**
   * Gets the port forward service for the given Kubernetes configuration.
   * @param kubeConfig - The Kubernetes configuration.
   * @returns The port forward service.
   */
  getService(kubeConfig: KubeConfig): KubernetesPortForwardService {
    const configKey = this.getKubeConfigKey(kubeConfig);
    if (this._serviceMap.has(configKey)) {
      return this._serviceMap.get(configKey)!;
    }

    const forwardingConnectionService = new PortForwardConnectionService(
      kubeConfig,
      new ForwardConfigRequirements(isFreePort),
    );
    const forwardConfigStorage = new FileBasedConfigStorage(
      new PreferenceFolderBasedStorage(new Directories()),
      configKey,
    );
    const configManagementService = new ConfigManagementService(forwardConfigStorage);
    const portForwardService = new KubernetesPortForwardService(configManagementService, forwardingConnectionService);

    this._serviceMap.set(configKey, portForwardService);

    return portForwardService;
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
export class KubernetesPortForwardService {
  /**
   * Creates an instance of KubernetesPortForwardService.
   * @param configManagementService - The configuration management service.
   * @param forwardingConnectionService - The port forward connection service.
   */
  constructor(
    private configManagementService: ConfigManagementService,
    private forwardingConnectionService: PortForwardConnectionService,
  ) {}

  /**
   * Creates a new forward configuration.
   * @param config - The forward configuration to create.
   * @returns The created forward configuration.
   * @see UserForwardConfig
   */
  async createForward(config: UserForwardConfig): Promise<ForwardConfig> {
    return this.configManagementService.createForward(config);
  }

  /**
   * Deletes an existing forward configuration.
   * @param config - The forward configuration to delete.
   * @returns Void if the operation successful.
   * @see UserForwardConfig
   */
  async deleteForward(config: UserForwardConfig): Promise<void> {
    return this.configManagementService.deleteForward(config);
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
    return this.forwardingConnectionService.startForward(config);
  }
}
