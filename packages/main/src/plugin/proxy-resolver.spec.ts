/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
/* eslint-disable @typescript-eslint/no-explicit-any */

import * as ProxyResolver from './proxy-resolver.js';
import { beforeEach, expect, test, vi } from 'vitest';
import type { Proxy } from './proxy.js';
import { get } from 'http';
import type { HttpsProxyAgentOptions } from 'hpagent';
import { HttpsProxyAgent } from 'hpagent';
import * as nodeurl from 'url';

vi.mock('http', () => {
  return {
    get: vi.fn(),
    request: vi.fn(),
  };
});

vi.mock('https', () => {
  return {
    get: vi.fn(),
    request: vi.fn(),
  };
});

vi.mock('hpagent', () => {
  return {
    HttpProxyAgent: function () {
      // @ts-ignore: this implicit any type
      this.https = false;
    },
    HttpsProxyAgent: function () {
      // @ts-ignore: this implicit any type
      this.https = true;
    },
  };
});

function createProxy(enabled: boolean, httpsProxy?: string, httpProxy?: string) {
  const proxy: {
    isEnabled: () => boolean;
    proxy?: {
      httpProxy?: string;
      httpsProxy?: string;
    };
  } = {
    isEnabled: () => enabled,
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

beforeEach(() => {
  vi.clearAllMocks();
});
test('getOptions return options w/o agent if proxy not enabled', () => {
  const proxy = createProxy(false);
  const options = ProxyResolver.getOptions(proxy, false);
  expect(options.agent).to.be.undefined;
});

test('getOptions return options w/ agent for https proxy', () => {
  const proxy = createProxy(true, 'https://proxy.url', 'http://proxy.url');
  const options = ProxyResolver.getOptions(proxy, true);
  expect(options.agent).is.not.undefined;
  expect((options.agent as any).https).is.true;
});

test('getOptions return options w/ https.Agent for https proxy', () => {
  const proxy = createProxy(true, undefined, 'http://proxy.url');
  const options = ProxyResolver.getOptions(proxy, false);
  expect(options.agent).is.not.undefined;
  expect((options.agent as any).https).is.false;
});

test('patched http get calls original with the original parameters when proxy is not enabled', () => {
  const proxy = createProxy(false, 'https://proxy.url', 'http://proxy.url');
  const patched = ProxyResolver.createHttpPatchedModules(proxy);
  patched.http.get('http://site.url');
  expect(get).toBeCalledWith('http://site.url');
});

test('patched http get calls original method with the original parameters when proxy is enabled and socketPath is requested', () => {
  const proxy = createProxy(true, 'https://proxy.url', 'http://proxy.url');
  const patched = ProxyResolver.createHttpPatchedModules(proxy);
  const socketOptions = { socketPath: '/var/socket/path' };
  patched.http.get(socketOptions);
  expect(get).toBeCalledWith(socketOptions, undefined);
});

test('patched http get when called with url and callback calls original with options and callback', () => {
  const proxy = createProxy(true, 'https://proxy.url', 'http://proxy.url');
  const patched = ProxyResolver.createHttpPatchedModules(proxy);
  const url = 'https://[fe80::1802:20ff:fe8d:d4ce]';
  const callback = vi.fn();
  patched.http.get(url, callback);
  patched.http.get(new nodeurl.URL(url), callback);
  expect(get).toHaveBeenCalledTimes(2);
  expect(get).toBeCalledWith(
    {
      agent: new HttpsProxyAgent({} as HttpsProxyAgentOptions),
      hostname: 'fe80::1802:20ff:fe8d:d4ce',
      path: '/',
      port: '',
      protocol: 'https:',
    },
    callback,
  );
});

test('patched http get translates username@password in url to auth option', () => {
  const proxy = createProxy(true, 'https://proxy.url', 'http://proxy.url');
  const patched = ProxyResolver.createHttpPatchedModules(proxy);
  const url = 'https://usr:pass@rest.url';
  const callback = vi.fn();
  patched.http.get(url, callback);
  patched.http.get(new nodeurl.URL(url), callback);
  expect(get).toHaveBeenCalledTimes(2);
  expect(get).toBeCalledWith(
    {
      agent: new HttpsProxyAgent({} as HttpsProxyAgentOptions),
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
  const proxy = createProxy(true, 'https://proxy.url', 'http://proxy.url');
  const patched = ProxyResolver.createHttpPatchedModules(proxy);
  const callback = vi.fn();
  const options = {
    hostname: 'rest.url',
    path: '/',
    port: '',
    protocol: 'https:',
  };
  patched.http.get(options, callback);
  expect(get).toBeCalledWith(
    {
      agent: new HttpsProxyAgent({} as HttpsProxyAgentOptions),
      ...options,
    },
    callback,
  );
});
