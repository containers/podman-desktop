/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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

import * as net from 'node:net';

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

type NoProxyRule =
  | { kind: 'wildcard' }
  | { kind: 'ip'; ip: string; port?: string }
  | { kind: 'cidr'; blockList: net.BlockList; family: 'ipv4' | 'ipv6' }
  | { kind: 'domain'; suffix: string; matchHost: boolean; port?: string };

/**
 * Handle proxy settings for Podman Desktop
 */
@injectable()
export class Proxy {
  private readonly ipv6Loopback = new net.BlockList();

  private proxySettings: ProxySettings | undefined;
  private proxyState: ProxyState = ProxyState.PROXY_SYSTEM;
  private noProxyRules: NoProxyRule[] = [];

  private readonly _onDidUpdateProxy = new Emitter<ProxySettings>();
  public readonly onDidUpdateProxy: Event<ProxySettings> = this._onDidUpdateProxy.event;

  private readonly _onDidStateChange = new Emitter<boolean>();
  public readonly onDidStateChange: Event<boolean> = this._onDidStateChange.event;

  constructor(
    @inject(IConfigurationRegistry)
    private configurationRegistry: IConfigurationRegistry,
    @inject(Certificates)
    private certificates: Certificates,
  ) {
    this.ipv6Loopback.addAddress('::1', 'ipv6');
  }

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
    this.noProxyRules = this.parseNoProxy(this.proxySettings?.noProxy);
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
    this.noProxyRules = this.parseNoProxy(newProxy?.noProxy);

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

  isNoProxyMatch(hostname: string | undefined, port?: string): boolean {
    if (!hostname) {
      return false;
    }
    const host = this.stripBrackets(hostname).toLowerCase();

    const ipFamily = net.isIP(host);
    const hostFamily: 'ipv4' | 'ipv6' | undefined = ipFamily === 6 ? 'ipv6' : ipFamily === 4 ? 'ipv4' : undefined;
    const hostIsIp = ipFamily !== 0;
    const isIpv4Loopback = ipFamily === 4 && host.startsWith('127.');
    const isIpv6Loopback = ipFamily === 6 && this.ipv6Loopback.check(host, 'ipv6');

    if (host === 'localhost' || isIpv4Loopback || isIpv6Loopback) {
      return true;
    }

    for (const rule of this.noProxyRules) {
      switch (rule.kind) {
        case 'wildcard':
          return true;

        case 'cidr':
          if (hostFamily === rule.family && rule.blockList.check(host, rule.family)) {
            return true;
          }
          break;

        case 'ip':
          if (hostIsIp && rule.ip === host && (!rule.port || rule.port === port)) {
            return true;
          }
          break;

        case 'domain':
          if (!hostIsIp && (host.endsWith(rule.suffix) || (rule.matchHost && host === rule.suffix.slice(1)))) {
            if (!rule.port || rule.port === port) {
              return true;
            }
          }
          break;
      }
    }
    return false;
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

  // NO_PROXY matching follows the same algorithm as Go's net/http/httpproxy useProxy():
  // https://github.com/golang/net/blob/master/http/httpproxy/proxy.go
  //
  // Loopback addresses (localhost, 127.0.0.1, ::1) always bypass the proxy,
  // regardless of NO_PROXY contents — same as Go's behaviour.
  //
  // NO_PROXY is a comma-separated list. Each entry can be:
  //   - "*"                → match everything
  //   - IPv4 address       → exact match (e.g. 192.168.1.1)
  //   - IPv6 address       → exact match (e.g. fd00::1, fe80::1)
  //   - IPv4 CIDR          → range match (e.g. 10.0.0.0/8, 172.16.0.0/12)
  //   - IPv6 CIDR          → range match (e.g. fd00::/8, 2001:db8::/32)
  //   - domain             → matches domain and all subdomains (e.g. foo.com matches bar.foo.com)
  //   - .domain            → matches subdomains only (e.g. .foo.com does NOT match foo.com)
  //   - *.domain           → same as .domain
  //   - any:port           → only matches when port also matches (e.g. foo.com:8080)

  private parseNoProxy(noProxy?: string): NoProxyRule[] {
    if (!noProxy) {
      return [];
    }
    const rules: NoProxyRule[] = [];
    for (const raw of noProxy.split(',')) {
      const entry = raw.trim().toLowerCase();
      if (!entry) {
        continue;
      }
      if (entry === '*') {
        rules.push({ kind: 'wildcard' });
        continue;
      }

      // CIDR entry (e.g. 10.0.0.0/8, fd00::/7)
      if (entry.includes('/')) {
        try {
          const slashIdx = entry.indexOf('/');
          const subnet = entry.slice(0, slashIdx);
          const prefixStr = entry.slice(slashIdx + 1);
          if (!/^\d+$/.test(prefixStr)) {
            console.error(`Malformed CIDR prefix in NO_PROXY: ${entry}`);
            continue;
          }
          const prefix = Number(prefixStr);
          const family = net.isIPv6(subnet) ? 'ipv6' : 'ipv4';
          const maxPrefix = family === 'ipv6' ? 128 : 32;
          if (prefix > maxPrefix) {
            console.error(`CIDR prefix ${prefix} out of range (0-${maxPrefix}) in NO_PROXY: ${entry}`);
            continue;
          }
          const blockList = new net.BlockList();
          blockList.addSubnet(subnet, prefix, family);
          rules.push({ kind: 'cidr', blockList, family });
        } catch (error: unknown) {
          console.error(`Malformed CIDR or family mismatch in NO_PROXY: ${entry}`, error);
        }
        continue;
      }

      // Split off optional port
      let entryHost: string;
      let entryPort: string | undefined;
      const portSep = this.splitHostPort(entry);
      if (portSep) {
        if (!portSep.port) {
          console.error(`Empty port in NO_PROXY entry: ${entry}`);
          continue;
        }
        entryHost = portSep.host;
        entryPort = portSep.port;
      } else {
        entryHost = this.stripBrackets(entry);
      }

      if (!entryHost) {
        console.error(`Empty host in NO_PROXY entry: ${entry}`);
        continue;
      }

      // Exact IP
      if (net.isIP(entryHost)) {
        rules.push({ kind: 'ip', ip: entryHost, port: entryPort });
        continue;
      }

      // Domain matching (Go algorithm):
      // "*.foo.com" → strip "*", becomes ".foo.com" → subdomain-only
      // ".foo.com"  → subdomain-only
      // "foo.com"   → prepend ".", set matchHost=true → domain + subdomains
      if (entryHost.startsWith('*.')) {
        entryHost = entryHost.slice(1);
      }
      let matchHost = false;
      if (!entryHost.startsWith('.')) {
        matchHost = true;
        entryHost = `.${entryHost}`;
      }
      rules.push({ kind: 'domain', suffix: entryHost, matchHost, port: entryPort });
    }
    return rules;
  }

  private stripBrackets(host: string): string {
    return host.replace(/^\[|\]$/g, '');
  }

  private splitHostPort(value: string): { host: string; port: string } | undefined {
    // [IPv6]:port
    const bracketIdx = value.lastIndexOf(']');
    if (bracketIdx !== -1) {
      const colonAfter = value.indexOf(':', bracketIdx);
      if (colonAfter !== -1) {
        return {
          host: this.stripBrackets(value.slice(0, colonAfter)),
          port: value.slice(colonAfter + 1),
        };
      }
    } else {
      // host:port — only if exactly one colon (not IPv6)
      const first = value.indexOf(':');
      const last = value.lastIndexOf(':');
      if (first !== -1 && first === last) {
        return { host: value.slice(0, first), port: value.slice(first + 1) };
      }
    }
    return undefined;
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
      const proxyurl = getProxyUrl(_me, isHttps, urlObj.hostname, urlObj.port);
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
