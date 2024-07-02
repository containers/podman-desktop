/**********************************************************************
 * Copyright (C) 2022-2024 Red Hat, Inc.
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
import extensionApi, { type ProxySettings } from '@podman-desktop/api';

import type { PodmanConfiguration } from './podman-configuration';
import { isMac } from './util';

const configurationRosetta = 'setting.rosetta';

export class ProxyConfigurationHandler {
  async registerHandler(podmanConfiguration: PodmanConfiguration): Promise<void> {
    // we receive an update for the current proxy settings
    extensionApi.proxy.onDidUpdateProxy(async (proxySettings: ProxySettings) => {
      await this.updateProxySetting(proxySettings, podmanConfiguration);
    });

    // in case of proxy being enabled or disabled we need to update the containers.conf file
    extensionApi.proxy.onDidStateChange(async (enabled: boolean) => {
      if (enabled) {
        const updatedProxySettings = extensionApi.proxy.getProxySettings();
        await this.updateProxySetting(updatedProxySettings, podmanConfiguration);
      } else {
        await this.updateProxySetting(undefined, podmanConfiguration);
      }
    });

    const proxySettings = await this.getProxySetting(podmanConfiguration);

    // register the proxy if there is no proxy settings for now
    if (
      extensionApi.proxy.getProxySettings() === undefined &&
      extensionApi.proxy.isEnabled() &&
      (proxySettings.httpsProxy || proxySettings.httpProxy || proxySettings.noProxy)
    ) {
      await extensionApi.proxy.setProxy(proxySettings);
    }

    // If we are on Mac, we need to monitor the configuration file to handle Rosetta changes
    if (isMac()) {
      extensionApi.configuration.onDidChangeConfiguration(async e => {
        if (e.affectsConfiguration(`podman.${configurationRosetta}`)) {
          await this.handleRosettaSetting(podmanConfiguration);
        }
      });
    }
  }

  protected async handleRosettaSetting(podmanConfiguration: PodmanConfiguration): Promise<void> {
    // If the configuration does not exist, we will default to true
    // if true, when we do updateRosettaSetting, if there is no configuration file, it will do nothing.
    const useRosetta = extensionApi.configuration.getConfiguration('podman').get<boolean>(configurationRosetta) ?? true;
    await this.updateRosettaSetting(useRosetta, podmanConfiguration);
  }

  protected async updateRosettaSetting(useRosetta: boolean, podmanConfiguration: PodmanConfiguration): Promise<void> {
    let tomlConfigFile: Record<string, unknown>;
    try {
      tomlConfigFile = await podmanConfiguration.readUserConfig();
    } catch (e) {
      tomlConfigFile = {};
    }

    if (typeof tomlConfigFile.machine !== 'object' || tomlConfigFile.machine === undefined) {
      tomlConfigFile.machine = {};
    }

    const machineConfig = tomlConfigFile.machine as Record<string, unknown>;

    if (useRosetta) {
      // rosetta true by default, removing property from the configuration activates the parameter
      delete machineConfig.rosetta;

      // no need to store empty object
      if (Object.keys(machineConfig).length === 0) {
        delete tomlConfigFile.machine;
      }
    } else {
      machineConfig['rosetta'] = false as boolean;
    }

    await podmanConfiguration.writeUserConfig(tomlConfigFile);
  }

  protected async getProxySetting(podmanConfiguration: PodmanConfiguration): Promise<ProxySettings> {
    let httpProxy = undefined;
    let httpsProxy = undefined;
    let noProxy = undefined;

    try {
      const tomlConfigFile = await podmanConfiguration.readUserConfig();
      if (tomlConfigFile.engine && typeof tomlConfigFile.engine === 'object') {
        const engineConfig = tomlConfigFile.engine as Record<string, unknown>;

        // env in engine section
        // env are written like array of key=value ['https_proxy=http://10.0.0.244:9090', 'http_proxy=http://10.0.0.244:9090']
        if (engineConfig.env && Array.isArray(engineConfig.env)) {
          const envArray: string[] = engineConfig.env;
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
    } catch (e) {
      console.warn(`Failed to process podman user configuration: ${(e as unknown as Error).message}`);
    }

    return {
      httpProxy,
      httpsProxy,
      noProxy,
    } as ProxySettings;
  }

  protected async updateProxySetting(
    proxySettings: ProxySettings | undefined,
    podmanConfiguration: PodmanConfiguration,
  ): Promise<void> {
    let tomlConfigFile: Record<string, unknown>;
    try {
      tomlConfigFile = await podmanConfiguration.readUserConfig();
    } catch (e) {
      tomlConfigFile = {};
    }

    if (typeof tomlConfigFile.engine !== 'object' || tomlConfigFile.engine === undefined) {
      tomlConfigFile.engine = {};
    }

    const engineConfig = tomlConfigFile.engine as Record<string, unknown>;

    let engineEnv: string[];
    if (!Array.isArray(engineConfig['env'])) {
      engineEnv = [];
      engineConfig['env'] = engineEnv;
    } else {
      engineEnv = engineConfig['env'] as string[];
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
    await podmanConfiguration.writeUserConfig(tomlConfigFile);
  }
}
