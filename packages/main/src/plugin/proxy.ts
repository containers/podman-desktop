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

import type { ProxySettings, Event } from '@podman-desktop/api';
import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry';
import { Emitter } from './events/emitter';

/**
 * Handle proxy settings for Podman Desktop
 */
export class Proxy {
  private proxySettings: ProxySettings | undefined;
  private proxyState = false;

  private readonly _onDidUpdateProxy = new Emitter<ProxySettings>();
  public readonly onDidUpdateProxy: Event<ProxySettings> = this._onDidUpdateProxy.event;

  private readonly _onDidStateChange = new Emitter<boolean>();
  public readonly onDidStateChange: Event<boolean> = this._onDidStateChange.event;

  constructor(private configurationRegistry: ConfigurationRegistry) {}

  async init(): Promise<void> {
    const proxyConfigurationNode: IConfigurationNode = {
      id: 'proxy',
      title: 'Proxy',
      type: 'object',
      properties: {
        ['proxy.http']: {
          description: 'Proxy (HTTP)',
          type: 'string',
          default: '',
          hidden: true,
        },
        ['proxy.https']: {
          description: 'Proxy (HTTPS)',
          type: 'string',
          default: '',
          hidden: true,
        },
        ['proxy.no']: {
          description: 'Pattern for not using a proxy',
          type: 'string',
          default: '',
          hidden: true,
        },
        ['proxy.enabled']: {
          description: 'Toggle to enable',
          type: 'string',
          default: false,
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([proxyConfigurationNode]);

    // be notified when configuration is updated
    this.configurationRegistry.onDidChangeConfiguration(e => {
      if (e.key.startsWith('proxy')) {
        this.updateFromConfiguration();
      }
    });

    // read initial value
    this.updateFromConfiguration();
  }

  updateFromConfiguration(): void {
    // read value from the configuration
    const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
    const httpProxy = proxyConfiguration.get<string>('http');
    const httpsProxy = proxyConfiguration.get<string>('https');
    const noProxy = proxyConfiguration.get<string>('no');
    const isEnabled = proxyConfiguration.get<boolean>('enabled') || false;

    this.proxySettings = {
      httpProxy,
      httpsProxy,
      noProxy,
    };
    this.proxyState = isEnabled;
  }

  async setProxy(proxy: ProxySettings): Promise<void> {
    // notify
    this._onDidUpdateProxy.fire(proxy);

    // update
    this.proxySettings = proxy;

    // update configuration
    const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
    await proxyConfiguration.update('http', proxy.httpProxy);
    await proxyConfiguration.update('https', proxy.httpsProxy);
    await proxyConfiguration.update('no', proxy.noProxy);
  }

  get proxy(): ProxySettings | undefined {
    return this.proxySettings;
  }

  isEnabled(): boolean {
    return this.proxyState;
  }

  setState(state: boolean): void {
    this.proxyState = state;

    // update configuration
    const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
    proxyConfiguration.update('enabled', state).catch((err: unknown) => {
      console.error('Error updating proxy state', err);
    });

    // notify
    this._onDidStateChange.fire(this.proxyState);
  }
}
