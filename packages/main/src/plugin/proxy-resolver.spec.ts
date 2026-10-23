/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { get } from 'node:http';
import * as nodeurl from 'node:url';

import type * as hpagent from 'hpagent';
import { HttpsProxyAgent } from 'hpagent';
import { beforeEach, expect, test, vi } from 'vitest';

import type { Certificates } from './certificates.js';
import type { Proxy } from './proxy.js';
import * as ProxyResolver from './proxy-resolver.js';

vi.mock(import('node:http'), () => {
  return {
    get: vi.fn(),
    request: vi.fn(),
  };
});

vi.mock(import('node:https'), () => {
  return {
    get: vi.fn(),
    request: vi.fn(),
  };
});

vi.mock(import('hpagent'), () => {
  return {
    HttpProxyAgent: function (): void {
      // @ts-ignore: this implicit any type
      this.https = false;
    },
    HttpsProxyAgent: function (): void {
      // @ts-ignore: this implicit any type
      this.https = true;
    },
  } as unknown as typeof hpagent;
});

function createProxy(
  enabled: boolean,
  httpsProxy?: string,
  httpProxy?: string,
  noProxyMatcher: (hostname?: string, port?: string) => boolean = () => false,
): Proxy {
  const proxy: {
    isEnabled: () => boolean;
    isNoProxyMatch: (hostname?: string, port?: string) => boolean;
    proxy?: {
      httpProxy?: string;
      httpsProxy?: string;
    };
  } = {
    isEnabled: () => enabled,
    isNoProxyMatch: noProxyMatcher,
  };
  if (httpProxy) {
    proxy.proxy = {
      httpProxy,
    };
  }
  if (httpsProxy) {
    proxy.proxy = {
      httpsProxy,
    };
  }
  return proxy as unknown as Proxy;
}

const Http = 'http';
const HttpProxyUrl = `${Http}://proxy.url`;
const HttpsProxyUrl = 'https://proxy.url';

const certificates: Certificates = {
  getAllCertificates: vi.fn(),
} as unknown as Certificates;

beforeEach(() => {
  vi.resetAllMocks();
});

test('getOptions return options w/o agent if proxy not enabled and url is not secure', () => {
  const proxy = createProxy(false);
  const options = ProxyResolver.getOptions(proxy, false, certificates);
  expect(options.agent).toBeUndefined();
});

test('getOptions return options w/ agent for https proxy', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl);
  const options = ProxyResolver.getOptions(proxy, true, certificates);
  expect(options.agent).not.toBeUndefined();
  expect(options.agent && 'https' in options.agent ? options.agent.https : false).toBeTruthy();
});

test('getOptions return options w/ https.Agent for https proxy', () => {
  const proxy = createProxy(true, undefined, HttpProxyUrl);
  const options = ProxyResolver.getOptions(proxy, false, certificates);
  expect(options.agent).not.toBeUndefined();
  expect(options.agent && 'https' in options.agent ? options.agent.https : true).toBeFalsy();
});

test('getProxyUrl returns undefined when proxy is disabled', () => {
  const proxy = createProxy(false, HttpsProxyUrl, HttpProxyUrl);
  expect(ProxyResolver.getProxyUrl(proxy, true, 'example.com')).toBeUndefined();
});

test('getProxyUrl returns https proxy url for secure request', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl);
  expect(ProxyResolver.getProxyUrl(proxy, true, 'example.com')).toBe(HttpsProxyUrl);
});

test('getProxyUrl returns http proxy url for non-secure request', () => {
  const proxy = createProxy(true, undefined, HttpProxyUrl);
  expect(ProxyResolver.getProxyUrl(proxy, false, 'example.com')).toBe(HttpProxyUrl);
});

test('getProxyUrl returns undefined when isNoProxyMatch returns true', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, () => true);
  expect(ProxyResolver.getProxyUrl(proxy, true, 'example.com')).toBeUndefined();
});

test('getProxyUrl returns proxy url when isNoProxyMatch returns false', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, () => false);
  expect(ProxyResolver.getProxyUrl(proxy, true, 'example.com')).toBe(HttpsProxyUrl);
});

test('getProxyUrl returns proxy url when hostname is omitted', () => {
  const noProxyMatcher = vi.fn().mockReturnValue(false);
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, noProxyMatcher);
  expect(ProxyResolver.getProxyUrl(proxy, true)).toBe(HttpsProxyUrl);
});

test('getProxyUrl passes hostname and port to isNoProxyMatch', () => {
  const noProxyMatcher = vi.fn().mockReturnValue(false);
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, noProxyMatcher);
  ProxyResolver.getProxyUrl(proxy, true, 'host.example.com', '8080');
  expect(noProxyMatcher).toHaveBeenCalledWith('host.example.com', '8080');
});

test('getOptions skips proxy agent when isNoProxyMatch returns true for non-secure request', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, () => true);
  const options = ProxyResolver.getOptions(proxy, false, certificates, 'internal.corp', '80');
  expect(options.agent).toBeUndefined();
});

test('patched http get calls original with the original parameters when proxy is not enabled', () => {
  const proxy = createProxy(false, HttpsProxyUrl, HttpProxyUrl);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get(`${Http}://site.url`);
  }
  expect(get).toBeCalledWith(`${Http}://site.url`);
});

test('patched http get calls original method with the original parameters when proxy is enabled and socketPath is requested', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const socketOptions = { socketPath: '/var/socket/path' };
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get(socketOptions);
  }

  expect(get).toBeCalledWith(socketOptions, undefined);
});

test('patched http get when called with url and callback calls original with options and callback', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const colon = ':';
  const url = `https://[fe80${colon}${colon}1802${colon}20ff${colon}fe8d${colon}d4ce]`;
  const callback = vi.fn();
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get(url, callback);
    http.get(new nodeurl.URL(url), callback);
  }
  expect(get).toHaveBeenCalledTimes(2);
  expect(get).toBeCalledWith(
    {
      agent: new HttpsProxyAgent({} as hpagent.HttpsProxyAgentOptions),
      hostname: `fe80${colon}${colon}1802${colon}20ff${colon}fe8d${colon}d4ce`,
      path: '/',
      port: '',
      protocol: 'https:',
    },
    callback,
  );
});

test('patched http get translates username@password in url to auth option', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const url = 'https://usr:pass@rest.url';
  const callback = vi.fn();
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get(url, callback);
    http.get(new nodeurl.URL(url), callback);
  }
  expect(get).toHaveBeenCalledTimes(2);
  expect(get).toBeCalledWith(
    {
      agent: new HttpsProxyAgent({} as hpagent.HttpsProxyAgentOptions),
      hostname: 'rest.url',
      path: '/',
      port: '',
      protocol: 'https:',
      auth: 'usr:pass',
    },
    callback,
  );
});

test('patched http get works when url passed as protocol and hostname in options', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const callback = vi.fn();
  const options = {
    hostname: 'rest.url',
    path: '/',
    port: '',
    protocol: 'https:',
  };
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get(options, callback);
  }
  expect(get).toBeCalledWith(
    {
      agent: new HttpsProxyAgent({} as hpagent.HttpsProxyAgentOptions),
      ...options,
    },
    callback,
  );
});

test('patched http get skips proxy agent when isNoProxyMatch returns true', () => {
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, () => true);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const callback = vi.fn();
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get('http://internal.corp/api', callback);
  }
  expect(get).toHaveBeenCalledWith(expect.not.objectContaining({ agent: expect.anything() }), callback);
});

test('patched http get uses proxy agent when isNoProxyMatch returns false', () => {
  const proxy = createProxy(true, undefined, HttpProxyUrl, () => false);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const callback = vi.fn();
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get('http://external.io/api', callback);
  }
  expect(get).toHaveBeenCalledWith(expect.objectContaining({ agent: expect.anything() }), callback);
});

test('patched http get forwards hostname and port to isNoProxyMatch', () => {
  const noProxyMatcher = vi.fn().mockReturnValue(false);
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, noProxyMatcher);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const callback = vi.fn();
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get({ hostname: 'api.corp', port: 8080, protocol: 'http:', path: '/' }, callback);
  }
  expect(noProxyMatcher).toHaveBeenCalledWith('api.corp', '8080');
});

test('patched http get normalizes empty port to protocol default for isNoProxyMatch', () => {
  const noProxyMatcher = vi.fn().mockReturnValue(false);
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, noProxyMatcher);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const callback = vi.fn();
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get('http://example.com/api', callback);
  }
  expect(noProxyMatcher).toHaveBeenCalledWith('example.com', '80');
});

test('patched http get defaults to localhost and bypasses proxy when host is absent', () => {
  const noProxyMatcher = vi.fn().mockReturnValue(true);
  const proxy = createProxy(true, HttpsProxyUrl, HttpProxyUrl, noProxyMatcher);
  const patched = ProxyResolver.createHttpPatchedModules(proxy, certificates);
  const http = patched['http'];
  if (http && 'get' in http && typeof http.get === 'function') {
    http.get({ protocol: 'http:', path: '/' });
  }
  expect(noProxyMatcher).toHaveBeenCalledWith('localhost', '80');
  const opts = vi.mocked(get).mock.calls[0]![0] as unknown as Record<string, unknown>;
  expect(opts['agent']).toBeUndefined();
});
