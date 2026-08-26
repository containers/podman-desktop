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

import EventEmitter from 'node:events';
import * as fs from 'node:fs';
import * as http from 'node:http';
import type { AddressInfo } from 'node:net';

import type { IDisposable } from '@desktop-framework/api';
import { ProxyState } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import { createProxy, type ProxyServer } from 'proxy';
import { Agent } from 'undici';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { Certificates } from '/@/plugin/certificates.js';
import { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import { ensureURL, Proxy } from '/@/plugin/proxy.js';

import type { DefaultConfiguration } from './default-configuration.js';
import type { Directories } from './directories.js';
import type { LockedConfiguration } from './locked-configuration.js';
import { getProxySettingsFromSystem } from './proxy-system.js';

const URL = 'https://podman-desktop.io';

vi.mock(import('./proxy-system.js'), () => {
  return {
    getProxySettingsFromSystem: vi.fn(),
  };
});

// Mock the fs module
vi.mock(import('node:fs'));
const readFileSync = vi.mocked(fs.readFileSync);
const writeFileSync = vi.mocked(fs.writeFileSync);
const existsSync = vi.mocked(fs.existsSync);
const mkdirSync = vi.mocked(fs.mkdirSync);

const certificates: Certificates = {
  getAllCertificates: vi.fn(),
} as unknown as Certificates;

const apiEmitter = new EventEmitter();

const apiSender: ApiSenderType = {
  send: function (channel: string, data?: unknown): void {
    apiEmitter.emit(channel, data);
  },
  receive: function (channel: string, func: (...args: unknown[]) => void): IDisposable {
    apiEmitter.on(channel, func);
    return {
      dispose: function (): void {
        apiEmitter.removeAllListeners();
      },
    };
  },
};

const directories = {
  getConfigurationDirectory: () => '/fake-config-directory',
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
  getContributionStorageDir: () => '/fake-contribution-storage-directory',
  getSafeStorageDirectory: () => '/fake-safe-storage-directory',
  getDataDirectory: () => '/fake-data-directory',
  getManagedDefaultsDirectory: () => '/fake-managed-defaults-directory',
} as unknown as Directories;

const defaultConfiguration = {
  getContent: vi.fn().mockResolvedValue({}),
} as unknown as DefaultConfiguration;

const lockedConfiguration = {
  getContent: vi.fn().mockResolvedValue({}),
} as unknown as LockedConfiguration;

function getConfigurationRegistry(): ConfigurationRegistry {
  return new ConfigurationRegistry(apiSender, directories, defaultConfiguration, lockedConfiguration);
}

async function buildProxy(): Promise<ProxyServer> {
  return new Promise(resolve => {
    const server = createProxy(http.createServer());
    server.listen(0, () => resolve(server));
  });
}

let proxy: Proxy | undefined;
let configurationRegistry: ConfigurationRegistry;

beforeEach(async () => {
  vi.resetAllMocks();

  // Set up filesystem mocks
  readFileSync.mockReturnValue(JSON.stringify({}));
  writeFileSync.mockReturnValue(undefined);
  existsSync.mockReturnValue(true);
  mkdirSync.mockReturnValue('');

  configurationRegistry = getConfigurationRegistry();
  proxy = new Proxy(configurationRegistry, certificates);
  await proxy.init();
});

test('fetch without proxy', async () => {
  await proxy?.setState(ProxyState.PROXY_DISABLED);
  await fetch(URL);
});

test('fetch with http proxy', async () => {
  const proxyServer = await buildProxy();
  const address = proxyServer.address() as AddressInfo;
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpsProxy: `127.0.0.1:${address.port}`,
    httpProxy: undefined,
    noProxy: undefined,
  });

  let connectDone = false;
  proxyServer.on('connect', () => (connectDone = true));
  await fetch(URL);
  expect(connectDone).toBeTruthy();
});

test('fetch skips proxy when hostname matches noProxy', async () => {
  const proxyServer = await buildProxy();
  const address = proxyServer.address() as AddressInfo;
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpsProxy: `127.0.0.1:${address.port}`,
    httpProxy: undefined,
    noProxy: 'podman-desktop.io',
  });

  let connectDone = false;
  proxyServer.on('connect', () => (connectDone = true));
  await fetch(URL);
  expect(connectDone).toBeFalsy();
});

test('fetch uses proxy when hostname does not match noProxy', async () => {
  const proxyServer = await buildProxy();
  const address = proxyServer.address() as AddressInfo;
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpsProxy: `127.0.0.1:${address.port}`,
    httpProxy: undefined,
    noProxy: 'localhost,example.com',
  });

  let connectDone = false;
  proxyServer.on('connect', () => (connectDone = true));
  await fetch(URL);
  expect(connectDone).toBeTruthy();
});

test('check change from manual to system without proxy send event', async () => {
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpProxy: `127.0.0.1:8080`,
    httpsProxy: undefined,
    noProxy: undefined,
  });
  const stateListener = vi.fn();
  const settingsListener = vi.fn();
  proxy?.onDidStateChange(stateListener);
  proxy?.onDidUpdateProxy(settingsListener);
  await proxy?.setState(ProxyState.PROXY_SYSTEM);
  expect(stateListener).toHaveBeenCalledWith(false);
  expect(settingsListener).not.toHaveBeenCalled();
});

test('check change from manual to system with proxy send event', async () => {
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpProxy: `127.0.0.1:8080`,
    httpsProxy: undefined,
    noProxy: undefined,
  });
  const stateListener = vi.fn();
  const settingsListener = vi.fn();
  proxy?.onDidStateChange(stateListener);
  proxy?.onDidUpdateProxy(settingsListener);
  vi.mocked(getProxySettingsFromSystem).mockResolvedValue({
    httpProxy: 'https://127.0.0.1:8081',
    httpsProxy: undefined,
    noProxy: undefined,
  });
  await proxy?.setState(ProxyState.PROXY_SYSTEM);
  expect(stateListener).toHaveBeenCalledWith(true);
  expect(settingsListener).toHaveBeenCalledWith({ httpProxy: 'https://127.0.0.1:8081' });
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

test('check isEnabled returns false when proxy is system but noProxy is not empty', async () => {
  vi.mocked(getProxySettingsFromSystem).mockResolvedValue({
    httpProxy: undefined,
    httpsProxy: undefined,
    noProxy: 'localhost,127.0.0.1',
  });
  await proxy?.setState(ProxyState.PROXY_SYSTEM);
  await proxy?.setProxy(undefined);
  expect(proxy?.isEnabled()).toBe(false);
});

test('check isEnabled returns true when proxy is system and some proxy is enabled', async () => {
  vi.mocked(getProxySettingsFromSystem).mockResolvedValue({
    httpProxy: 'http://127.0.0.1:8080',
    httpsProxy: undefined,
    noProxy: 'localhost,127.0.0.1',
  });
  await proxy?.setState(ProxyState.PROXY_SYSTEM);
  await proxy?.setProxy(undefined);
  expect(proxy?.isEnabled()).toBe(true);
});

test('fetch with caller-provided dispatcher should not be overridden', async () => {
  // install our own fetch as the one the override will delegate to, so we can assert what it receives
  const originalFetch = vi.fn().mockResolvedValue(new Response());
  const previousFetch = globalThis.fetch;
  globalThis.fetch = originalFetch as unknown as typeof globalThis.fetch;

  try {
    const localProxy = new Proxy(configurationRegistry, certificates);
    await localProxy.init();
    await localProxy.setState(ProxyState.PROXY_MANUAL);
    await localProxy.setProxy({
      httpsProxy: '127.0.0.1:8888',
      httpProxy: undefined,
      noProxy: undefined,
    });

    const customDispatcher = new Agent();
    await globalThis.fetch(URL, { dispatcher: customDispatcher } as RequestInit);

    // without the bypass the override would replace the dispatcher with its own ProxyAgent
    expect(originalFetch).toHaveBeenCalledWith(URL, expect.objectContaining({ dispatcher: customDispatcher }));
  } finally {
    globalThis.fetch = previousFetch;
  }
});

test('fetch skips proxy when noProxy has port :443 matching default HTTPS port', async () => {
  const proxyServer = await buildProxy();
  const address = proxyServer.address() as AddressInfo;
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpsProxy: `127.0.0.1:${address.port}`,
    httpProxy: undefined,
    noProxy: 'podman-desktop.io:443',
  });

  let connectDone = false;
  proxyServer.on('connect', () => (connectDone = true));
  await fetch('https://podman-desktop.io');
  expect(connectDone).toBeFalsy();
});

test('fetch uses proxy when noProxy has port :8080 not matching default HTTPS port', async () => {
  const proxyServer = await buildProxy();
  const address = proxyServer.address() as AddressInfo;
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpsProxy: `127.0.0.1:${address.port}`,
    httpProxy: undefined,
    noProxy: 'podman-desktop.io:8080',
  });

  let connectDone = false;
  proxyServer.on('connect', () => (connectDone = true));
  await fetch('https://podman-desktop.io');
  expect(connectDone).toBeTruthy();
});

test('fetch skips proxy when noProxy has port :443 and URL has explicit :443', async () => {
  const proxyServer = await buildProxy();
  const address = proxyServer.address() as AddressInfo;
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpsProxy: `127.0.0.1:${address.port}`,
    httpProxy: undefined,
    noProxy: 'podman-desktop.io:443',
  });

  let connectDone = false;
  proxyServer.on('connect', () => (connectDone = true));
  await fetch('https://podman-desktop.io:443');
  expect(connectDone).toBeFalsy();
});

test('isNoProxyMatch reflects updated rules after setProxy', async () => {
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpProxy: 'http://127.0.0.1:8080',
    httpsProxy: undefined,
    noProxy: 'example.com',
  });

  expect(proxy?.isNoProxyMatch('example.com')).toBe(true);
  expect(proxy?.isNoProxyMatch('internal.corp')).toBe(false);

  await proxy?.setProxy({
    httpProxy: 'http://127.0.0.1:8080',
    httpsProxy: undefined,
    noProxy: 'example.com,internal.corp',
  });

  expect(proxy?.isNoProxyMatch('example.com')).toBe(true);
  expect(proxy?.isNoProxyMatch('internal.corp')).toBe(true);
});

test('isNoProxyMatch returns false for all hosts when noProxy is undefined', async () => {
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpProxy: 'http://127.0.0.1:8080',
    httpsProxy: undefined,
    noProxy: undefined,
  });

  expect(proxy?.isNoProxyMatch('example.com')).toBe(false);
});

test('isNoProxyMatch reflects system proxy settings changes', async () => {
  vi.mocked(getProxySettingsFromSystem).mockResolvedValue({
    httpProxy: 'http://127.0.0.1:8080',
    httpsProxy: undefined,
    noProxy: '10.0.0.0/8,*.internal.corp',
  });
  await proxy?.setState(ProxyState.PROXY_SYSTEM);
  await proxy?.setProxy(undefined);

  expect(proxy?.isNoProxyMatch('10.5.5.5')).toBe(true);
  expect(proxy?.isNoProxyMatch('app.internal.corp')).toBe(true);
  expect(proxy?.isNoProxyMatch('external.com')).toBe(false);

  vi.mocked(getProxySettingsFromSystem).mockResolvedValue({
    httpProxy: 'http://127.0.0.1:8080',
    httpsProxy: undefined,
    noProxy: 'new.domain.com',
  });
  await proxy?.setProxy(undefined);

  expect(proxy?.isNoProxyMatch('new.domain.com')).toBe(true);
  expect(proxy?.isNoProxyMatch('10.5.5.5')).toBe(false);
});

test('isNoProxyMatch returns false for all hosts when proxy is disabled', async () => {
  await proxy?.setState(ProxyState.PROXY_MANUAL);
  await proxy?.setProxy({
    httpProxy: 'http://127.0.0.1:8080',
    httpsProxy: undefined,
    noProxy: 'example.com',
  });
  expect(proxy?.isNoProxyMatch('example.com')).toBe(true);

  await proxy?.setState(ProxyState.PROXY_DISABLED);
  await proxy?.updateFromConfiguration();

  expect(proxy?.isNoProxyMatch('example.com')).toBe(false);
});

describe('isNoProxyMatch CIDR validation', () => {
  test.each([
    ['10.0.0.0/', 'Malformed CIDR prefix'],
    ['10.0.0.0/ 8', 'Malformed CIDR prefix'],
    ['10.0.0.0/33', 'out of range'],
    ['fd00::/129', 'out of range'],
  ])('malformed CIDR %s is rejected (expects %s error)', async (input, expectedMsg) => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await proxy?.setState(ProxyState.PROXY_MANUAL);
    await proxy?.setProxy({ httpProxy: 'http://proxy:8080', httpsProxy: undefined, noProxy: input });
    expect(proxy?.isNoProxyMatch('10.1.2.3')).toBe(false);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(expectedMsg));
    consoleSpy.mockRestore();
  });

  test.each([
    ['10.0.0.0/8', '10.1.2.3'],
    ['fd00::/7', 'fd00::1'],
  ])('valid CIDR %s matches %s', async (cidr, host) => {
    await proxy?.setState(ProxyState.PROXY_MANUAL);
    await proxy?.setProxy({ httpProxy: 'http://proxy:8080', httpsProxy: undefined, noProxy: cidr });
    expect(proxy?.isNoProxyMatch(host)).toBe(true);
  });
});

interface NoProxyTestCase {
  description: string;
  noProxy?: string;
  host: string;
  port?: string;
  expected: boolean;
}

describe('isNoProxyMatch', () => {
  test.each<NoProxyTestCase>([
    // Domain & Subdomain Matching
    {
      description: 'hostname matches exactly',
      noProxy: 'internal.example.com',
      host: 'internal.example.com',
      expected: true,
    },
    {
      description: 'hostname does not match',
      noProxy: 'internal.example.com',
      host: 'podman-desktop.io',
      expected: false,
    },
    { description: '*. prefix matches subdomain', noProxy: '*.example.com', host: 'foo.example.com', expected: true },
    {
      description: '*. prefix does not match main domain',
      noProxy: '*.example.com',
      host: 'example.com',
      expected: false,
    },
    { description: 'leading dot matches subdomain', noProxy: '.example.com', host: 'sub.example.com', expected: true },
    {
      description: 'leading dot does not match main domain',
      noProxy: '.example.com',
      host: 'example.com',
      expected: false,
    },
    { description: 'no leading dot matches main domain', noProxy: 'example.com', host: 'example.com', expected: true },
    {
      description: 'no leading dot matches subdomain',
      noProxy: 'example.com',
      host: 'sub.example.com',
      expected: true,
    },

    // Loopback Bypassing
    { description: 'bypasses for localhost', noProxy: 'example.com', host: 'localhost', expected: true },
    { description: 'bypasses for 127.0.0.1', noProxy: 'example.com', host: '127.0.0.1', expected: true },
    { description: 'bypasses for 127.0.0.2', noProxy: 'example.com', host: '127.0.0.2', expected: true },
    { description: 'bypasses for 127.255.255.255', noProxy: 'example.com', host: '127.255.255.255', expected: true },
    { description: 'does not bypass for 128.0.0.1', noProxy: 'example.com', host: '128.0.0.1', expected: false },
    { description: 'bypasses for ::1', noProxy: 'example.com', host: '::1', expected: true },
    { description: 'bypasses for [::1]', noProxy: 'example.com', host: '[::1]', expected: true },
    { description: 'bypasses loopback when noProxy is empty', noProxy: '', host: 'localhost', expected: true },
    {
      description: 'bypasses loopback when noProxy is undefined',
      noProxy: undefined,
      host: '127.0.0.1',
      expected: true,
    },

    // IPv4 & CIDR Matching
    { description: 'matches IP inside CIDR range', noProxy: '10.0.0.0/8', host: '10.1.2.3', expected: true },
    {
      description: 'does not match IP outside CIDR range',
      noProxy: '10.0.0.0/8',
      host: '192.168.1.1',
      expected: false,
    },
    { description: 'matches exact IPv4 address', noProxy: '192.168.1.100', host: '192.168.1.100', expected: true },
    { description: 'does not match different IPv4', noProxy: '192.168.1.100', host: '192.168.1.101', expected: false },

    // IPv6 Matching
    { description: 'matches exact IPv6', noProxy: 'fd00::1', host: 'fd00::1', expected: true },
    { description: 'does not match different IPv6', noProxy: 'fd00::1', host: 'fd00::2', expected: false },
    { description: 'matches IPv6 inside CIDR', noProxy: 'fd00::/8', host: 'fd00::1', expected: true },
    { description: 'does not match IPv6 outside CIDR', noProxy: 'fd00::/8', host: 'fe80::1', expected: false },
    { description: 'handles bracketed IPv6', noProxy: 'fd00::/8', host: '[fd00::1]', expected: true },

    // Multiple Patterns & Whitespace
    { description: 'matches first in list', noProxy: 'foo.com,bar.org', host: 'foo.com', expected: true },
    { description: 'matches second in list', noProxy: 'foo.com,bar.org', host: 'bar.org', expected: true },
    { description: 'does not match unlisted', noProxy: 'foo.com,bar.org', host: 'other.io', expected: false },
    { description: 'trims spaces', noProxy: ' foo.com , bar.org ', host: 'foo.com', expected: true },
    { description: 'ignores empty entries', noProxy: ',foo.com,,bar.org,', host: 'foo.com', expected: true },
    { description: 'empty noProxy does not match non-loopback', noProxy: '', host: 'example.com', expected: false },

    // Wildcard
    { description: 'wildcard * matches all', noProxy: '*', host: 'anything.example.com', expected: true },
    { description: 'wildcard * matches IP', noProxy: '*', host: '10.0.0.1', expected: true },

    // Port Matching
    {
      description: 'matches domain when port matches',
      noProxy: 'example.com:8080',
      host: 'example.com',
      port: '8080',
      expected: true,
    },
    {
      description: 'uses proxy when port differs',
      noProxy: 'example.com:8080',
      host: 'example.com',
      port: '9090',
      expected: false,
    },
    {
      description: 'uses proxy when no port but entry has port',
      noProxy: 'example.com:8080',
      host: 'example.com',
      expected: false,
    },
    {
      description: 'bypasses regardless of port if entry has no port',
      noProxy: 'example.com',
      host: 'example.com',
      port: '8080',
      expected: true,
    },
    {
      description: 'matches IP with port',
      noProxy: '192.168.1.1:8080',
      host: '192.168.1.1',
      port: '8080',
      expected: true,
    },
    {
      description: 'uses proxy when IP port differs',
      noProxy: '192.168.1.1:8080',
      host: '192.168.1.1',
      port: '9090',
      expected: false,
    },
    { description: 'matches IPv6 with port', noProxy: '[fe80::1]:8080', host: 'fe80::1', port: '8080', expected: true },
    {
      description: 'uses proxy for IPv6 non-matching port',
      noProxy: '[fe80::1]:8080',
      host: 'fe80::1',
      port: '9090',
      expected: false,
    },

    // Mixed entries
    {
      description: 'mixed CIDR match',
      noProxy: '10.0.0.0/8,.internal.corp,192.168.1.42',
      host: '10.5.5.5',
      expected: true,
    },
    {
      description: 'mixed subdomain match',
      noProxy: '10.0.0.0/8,.internal.corp,192.168.1.42',
      host: 'app.internal.corp',
      expected: true,
    },
    {
      description: 'mixed exact IP match',
      noProxy: '10.0.0.0/8,.internal.corp,192.168.1.42',
      host: '192.168.1.42',
      expected: true,
    },
    {
      description: 'mixed does not match unlisted',
      noProxy: '10.0.0.0/8,.internal.corp,192.168.1.42',
      host: 'public.example.com',
      expected: false,
    },

    // Malformed entries
    { description: 'empty hostname returns false', noProxy: '*', host: '', expected: false },
    { description: 'trailing colon skipped', noProxy: 'example.com:,other.com', host: 'example.com', expected: false },
    { description: ':port with no host skipped', noProxy: ':8080,other.com', host: 'other.com', expected: true },
    { description: ':port with no host does not match', noProxy: ':8080', host: 'example.com', expected: false },
    {
      description: 'bracketed IPv6 with empty port skipped',
      noProxy: '[fd00::1]:,other.com',
      host: 'fd00::1',
      expected: false,
    },
    {
      description: 'valid entry after malformed still works',
      noProxy: 'example.com:,other.com',
      host: 'other.com',
      expected: true,
    },
  ])('$description', async ({ noProxy, host, port, expected }) => {
    await proxy?.setState(ProxyState.PROXY_MANUAL);
    await proxy?.setProxy({ httpProxy: 'http://proxy:8080', httpsProxy: undefined, noProxy });
    expect(proxy?.isNoProxyMatch(host, port)).toBe(expected);
  });
});
