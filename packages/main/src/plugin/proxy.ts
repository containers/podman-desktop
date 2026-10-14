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

import { PROXY_CONFIG_KEYS, ProxyState } from '@desktop-framework/api';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import type { Event, ProxySettings } from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';
import type { fetch, RequestInfo, RequestInit, Response } from 'undici';
import { Agent, ProxyAgent } from 'undici';

import { Certificates } from '/@/plugin/certificates.js';

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

function asURL(url: unknown): URL {
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
@injectable()
export class Proxy {
  private proxySettings: ProxySettings | undefined;
  private proxyState: ProxyState = ProxyState.PROXY_SYSTEM;

  private readonly _onDidUpdateProxy = new Emitter<ProxySettings>();
  public readonly onDidUpdateProxy: Event<ProxySettings> = this._onDidUpdateProxy.event;

  private readonly _onDidStateChange = new Emitter<boolean>();
  public readonly onDidStateChange: Event<boolean> = this._onDidStateChange.event;

  constructor(
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
    @inject(Certificates)
    private certificates: Certificates,
  ) {}

  async init(): Promise<void> {
    const proxyConfigurationNode: IConfigurationNode = {
      id: 'proxy',
      title: 'Proxy',
      type: 'object',
      properties: {
        [PROXY_CONFIG_KEYS.HTTP]: {
          description: 'Proxy (HTTP)',
          type: 'string',
          default: '',
          hidden: true,
        },
        [PROXY_CONFIG_KEYS.HTTPS]: {
          description: 'Proxy (HTTPS)',
          type: 'string',
          default: '',
          hidden: true,
        },
        [PROXY_CONFIG_KEYS.NO_PROXY]: {
          description: 'Pattern for not using a proxy',
          type: 'string',
          default: '',
          hidden: true,
        },
        [PROXY_CONFIG_KEYS.ENABLED]: {
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
      this.proxySettings = undefined;
    }
  }

  async setProxy(proxy: ProxySettings | undefined): Promise<void> {
    let newProxy = proxy;
    if (newProxy && this.proxyState === ProxyState.PROXY_MANUAL) {
      newProxy.httpProxy = ensureURL(newProxy.httpProxy);
      newProxy.httpsProxy = ensureURL(newProxy.httpsProxy);
    } else if (this.proxyState === ProxyState.PROXY_SYSTEM) {
      newProxy = await getProxySettingsFromSystem(this);
    }

    // update
    this.proxySettings = newProxy;

    if (newProxy) {
      // notify
      this._onDidUpdateProxy.fire(newProxy);
    }

    // update configuration
    const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
    await proxyConfiguration.update('http', newProxy?.httpProxy);
    await proxyConfiguration.update('https', newProxy?.httpsProxy);
    await proxyConfiguration.update('no', newProxy?.noProxy);
  }

  get proxy(): ProxySettings | undefined {
    return this.proxySettings;
  }

  isEnabled(): boolean {
    return (
      this.proxyState !== ProxyState.PROXY_DISABLED &&
      this.proxySettings !== undefined &&
      (this.proxySettings.httpProxy !== undefined || this.proxySettings.httpsProxy !== undefined)
    );
  }

  async setState(state: ProxyState): Promise<void> {
    this.proxyState = state;

    // update configuration
    const proxyConfiguration = this.configurationRegistry.getConfiguration('proxy');
    await proxyConfiguration.update('enabled', state);

    if (state === ProxyState.PROXY_SYSTEM) {
      await this.setProxy(undefined);
    }
    // notify
    this._onDidStateChange.fire(this.isEnabled());
  }

  getState(): ProxyState {
    return this.proxyState;
  }

  private overrideFetch(): void {
    const original = globalThis.fetch as unknown as typeof fetch;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _me = this;
    (globalThis.fetch as unknown as typeof fetch) = function (url: RequestInfo, opts?: RequestInit): Promise<Response> {
      // respect a caller-provided dispatcher (e.g. for insecure TLS)
      if (opts && 'dispatcher' in opts) {
        return original(url, opts);
      }

      const urlObj = asURL(url);
      const isHttps = urlObj.protocol === 'https:';
      const proxyurl = getProxyUrl(_me, isHttps);
      const ca = _me.certificates.getAllCertificates();
      if (proxyurl) {
        opts = {
          ...opts,
          dispatcher: new ProxyAgent({
            uri: proxyurl,
            requestTls: { ca }, // CA for upstream TLS (HTTP proxy + CONNECT)
            proxyTls: { ca }, // CA for TLS-to-proxy (HTTPS proxy)
          }),
        };
      } else if (isHttps) {
        // configure certificates
        opts = {
          ...opts,
          dispatcher: new Agent({
            connect: { ca },
          }),
        };
      }

      return original(url, opts);
    };
  }
}
