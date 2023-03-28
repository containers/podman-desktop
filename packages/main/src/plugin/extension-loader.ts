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

import type * as containerDesktopAPI from '@podman-desktop/api';
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
import type { ImageRegistry } from './image-registry';
import type { Dialogs } from './dialog-impl';
import type { ProgressImpl } from './progress-impl';
import { ProgressLocation } from './progress-impl';
import type { NotificationImpl } from './notification-impl';
import { StatusBarItemImpl } from './statusbar/statusbar-item';
import type { StatusBarRegistry } from './statusbar/statusbar-registry';
import { StatusBarAlignLeft, StatusBarAlignRight, StatusBarItemDefaultPriority } from './statusbar/statusbar-item';
import type { FilesystemMonitoring } from './filesystem-monitoring';
import { Uri } from './types/uri';
import type { KubernetesClient } from './kubernetes-client';
import type { Proxy } from './proxy';
import type { ContainerProviderRegistry } from './container-registry';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry';
import { QuickPickItemKind, InputBoxValidationSeverity } from './input-quickpick/input-quickpick-registry';
import type { MenuRegistry } from '/@/plugin/menu-registry';
import { desktopAppHomeDir } from '../util';
import { Emitter } from './events/emitter';
import { CancellationTokenSource } from './cancellation-token';

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
  removable: boolean;
}

export interface ActivatedExtension {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deactivateFunction: any;
  extensionContext: containerDesktopAPI.ExtensionContext;
}

const EXTENSION_OPTION = '--extension-folder';

export class ExtensionLoader {
  private overrideRequireDone = false;

  private activatedExtensions = new Map<string, ActivatedExtension>();
  private analyzedExtensions = new Map<string, AnalyzedExtension>();
  private watcherExtensions = new Map<string, containerDesktopAPI.FileSystemWatcher>();
  private reloadInProgressExtensions = new Map<string, boolean>();

  protected watchTimeout = 1000;

  // Plugins directory location
  private pluginsDirectory = path.resolve(os.homedir(), desktopAppHomeDir(), 'plugins');
  protected pluginsScanDirectory = path.resolve(os.homedir(), desktopAppHomeDir(), 'plugins-scanning');

  // Extensions directory location
  private extensionsStorageDirectory = path.resolve(os.homedir(), desktopAppHomeDir(), 'extensions-storage');

  constructor(
    private commandRegistry: CommandRegistry,
    private menuRegistry: MenuRegistry,
    private providerRegistry: ProviderRegistry,
    private configurationRegistry: ConfigurationRegistry,
    private imageRegistry: ImageRegistry,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private apiSender: any,
    private trayMenuRegistry: TrayMenuRegistry,
    private dialogs: Dialogs,
    private progress: ProgressImpl,
    private notifications: NotificationImpl,
    private statusBarRegistry: StatusBarRegistry,
    private kubernetesClient: KubernetesClient,
    private fileSystemMonitoring: FilesystemMonitoring,
    private proxy: Proxy,
    private containerProviderRegistry: ContainerProviderRegistry,
    private inputQuickPickRegistry: InputQuickPickRegistry,
  ) {}

  async listExtensions(): Promise<ExtensionInfo[]> {
    return Array.from(this.analyzedExtensions.values()).map(extension => ({
      name: extension.manifest.name,
      displayName: extension.manifest.displayName,
      description: extension.manifest.description,
      version: extension.manifest.version,
      publisher: extension.manifest.publisher,
      state: this.activatedExtensions.get(extension.id) ? 'active' : 'inactive',
      id: extension.id,
      path: extension.path,
      removable: extension.removable,
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
        if (request !== '@podman-desktop/api') {
          // eslint-disable-next-line prefer-rest-params
          return internalLoad.apply(this, arguments);
        }
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
    const filename = path.basename(filePath);
    const dirname = path.dirname(filePath);

    const unpackedDirectory = path.resolve(dirname, `../unpacked/${filename}`);
    fs.mkdirSync(unpackedDirectory, { recursive: true });
    // extract to an existing directory
    zipper.sync.unzip(filePath).save(unpackedDirectory);

    await this.loadExtension(unpackedDirectory, true);
    this.apiSender.send('extension-started', {});
  }

  async init(): Promise<void> {
    // create pluginsDirectory if it does not exist
    if (!fs.existsSync(this.pluginsDirectory)) {
      fs.mkdirSync(this.pluginsDirectory, { recursive: true });
    }

    if (!fs.existsSync(this.pluginsScanDirectory)) {
      fs.mkdirSync(this.pluginsScanDirectory, { recursive: true });
    }
  }

  protected async setupScanningDirectory(): Promise<void> {
    if (fs.existsSync(this.pluginsScanDirectory)) {
      // add watcher
      fs.watch(this.pluginsScanDirectory, (_, filename) => {
        // need to load the file
        const packagedFile = path.resolve(this.pluginsScanDirectory, filename);
        setTimeout(() => this.loadPackagedFile(packagedFile), this.watchTimeout);
      });

      // scan all files in the directory
      const entries = await fs.promises.readdir(this.pluginsScanDirectory, { withFileTypes: true });
      // filter only files
      const files = entries
        .filter(entry => entry.isFile())
        .filter(entry => entry.name.endsWith('.cdix'))
        .map(file => path.join(this.pluginsScanDirectory, file.name));

      // load all files
      await Promise.all(files.map(file => this.loadPackagedFile(file)));
    }
  }

  async start() {
    // Scan the plugins-scanning directory
    await this.setupScanningDirectory();

    // Create the extensions storage directory if it does not exist
    if (!fs.existsSync(this.extensionsStorageDirectory)) {
      fs.mkdirSync(this.extensionsStorageDirectory);
    }

    let folders;
    // scan all extensions that we can find from the extensions folder
    if (import.meta.env.PROD) {
      // in production mode, use the extensions locally
      folders = await this.readProductionFolders(path.join(__dirname, '../../../extensions'));
    } else {
      // in development mode, use the extensions locally
      folders = await this.readDevelopmentFolders(path.join(__dirname, '../../../extensions'));
    }
    const externalExtensions = await this.readExternalFolders();
    // ok now load all extensions from these folders
    await Promise.all(folders.map(folder => this.loadExtension(folder, false)));
    await Promise.all(externalExtensions.map(folder => this.loadExtension(folder, false)));

    // also load extensions from the plugins directory
    if (fs.existsSync(this.pluginsDirectory)) {
      const pluginDirEntries = await fs.promises.readdir(this.pluginsDirectory, { withFileTypes: true });
      // filter only directories ignoring node_modules directory
      const pluginDirectories = pluginDirEntries
        .filter(entry => entry.isDirectory())
        .map(directory => this.pluginsDirectory + '/' + directory.name);

      // ok now load all extensions from the pluginDirectory folders
      await Promise.all(pluginDirectories.map(folder => this.loadExtension(folder, true)));
    }
  }

  async readDevelopmentFolders(path: string): Promise<string[]> {
    const entries = await fs.promises.readdir(path, { withFileTypes: true });
    // filter only directories ignoring node_modules directory
    return entries
      .filter(entry => entry.isDirectory())
      .filter(directory => directory.name !== 'node_modules')
      .map(directory => path + '/' + directory.name);
  }

  async readExternalFolders(): Promise<string[]> {
    const pathes = [];
    for (let index = 0; index < process.argv.length; index++) {
      if (process.argv[index] === EXTENSION_OPTION && index < process.argv.length - 1) {
        pathes.push(process.argv[++index]);
      }
    }
    return pathes;
  }

  async readProductionFolders(path: string): Promise<string[]> {
    const entries = await fs.promises.readdir(path, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .filter(directory => directory.name !== 'node_modules')
      .map(directory => path + '/' + directory.name + `/builtin/${directory.name}.cdix`);
  }

  getBase64Image(imagePath: string): string {
    const imageContent = fs.readFileSync(imagePath);

    // convert to base64
    const base64Content = Buffer.from(imageContent).toString('base64');

    const base64Image = `data:image/png;base64,${base64Content}`;

    // create base64 image content
    return base64Image;
  }

  /**
   * Update the image to be a base64 content
   */
  updateImage(
    image: undefined | string | { light: string; dark: string },
    rootPath: string,
  ): undefined | string | { light: string; dark: string } {
    // do nothing if no image
    if (!image) {
      return undefined;
    }
    if (typeof image === 'string') {
      return this.getBase64Image(path.resolve(rootPath, image));
    } else {
      if (image.light) {
        image.light = this.getBase64Image(path.resolve(rootPath, image.light));
      }
      if (image.dark) {
        image.dark = this.getBase64Image(path.resolve(rootPath, image.dark));
      }
      return image;
    }
  }

  protected async reloadExtension(extension: AnalyzedExtension, removable: boolean): Promise<void> {
    const inProgress = this.reloadInProgressExtensions.get(extension.id);
    if (inProgress) {
      return;
    }

    console.log(`Extension ${extension.path} has been updated, reloading it`);
    this.reloadInProgressExtensions.set(extension.id, true);

    // unload the extension
    await this.deactivateExtension(extension.id);

    // reload the extension
    try {
      await this.loadExtension(extension.path, removable);
    } catch (error) {
      console.error('error while reloading extension', error);
    } finally {
      this.reloadInProgressExtensions.set(extension.id, false);
    }
  }

  async loadExtension(extensionPath: string, removable: boolean): Promise<void> {
    // do nothing if there is no package.json file
    if (!fs.existsSync(path.resolve(extensionPath, 'package.json'))) {
      console.warn(`Ignoring extension ${extensionPath} without package.json file`);
      return;
    }

    // load manifest
    const manifest = await this.loadManifest(extensionPath);
    this.overrideRequire();

    // create api object
    const api = this.createApi(extensionPath, manifest);

    const extension: AnalyzedExtension = {
      id: manifest.name,
      manifest,
      path: extensionPath,
      mainPath: path.resolve(extensionPath, manifest.main),
      api,
      removable,
    };

    const extensionConfiguration = manifest?.contributes?.configuration;
    if (extensionConfiguration) {
      // add information about the current extension
      extensionConfiguration.extension = extension;
      extensionConfiguration.title = `Extension: ${extensionConfiguration.title}`;
      extensionConfiguration.id = 'preferences.' + extension.id;

      this.configurationRegistry.registerConfigurations([extensionConfiguration]);
    }

    const menus = manifest?.contributes?.menus;
    if (menus) {
      this.menuRegistry.registerMenus(menus);
    }

    this.analyzedExtensions.set(extension.id, extension);

    // in development mode, watch if the extension is updated and reload it
    if (import.meta.env.DEV) {
      if (!this.watcherExtensions.has(extension.id)) {
        const extensionWatcher = this.fileSystemMonitoring.createFileSystemWatcher(extensionPath);
        extensionWatcher.onDidChange(async () => {
          // wait 1 second before trying to reload the extension
          // this is to avoid reloading the extension while it is still being updated
          setTimeout(() => this.reloadExtension(extension, removable), 1000);
        });
        this.watcherExtensions.set(extension.id, extensionWatcher);
      }
    }

    const runtime = this.loadRuntime(extension);

    await this.activateExtension(extension, runtime);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createApi(extensionPath: string, extManifest: any): typeof containerDesktopAPI {
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

    const providerRegistry = this.providerRegistry;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    const provider: typeof containerDesktopAPI.provider = {
      createProvider(providerOptions: containerDesktopAPI.ProviderOptions): containerDesktopAPI.Provider {
        // update path of images using the extension path
        if (providerOptions.images) {
          const images = providerOptions.images;
          instance.updateImage.bind(instance);
          images.icon = instance.updateImage(images.icon, extensionPath);
          images.logo = instance.updateImage(images.logo, extensionPath);
        }
        return providerRegistry.createProvider(providerOptions);
      },
      onDidUpdateProvider: (listener, thisArg, disposables) => {
        return providerRegistry.onDidUpdateProvider(listener, thisArg, disposables);
      },
      onDidUnregisterContainerConnection: (listener, thisArg, disposables) => {
        return providerRegistry.onDidUnregisterContainerConnection(listener, thisArg, disposables);
      },
      onDidRegisterContainerConnection: (listener, thisArg, disposables) => {
        return providerRegistry.onDidRegisterContainerConnection(listener, thisArg, disposables);
      },
      getContainerConnections: () => {
        return providerRegistry.getContainerConnections();
      },
    };

    const proxyInstance = this.proxy;
    const proxy: typeof containerDesktopAPI.proxy = {
      getProxySettings(): containerDesktopAPI.ProxySettings | undefined {
        return proxyInstance.proxy;
      },
      setProxy(proxySettings: containerDesktopAPI.ProxySettings): void {
        proxyInstance.setProxy(proxySettings);
      },
      onDidUpdateProxy: (listener, thisArg, disposables) => {
        return proxyInstance.onDidUpdateProxy(listener, thisArg, disposables);
      },
      isEnabled(): boolean {
        return proxyInstance.isEnabled();
      },
      onDidStateChange: (listener, thisArg, disposables) => {
        return proxyInstance.onDidStateChange(listener, thisArg, disposables);
      },
    };

    const trayMenuRegistry = this.trayMenuRegistry;
    const tray: typeof containerDesktopAPI.tray = {
      registerMenuItem(item: containerDesktopAPI.MenuItem): containerDesktopAPI.Disposable {
        return trayMenuRegistry.registerMenuItem(item);
      },
      registerProviderMenuItem(providerId: string, item: containerDesktopAPI.MenuItem): containerDesktopAPI.Disposable {
        return trayMenuRegistry.registerProviderMenuItem(providerId, item);
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
      onDidChangeConfiguration: (listener, thisArg, disposables) => {
        return configurationRegistry.onDidChangeConfigurationAPI(listener, thisArg, disposables);
      },
    };

    const imageRegistry = this.imageRegistry;
    const registry: typeof containerDesktopAPI.registry = {
      registerRegistry: (registry: containerDesktopAPI.Registry): Disposable => {
        return imageRegistry.registerRegistry(registry);
      },

      suggestRegistry: (registry: containerDesktopAPI.RegistrySuggestedProvider): Disposable => {
        return imageRegistry.suggestRegistry(registry);
      },

      unregisterRegistry: (registry: containerDesktopAPI.Registry): void => {
        return imageRegistry.unregisterRegistry(registry);
      },

      onDidUpdateRegistry: (listener, thisArg, disposables) => {
        return imageRegistry.onDidUpdateRegistry(listener, thisArg, disposables);
      },

      onDidRegisterRegistry: (listener, thisArg, disposables) => {
        return imageRegistry.onDidRegisterRegistry(listener, thisArg, disposables);
      },

      onDidUnregisterRegistry: (listener, thisArg, disposables) => {
        return imageRegistry.onDidUnregisterRegistry(listener, thisArg, disposables);
      },
      registerRegistryProvider: (registryProvider: containerDesktopAPI.RegistryProvider): Disposable => {
        return imageRegistry.registerRegistryProvider(registryProvider);
      },
    };

    const dialogs = this.dialogs;
    const progress = this.progress;
    const notifications = this.notifications;
    const inputQuickPickRegistry = this.inputQuickPickRegistry;
    const windowObj: typeof containerDesktopAPI.window = {
      showInformationMessage: (message: string, ...items: string[]) => {
        return dialogs.showDialog('info', extManifest.name, message, items);
      },
      showWarningMessage: (message: string, ...items: string[]) => {
        return dialogs.showDialog('warning', extManifest.name, message, items);
      },
      showErrorMessage: (message: string, ...items: string[]) => {
        return dialogs.showDialog('error', extManifest.name, message, items);
      },

      showInputBox: (options?: containerDesktopAPI.InputBoxOptions, token?: containerDesktopAPI.CancellationToken) => {
        return inputQuickPickRegistry.showInputBox(options, token);
      },

      showQuickPick(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: readonly any[] | Promise<readonly any[]>,
        options?: containerDesktopAPI.QuickPickOptions,
        token?: containerDesktopAPI.CancellationToken,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ): Promise<any> {
        return inputQuickPickRegistry.showQuickPick(items, options, token);
      },

      withProgress: <R>(
        options: containerDesktopAPI.ProgressOptions,
        task: (
          progress: containerDesktopAPI.Progress<{ message?: string; increment?: number }>,
          token: containerDesktopAPI.CancellationToken,
        ) => Promise<R>,
      ): Promise<R> => {
        return progress.withProgress(options, task);
      },

      showNotification: (options: containerDesktopAPI.NotificationOptions): containerDesktopAPI.Disposable => {
        return notifications.showNotification(options);
      },

      createStatusBarItem: (
        param1?: containerDesktopAPI.StatusBarAlignment | number,
        param2?: number,
      ): containerDesktopAPI.StatusBarItem => {
        let alignment: containerDesktopAPI.StatusBarAlignment = StatusBarAlignLeft;
        let priority = StatusBarItemDefaultPriority;

        if (typeof param2 !== 'undefined') {
          alignment = param1 as containerDesktopAPI.StatusBarAlignment;
          priority = param2;
        } else if (typeof param1 !== 'undefined') {
          if (typeof param1 === 'string') {
            alignment = param1 as containerDesktopAPI.StatusBarAlignment;
          } else {
            priority = param1;
          }
        }

        return new StatusBarItemImpl(this.statusBarRegistry, alignment, priority);
      },
    };

    const fileSystemMonitoring = this.fileSystemMonitoring;
    const fs: typeof containerDesktopAPI.fs = {
      createFileSystemWatcher(path: string): containerDesktopAPI.FileSystemWatcher {
        return fileSystemMonitoring.createFileSystemWatcher(path);
      },
    };

    const kubernetesClient = this.kubernetesClient;
    const kubernetes: typeof containerDesktopAPI.kubernetes = {
      getKubeconfig(): containerDesktopAPI.Uri {
        return kubernetesClient.getKubeconfig();
      },
      async setKubeconfig(kubeconfig: containerDesktopAPI.Uri): Promise<void> {
        return kubernetesClient.setKubeconfig(kubeconfig);
      },
      onDidUpdateKubeconfig: (listener, thisArg, disposables) => {
        return kubernetesClient.onDidUpdateKubeconfig(listener, thisArg, disposables);
      },
    };

    const containerProviderRegistry = this.containerProviderRegistry;
    const containerEngine: typeof containerDesktopAPI.containerEngine = {
      listContainers(): Promise<containerDesktopAPI.ContainerInfo[]> {
        return containerProviderRegistry.listSimpleContainers();
      },
      inspectContainer(engineId: string, id: string): Promise<containerDesktopAPI.ContainerInspectInfo> {
        return containerProviderRegistry.getContainerInspect(engineId, id);
      },
      saveImage(engineId: string, id: string, filename: string) {
        return containerProviderRegistry.saveImage(engineId, id, filename);
      },
      onEvent: (listener, thisArg, disposables) => {
        return containerProviderRegistry.onEvent(listener, thisArg, disposables);
      },
    };

    return <typeof containerDesktopAPI>{
      // Types
      Disposable: Disposable,
      Uri: Uri,
      EventEmitter: Emitter,
      CancellationTokenSource: CancellationTokenSource,
      commands,
      registry,
      provider,
      fs,
      configuration,
      tray,
      proxy,
      kubernetes,
      containerEngine,
      ProgressLocation,
      window: windowObj,
      StatusBarItemDefaultPriority,
      StatusBarAlignLeft,
      StatusBarAlignRight,
      InputBoxValidationSeverity,
      QuickPickItemKind,
    };
  }

  loadRuntime(extension: AnalyzedExtension): NodeRequire {
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
        if (childMod && childMod.id.startsWith(extension.path) && !childMod.id.endsWith('.node')) {
          // cleanup exports - note that some modules (e.g. ansi-styles) define their
          // exports in an immutable manner, so overwriting the exports throws an error
          delete childMod.exports;
          mod?.children.splice(i, 1);
          for (let j = 0; j < childMod.children.length; j++) {
            delete childMod.children[j];
          }
        }
      }

      if (key.startsWith(extension.path)) {
        // delete entry
        delete require.cache[key];
        const ix = mod?.parent?.children.indexOf(mod) || 0;
        if (ix >= 0) {
          mod?.parent?.children.splice(ix, 1);
        }
      }
    });
    return require(extension.mainPath);
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
      storagePath: path.resolve(this.extensionsStorageDirectory, extension.id),
    };
    let deactivateFunction = undefined;
    if (typeof extensionMain['deactivate'] === 'function') {
      deactivateFunction = extensionMain['deactivate'];
    }
    if (typeof extensionMain['activate'] === 'function') {
      // return exports
      console.log(`Activating extension (${extension.id})`);
      await extensionMain['activate'].apply(undefined, [extensionContext]);
      console.log(`Activation extension (${extension.id}) ended`);
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
      extension.extensionContext.subscriptions.forEach(async subscription => {
        await subscription.dispose();
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
      await this.loadExtension(extension?.path, extension.removable);
    }
  }

  async removeExtension(extensionId: string): Promise<void> {
    const extension = this.analyzedExtensions.get(extensionId);
    if (extension) {
      await this.deactivateExtension(extensionId);
      // delete the path
      if (extension.removable) {
        await fs.promises.rm(extension.path, { recursive: true, force: true });
      } else {
        throw new Error(`Extension ${extensionId} is not removable`);
      }
      this.analyzedExtensions.delete(extensionId);
      this.apiSender.send('extension-removed', {});
    }
  }

  getConfigurationRegistry(): ConfigurationRegistry {
    return this.configurationRegistry;
  }

  getPluginsDirectory(): string {
    return this.pluginsDirectory;
  }
}
