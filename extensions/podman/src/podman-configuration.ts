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

import { isLinux, isMac, isWindows } from './util';

export function stringify(table: Record<string, unknown>): string {
  return toml.stringify(table as never, { newline: '\n' });
}

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

export abstract class PropertyPredicate {
  abstract check(value: Record<string, unknown>): boolean;
}

export abstract class RegexBasedPropertyPredicate extends PropertyPredicate {
  check(value: Record<string, unknown>): boolean {
    return this.getRegexPattern().test(stringify(value));
  }

  abstract getRegexPattern(): RegExp;
}

export class HyperVProperty extends RegexBasedPropertyPredicate {
  getRegexPattern(): RegExp {
    return /provider\s*=\s*'hyperv'/;
  }
}

export const hypervProperty = new HyperVProperty();

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
    if (path === undefined) {
      return false;
    }

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

  /**
   * Reads the system-wide Podman configuration and checks if the particular property is set.
   * @param predicate predicate to check the property value.
   * @see {PropertyPredicate}
   * @see {RegexBasedPropertyPredicate}
   * @see {hypervProperty}
   */
  async isPropertySet(predicate: PropertyPredicate): Promise<boolean> {
    const configuration = await this.readConfig();
    return predicate.check(configuration);
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
