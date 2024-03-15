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

import * as fs from 'node:fs';
import * as path from 'node:path';

import type * as containerDesktopAPI from '@podman-desktop/api';

import type { ApiSenderType } from './api.js';
import type { NotificationCardOptions } from './api/notification.js';
import { ConfigurationImpl } from './configuration-impl.js';
import { CONFIGURATION_DEFAULT_SCOPE } from './configuration-registry-constants.js';
import type { Directories } from './directories.js';
import type { Event } from './events/emitter.js';
import { Emitter } from './events/emitter.js';
import { Disposable } from './types/disposable.js';

export type IConfigurationPropertySchemaType =
  | 'markdown'
  | 'string'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'null'
  | 'array'
  | 'object';

export interface IConfigurationChangeEvent {
  key: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
  scope: containerDesktopAPI.ConfigurationScope;
}

export interface IConfigurationPropertyRecordedSchema extends IConfigurationPropertySchema {
  title: string;
  parentId: string;
  extension?: IConfigurationExtensionInfo;
}

export interface IConfigurationPropertySchema {
  id?: string;
  type?: IConfigurationPropertySchemaType | IConfigurationPropertySchemaType[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default?: any;
  description?: string;
  placeholder?: string;
  markdownDescription?: string;
  minimum?: number;
  maximum?: number | string;
  format?: string;
  step?: number;
  scope?: ConfigurationScope | ConfigurationScope[];
  readonly?: boolean;
  // if hidden is true, the property is not shown in the preferences page. It may still appear in other locations if it uses other scope (like onboarding)
  hidden?: boolean;
  enum?: string[];
  when?: string;
}

export type ConfigurationScope =
  | 'DEFAULT'
  | 'ContainerConnection'
  | 'KubernetesConnection'
  | 'ContainerProviderConnectionFactory'
  | 'KubernetesProviderConnectionFactory'
  | 'Onboarding';

export interface IConfigurationExtensionInfo {
  id: string;
}

export interface IConfigurationNode {
  id: string;
  type?: string | string[];
  title: string;
  description?: string;
  properties?: Record<string, IConfigurationPropertySchema>;
  scope?: ConfigurationScope;
  extension?: IConfigurationExtensionInfo;
}

export interface IConfigurationRegistry {
  registerConfigurations(configurations: IConfigurationNode[]): void;
  deregisterConfigurations(configurations: IConfigurationNode[]): void;
  updateConfigurations(configurations: { add: IConfigurationNode[]; remove: IConfigurationNode[] }): void;
  readonly onDidUpdateConfiguration: Event<{ properties: string[] }>;
  readonly onDidChangeConfiguration: Event<IConfigurationChangeEvent>;
  getConfigurationProperties(): Record<string, IConfigurationPropertyRecordedSchema>;
}

export class ConfigurationRegistry implements IConfigurationRegistry {
  private readonly configurationContributors: IConfigurationNode[];
  private readonly configurationProperties: Record<string, IConfigurationPropertyRecordedSchema>;

  private readonly _onDidUpdateConfiguration = new Emitter<{ properties: string[] }>();
  readonly onDidUpdateConfiguration: Event<{ properties: string[] }> = this._onDidUpdateConfiguration.event;

  private readonly _onDidChangeConfiguration = new Emitter<IConfigurationChangeEvent>();
  readonly onDidChangeConfiguration: Event<IConfigurationChangeEvent> = this._onDidChangeConfiguration.event;

  private readonly _onDidChangeConfigurationAPI = new Emitter<containerDesktopAPI.ConfigurationChangeEvent>();
  readonly onDidChangeConfigurationAPI: Event<containerDesktopAPI.ConfigurationChangeEvent> =
    this._onDidChangeConfigurationAPI.event;

  // Contains the value of the current configuration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private configurationValues: Map<string, any>;

  constructor(
    private apiSender: ApiSenderType,
    private directories: Directories,
  ) {
    this.configurationProperties = {};
    this.configurationContributors = [];
    this.configurationValues = new Map();
    this.configurationValues.set(CONFIGURATION_DEFAULT_SCOPE, {});
  }

  protected getSettingsFile(): string {
    // create directory if it does not exist
    return path.resolve(this.directories.getConfigurationDirectory(), 'settings.json');
  }

  public init(): NotificationCardOptions[] {
    const notifications: NotificationCardOptions[] = [];

    const settingsFile = this.getSettingsFile();
    const parentDirectory = path.dirname(settingsFile);
    if (!fs.existsSync(parentDirectory)) {
      fs.mkdirSync(parentDirectory, { recursive: true });
    }
    if (!fs.existsSync(settingsFile)) {
      fs.writeFileSync(settingsFile, JSON.stringify({}));
    }

    const settingsRawContent = fs.readFileSync(settingsFile, 'utf-8');
    let configData: unknown;
    try {
      configData = JSON.parse(settingsRawContent);
    } catch (error) {
      console.error(`Unable to parse ${settingsFile} file`, error);

      const backupFilename = `${settingsFile}.backup-${Date.now()}`;
      // keep original file as a backup
      fs.cpSync(settingsFile, backupFilename);

      // append notification for the user
      notifications.push({
        title: 'Corrupted configuration file',
        body: `Configuration file located at ${settingsFile} was invalid. Created a copy at '${backupFilename}' and started with default settings.`,
        extensionId: 'core',
        type: 'warn',
        highlight: true,
        silent: true,
      });
      configData = {};
    }
    this.configurationValues.set(CONFIGURATION_DEFAULT_SCOPE, configData);
    return notifications;
  }

  public registerConfigurations(configurations: IConfigurationNode[]): Disposable {
    this.doRegisterConfigurations(configurations, true);
    return Disposable.create(() => {
      this.deregisterConfigurations(configurations);
    });
  }

  doRegisterConfigurations(configurations: IConfigurationNode[], notify?: boolean): string[] {
    const properties: string[] = [];
    configurations.forEach(configuration => {
      for (const key in configuration.properties) {
        properties.push(key);
        const configProperty: IConfigurationPropertyRecordedSchema = {
          ...configuration.properties[key],
          title: configuration.title,
          id: key,
          parentId: configuration.id,
        };
        if (configuration.extension) {
          configProperty.extension = { id: configuration.extension?.id };
        }

        // register default if not yet set
        if (
          configProperty.default &&
          this.isDefaultScope(configProperty.scope) &&
          this.configurationValues.get(CONFIGURATION_DEFAULT_SCOPE)[key] === undefined
        ) {
          this.configurationValues.get(CONFIGURATION_DEFAULT_SCOPE)[key] = configProperty.default;
        }
        if (!configProperty.scope) {
          configProperty.scope = CONFIGURATION_DEFAULT_SCOPE;
        }
        this.configurationProperties[key] = configProperty;
      }
      this.configurationContributors.push(configuration);
    });
    if (notify) {
      this._onDidUpdateConfiguration.fire({ properties });
    }
    return properties;
  }

  private isDefaultScope(scope?: ConfigurationScope | ConfigurationScope[]): boolean {
    if (!scope) {
      return true;
    }
    if (Array.isArray(scope) && scope.find(s => s === CONFIGURATION_DEFAULT_SCOPE)) {
      return true;
    }
    return scope === CONFIGURATION_DEFAULT_SCOPE;
  }

  public deregisterConfigurations(configurations: IConfigurationNode[]): void {
    this.doDeregisterConfigurations(configurations, true);
  }

  public doDeregisterConfigurations(configurations: IConfigurationNode[], notify?: boolean): string[] {
    const properties: string[] = [];
    for (const configuration of configurations) {
      if (configuration.properties) {
        for (const key in configuration.properties) {
          properties.push(key);
          delete this.configurationProperties[key];
        }
      }
      const index = this.configurationContributors.indexOf(configuration);
      if (index !== -1) {
        this.configurationContributors.splice(index, 1);
      }
    }
    if (notify) {
      this._onDidUpdateConfiguration.fire({ properties });
    }
    return properties;
  }

  public updateConfigurations({ add, remove }: { add: IConfigurationNode[]; remove: IConfigurationNode[] }): void {
    const properties = [];
    properties.push(...this.doDeregisterConfigurations(remove, false));
    properties.push(...this.doRegisterConfigurations(add, false));
    this._onDidUpdateConfiguration.fire({ properties });
  }

  getConfigurationProperties(): Record<string, IConfigurationPropertyRecordedSchema> {
    return this.configurationProperties;
  }

  async updateConfigurationValue(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    scope?: containerDesktopAPI.ConfigurationScope | containerDesktopAPI.ConfigurationScope[],
  ): Promise<void> {
    if (Array.isArray(scope)) {
      for (const scopeItem of scope) {
        await this.updateSingleScopeConfigurationValue(key, value, scopeItem);
      }
    } else {
      await this.updateSingleScopeConfigurationValue(key, value, scope);
    }

    const affectsConfiguration = function (affectedSection: string, affectedScope?: ConfigurationScope): boolean {
      if (affectedScope) {
        if (Array.isArray(scope) && !scope.find(s => s === affectedScope)) {
          return false;
        }
        if (affectedScope !== scope) {
          return false;
        }
      }
      return key.startsWith(affectedSection);
    };
    this._onDidChangeConfigurationAPI.fire({ affectsConfiguration });
  }

  async updateSingleScopeConfigurationValue(
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    scope?: containerDesktopAPI.ConfigurationScope,
  ): Promise<void> {
    // extract parent key with first name before first . notation
    const parentKey = key.substring(0, key.indexOf('.'));
    // extract child key with first name after first . notation
    const childKey = key.substring(key.indexOf('.') + 1);

    const promise = await this.getConfiguration(parentKey, scope).update(childKey, value);
    if (scope === CONFIGURATION_DEFAULT_SCOPE) {
      this.saveDefault();
    }
    if (!scope) {
      scope = CONFIGURATION_DEFAULT_SCOPE;
    }
    const event = { key, value, scope };
    this._onDidChangeConfiguration.fire(event);
    // notify renderer
    // send only for default scope
    if (scope === CONFIGURATION_DEFAULT_SCOPE) {
      this.apiSender.send('onDidChangeConfiguration', event);
    }
    return promise;
  }

  public saveDefault(): void {
    const cloneConfig = { ...this.configurationValues.get(CONFIGURATION_DEFAULT_SCOPE) };
    // for each key being already the default value, remove the entry
    Object.keys(cloneConfig)
      .filter(key => cloneConfig[key] === this.configurationProperties[key]?.default)
      .filter(key => this.configurationProperties[key]?.type !== 'markdown')
      .forEach(key => {
        delete cloneConfig[key];
      });
    fs.writeFileSync(this.getSettingsFile(), JSON.stringify(cloneConfig, undefined, 2));
  }

  /**
   * Grab the configuration for the given section
   */
  getConfiguration(
    section?: string,
    scope?: containerDesktopAPI.ConfigurationScope,
  ): containerDesktopAPI.Configuration {
    const callback = (scope: containerDesktopAPI.ConfigurationScope): void => {
      if (scope === CONFIGURATION_DEFAULT_SCOPE) {
        this.saveDefault();
      }
    };
    return new ConfigurationImpl(this.apiSender, callback, this.configurationValues, section, scope);
  }

  addConfigurationEnum(key: string, values: string[], valueWhenRemoved: unknown): Disposable {
    const property = this.configurationProperties[key];
    if (property?.enum) {
      property.enum?.push(...values);
      this.apiSender.send('configuration-changed');
    }
    return Disposable.create(() => {
      this.removeConfigurationEnum(key, values, valueWhenRemoved);
    });
  }

  protected removeConfigurationEnum(key: string, values: string[], valueWhenRemoved: unknown): void {
    const property = this.configurationProperties[key];
    if (property) {
      // remove the values from the enum
      property.enum = property.enum?.filter(e => !values.includes(e));

      // if the current value is the enum being removed, need to switch back to the previous element
      // current scope
      const currentValue = this.configurationValues.get(CONFIGURATION_DEFAULT_SCOPE)[key];

      if (values.some(val => val === currentValue)) {
        this.updateConfigurationValue(key, valueWhenRemoved).catch((e: unknown) =>
          console.error(`unable to update default value for the property ${key}`, e),
        );
      }
      this.apiSender.send('configuration-changed');
    }
  }
}
