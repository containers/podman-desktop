/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ExtensionDevelopmentFolderInfo } from '@desktop-framework/api';
import { ExtensionDevelopmentFolderInfoSettings } from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import { type IConfigurationNode, IConfigurationRegistry } from '@desktop-framework/api/configuration';
import { inject, injectable } from 'inversify';

import { Emitter } from '/@/plugin/events/emitter.js';

import { type AnalyzedExtension, ExtensionAnalyzer } from './extension-analyzer.js';

// Handle the registration / track of all development folders used when developing extensions
@injectable()
export class ExtensionDevelopmentFolders {
  #configurationRegistry: IConfigurationRegistry;

  #apiSender: ApiSenderType;

  #firstLaunch = true;

  #developmentFolders: string[] = [];

  #extensionAnalyzer: ExtensionAnalyzer;

  #externalExtensionIds: string[] = [];

  // event that will be fired
  #onDidUpdateDevelopmentFolders: Emitter<ExtensionDevelopmentFolderInfo[]> = new Emitter<
    ExtensionDevelopmentFolderInfo[]
  >();
  onDidUpdateDevelopmentFolders = this.#onDidUpdateDevelopmentFolders.event;

  // event that will be fired when an extension needs to be loaded
  #onRequestLoadExension: Emitter<AnalyzedExtension> = new Emitter<AnalyzedExtension>();
  onNeedToLoadExension = this.#onRequestLoadExension.event;

  constructor(
    @inject(IConfigurationRegistry)
    configurationRegistry: IConfigurationRegistry,
    @inject(ExtensionAnalyzer)
    extensionAnalyzer: ExtensionAnalyzer,
    @inject(ApiSenderType)
    apiSender: ApiSenderType,
  ) {
    this.#configurationRegistry = configurationRegistry;
    this.#extensionAnalyzer = extensionAnalyzer;
    this.#apiSender = apiSender;
  }

  protected refreshFolders(): void {
    const updatedFolders = this.#configurationRegistry
      .getConfiguration(ExtensionDevelopmentFolderInfoSettings.SectionName)
      .get<string[]>(ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders, []);

    // first launch ? send the initial value as well
    // or when value is being changed
    if (this.#firstLaunch || JSON.stringify(this.#developmentFolders) !== JSON.stringify(updatedFolders)) {
      this.#developmentFolders = updatedFolders;
      this.#onDidUpdateDevelopmentFolders.fire(this.getDevelopmentFolders());
    }
  }

  init(): void {
    const developmentExtensionsFoldersConfiguration: IConfigurationNode = {
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [`${ExtensionDevelopmentFolderInfoSettings.SectionName}.${ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders}`]:
          {
            description: 'List of extension folders to monitor',
            type: 'array',
            default: [],
            hidden: true,
          },
      },
    };
    this.#configurationRegistry.registerConfigurations([developmentExtensionsFoldersConfiguration]);

    // refresh the value when the property is changed
    this.#configurationRegistry.onDidChangeConfiguration(event => {
      if (
        event.key ===
        `${ExtensionDevelopmentFolderInfoSettings.SectionName}.${ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders}`
      ) {
        this.refreshFolders();
      }
    });

    // initialize and track all development folders
    this.refreshFolders();

    this.#firstLaunch = false;
  }

  protected async saveToConfiguration(): Promise<void> {
    await this.#configurationRegistry
      .getConfiguration(ExtensionDevelopmentFolderInfoSettings.SectionName)
      .update(ExtensionDevelopmentFolderInfoSettings.DevelopmentExtensionsFolders, this.#developmentFolders);

    // send an event to refresh the value
    this.#apiSender.send('extensions-development-folders-changed');
  }

  async addDevelopmentFolder(path: string): Promise<void> {
    // check the path is not already in the list
    if (this.#developmentFolders.includes(path)) {
      throw new Error(`Path ${path} already exist in the list`);
    }

    // before adding the path, check it's a valid extension path
    const analyzedExtension = await this.#extensionAnalyzer.analyzeExtension({
      extensionPath: path,
      removable: false,
      devMode: true,
    });
    // if there is an error, abort
    if (analyzedExtension.error) {
      throw new Error(analyzedExtension.error);
    }

    // check if "podman-desktop" is listed as engine
    if (analyzedExtension.manifest?.engines?.['podman-desktop'] === undefined) {
      throw new Error(
        `Extension with id ${analyzedExtension.id} is not compatible with Podman Desktop. It requires 'podman-desktop' engine.`,
      );
    }

    // if there is a file, check if the file is present
    if (
      analyzedExtension.manifest.main &&
      existsSync(resolve(analyzedExtension.path, analyzedExtension.manifest.main)) === false
    ) {
      throw new Error(
        `Extension with id ${analyzedExtension.id} is not ready. The main file ${analyzedExtension.manifest.main} referenced by the package.json file does not exist. Maybe Extension is not built / in watch mode ?`,
      );
    }

    // if the extension is already part of the loader, avoid the loading
    if (this.#externalExtensionIds.includes(analyzedExtension.id)) {
      throw new Error(
        `Extension with id ${analyzedExtension.id} is already loaded globally. It cannot be added as a development folder.`,
      );
    }

    this.#developmentFolders.push(path);

    // persist the changes
    await this.saveToConfiguration();
    this.#onDidUpdateDevelopmentFolders.fire(this.getDevelopmentFolders());

    // ask to load the extension
    this.#onRequestLoadExension.fire(analyzedExtension);
  }

  async removeDevelopmentFolder(path: string): Promise<void> {
    this.#developmentFolders = this.#developmentFolders.filter(folder => folder !== path);

    // persist the changes
    await this.saveToConfiguration();

    // dispatch
    this.#onDidUpdateDevelopmentFolders.fire(this.getDevelopmentFolders());
  }

  getDevelopmentFolders(): ExtensionDevelopmentFolderInfo[] {
    return this.#developmentFolders.map(path => ({ path }));
  }

  addExternalExtensionId(extensionId: string): void {
    if (!this.#externalExtensionIds.includes(extensionId)) {
      this.#externalExtensionIds.push(extensionId);
    }
  }
  removeExternalExtensionId(extensionId: string): void {
    this.#externalExtensionIds = this.#externalExtensionIds.filter(id => id !== extensionId);
  }
}
