/**********************************************************************
 * Copyright (C) 2022-2026 Red Hat, Inc.
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
import * as fsPromises from 'node:fs/promises';
import { homedir } from 'node:os';
import * as path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

import type { Event, IAsyncDisposable, IDisposable, NotificationCardOptions } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type {
  ConfigurationScope,
  IConfigurationChangeEvent,
  IConfigurationNode,
  IConfigurationPropertyRecordedSchema,
  IConfigurationPropertySchema,
  IConfigurationRegistry,
} from '@desktop-framework/api/configuration';
import {
  CONFIGURATION_DEFAULT_SCOPE,
  CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE,
  CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE,
} from '@desktop-framework/api/configuration';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { inject, injectable } from 'inversify';

import product from '/@product.json' with { type: 'json' };

import { ConfigurationImpl } from './configuration-impl.js';
import { DefaultConfiguration } from './default-configuration.js';
import { Directories } from './directories.js';
import { Emitter } from './events/emitter.js';
import { LockedKeys } from './lock-configuration.js';
import { LockedConfiguration } from './locked-configuration.js';
import { Disposable } from './types/disposable.js';
import { AtomicFileWriter } from './util/atomic-file-writer.js';

@injectable()
export class ConfigurationRegistry implements IConfigurationRegistry, IAsyncDisposable {
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
  private configurationValues: Map<string, { [key: string]: unknown }>;
  private lockedKeys: LockedKeys;
  #atomicWriter: AtomicFileWriter | undefined;

  constructor(
    @inject(ApiSenderType)
    private apiSender: ApiSenderType,
    @inject(Directories)
    private directories: Directories,
    @inject(DefaultConfiguration)
    private defaultConfiguration: DefaultConfiguration,
    @inject(LockedConfiguration)
    private lockedConfiguration: LockedConfiguration,
  ) {
    this.configurationProperties = {};
    this.configurationContributors = [];
    this.configurationValues = new Map();
    this.configurationValues.set(CONFIGURATION_DEFAULT_SCOPE, {});
    this.configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, {});
    this.configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, {});
    this.lockedKeys = new LockedKeys(this.configurationValues);
  }

  protected getSettingsFile(): string {
    // create directory if it does not exist
    return path.resolve(this.directories.getConfigurationDirectory(), 'settings.json');
  }

  public async init(): Promise<NotificationCardOptions[]> {
    const notifications: NotificationCardOptions[] = [];

    const settingsFile = this.getSettingsFile();
    const parentDirectory = path.dirname(settingsFile);

    // Ensure the parent directory exists, we will use .access as the "best" way to check if the directory first exists
    // this is different vs non-async functions such as fs.existsSync as well as mkdirSync / writeFileSync
    try {
      await fsPromises.access(parentDirectory);
    } catch {
      await fsPromises.mkdir(parentDirectory, { recursive: true });
    }

    // We will create a "standard" empty settings.json file if the file we are trying to access does not exist.
    try {
      await fsPromises.access(settingsFile);
    } catch {
      await fsPromises.writeFile(settingsFile, JSON.stringify({}));
    }

    const settingsRawContent = await fsPromises.readFile(settingsFile, 'utf-8');
    let configData: { [key: string]: unknown };
    try {
      configData = JSON.parse(settingsRawContent);
    } catch (error) {
      console.error(`Unable to parse ${settingsFile} file`, error);

      const backupFilename = `${settingsFile}.backup-${Date.now()}`;
      // keep original file as a backup
      await fsPromises.copyFile(settingsFile, backupFilename);

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

    // Load managed defaults
    const defaults = await this.defaultConfiguration.getContent();
    this.configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_DEFAULTS_SCOPE, defaults);

    // Load managed locked
    const locked = await this.lockedConfiguration.getContent();
    this.configurationValues.set(CONFIGURATION_SYSTEM_MANAGED_LOCKED_SCOPE, locked);

    // Apply managed defaults to user config for any undefined keys
    // that have not been set yet in the local settings.json
    const listOfAppliedKeys = this.applyManagedDefaults(configData, defaults);

    // Set the updated configuration data, this doesn't "save-to-disk" yet until we run saveDefault()...
    this.configurationValues.set(CONFIGURATION_DEFAULT_SCOPE, configData);

    this.#atomicWriter = new AtomicFileWriter(settingsFile, () => {
      const cloneConfig = { ...this.configurationValues.get(CONFIGURATION_DEFAULT_SCOPE) };
      // for each key being already the default value, remove the entry
      Object.keys(cloneConfig)
        .filter(key => isDeepStrictEqual(cloneConfig[key], this.configurationProperties[key]?.default))
        .filter(key => this.configurationProperties[key]?.type !== 'markdown')
        .forEach(key => {
          delete cloneConfig[key];
        });
      return JSON.stringify(cloneConfig, undefined, 2);
    });

    // Note: saveDefault() will filter out any keys that match the schema default, so only non-default values will actually be persisted to settings.json
    if (listOfAppliedKeys.length > 0) {
      this.saveDefault();
    }

    return notifications;
  }

  /**
   * Apply default settings from default-settings.json (object) to user config (settings.json) (also an object being passed in),
   * and mutably update the object.
   * @returns array of keys that were applied to configData (useful for testing and debugging purposes)
   */
  protected applyManagedDefaults(configData: Record<string, unknown>, defaults: Record<string, unknown>): string[] {
    const appliedKeys: string[] = [];

    // Keeping it simple here by iterating over the default keys
    // and applying it to any undefined keys in the user config.
    // we do NOT do any deep merging of objects here, as we are only interested if there is a
    // top-level key that is undefined in the user config, and then copy over the configuration default.
    for (const key of Object.keys(defaults)) {
      if (configData[key] === undefined) {
        configData[key] = defaults[key];
        appliedKeys.push(key);
      }
    }

    // We concatenate the applied keys into one console.log so we don't spam the console,
    // this is only shown once when initialized / copy over the keys, but does not subsequently log
    // after each startup.
    if (appliedKeys.length > 0) {
      console.log(`[Managed-by]: Applied default settings for: ${appliedKeys.join(', ')}`);
    }
    return appliedKeys;
  }

  /**
   * Register a configuration
   * @param configurations
   * @return the {@link Disposable} object provided **delete** definitely the value from the settings.
   */
  public registerConfigurations(configurations: IConfigurationNode[]): IDisposable {
    this.doRegisterConfigurations(configurations, true);
    return Disposable.create(() => {
      this.deregisterConfigurations(configurations);
    });
  }

  doRegisterConfigurations(configurations: IConfigurationNode[], notify?: boolean): string[] {
    const properties: string[] = [];

    // Get all the locked keys at the start to avoid multiple lookups
    const lockedSet = this.lockedKeys.getAllKeys();

    const productConfigurationsProperties = (product.configuration.override ?? {}) as {
      [key: string]: Partial<IConfigurationPropertySchema>;
    };

    // biome-ignore lint/complexity/noForEach: <explanation>
    configurations.forEach(configuration => {
      for (const key in configuration.properties) {
        properties.push(key);
        const productConfigProperties = productConfigurationsProperties[key];
        const configProperty: IConfigurationPropertyRecordedSchema = {
          ...configuration.properties[key],
          ...productConfigProperties,
          title: configuration.title,
          id: key,
          parentId: configuration.id,
          locked: lockedSet.has(key),
        };
        if (configuration.extension) {
          configProperty.extension = { id: configuration.extension?.id };
        }

        // Resolve declarative defaults (env:/file: arrays) at registration time
        configProperty.default = this.resolveDeclarativeDefault(configProperty.default);

        // register default if not yet set
        const configurationValue = this.configurationValues.get(CONFIGURATION_DEFAULT_SCOPE);
        if (configurationValue !== undefined) {
          if (
            configProperty.default !== undefined &&
            this.isDefaultScope(configProperty.scope) &&
            configurationValue[key] === undefined
          ) {
            configurationValue[key] = configProperty.default;
          }
        }
        configProperty.scope ??= CONFIGURATION_DEFAULT_SCOPE;
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

  /**
   * Resolve declarative default values declared as `env:` / `file:` entries.
   * Supports both a single string (`"default": "env:VAR"`) and an ordered
   * array (`"default": ["env:VAR", "file:~/.path"]`).
   * Returns the first matching value, or `undefined` if none resolve.
   * Non-declarative defaults (literals, object arrays, etc.) are returned unchanged.
   */
  protected resolveDeclarativeDefault(defaultValue: unknown): unknown {
    // Single string form: "default": "env:VAR" or "default": "file:~/.path"
    if (typeof defaultValue === 'string' && (defaultValue.startsWith('env:') || defaultValue.startsWith('file:'))) {
      return this.resolveDeclarativeDefaultEntry(defaultValue);
    }

    if (!Array.isArray(defaultValue) || defaultValue.length === 0) {
      return defaultValue;
    }

    // Only treat as declarative when every entry is an env: or file: string
    if (
      !defaultValue.every(
        (entry): entry is string =>
          typeof entry === 'string' && (entry.startsWith('env:') || entry.startsWith('file:')),
      )
    ) {
      return defaultValue;
    }

    for (const entry of defaultValue) {
      const resolved = this.resolveDeclarativeDefaultEntry(entry);
      if (resolved !== undefined) {
        return resolved;
      }
    }
    return undefined;
  }

  protected resolveDeclarativeDefaultEntry(entry: string): string | undefined {
    if (entry.startsWith('env:')) {
      const varName = entry.slice('env:'.length);
      if (!varName) {
        return undefined;
      }
      const value = process.env[varName];
      if (value !== undefined && value !== '') {
        return value;
      }
      return undefined;
    }

    if (entry.startsWith('file:')) {
      const pathSpec = entry.slice('file:'.length);
      if (!pathSpec) {
        return undefined;
      }
      const expanded = this.expandPath(pathSpec);
      if (expanded && fs.existsSync(expanded)) {
        return expanded;
      }
      return undefined;
    }

    return undefined;
  }

  /**
   * Expand `~` (home directory) and `$VAR` environment variables in a path string.
   * Returns `undefined` if any referenced `$VAR` is unset or empty, so we never
   * check a truncated path like `/gcloud/creds.json` when `$APPDATA` is missing.
   */
  protected expandPath(pathSpec: string): string | undefined {
    let result = pathSpec;

    if (result === '~') {
      result = homedir();
    } else if (result.startsWith('~/') || result.startsWith('~\\')) {
      result = path.join(homedir(), result.slice(2));
    }

    let unsetVariable = false;
    result = result.replace(/\$([A-Za-z_]\w*)/g, (_match, name: string) => {
      const value = process.env[name];
      if (value === undefined || value === '') {
        unsetVariable = true;
        return '';
      }
      return value;
    });

    if (unsetVariable) {
      return undefined;
    }

    return result;
  }

  /**
   * This method remove the configuration value from the settings definitely
   * @remarks this would lose the value provided by the user
   * @param configurations
   */
  public deregisterConfigurations(configurations: IConfigurationNode[]): void {
    this.doDeregisterConfigurations(configurations, true);
  }

  /**
   * This method remove the configuration value from the settings definitely
   * @remarks this would lose the value provided by the user
   * @param configurations
   * @param notify
   */
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
    value: unknown,
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
    value: unknown,
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
    scope ??= CONFIGURATION_DEFAULT_SCOPE;
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
    this.#atomicWriter?.schedule();
  }

  async asyncDispose(): Promise<void> {
    await this.#atomicWriter?.asyncDispose();
  }

  /**
   * Grab the configuration for the given section
   */
  getConfiguration(
    section?: string,
    scope?: containerDesktopAPI.ConfigurationScope,
  ): containerDesktopAPI.Configuration {
    const callback = (sectionName: string, scope: containerDesktopAPI.ConfigurationScope): void => {
      if (scope === CONFIGURATION_DEFAULT_SCOPE) {
        this.saveDefault();
      }
      // perform notification in case of the update
      this._onDidUpdateConfiguration.fire({ properties: [sectionName] });
    };
    return new ConfigurationImpl(this.apiSender, callback, this.configurationValues, section, scope);
  }

  addConfigurationEnum(key: string, values: string[], valueWhenRemoved: unknown): Disposable {
    const property = this.configurationProperties[key];
    if (property?.enum) {
      property.enum?.push(...values);
      this.apiSender.send('configuration-changed', { key, value: property.enum });
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
      const currentValue = this.configurationValues.get(CONFIGURATION_DEFAULT_SCOPE)?.[key];

      if (values.some(val => val === currentValue)) {
        this.updateConfigurationValue(key, valueWhenRemoved).catch((e: unknown) =>
          console.error(`unable to update default value for the property ${key}`, e),
        );
      }
      this.apiSender.send('configuration-changed', { key, value: property.enum });
    }
  }
}
