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

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import type { ProxySettings } from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';
import { Mutex } from 'async-mutex';
import * as toml from 'smol-toml';

import type { RegistryConfiguration } from '/@/configuration/registry-configuration';
import { RegistryConfigurationImpl } from '/@/configuration/registry-configuration';

import { VMTYPE } from './util';

const configurationRosetta = 'setting.rosetta';

/**
 * Manages access to the containers.conf configuration file used to configure Podman
 */
export class PodmanConfiguration {
  private mutex: Mutex = new Mutex();

  #extensionContext: extensionApi.ExtensionContext;
  #registryConfiguration: RegistryConfiguration;

  constructor(extensionContext: extensionApi.ExtensionContext) {
    this.#extensionContext = extensionContext;
    this.#registryConfiguration = new RegistryConfigurationImpl();
  }

  async init(): Promise<void> {
    let httpProxy = undefined;
    let httpsProxy = undefined;
    let noProxy = undefined;

    const disposables = await this.#registryConfiguration.init();
    this.#extensionContext.subscriptions.push(...disposables);

    // we receive an update for the current proxy settings
    extensionApi.proxy.onDidUpdateProxy(async (proxySettings: ProxySettings) => {
      await this.updateProxySettings(proxySettings);
    });

    // in case of proxy being enabled or disabled we need to update the containers.conf file
    extensionApi.proxy.onDidStateChange(async (enabled: boolean) => {
      // eslint-disable-next-line sonarjs/no-selector-parameter
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
        const engineConf = tomlConfigFile.engine;

        // env in engine section
        // env are written like array of key=value ['https_proxy=http://10.0.0.244:9090', 'http_proxy=http://10.0.0.244:9090']
        if (typeof engineConf === 'object' && 'env' in engineConf && engineConf.env && Array.isArray(engineConf.env)) {
          const envArray = engineConf.env;
          envArray.forEach(envVar => {
            if (typeof envVar !== 'string') {
              console.error(`podman configuration env is not a string but ${typeof envVar}: ${envVar}`);
              return;
            }
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
      (httpsProxy ?? httpProxy ?? noProxy)
    ) {
      await extensionApi.proxy.setProxy(proxySettings);
    }

    // If we are on Mac, we need to monitor the configuration file to handle Rosetta changes
    if (extensionApi.env.isMac) {
      extensionApi.configuration.onDidChangeConfiguration(async e => {
        if (e.affectsConfiguration(`podman.${configurationRosetta}`)) {
          await this.handleRosettaSetting();
        }
      });
    }
  }

  async updateProxySettings(proxy: undefined | ProxySettings): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      await this.doUpdateProxySettings(proxy);
    } finally {
      release();
    }
  }

  async handleRosettaSetting(): Promise<void> {
    // If the configuration does not exist, we will default to true
    // if true, when we do updateRosettaSetting, if there is no configuration file, it will do nothing.
    const useRosetta = extensionApi.configuration.getConfiguration('podman').get<boolean>(configurationRosetta) ?? true;
    await this.updateRosettaSetting(useRosetta);
  }

  async isRosettaEnabled(): Promise<boolean> {
    if (fs.existsSync(this.getContainersFileLocation())) {
      // Read the file
      const containersConfigFile = await this.readContainersConfigFile();
      const tomlConfigFile = toml.parse(containersConfigFile);
      const machine = tomlConfigFile.machine;
      if (machine && typeof machine === 'object' && 'rosetta' in machine) {
        const val = machine['rosetta'];
        if (typeof val === 'boolean') {
          return val;
        }
      }
    }
    return true;
  }

  async updateRosettaSetting(useRosetta: boolean): Promise<void> {
    // Initialize an empty configuration file for us to use
    const containersConfContent = {
      containers: {},
      engine: {
        env: [] as string[],
      },
      machine: {},
      network: {},
      secrets: {},
      configmaps: {},
    };

    if (!fs.existsSync(this.getContainersFileLocation())) {
      // File does not exist — create it with the explicit rosetta value
      containersConfContent['machine'] = {
        rosetta: useRosetta,
      };
      const content = toml.stringify(containersConfContent);
      await this.writeNewContainersConfigFile(content);
    } else {
      // Read the file
      const containersConfigFile = await this.readContainersConfigFile();
      const tomlConfigFile = toml.parse(containersConfigFile);

      // Copy over the previous configuration
      if (tomlConfigFile.containers && typeof tomlConfigFile.containers === 'object') {
        containersConfContent['containers'] = tomlConfigFile.containers;
      }
      if (tomlConfigFile.machine && typeof tomlConfigFile.machine === 'object') {
        containersConfContent['machine'] = tomlConfigFile.machine;
      }
      if (tomlConfigFile.network && typeof tomlConfigFile.network === 'object') {
        containersConfContent['network'] = tomlConfigFile.network;
      }
      if (tomlConfigFile.secrets && typeof tomlConfigFile.secrets === 'object') {
        containersConfContent['secrets'] = tomlConfigFile.secrets;
      }
      if (tomlConfigFile.configmaps && typeof tomlConfigFile.configmaps === 'object') {
        containersConfContent['configmaps'] = tomlConfigFile.configmaps;
      }

      // Always write the rosetta value explicitly so that Podman CLI does not
      // have to rely on its own default (which may differ across versions).
      if (containersConfContent['machine']) {
        containersConfContent['machine'] = {
          ...containersConfContent['machine'],
          rosetta: useRosetta,
        };
      }

      // Write the file
      const content = toml.stringify(containersConfContent);
      await fs.promises.writeFile(this.getContainersFileLocation(), content);
    }
  }

  async updateMachineProviderSettings(provider: VMTYPE): Promise<void> {
    // Initialize an empty configuration file for us to use
    const containersConfContent = {
      containers: {},
      engine: {
        env: [] as string[],
      },
      machine: {},
      network: {},
      secrets: {},
      configmaps: {},
    };

    // If the file does NOT exist we will have to create the file and the provider is not Applehv (default one)
    if (provider !== VMTYPE.APPLEHV && !fs.existsSync(this.getContainersFileLocation())) {
      containersConfContent['machine'] = {
        provider: provider,
      };
      const content = toml.stringify(containersConfContent);
      await this.writeNewContainersConfigFile(content);
    } else if (fs.existsSync(this.getContainersFileLocation())) {
      // Read the file
      const containersConfigFile = await this.readContainersConfigFile();
      const tomlConfigFile = toml.parse(containersConfigFile);

      // Copy over the previous configuration
      if (tomlConfigFile.containers && typeof tomlConfigFile.containers === 'object') {
        containersConfContent['containers'] = tomlConfigFile.containers;
      }
      if (tomlConfigFile.machine && typeof tomlConfigFile.machine === 'object') {
        containersConfContent['machine'] = tomlConfigFile.machine;
      }
      if (tomlConfigFile.network && typeof tomlConfigFile.network === 'object') {
        containersConfContent['network'] = tomlConfigFile.network;
      }
      if (tomlConfigFile.secrets && typeof tomlConfigFile.secrets === 'object') {
        containersConfContent['secrets'] = tomlConfigFile.secrets;
      }
      if (tomlConfigFile.configmaps && typeof tomlConfigFile.configmaps === 'object') {
        containersConfContent['configmaps'] = tomlConfigFile.configmaps;
      }

      if (
        containersConfContent['machine'] &&
        'provider' in containersConfContent['machine'] &&
        provider !== VMTYPE.APPLEHV
      ) {
        containersConfContent['machine'] = {
          ...containersConfContent['machine'], // MAKE SURE we copy over the previous configuration
          provider: provider,
        };
      }

      // If provider is applehv, edit containersConfContent['machine'] and remove the provider key if found.
      // this is because provider is applehv by default and we don't need to set it in the file
      if (
        provider === VMTYPE.APPLEHV &&
        containersConfContent['machine'] &&
        'provider' in containersConfContent['machine']
      ) {
        delete containersConfContent['machine']['provider'];
      } else if (provider !== VMTYPE.APPLEHV && containersConfContent['machine']) {
        // If provider key does not exist, we need to add it
        containersConfContent['machine'] = {
          ...containersConfContent['machine'], // MAKE SURE we copy over the previous configuration
          provider: provider,
        };
      }

      // Write the file
      const content = toml.stringify(containersConfContent);
      await fs.promises.writeFile(this.getContainersFileLocation(), content);
    }
  }

  async doUpdateProxySettings(proxySettings: ProxySettings | undefined): Promise<void> {
    // create empty config file
    const containersConfContent = {
      containers: {},
      engine: {
        env: [] as string[],
      },
      machine: {},
      network: {},
      secrets: {},
      configmaps: {},
    };

    if (!fs.existsSync(this.getContainersFileLocation())) {
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
      const content = toml.stringify(containersConfContent);
      await this.writeNewContainersConfigFile(content);
    } else {
      // read the content of the file
      const containersConfigFile = await this.readContainersConfigFile();
      const tomlConfigFile = toml.parse(containersConfigFile);

      // we need to create a ReadonlyTable so that we can write it later, so we copy the content of tomlConfigFile inside containersConfContent
      if (tomlConfigFile.containers && typeof tomlConfigFile.containers === 'object') {
        containersConfContent['containers'] = tomlConfigFile.containers;
      }
      if (tomlConfigFile.machine && typeof tomlConfigFile.machine === 'object') {
        containersConfContent['machine'] = tomlConfigFile.machine;
      }
      if (tomlConfigFile.network && typeof tomlConfigFile.network === 'object') {
        containersConfContent['network'] = tomlConfigFile.network;
      }
      if (tomlConfigFile.secrets && typeof tomlConfigFile.secrets === 'object') {
        containersConfContent['secrets'] = tomlConfigFile.secrets;
      }
      if (tomlConfigFile.configmaps && typeof tomlConfigFile.configmaps === 'object') {
        containersConfContent['configmaps'] = tomlConfigFile.configmaps;
      }

      let engineEnv: string[] = [];
      if (tomlConfigFile.engine && typeof tomlConfigFile.engine === 'object' && 'env' in tomlConfigFile.engine) {
        if (!tomlConfigFile.engine['env']) {
          engineEnv = [];
        } else {
          engineEnv = tomlConfigFile.engine['env'] as string[];
        }
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
      } else if (!proxySettings?.httpsProxy || proxySettings?.httpsProxy === '') {
        // delete the httpsProxyIndex in the engineEnv array
        engineEnv.splice(httpsProxyIndex, 1);
      } else {
        engineEnv[httpsProxyIndex] = httpsProxyEnvValue;
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
      } else if (!proxySettings?.httpProxy || proxySettings?.httpProxy === '') {
        // empty or undefined ? needs to unset
        // delete the httpProxyIndex in the engineEnv array
        engineEnv.splice(httpProxyIndex, 1);
      } else {
        engineEnv[httpProxyIndex] = httpProxyEnvValue;
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
      } else if (!proxySettings?.noProxy || proxySettings?.noProxy === '') {
        // delete the noProxyIndex in the engineEnv array
        engineEnv.splice(noProxyIndex, 1);
      } else {
        engineEnv[noProxyIndex] = noProxyEnvValue;
      }

      containersConfContent['engine'].env = engineEnv;
      // write the file
      const content = toml.stringify(containersConfContent);
      await fs.promises.writeFile(this.getContainersFileLocation(), content);
    }
  }

  async matchRegexpInContainersConfig(regex: RegExp): Promise<boolean> {
    try {
      const containerConf = await this.readContainersConfigFile();
      return regex.test(containerConf);
    } catch (e) {
      console.warn(`Unable to run regex on containers.conf file. Reason: ${String(e)}`);
    }
    return false;
  }

  getContainersFileLocation(): string {
    let podmanConfigContainersPath = '';

    if (extensionApi.env.isMac) {
      podmanConfigContainersPath = path.resolve(os.homedir(), '.config', 'containers');
    } else if (extensionApi.env.isWindows) {
      podmanConfigContainersPath = path.resolve(os.homedir(), 'AppData', 'Roaming', 'containers');
    } else if (extensionApi.env.isLinux) {
      const xdgConfigHome = process.env['XDG_CONFIG_HOME'];
      podmanConfigContainersPath = xdgConfigHome
        ? path.resolve(xdgConfigHome, 'containers')
        : path.resolve(os.homedir(), '.config', 'containers');
    }

    // resolve the containers.conffile path
    return path.resolve(podmanConfigContainersPath, 'containers.conf');
  }

  private async writeNewContainersConfigFile(content: string): Promise<void> {
    const location = this.getContainersFileLocation();
    await fs.promises.mkdir(path.dirname(location), { recursive: true });
    await fs.promises.writeFile(location, content);
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

  // expose RegistryConfiguration interface
  get registryConfiguration(): RegistryConfiguration {
    return this.#registryConfiguration;
  }
}
