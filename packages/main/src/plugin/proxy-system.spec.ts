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

import type { RunResult } from '@podman-desktop/api';
import { describe, expect, test, vi } from 'vitest';

import type { Proxy } from '/@/plugin/proxy.js';
import { getProxySettingsFromSystem } from '/@/plugin/proxy-system.js';
import { Exec } from '/@/plugin/util/exec.js';

import * as util from '../util.js';

const mocks = vi.hoisted(() => {
  return {
    WinRegMock: vi.fn(),
  };
});

vi.mock('winreg', () => {
  return {
    default: mocks.WinRegMock,
  };
});

function setupPlatform(windows: boolean, macos: boolean, linux: boolean): void {
  vi.spyOn(util, 'isWindows').mockReturnValue(windows);
  vi.spyOn(util, 'isMac').mockReturnValue(macos);
  vi.spyOn(util, 'isLinux').mockReturnValue(linux);
}

describe('Windows platform tests', () => {
  setupPlatform(true, false, false);
  test('No state returned in case of execution error', async () => {
    mocks.WinRegMock.mockReturnValue({
      values: vi.fn().mockImplementation(cb => {
        cb(new Error('execution error'), undefined);
      }),
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings.httpProxy).toBeUndefined();
    expect(settings.httpsProxy).toBeUndefined();
    expect(settings.noProxy).toBeUndefined();
  });

  test('No state returned in case of proxy disabled', async () => {
    setupPlatform(true, false, false);
    mocks.WinRegMock.mockReturnValue({
      values: vi.fn().mockImplementation(cb => {
        cb(undefined, [{ name: 'ProxyEnable', value: '0x0' }]);
      }),
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings.httpProxy).toBeUndefined();
    expect(settings.httpsProxy).toBeUndefined();
    expect(settings.noProxy).toBeUndefined();
  });

  test('Empty state returned in case of proxy enabled only', async () => {
    setupPlatform(true, false, false);
    mocks.WinRegMock.mockReturnValue({
      values: vi.fn().mockImplementation(cb => {
        cb(undefined, [{ name: 'ProxyEnable', value: '0x1' }]);
      }),
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings?.httpProxy).toBeUndefined();
    expect(settings?.httpsProxy).toBeUndefined();
    expect(settings?.noProxy).toBeUndefined();
  });

  test('State returned in case of proxy enabled and proxy server', async () => {
    setupPlatform(true, false, false);
    mocks.WinRegMock.mockReturnValue({
      values: vi.fn().mockImplementation(cb => {
        cb(undefined, [
          { name: 'ProxyEnable', value: '0x1' },
          { name: 'ProxyServer', value: 'http=127.0.0.1:8888;https=127.0.0.1:8889' },
        ]);
      }),
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings?.httpProxy).toBe('http://127.0.0.1:8888');
    expect(settings?.httpsProxy).toBe('http://127.0.0.1:8889');
    expect(settings?.noProxy).toBeUndefined();
  });

  test('State returned in case of proxy enabled and proxy server with exceptions', async () => {
    setupPlatform(true, false, false);
    mocks.WinRegMock.mockReturnValue({
      values: vi.fn().mockImplementation(cb => {
        cb(undefined, [
          { name: 'ProxyEnable', value: '0x1' },
          { name: 'ProxyServer', value: 'http=127.0.0.1:8888;https=127.0.0.1:8889' },
          { name: 'ProxyOverride', value: '*.internal' },
        ]);
      }),
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings?.httpProxy).toBe('http://127.0.0.1:8888');
    expect(settings?.httpsProxy).toBe('http://127.0.0.1:8889');
    expect(settings?.noProxy).toBe('*.internal');
  });
});

describe('Linux platform test', () => {
  test('No state returned in case of proxy disabled', async () => {
    const previousHttpProxy = process.env['HTTP_PROXY'];
    const previousHttpsProxy = process.env['HTTPS_PROXY'];
    const previousNoProxy = process.env['NO_PROXY'];
    try {
      setupPlatform(false, false, true);
      delete process.env['HTTP_PROXY'];
      delete process.env['HTTPS_PROXY'];
      delete process.env['NO_PROXY'];
      const settings = await getProxySettingsFromSystem({} as Proxy);
      expect(settings).toBeDefined();
      expect(settings.httpProxy).toBeUndefined();
      expect(settings.httpsProxy).toBeUndefined();
      expect(settings.noProxy).toBeUndefined();
    } finally {
      process.env['HTTP_PROXY'] = previousHttpProxy;
      process.env['HTTPS_PROXY'] = previousHttpsProxy;
      process.env['NO_PROXY'] = previousNoProxy;
    }
  });

  test('State returned in case of http proxy', async () => {
    const previousHttpProxy = process.env['HTTP_PROXY'];
    const previousHttpsProxy = process.env['HTTPS_PROXY'];
    const previousNoProxy = process.env['NO_PROXY'];
    try {
      setupPlatform(false, false, true);
      process.env['HTTP_PROXY'] = 'http://127.0.0.1:8888';
      delete process.env['HTTPS_PROXY'];
      delete process.env['NO_PROXY'];
      const settings = await getProxySettingsFromSystem({} as Proxy);
      expect(settings).toBeDefined();
      expect(settings?.httpProxy).toBe('http://127.0.0.1:8888');
      expect(settings?.httpsProxy).toBeUndefined();
      expect(settings?.noProxy).toBeUndefined();
    } finally {
      process.env['HTTP_PROXY'] = previousHttpProxy;
      process.env['HTTPS_PROXY'] = previousHttpsProxy;
      process.env['NO_PROXY'] = previousNoProxy;
    }
  });

  test('State returned in case of https proxy', async () => {
    const previousHttpProxy = process.env['HTTP_PROXY'];
    const previousHttpsProxy = process.env['HTTPS_PROXY'];
    const previousNoProxy = process.env['NO_PROXY'];
    try {
      setupPlatform(false, false, true);
      process.env['HTTPS_PROXY'] = 'http://127.0.0.1:8888';
      delete process.env['HTTP_PROXY'];
      delete process.env['NO_PROXY'];
      const settings = await getProxySettingsFromSystem({} as Proxy);
      expect(settings).toBeDefined();
      expect(settings?.httpProxy).toBeUndefined();
      expect(settings?.httpsProxy).toBe('http://127.0.0.1:8888');
      expect(settings?.noProxy).toBeUndefined();
    } finally {
      process.env['HTTP_PROXY'] = previousHttpProxy;
      process.env['HTTPS_PROXY'] = previousHttpsProxy;
      process.env['NO_PROXY'] = previousNoProxy;
    }
  });

  test('State returned in case of no proxy', async () => {
    const previousHttpProxy = process.env['HTTP_PROXY'];
    const previousHttpsProxy = process.env['HTTPS_PROXY'];
    const previousNoProxy = process.env['NO_PROXY'];
    try {
      setupPlatform(false, false, true);
      delete process.env['HTTP_PROXY'];
      delete process.env['HTTPS_PROXY'];
      process.env['NO_PROXY'] = '*.internal';
      const settings = await getProxySettingsFromSystem({} as Proxy);
      expect(settings).toBeDefined();
      expect(settings?.httpProxy).toBeUndefined();
      expect(settings?.httpsProxy).toBeUndefined();
      expect(settings?.noProxy).toBe('*.internal');
    } finally {
      process.env['HTTP_PROXY'] = previousHttpProxy;
      process.env['HTTPS_PROXY'] = previousHttpsProxy;
      process.env['NO_PROXY'] = previousNoProxy;
    }
  });
});

describe('MacOS platform tests', () => {
  test('No state returned in case of execution error', async () => {
    setupPlatform(false, true, false);
    vi.spyOn(Exec.prototype, 'exec').mockRejectedValue(new Error('execution error'));
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings.httpProxy).toBeUndefined();
    expect(settings.httpsProxy).toBeUndefined();
    expect(settings.noProxy).toBeUndefined();
  });

  test('No state returned if no network connections', async () => {
    setupPlatform(false, true, false);
    vi.spyOn(Exec.prototype, 'exec').mockResolvedValue({ stdout: '' } as RunResult);
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings.httpProxy).toBeUndefined();
    expect(settings.httpsProxy).toBeUndefined();
    expect(settings.noProxy).toBeUndefined();
  });

  test('No state returned if network connection is disabled', async () => {
    setupPlatform(false, true, false);
    vi.spyOn(Exec.prototype, 'exec').mockResolvedValue({ stdout: '\n*Connection' } as RunResult);
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings.httpProxy).toBeUndefined();
    expect(settings.httpsProxy).toBeUndefined();
    expect(settings.noProxy).toBeUndefined();
  });

  test('State returned with http proxy if network connection', async () => {
    setupPlatform(false, true, false);
    vi.spyOn(Exec.prototype, 'exec').mockImplementation(async (_command, args?) => {
      if (args?.[0] === '-listnetworkservices') {
        return { stdout: '\nConnection' } as RunResult;
      } else if (args?.[0] === '-getwebproxy') {
        return { stdout: 'Server: 127.0.0.1\nPort: 8888\nEnabled: Yes' } as RunResult;
      }
      throw new Error('Unsupported call');
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings?.httpProxy).toBe('http://127.0.0.1:8888');
    expect(settings?.httpsProxy).toBeUndefined();
    expect(settings?.noProxy).toBeUndefined();
  });

  test('State returned with https proxy if network connection', async () => {
    setupPlatform(false, true, false);
    vi.spyOn(Exec.prototype, 'exec').mockImplementation(async (_command, args?) => {
      if (args?.[0] === '-listnetworkservices') {
        return { stdout: '\nConnection' } as RunResult;
      } else if (args?.[0] === '-getsecurewebproxy') {
        return { stdout: 'Server: 127.0.0.1\nPort: 8888\nEnabled: Yes' } as RunResult;
      }
      throw new Error('Unsupported call');
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings?.httpProxy).toBeUndefined();
    expect(settings?.httpsProxy).toBe('http://127.0.0.1:8888');
    expect(settings?.noProxy).toBeUndefined();
  });

  test('State returned with no proxy if network connection', async () => {
    setupPlatform(false, true, false);
    vi.spyOn(Exec.prototype, 'exec').mockImplementation(async (_command, args?) => {
      if (args?.[0] === '-listnetworkservices') {
        return { stdout: '\nConnection' } as RunResult;
      } else if (args?.[0] === '-getproxybypassdomains') {
        return { stdout: '*.internal' } as RunResult;
      }
      throw new Error('Unsupported call');
    });
    const settings = await getProxySettingsFromSystem({} as Proxy);
    expect(settings).toBeDefined();
    expect(settings?.httpProxy).toBeUndefined();
    expect(settings?.httpsProxy).toBeUndefined();
    expect(settings?.noProxy).toBe('*.internal');
  });
});
