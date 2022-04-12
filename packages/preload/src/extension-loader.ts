/**********************************************************************
 * Copyright (C) 2022 Red Hat, Inc.
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

import type * as containerDesktopAPI from '@tmpwip/extension-api';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import type { CommandRegistry } from './command-registry';
import type { ExtensionInfo } from './api/extension-info';
import * as zipper from 'zip-local';
import type { TrayMenuRegistry } from './tray-menu-registry';
import { Disposable } from './types/disposable';
import type { ProviderRegistry } from './provider-registry';
import type { ConfigurationRegistry } from './configuration-registry';

/**
 * Handle the loading of an extension
 */

export interface AnalyzedExtension {
  id: string;
  // root folder (where is package.json)
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  // main entry
  mainPath: string;
  api: typeof containerDesktopAPI;
}

export interface ActivatedExtension {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deactivateFunction: any;
  extensionContext: containerDesktopAPI.ExtensionContext;
}

export class ExtensionLoader {
  private overrideRequireDone = false;

  private activatedExtensions = new Map<string, ActivatedExtension>();
  private analyzedExtensions = new Map<string, AnalyzedExtension>();

  constructor(
    private commandRegistry: CommandRegistry,
    private providerRegistry: ProviderRegistry,
    private configurationRegistry: ConfigurationRegistry,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private apiSender: any,
    private trayMenuRegistry: TrayMenuRegistry,
  ) {}

  async listExtensions(): Promise<ExtensionInfo[]> {
    return Array.from(this.analyzedExtensions.values()).map(extension => ({
      name: extension.manifest.name,
      displayName: extension.manifest.displayName,
      version: extension.manifest.version,
      publisher: extension.manifest.publisher,
      state: this.activatedExtensions.get(extension.id) ? 'active' : 'inactive',
      id: extension.id,
    }));
  }

  protected overrideRequire() {
    if (!this.overrideRequireDone) {
      this.overrideRequireDone = true;
      const module = require('module');
      // save original load method
      const internalLoad = module._load;
      const analyzedExtensions = this.analyzedExtensions;

      // if we try to resolve theia module, return the filename entry to use cache.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      module._load = function (request: string, parent: any): any {
        if (request !== '@tmpwip/extension-api') {
          console.log('loading...', request, parent);
          // eslint-disable-next-line prefer-rest-params
          return internalLoad.apply(this, arguments);
        }
        console.log('in require function, loading with parent', parent.filename);

        const extension = Array.from(analyzedExtensions.values()).find(extension =>
          path.normalize(parent.filename).startsWith(path.normalize(extension.path)),
        );
        if (extension && extension.api) {
          return extension.api;
        }
        throw new Error('Unable to find extension API');
      };
    }
  }

  async loadPackagedFile(filePath: string): Promise<void> {
    // need to unpack the file before load it
    console.log('loadPackagedFile', filePath);

    const filename = path.basename(filePath);
    const dirname = path.dirname(filePath);

    const unpackedDirectory = path.resolve(dirname, `../unpacked/${filename}`);
    console.log('unpackedDirectory', unpackedDirectory);
    fs.mkdirSync(unpackedDirectory, { recursive: true });
    // extract to an existing directory
    zipper.sync.unzip(filePath).save(unpackedDirectory);

    await this.loadExtension(unpackedDirectory);
    this.apiSender.send('extension-started', {});
  }

  async start() {
    // add watcher to the $HOME/container-desktop
    const pluginsDirectory = path.resolve(os.homedir(), '.local/share/container-desktop/plugins');
    if (fs.existsSync(pluginsDirectory)) {
      // add watcher
      fs.watch(pluginsDirectory, (_, filename) => {
        // need to load the file
        const packagedFile = path.resolve(pluginsDirectory, filename);
        setTimeout(() => this.loadPackagedFile(packagedFile), 1000);
      });
    }

    let folders;
    // scan all extensions that we can find from the extensions folder
    if (import.meta.env.PROD) {
      console.log('IN PRODUCTION MODE');
      // in production mode, use the extensions locally
      console.log('dirname is', __dirname);
      folders = await this.readProductionFolders(path.join(__dirname, '../../../extensions'));
    } else {
      // in development mode, use the extensions locally
      folders = await this.readDevelopmentFolders(path.join(__dirname, '../../../extensions'));
    }
    console.log('found folders', folders);

    // ok now load all extensions from these folders
    await Promise.all(folders.map(folder => this.loadExtension(folder)));
  }

  async readDevelopmentFolders(path: string): Promise<string[]> {
    const entries = await fs.promises.readdir(path, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory)
      .map(directory => path + '/' + directory.name)
      .filter(item => !item.includes('docker'))
      .filter(item => !item.includes('lima'));
  }

  async readProductionFolders(path: string): Promise<string[]> {
    const entries = await fs.promises.readdir(path, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory)
      .map(directory => path + '/' + directory.name + `/builtin/${directory.name}.cdix`);
  }

  async loadExtension(extensionPath: string): Promise<void> {
    // load manifest
    const manifest = await this.loadManifest(extensionPath);
    console.log('manifest is', manifest);

    console.log('overriding require');
    this.overrideRequire();

    // create api object
    console.log('create API object');
    const api = this.createApi();

    const extension: AnalyzedExtension = {
      id: manifest.name,
      manifest,
      path: extensionPath,
      mainPath: path.resolve(extensionPath, manifest.main),
      api,
    };

    const extensionConfiguration = manifest?.contributes?.configuration;
    if (extensionConfiguration) {
      // add information about the current extension
      extensionConfiguration.extension = extension;
      extensionConfiguration.id = 'extensions.' + extension.id;
      this.configurationRegistry.registerConfigurations([extensionConfiguration]);
    }

    this.analyzedExtensions.set(extension.id, extension);
    console.log('load runtime...' + extension.mainPath);
    const runtime = this.loadRuntime(extension.mainPath);

    console.log('Activate extension...');
    return this.activateExtension(extension, runtime);
  }

  createApi(): typeof containerDesktopAPI {
    const commandRegistry = this.commandRegistry;
    const commands: typeof containerDesktopAPI.commands = {
      registerCommand(
        command: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (...args: any[]) => any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        thisArg?: any,
      ): containerDesktopAPI.Disposable {
        return commandRegistry.registerCommand(command, callback, thisArg);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      executeCommand<T = unknown>(commandId: string, ...args: any[]): PromiseLike<T> {
        return commandRegistry.executeCommand(commandId, ...args);
      },
    };

    //export function executeCommand<T = unknown>(command: string, ...rest: any[]): PromiseLike<T>;

    const containerProviderRegistry = this.providerRegistry;
    const provider: typeof containerDesktopAPI.provider = {
      createProvider(providerOptions: containerDesktopAPI.ProviderOptions): containerDesktopAPI.Provider {
        return containerProviderRegistry.createProvider(providerOptions);
      },
    };

    const trayMenuRegistry = this.trayMenuRegistry;
    const tray: typeof containerDesktopAPI.tray = {
      registerMenuItem(providerId: string, item: containerDesktopAPI.MenuItem): containerDesktopAPI.Disposable {
        return trayMenuRegistry.registerMenuItem(providerId, item);
      },
    };
    const configurationRegistry = this.configurationRegistry;
    const configuration: typeof containerDesktopAPI.configuration = {
      getConfiguration(
        section?: string,
        scope?: containerDesktopAPI.ConfigurationScope,
      ): containerDesktopAPI.Configuration {
        return configurationRegistry.getConfiguration(section, scope);
      },
    };

    return <typeof containerDesktopAPI>{
      // Types
      Disposable: Disposable,
      commands,
      provider,
      configuration,
      tray,
    };
  }

  loadRuntime(extensionPathFolder: string): NodeRequire {
    // cleaning the cache for all files of that plug-in.
    Object.keys(require.cache).forEach(function (key): void {
      const mod: NodeJS.Module | undefined = require.cache[key];

      // attempting to reload a native module will throw an error, so skip them
      if (mod?.id.endsWith('.node')) {
        return;
      }

      // remove children that are part of the plug-in
      let i = mod?.children.length || 0;
      while (i--) {
        const childMod: NodeJS.Module | undefined = mod?.children[i];
        // ensure the child module is not null, is in the plug-in folder, and is not a native module (see above)
        if (childMod && childMod.id.startsWith(extensionPathFolder) && !childMod.id.endsWith('.node')) {
          // cleanup exports - note that some modules (e.g. ansi-styles) define their
          // exports in an immutable manner, so overwriting the exports throws an error
          delete childMod.exports;
          mod?.children.splice(i, 1);
          for (let j = 0; j < childMod.children.length; j++) {
            delete childMod.children[j];
          }
        }
      }

      if (key.startsWith(extensionPathFolder)) {
        // delete entry
        delete require.cache[key];
        const ix = mod?.parent?.children.indexOf(mod) || 0;
        if (ix >= 0) {
          mod?.parent?.children.splice(ix, 1);
        }
      }
    });
    return require(extensionPathFolder);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async loadManifest(extensionPath: string): Promise<any> {
    const manifestPath = path.join(extensionPath, 'package.json');
    return new Promise((resolve, reject) => {
      fs.readFile(manifestPath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async activateExtension(extension: AnalyzedExtension, extensionMain: any): Promise<void> {
    const subscriptions: containerDesktopAPI.Disposable[] = [];

    const extensionContext: containerDesktopAPI.ExtensionContext = {
      subscriptions,
    };
    let deactivateFunction = undefined;
    if (typeof extensionMain['deactivate'] === 'function') {
      deactivateFunction = extensionMain['deactivate'];
    }
    if (typeof extensionMain['activate'] === 'function') {
      // return exports
      await extensionMain['activate'].apply(undefined, [extensionContext]);
    }
    const id = extension.id;
    const activatedExtension: ActivatedExtension = {
      id,
      deactivateFunction,
      extensionContext,
    };
    this.activatedExtensions.set(extension.id, activatedExtension);
  }

  async deactivateExtension(extensionId: string): Promise<void> {
    const extension = this.activatedExtensions.get(extensionId);
    if (extension) {
      if (extension.deactivateFunction) {
        await extension.deactivateFunction();
      }

      // dispose subscriptions
      extension.extensionContext.subscriptions.forEach(subscription => {
        subscription.dispose();
      });

      this.activatedExtensions.delete(extensionId);
    }
  }

  async stopAllExtensions(): Promise<void> {
    await Promise.all(
      Array.from(this.activatedExtensions.keys()).map(extensionId => this.deactivateExtension(extensionId)),
    );
  }

  async startExtension(extensionId: string): Promise<void> {
    const extension = this.analyzedExtensions.get(extensionId);
    if (extension) {
      await this.loadExtension(extension?.path);
    }
  }
}
