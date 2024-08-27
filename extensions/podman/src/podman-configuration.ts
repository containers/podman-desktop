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

import type { PathLike } from 'node:fs';
import * as fs from 'node:fs';
import { promises as fsPromises } from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { resolve } from 'node:path';

import toml from '@ltd/j-toml';
import type { ProxySettings } from '@podman-desktop/api';
import extensionApi from '@podman-desktop/api';

import { isLinux, isMac, isWindows } from './util';

export function merge(source: Record<string, unknown>, target: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = { ...source };

  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key)) {
      if (typeof target[key] === 'object' && !Array.isArray(target[key]) && target[key] !== undefined) {
        if (typeof result[key] === 'object' && !Array.isArray(result[key]) && result[key] !== undefined) {
          result[key] = merge(result[key] as Record<string, unknown>, target[key] as Record<string, unknown>);
        } else {
          result[key] = { ...(target[key] as Record<string, unknown>) };
        }
      } else {
        result[key] = target[key];
      }
    }
  }

  return result;
}

/**
 * Provides the ability to operate with system-wide and user based Podman properties file.
 * There is a particular implementation for each supported os. Not intended to be directly created.
 * @see {PodmanConfigurationProvider}
 * @see {DarwinPodmanConfiguration}
 * @see {LinuxPodmanConfiguration}
 * @see {WindowsPodmanConfiguration}
 */
export abstract class PodmanConfiguration {
  protected configPath = path.join('containers', 'containers.conf');
  protected userOverrideContainersConfig = path.join('.config', this.configPath);

  protected userConfigPath(): PathLike {
    const xdgRuntimeDir: PathLike | undefined = process.env.XDG_RUNTIME_DIR;
    if (xdgRuntimeDir !== undefined) {
      const xdgConfigPath = path.join(xdgRuntimeDir, this.configPath);
      if (this.isValid(xdgConfigPath)) {
        return xdgConfigPath;
      }
    }

    return path.join(os.homedir(), this.userOverrideContainersConfig);
  }

  protected abstract defaultContainersConfig(): PathLike;

  protected abstract overrideContainersConfigPath(): PathLike;

  protected async systemConfigs(): Promise<PathLike[]> {
    const configs: PathLike[] = [];

    let path: PathLike | undefined = process.env.CONTAINERS_CONF;
    if (path) {
      const resolvedPath = resolve(path);
      try {
        await fsPromises.access(resolvedPath);
        configs.push(resolvedPath);
      } catch (e) {
        throw new Error(`${resolvedPath} file: ${(e as unknown as Error).message}`);
      }
    }

    path = this.defaultContainersConfig();
    if (this.isValid(path)) {
      configs.push(path);
    }

    path = this.overrideContainersConfigPath();
    configs.push(path);

    configs.push(...(await this.addConfigs(path + '.d')));

    path = this.userConfigPath();
    configs.push(path);

    configs.push(...(await this.addConfigs(path + '.d')));

    // Remove duplicates while preserving order
    return Array.from(new Map(configs.map(p => [p.toString(), p])).values());
  }

  protected async addConfigs(dirPath: PathLike): Promise<PathLike[]> {
    const newConfigs: PathLike[] = [];

    const entries = await fsPromises.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = path.join(dirPath.toString(), entry.name);

      if (entry.isFile() && entry.name.endsWith('.conf')) {
        newConfigs.push(entryPath);
      }
    }

    newConfigs.sort();
    return newConfigs;
  }

  protected isValid(path: PathLike): boolean {
    return !(typeof path === 'string' && path.trim() === '');
  }

  /**
   * Read the system-wide Podman configuration files and merge them into one configuration table.
   */
  async readConfig(): Promise<Record<string, unknown>> {
    let baseConfig = {} as Record<string, unknown>;

    const configs = await this.systemConfigs();
    for (const path of configs) {
      const config = await this.readConfigFromFile(path);
      baseConfig = merge(baseConfig, config);
      console.info(`Merged system config ${path}`);
    }

    return baseConfig;
  }

  /**
   * Read the user based Podman configuration.
   */
  async readUserConfig(): Promise<Record<string, unknown>> {
    const configPath = this.userConfigPath();
    return await this.readConfigFromFile(configPath);
  }

  /**
   * Writes the user based Podman configuration.
   * @param config the configuration to be serialized into a file content in Toml format.
   */
  async writeUserConfig(config: Record<string, unknown>): Promise<void> {
    const configPath = this.userConfigPath();
    await this.writeConfigToFile(configPath, config);
  }

  protected async readConfigFromFile(path: PathLike): Promise<Record<string, unknown>> {
    console.info(`Reading configuration file: ${path}`);
    const configFileContent = await fsPromises.readFile(path, 'utf8');
    return toml.parse(configFileContent, { bigint: false });
  }

  protected async writeConfigToFile(path: PathLike, config: Record<string, unknown>): Promise<void> {
    console.info(`Writing configuration file: ${path}`);
    const content = toml.stringify(config as never, { newline: '\n' });
    await fs.promises.writeFile(path, content);
  }
}

export class DarwinPodmanConfiguration extends PodmanConfiguration {
  defaultContainersConfig(): PathLike {
    return path.join('/usr/share', this.configPath);
  }

  overrideContainersConfigPath(): PathLike {
    return path.join('/usr/local/etc', this.configPath);
  }
}

export class LinuxPodmanConfiguration extends PodmanConfiguration {
  defaultContainersConfig(): PathLike {
    return path.join('/usr/share', this.configPath);
  }

  overrideContainersConfigPath(): PathLike {
    return path.join('/usr/local/etc', this.configPath);
  }
}

export class WindowsPodmanConfiguration extends PodmanConfiguration {
  defaultContainersConfig(): PathLike {
    return '';
  }

  overrideContainersConfigPath(): PathLike {
    return path.join(process.env.PROGRAMDATA ?? '', this.configPath);
  }

  userConfigPath(): PathLike {
    return path.join(process.env.APPDATA ?? '', this.configPath);
  }
}

/**
 * Main entry point ot operate with the Podman configuration.
 * @see {PodmanConfiguration}
 */
export class PodmanConfigurationProvider {
  protected config: PodmanConfiguration | undefined;

  getConfiguration(): PodmanConfiguration {
    if (this.config !== undefined) {
      return this.config;
    }

    if (isMac()) {
      this.config = new DarwinPodmanConfiguration();
    } else if (isWindows()) {
      this.config = new WindowsPodmanConfiguration();
    } else if (isLinux()) {
      this.config = new LinuxPodmanConfiguration();
    } else {
      throw new Error('Operation system is not supported.');
    }

    return this.config;
  }
}

export class RosettaConfiguration {
  readonly configurationRosetta = 'setting.rosetta';

  constructor(private podmanConfiguration: PodmanConfiguration) {
    // If we are on Mac, we need to monitor the configuration file to handle Rosetta changes
    if (isMac()) {
      extensionApi.configuration.onDidChangeConfiguration(async e => {
        if (e.affectsConfiguration(`podman.${this.configurationRosetta}`)) {
          await this.handleRosettaSetting();
        }
      });
    }
  }

  async isRosettaEnabled(): Promise<boolean> {
    let tomlConfigFile: Record<string, unknown>;
    try {
      tomlConfigFile = await this.podmanConfiguration.readUserConfig();
    } catch (e) {
      return true;
    }

    if (typeof tomlConfigFile.machine !== 'object' || tomlConfigFile.machine === undefined) {
      return true;
    }

    const machineConfig = tomlConfigFile.machine as Record<string, unknown>;

    if ('rosetta' in machineConfig) {
      const val = machineConfig['rosetta'];
      if (typeof val === 'boolean') {
        return val;
      }
    }

    return true;
  }

  async updateRosettaSetting(useRosetta: boolean): Promise<void> {
    let tomlConfigFile: Record<string, unknown>;
    try {
      tomlConfigFile = await this.podmanConfiguration.readUserConfig();
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

    await this.podmanConfiguration.writeUserConfig(tomlConfigFile);
  }

  protected async handleRosettaSetting(): Promise<void> {
    // If the configuration does not exist, we will default to true
    // if true, when we do updateRosettaSetting, if there is no configuration file, it will do nothing.
    const useRosetta =
      extensionApi.configuration.getConfiguration('podman').get<boolean>(this.configurationRosetta) ?? true;
    await this.updateRosettaSetting(useRosetta);
  }
}

export class ProxyConfiguration {
  constructor(private podmanConfiguration: PodmanConfiguration) {}

  async registerHandlers(): Promise<void> {
    // we receive an update for the current proxy settings
    extensionApi.proxy.onDidUpdateProxy(async (proxySettings: ProxySettings) => {
      await this.updateProxySetting(proxySettings);
    });

    // in case of proxy being enabled or disabled we need to update the containers.conf file
    extensionApi.proxy.onDidStateChange(async (enabled: boolean) => {
      if (enabled) {
        const updatedProxySettings = extensionApi.proxy.getProxySettings();
        await this.updateProxySetting(updatedProxySettings);
      } else {
        await this.updateProxySetting(undefined);
      }
    });

    const proxySettings = await this.getProxySetting();

    // register the proxy if there is no proxy settings for now
    if (
      extensionApi.proxy.getProxySettings() === undefined &&
      extensionApi.proxy.isEnabled() &&
      (proxySettings.httpsProxy || proxySettings.httpProxy || proxySettings.noProxy)
    ) {
      await extensionApi.proxy.setProxy(proxySettings);
    }
  }

  async getProxySetting(): Promise<ProxySettings> {
    let httpProxy = undefined;
    let httpsProxy = undefined;
    let noProxy = undefined;

    try {
      const tomlConfigFile = await this.podmanConfiguration.readUserConfig();
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

  async updateProxySetting(proxySettings: ProxySettings | undefined): Promise<void> {
    let tomlConfigFile: Record<string, unknown>;
    try {
      tomlConfigFile = await this.podmanConfiguration.readUserConfig();
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
    await this.podmanConfiguration.writeUserConfig(tomlConfigFile);
  }
}

export class HyperVConfiguration {
  constructor(private podmanConfiguration: PodmanConfiguration) {}

  async isHyperVEnabled(): Promise<boolean> {
    let tomlConfigFile: Record<string, unknown>;
    try {
      tomlConfigFile = await this.podmanConfiguration.readConfig();
    } catch (e) {
      return false;
    }

    if (typeof tomlConfigFile.machine !== 'object' || tomlConfigFile.machine === undefined) {
      return false;
    }

    const machineConfig = tomlConfigFile.machine as Record<string, unknown>;

    if ('provider' in machineConfig) {
      const val = machineConfig['provider'];
      if (typeof val === 'string') {
        return val === 'hyperv';
      }
    }

    return false;
  }
}
