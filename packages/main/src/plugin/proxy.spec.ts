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

import * as http from 'node:http';
import type { AddressInfo } from 'node:net';

import { createProxy, type ProxyServer } from 'proxy';
import { describe, expect, test, vi } from 'vitest';

import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { ensureURL, Proxy } from '/@/plugin/proxy.js';

const URL = 'https://podman-desktop.io';

function getConfigurationRegistry(
  enabled: boolean,
  http: string | undefined,
  https: string | undefined,
  no: string | undefined,
): ConfigurationRegistry {
  const get = vi.fn().mockImplementation(name => {
    if (name === 'enabled') {
      return enabled;
    } else if (name === 'http') {
      return http;
    } else if (name === 'https') {
      return https;
    } else if (name === 'no') {
      return no;
    }
  });
  return {
    registerConfigurations: vi.fn(),
    onDidChangeConfiguration: vi.fn(),
    getConfiguration: vi.fn().mockReturnValue({
      get: get,
    }),
  } as unknown as ConfigurationRegistry;
}

async function buildProxy(): Promise<ProxyServer> {
  return new Promise(resolve => {
    const server = createProxy(http.createServer());
    server.listen(0, () => resolve(server));
  });
}

test('fetch without proxy', async () => {
  const configurationRegistry = getConfigurationRegistry(false, undefined, undefined, undefined);
  const proxy = new Proxy(configurationRegistry);
  await proxy.init();
  await fetch(URL);
});

test('fetch with http proxy', async () => {
  const proxyServer = await buildProxy();
  const address = proxyServer.address() as AddressInfo;
  const configurationRegistry = getConfigurationRegistry(true, `127.0.0.1:${address.port}`, undefined, undefined);
  const proxy = new Proxy(configurationRegistry);
  await proxy.init();
  let connectDone = false;
  proxyServer.on('connect', () => (connectDone = true));
  await fetch(URL);
  expect(connectDone).toBeTruthy();
});

describe.each([
  { original: '127.0.0.1', converted: 'http://127.0.0.1' },
  { original: '127.0.0.1:8080', converted: 'http://127.0.0.1:8080' },
  { original: '192.168.1.1', converted: 'http://192.168.1.1' },
  { original: '192.168.1.1:8080', converted: 'http://192.168.1.1:8080' },
  { original: 'myhostname', converted: 'http://myhostname' },
  { original: 'myhostname:8080', converted: 'http://myhostname:8080' },
  { original: 'myhostname.domain.com', converted: 'http://myhostname.domain.com' },
  { original: 'myhostname.domain.com:8080', converted: 'http://myhostname.domain.com:8080' },
  { original: 'http://127.0.0.1', converted: 'http://127.0.0.1' },
  { original: 'http://127.0.0.1:8080', converted: 'http://127.0.0.1:8080' },
  { original: 'http://192.168.1.1', converted: 'http://192.168.1.1' },
  { original: 'http://192.168.1.1:8080', converted: 'http://192.168.1.1:8080' },
  { original: 'http://myhostname', converted: 'http://myhostname' },
  { original: 'http://myhostname:8080', converted: 'http://myhostname:8080' },
  { original: 'http://myhostname.domain.com', converted: 'http://myhostname.domain.com' },
  { original: 'http://myhostname.domain.com:8080', converted: 'http://myhostname.domain.com:8080' },
])('Ensure URL returns corrected value', ({ original, converted }) => {
  test(`Ensure ${original} is converted to ${converted}`, () => {
    expect(ensureURL(original)).toBe(converted);
  });
});
