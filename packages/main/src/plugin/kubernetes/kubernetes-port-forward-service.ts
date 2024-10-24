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
import { Disposable } from '/@/plugin/types/disposable.js';
import { isFreePort } from '/@/plugin/util/port.js';
import type {
  ForwardConfig,
  ForwardOptions,
  PortMapping,
  UserForwardConfig,
} from '/@api/kubernetes-port-forward-model.js';

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
  #disposables: Map<string, IDisposable> = new Map();

  /**
   * Creates an instance of KubernetesPortForwardService.
   * @param configManagementService - The configuration management service.
   * @param forwardingConnectionService - The port forward connection service.
   * @param apiSender the api sender object
   */
  constructor(
    private configManagementService: ConfigManagementService,
    private forwardingConnectionService: PortForwardConnectionService,
    private apiSender: ApiSenderType,
  ) {
    this.apiSender.send('kubernetes-port-forwards-update', []);
  }

  dispose(): void {
    this.#disposables.forEach(disposable => disposable.dispose());
    this.#disposables.clear();
  }

  /**
   * Each key is specific for a dedicated remotePort
   * @param config
   * @param mapping
   * @private
   */
  private getPortForwardKey(config: ForwardConfig, mapping: PortMapping): string {
    return `${config.namespace}/${config.name}/${config.kind}/${mapping.remotePort}`;
  }

  /**
   * Creates a new forward
   * If we have an already existing ForwardConfig we will update it
   * @returns The created forward configuration.
   * @see
   * @param options
   */
  async createForward(options: ForwardOptions): Promise<UserForwardConfig> {
    const configs = await this.listForwards();
    const userForwardConfig: UserForwardConfig | undefined = configs.find(
      config => config.name === options.name && config.namespace === options.namespace && config.kind === options.kind,
    );
    let result: UserForwardConfig;
    if (userForwardConfig) {
      result = await this.configManagementService.updateForward(userForwardConfig, {
        name: options.name,
        forwards: [...userForwardConfig.forwards, options.forward],
        namespace: options.namespace,
        kind: options.kind,
        displayName: options.displayName,
      });
    } else {
      result = await this.configManagementService.createForward({
        name: options.name,
        forwards: [options.forward],
        namespace: options.namespace,
        kind: options.kind,
        displayName: options.displayName,
      });
    }

    this.apiSender.send('kubernetes-port-forwards-update', await this.listForwards());
    return result;
  }

  /**
   * Deletes an existing forward configuration.
   * @param config - The forward configuration to delete.
   * @param mapping - The mapping to delete, if mapping is undefined, delete all
   * @returns Void if the operation successful.
   * @see UserForwardConfig
   */
  async deleteForward(config: UserForwardConfig, mapping?: PortMapping): Promise<void> {
    const keys: string[] = [];
    if (mapping) {
      keys.push(this.getPortForwardKey(config, mapping));
    } else {
      keys.push(...config.forwards.map(forward => this.getPortForwardKey(config, forward)));
    }

    for (const key of keys) {
      const disposable = this.#disposables.get(key);
      if (disposable) {
        disposable.dispose();
        this.#disposables.delete(key);
      }
    }

    const newConfig: UserForwardConfig = {
      ...config,
      forwards: config.forwards.filter(forward => !keys.includes(this.getPortForwardKey(config, forward))),
    };

    if (newConfig.forwards.length === 0) {
      await this.configManagementService.deleteForward(config);
    } else {
      await this.configManagementService.updateForward(config, newConfig);
    }

    this.apiSender.send('kubernetes-port-forwards-update', await this.listForwards());
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
    const disposables: IDisposable[] = [];
    for (const forward of config.forwards) {
      const key = this.getPortForwardKey(config, forward);

      if (!this.#disposables.has(key)) {
        const disposable = await this.forwardingConnectionService.startForward(config, forward);
        disposables.push(disposable);
        this.#disposables.set(key, disposable);
      }
    }

    return Disposable.from(...disposables);
  }
}
