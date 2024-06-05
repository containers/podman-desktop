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
import { type ProxySettings } from '@podman-desktop/api';

import { isLinux, isMac, isWindows } from '../util.js';
import type { Proxy } from './proxy.js';
import { Exec } from './util/exec.js';

export async function getProxySettingsFromSystem(proxy: Proxy): Promise<ProxySettings> {
  if (isWindows()) {
    return getWindowsProxySettings(new Exec(proxy));
  } else if (isMac()) {
    return getMacOSProxySettings(new Exec(proxy));
  } else if (isLinux()) {
    const httpProxy = process.env.HTTP_PROXY;
    const httpsProxy = process.env.HTTPS_PROXY;
    const noProxy = process.env.NO_PROXY;
    return { httpProxy, httpsProxy, noProxy };
  }
  return {} as ProxySettings;
}

async function getWindowsProxySettings(exec: Exec): Promise<ProxySettings> {
  try {
    const result = await exec.exec('reg', [
      'query',
      '"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings"',
    ]);
    const lines = result.stdout.split(/\r?\n/);
    let enabled = false;
    let httpProxy = undefined;
    let httpsProxy = undefined;
    let noProxy = undefined;
    lines.forEach(line => {
      const tokens = line.split(' ').filter(s => s.length > 0);
      if (tokens.length === 3) {
        if (tokens[0] === 'ProxyEnable') {
          enabled = tokens[2] === '0x1';
        }
        if (tokens[0] === 'ProxyServer') {
          const items = tokens[2].split(';');
          items.forEach(item => {
            if (item.startsWith('http=')) {
              httpProxy = `http://${item.substring(5)}`;
            } else if (item.startsWith('https=')) {
              httpsProxy = `http://${item.substring(6)}`;
            } else {
              httpProxy = httpsProxy = `http:${item}`;
            }
          });
        }
        if (tokens[0] === 'ProxyOverride') {
          noProxy = tokens[2];
        }
      }
    });
    return enabled ? { httpProxy, httpsProxy, noProxy } : ({} as ProxySettings);
  } catch (err) {
    console.warn(`Error while getting Windows internet settings from registry`, err);
    return {} as ProxySettings;
  }
}

async function getMacOSConnectionProxyInfo(
  exec: Exec,
  connection: string,
  secure: boolean,
): Promise<string | undefined> {
  try {
    const result = await exec.exec('networksetup', [secure ? '-getsecurewebproxy' : '-getwebproxy', connection]);
    let enabled = false;
    let server = undefined;
    let port = undefined;
    const lines = result.stdout.split(/\r?\n/);
    lines.forEach(line => {
      if (line.startsWith('Enabled: ')) {
        enabled = line.substring(9) !== 'No';
      } else if (line.startsWith('Server: ')) {
        server = line.substring(8);
      } else if (line.startsWith('Port: ')) {
        port = line.substring(6);
        if (port === '0') {
          port = undefined;
        }
      }
    });
    return enabled && server ? (port ? `http://${server}:${port}` : `http:/${server}`) : undefined;
  } catch (err) {
    console.warn(`Error while getting MacOS proxy settings for connection ${connection}`, err);
  }
}

async function getMacOSConnectionProxyByPass(exec: Exec, connection: string): Promise<string | undefined> {
  try {
    const result = await exec.exec('networksetup', ['-getproxybypassdomains', connection]);
    const lines = result.stdout.split(/\r?\n/);
    return lines.length > 0 ? lines.join(';') : undefined;
  } catch (err) {
    console.warn(`Error while getting MacOS proxy settings for connection ${connection}`, err);
  }
}

async function getMacOSProxySettings(exec: Exec): Promise<ProxySettings> {
  try {
    const result = await exec.exec('networksetup', ['-listnetworkservices']);
    const lines = result.stdout.split(/\r?\n/);
    let httpProxy = undefined;
    let httpsProxy = undefined;
    let noProxy = undefined;
    for (let index = 1; index < lines.length; ++index) {
      if (!lines[index].startsWith('*')) {
        if (!httpProxy) {
          httpProxy = await getMacOSConnectionProxyInfo(exec, lines[index], false);
        }
        if (!httpsProxy) {
          httpsProxy = await getMacOSConnectionProxyInfo(exec, lines[index], true);
        }
        if (!noProxy) {
          noProxy = await getMacOSConnectionProxyByPass(exec, lines[index]);
        }
      }
    }
    return httpProxy || httpsProxy || noProxy ? { httpProxy, httpsProxy, noProxy } : ({} as ProxySettings);
  } catch (err) {
    console.warn(`Error while getting MacOS network services`, err);
    return {} as ProxySettings;
  }
}
