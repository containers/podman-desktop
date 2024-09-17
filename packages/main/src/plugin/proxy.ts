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

import type { Event, ProxySettings } from '@podman-desktop/api';
import { ProxyAgent } from 'undici';

import type { Certificates } from '/@/plugin/certificates.js';
import { ProxyState } from '/@api/proxy.js';

import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry.js';
import { Emitter } from './events/emitter.js';
import { getProxyUrl } from './proxy-resolver.js';
import { getProxySettingsFromSystem } from './proxy-system.js';

export function ensureURL(urlstring: string | undefined): string | undefined {
  if (urlstring) {
    try {
      const url = new URL(urlstring);
      if (url.hostname) {
        return urlstring;
      }
    } catch (err) {
      /* empty */
    }
    return `http://${urlstring}`;
  }
  return undefined;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function asURL(url: any): URL {
  if (url instanceof URL) {
    return url;
  } else if (typeof url === 'string') {
    return new URL(url);
  }
  return new URL((url as Request).url);
}

/**
 * Handle proxy settings for Podman Desktop
 */
export class Proxy {
  private proxySettings: ProxySettings | undefined;
  private proxyState: ProxyState = ProxyState.PROXY_SYSTEM;

  private readonly _onDidUpdateProxy = new Emitter<ProxySettings>();
  public readonly onDidUpdateProxy: Event<ProxySettings> = this._onDidUpdateProxy.event;

  private readonly _onDidStateChange = new Emitter<boolean>();
  public readonly onDidStateChange: Event<boolean> = this._onDidStateChange.event;

  constructor(
    private configurationRegistry: ConfigurationRegistry,
    private certificates: Certificates,
  ) {}

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
          description: 'Configure proxy',
          type: 'number',
          maximum: 2,
          minimum: 0,
          placeholder: 'System(0)/Manual(1)/Disabled(2)',
          default: 0,
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([proxyConfigurationNode]);

    // be notified when configuration is updated
    this.configurationRegistry.onDidChangeConfiguration(async e => {
      if (e.key.startsWith('proxy')) {
        await this.updateFromConfiguration();
      }
    });

    // read initial value
    await this.updateFromConfiguration();
    this.overrideFetch();
  }

  async updateFromConfiguration(): Promise<void> {
    // read value from the configuration
    const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
    const isEnabled = proxyConfiguration.get<unknown>('enabled');
    let proxyState: ProxyState = ProxyState.PROXY_SYSTEM;
    if (typeof isEnabled === 'boolean') {
      proxyState = isEnabled ? ProxyState.PROXY_MANUAL : ProxyState.PROXY_SYSTEM;
    } else if (typeof isEnabled === 'number') {
      proxyState = isEnabled as ProxyState;
    }
    this.proxyState = proxyState;
    if (this.proxyState === ProxyState.PROXY_MANUAL) {
      const httpProxy = ensureURL(proxyConfiguration.get<string>('http'));
      const httpsProxy = ensureURL(proxyConfiguration.get<string>('https'));
      const noProxy = proxyConfiguration.get<string>('no');
      this.proxySettings = {
        httpProxy,
        httpsProxy,
        noProxy,
      };
    } else if (this.proxyState === ProxyState.PROXY_SYSTEM) {
      this.proxySettings = await getProxySettingsFromSystem(this);
    } else {
      this.proxySettings = {} as ProxySettings;
    }
  }

  async setProxy(proxy: ProxySettings): Promise<void> {
    let newProxy: ProxySettings | undefined = proxy;
    if (this.proxyState === ProxyState.PROXY_MANUAL) {
      newProxy.httpProxy = ensureURL(newProxy.httpProxy);
      newProxy.httpsProxy = ensureURL(newProxy.httpsProxy);
    } else if (this.proxyState === ProxyState.PROXY_SYSTEM) {
      newProxy = await getProxySettingsFromSystem(this);
    }

    // update configuration
    if (newProxy) {
      // update
      this.proxySettings = newProxy;

      // notify
      this._onDidUpdateProxy.fire(newProxy);
      const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
      await proxyConfiguration.update('http', newProxy.httpProxy);
      await proxyConfiguration.update('https', newProxy.httpsProxy);
      await proxyConfiguration.update('no', newProxy.noProxy);
    }
  }

  get proxy(): ProxySettings | undefined {
    return this.proxySettings;
  }

  isEnabled(): boolean {
    return this.proxyState !== ProxyState.PROXY_DISABLED && this.proxySettings !== undefined;
  }

  setState(state: ProxyState): void {
    this.proxyState = state;

    // update configuration
    const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
    proxyConfiguration.update('enabled', state).catch((err: unknown) => {
      console.error('Error updating proxy state', err);
    });

    // notify
    this._onDidStateChange.fire(this.isEnabled());
  }

  getState(): ProxyState {
    return this.proxyState;
  }

  private overrideFetch(): void {
    const original = globalThis.fetch;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _me = this;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    globalThis.fetch = function (url: any, opts?: any): Promise<Response> {
      const proxyurl = getProxyUrl(_me, asURL(url).protocol === 'https');
      if (proxyurl) {
        opts = {
          ...opts,
          dispatcher: new ProxyAgent({ uri: proxyurl, proxyTls: { ca: _me.certificates.getAllCertificates() } }),
        };
      }

      return original(url, opts);
    };
  }
}
