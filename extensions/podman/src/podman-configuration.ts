/**********************************************************************
 * Copyright (C) 2022-2023 Red Hat, Inc.
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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import * as toml from '@ltd/j-toml';
import type { ProxySettings } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

import { isLinux, isMac, isWindows } from './util';

/**
 * Manages access to the containers.conf configuration file used to configure Podman
 */
export class PodmanConfiguration {
  async init(): Promise<void> {
    let httpProxy = undefined;
    let httpsProxy = undefined;
    let noProxy = undefined;

    // we receive an update for the current proxy settings
    extensionApi.proxy.onDidUpdateProxy(async (proxySettings: ProxySettings) => {
      await this.updateProxySettings(proxySettings);
    });

    // in case of proxy being enabled or disabled we need to update the containers.conf file
    extensionApi.proxy.onDidStateChange(async (enabled: boolean) => {
      if (enabled) {
        const updatedProxySettings = extensionApi.proxy.getProxySettings();
        await this.updateProxySettings(updatedProxySettings);
      } else {
        await this.updateProxySettings(undefined);
      }
    });

    // check if the file exists
    if (fs.existsSync(this.getContainersFileLocation())) {
      const containersConfigFile = await this.readContainersConfigFile();
      const tomlConfigFile = toml.parse(containersConfigFile);

      if (tomlConfigFile?.engine) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const engineConf: any = tomlConfigFile.engine;

        // env in engine section
        // env are written like array of key=value ['https_proxy=http://10.0.0.244:9090', 'http_proxy=http://10.0.0.244:9090']
        if (engineConf.env && Array.isArray(engineConf.env)) {
          const envArray: string[] = engineConf.env;
          envArray.forEach(envVar => {
            const split = envVar.split('=');
            if (split.length === 2) {
              if (split[0] === 'https_proxy') {
                httpsProxy = split[1];
              } else if (split[0] === 'http_proxy') {
                httpProxy = split[1];
              } else if (split[0] === 'no_proxy') {
                noProxy = split[1];
              }
            }
          });
        }
      }
    }

    const proxySettings = {
      httpsProxy,
      httpProxy,
      noProxy,
    };

    // register the proxy if there is no proxy settings for now
    if (
      extensionApi.proxy.getProxySettings() === undefined &&
      extensionApi.proxy.isEnabled() &&
      (httpsProxy || httpProxy || noProxy)
    ) {
      await extensionApi.proxy.setProxy(proxySettings);
    }
  }

  async updateProxySettings(proxySettings: ProxySettings | undefined): Promise<void> {
    if (!fs.existsSync(this.getContainersFileLocation())) {
      // file does not exist, needs to create an empty one
      const containersConfContent = {
        containers: toml.Section({}),
        engine: toml.Section({
          env: [],
        }),
        machine: toml.Section({}),
        network: toml.Section({}),
        secrets: toml.Section({}),
        configmaps: toml.Section({}),
      };
      if (proxySettings?.httpProxy && proxySettings?.httpProxy !== '') {
        containersConfContent['engine'].env.push(`http_proxy=${proxySettings.httpProxy}`);
      }
      if (proxySettings?.httpsProxy && proxySettings?.httpsProxy !== '') {
        containersConfContent['engine'].env.push(`https_proxy=${proxySettings.httpsProxy}`);
      }
      if (proxySettings?.noProxy && proxySettings?.noProxy !== '') {
        containersConfContent['engine'].env.push(`no_proxy=${proxySettings.noProxy}`);
      }

      // write the file
      const content = toml.stringify(containersConfContent, { newline: '\n' });
      await fs.promises.writeFile(this.getContainersFileLocation(), content);
    } else {
      // read the content of the file
      const containersConfigFile = await this.readContainersConfigFile();
      let tomlConfigFile = toml.parse(containersConfigFile);
      if (!tomlConfigFile) {
        tomlConfigFile = {};
      }

      if (!tomlConfigFile.engine) {
        tomlConfigFile.engine = {};
      }

      let engineEnv: string[];
      if (!tomlConfigFile.engine['env']) {
        engineEnv = [];
        tomlConfigFile.engine['env'] = engineEnv;
      } else {
        engineEnv = tomlConfigFile.engine['env'];
      }

      // now update values
      const httpsProxyIndex = engineEnv.findIndex(item => item.startsWith('https_proxy='));
      // not found ?
      const httpsProxyEnvValue = `https_proxy=${proxySettings?.httpsProxy}`;
      if (httpsProxyIndex === -1) {
        // add the value only if there is one
        if (proxySettings?.httpsProxy && proxySettings?.httpsProxy !== '') {
          engineEnv.push(httpsProxyEnvValue);
        }
      } else {
        // empty or undefined ? needs to unset
        if (!proxySettings?.httpsProxy || proxySettings?.httpsProxy === '') {
          // delete the httpsProxyIndex in the engineEnv array
          engineEnv.splice(httpsProxyIndex, 1);
        } else {
          engineEnv[httpsProxyIndex] = httpsProxyEnvValue;
        }
      }
      // now update values
      const httpProxyIndex = engineEnv.findIndex(item => item.startsWith('http_proxy='));
      // not found ?
      const httpProxyEnvValue = `http_proxy=${proxySettings?.httpProxy}`;
      if (httpProxyIndex === -1) {
        // add the value only if there is one
        if (proxySettings?.httpProxy && proxySettings?.httpProxy !== '') {
          engineEnv.push(httpProxyEnvValue);
        }
      } else {
        // empty or undefined ? needs to unset
        if (!proxySettings?.httpProxy || proxySettings?.httpProxy === '') {
          // delete the httpProxyIndex in the engineEnv array
          engineEnv.splice(httpProxyIndex, 1);
        } else {
          engineEnv[httpProxyIndex] = httpProxyEnvValue;
        }
      }

      // now update values
      const noProxyIndex = engineEnv.findIndex(item => item.startsWith('no_proxy='));
      // not found ?
      const noProxyEnvValue = `no_proxy=${proxySettings?.noProxy}`;
      if (noProxyIndex === -1) {
        // add the value only if there is one
        if (proxySettings?.noProxy && proxySettings?.noProxy !== '') {
          engineEnv.push(noProxyEnvValue);
        }
      } else {
        // empty or undefined ? needs to unset
        if (!proxySettings?.noProxy || proxySettings?.noProxy === '') {
          // delete the noProxyIndex in the engineEnv array
          engineEnv.splice(noProxyIndex, 1);
        } else {
          engineEnv[noProxyIndex] = noProxyEnvValue;
        }
      }

      // write the file
      const content = toml.stringify(tomlConfigFile, { newline: '\n' });
      await fs.promises.writeFile(this.getContainersFileLocation(), content);
    }
  }

  protected getContainersFileLocation(): string {
    let podmanConfigContainersPath;

    if (isMac()) {
      podmanConfigContainersPath = path.resolve(os.homedir(), '.config', 'containers');
    } else if (isWindows()) {
      podmanConfigContainersPath = path.resolve(os.homedir(), 'AppData', 'Roaming', 'containers');
    } else if (isLinux()) {
      const xdgRuntimeDirectory = process.env['XDG_RUNTIME_DIR'];
      podmanConfigContainersPath = path.resolve(xdgRuntimeDirectory, 'containers');
    }

    // resolve the containers.conffile path
    return path.resolve(podmanConfigContainersPath, 'containers.conf');
  }

  protected readContainersConfigFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.getContainersFileLocation(), 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
