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
import * as fs from 'fs';
import type { CommandRegistry } from './command-registry.js';
import type { ExtensionError, ExtensionInfo, ExtensionUpdateInfo } from './api/extension-info.js';
import * as zipper from 'zip-local';
import type { TrayMenuRegistry } from './tray-menu-registry.js';
import { Disposable } from './types/disposable.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry.js';
import type { ImageRegistry } from './image-registry.js';
import type { MessageBox } from './message-box.js';
import type { ProgressImpl } from './progress-impl.js';
import { ProgressLocation } from './progress-impl.js';
import type { NotificationImpl } from './notification-impl.js';
import {
  StatusBarItemImpl,
  StatusBarAlignLeft,
  StatusBarAlignRight,
  StatusBarItemDefaultPriority,
} from './statusbar/statusbar-item.js';
import type { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import type { FilesystemMonitoring } from './filesystem-monitoring.js';
import { Uri } from './types/uri.js';
import type { KubernetesClient } from './kubernetes-client.js';
import type { Proxy } from './proxy.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import { QuickPickItemKind, InputBoxValidationSeverity } from './input-quickpick/input-quickpick-registry.js';
import type { MenuRegistry } from '/@/plugin/menu-registry.js';
import { Emitter } from './events/emitter.js';
import { CancellationTokenSource } from './cancellation-token.js';
import type { ApiSenderType } from './api.js';
import type { AuthenticationImpl } from './authentication.js';
import type { Telemetry } from './telemetry/telemetry.js';
import { TelemetryTrustedValue } from './types/telemetry.js';
import { clipboard as electronClipboard } from 'electron';
import { securityRestrictionCurrentHandler } from '../security-restrictions-handler.js';
import type { IconRegistry } from './icon-registry.js';
import type { Directories } from './directories.js';
import { getBase64Image, isLinux, isMac, isWindows } from '../util.js';
import type { CustomPickRegistry } from './custompick/custompick-registry.js';
import type { Exec } from './util/exec.js';
import type { ProviderContainerConnectionInfo, ProviderKubernetesConnectionInfo } from './api/provider-info.js';
import type { ViewRegistry } from './view-registry.js';
import type { Context } from './context/context.js';
import type { OnboardingRegistry } from './onboarding-registry.js';
import { createHttpPatchedModules } from './proxy-resolver.js';
import { ModuleLoader } from './module-loader.js';
import { ExtensionLoaderSettings } from './extension-loader-settings.js';

/**
 * Handle the loading of an extension
 */

export interface AnalyzedExtension {
  id: string;
  name: string;
  // root folder (where is package.json)
  path: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  // main entry
  mainPath?: string;
  api: typeof containerDesktopAPI;
  removable: boolean;

  update?: {
    version: string;
    ociUri: string;
  };

  missingDependencies?: string[];
  circularDependencies?: string[];

  readonly subscriptions: { dispose(): unknown }[];

  dispose(): void;
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

  private moduleLoader: ModuleLoader;

  protected activatedExtensions = new Map<string, ActivatedExtension>();
  protected analyzedExtensions = new Map<string, AnalyzedExtension>();
  private watcherExtensions = new Map<string, containerDesktopAPI.FileSystemWatcher>();
  private reloadInProgressExtensions = new Map<string, boolean>();
  protected extensionState = new Map<string, string>();
  protected extensionStateErrors = new Map<string, unknown>();

  protected watchTimeout = 1000;

  // Plugins directory location
  private pluginsDirectory;
  protected pluginsScanDirectory;

  // Extensions directory location
  private extensionsStorageDirectory;

  constructor(
    private commandRegistry: CommandRegistry,
    private menuRegistry: MenuRegistry,
    private providerRegistry: ProviderRegistry,
    private configurationRegistry: ConfigurationRegistry,
    private imageRegistry: ImageRegistry,
    private apiSender: ApiSenderType,
    private trayMenuRegistry: TrayMenuRegistry,
    private messageBox: MessageBox,
    private progress: ProgressImpl,
    private notifications: NotificationImpl,
    private statusBarRegistry: StatusBarRegistry,
    private kubernetesClient: KubernetesClient,
    private fileSystemMonitoring: FilesystemMonitoring,
    private proxy: Proxy,
    private containerProviderRegistry: ContainerProviderRegistry,
    private inputQuickPickRegistry: InputQuickPickRegistry,
    private customPickRegistry: CustomPickRegistry,
    private authenticationProviderRegistry: AuthenticationImpl,
    private iconRegistry: IconRegistry,
    private onboardingRegistry: OnboardingRegistry,
    private telemetry: Telemetry,
    private viewRegistry: ViewRegistry,
    private context: Context,
    directories: Directories,
    private exec: Exec,
  ) {
    this.pluginsDirectory = directories.getPluginsDirectory();
    this.pluginsScanDirectory = directories.getPluginsScanDirectory();
    this.extensionsStorageDirectory = directories.getExtensionsStorageDirectory();
    this.moduleLoader = new ModuleLoader(require('module'), this.analyzedExtensions);
  }

  mapError(err: unknown): ExtensionError | undefined {
    if (err) {
      if (err instanceof Error) {
        return { message: err.message, stack: err.stack };
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return { message: (err as any).toString() };
      }
    }
    return undefined;
  }

  async listExtensions(): Promise<ExtensionInfo[]> {
    return Array.from(this.analyzedExtensions.values()).map(extension => ({
      name: extension.manifest.name,
      displayName: extension.manifest.displayName,
      description: extension.manifest.description,
      version: extension.manifest.version,
      publisher: extension.manifest.publisher,
      state: this.extensionState.get(extension.id) || 'stopped',
      error: this.mapError(this.extensionStateErrors.get(extension.id)),
      id: extension.id,
      path: extension.path,
      removable: extension.removable,
      update: extension.update,
    }));
  }

  async loadPackagedFile(filePath: string): Promise<void> {
    // need to unpack the file before load it
    const filename = path.basename(filePath);
    const dirname = path.dirname(filePath);

    const unpackedDirectory = path.resolve(dirname, `../unpacked/${filename}`);
    fs.mkdirSync(unpackedDirectory, { recursive: true });
    // extract to an existing directory
    zipper.sync.unzip(filePath).save(unpackedDirectory);

    const extension = await this.analyzeExtension(unpackedDirectory, true);
    if (extension) {
      await this.loadExtension(extension);
      this.apiSender.send('extension-started', {});
    }
  }

  async init(): Promise<void> {
    // create pluginsDirectory if it does not exist
    if (!fs.existsSync(this.pluginsDirectory)) {
      fs.mkdirSync(this.pluginsDirectory, { recursive: true });
    }

    if (!fs.existsSync(this.pluginsScanDirectory)) {
      fs.mkdirSync(this.pluginsScanDirectory, { recursive: true });
    }

    this.moduleLoader.addOverride(createHttpPatchedModules(this.proxy)); // add patched http and https
    this.moduleLoader.addOverride({ '@podman-desktop/api': ext => ext.api }); // add podman desktop API

    this.moduleLoader.overrideRequire();
    // register configuration for the max activation time
    const maxActivationTimeConfiguration: IConfigurationNode = {
      id: 'preferences.extension',
      title: 'Extensions',
      type: 'object',
      properties: {
        [ExtensionLoaderSettings.SectionName + '.' + ExtensionLoaderSettings.MaxActivationTime]: {
          description: 'Maximum activation time for an extension, in seconds.',
          type: 'number',
          default: 10,
          minimum: 1,
          maximum: 100,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([maxActivationTimeConfiguration]);
  }

  protected async setupScanningDirectory(): Promise<void> {
    if (fs.existsSync(this.pluginsScanDirectory)) {
      // add watcher
      fs.watch(this.pluginsScanDirectory, (_, filename) => {
        // need to load the file
        if (filename) {
          const packagedFile = path.resolve(this.pluginsScanDirectory, filename);
          setTimeout(() => {
            this.loadPackagedFile(packagedFile).catch((error: unknown) => {
              console.error('Error while loadPackagedFile', error);
            });
          }, this.watchTimeout);
        }
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
    // ok now load grab all extensions from these folders
    const analyzedExtensions: AnalyzedExtension[] = [];

    const analyzedFoldersExtension = (
      await Promise.all(folders.map(folder => this.analyzeExtension(folder, false)))
    ).filter(extension => extension !== undefined) as AnalyzedExtension[];
    analyzedExtensions.push(...analyzedFoldersExtension);

    const analyzedExternalExtensions = (
      await Promise.all(externalExtensions.map(folder => this.analyzeExtension(folder, false)))
    ).filter(extension => extension !== undefined) as AnalyzedExtension[];
    analyzedExtensions.push(...analyzedExternalExtensions);

    // also load extensions from the plugins directory
    if (fs.existsSync(this.pluginsDirectory)) {
      const pluginDirEntries = await fs.promises.readdir(this.pluginsDirectory, { withFileTypes: true });
      // filter only directories ignoring node_modules directory
      const pluginDirectories = pluginDirEntries
        .filter(entry => entry.isDirectory())
        .map(directory => this.pluginsDirectory + '/' + directory.name);

      // collect all extensions from the pluginDirectory folders
      const analyzedPluginsDirectoryExtensions: AnalyzedExtension[] = (
        await Promise.all(pluginDirectories.map(folder => this.analyzeExtension(folder, true)))
      ).filter(extension => extension !== undefined) as AnalyzedExtension[];
      analyzedExtensions.push(...analyzedPluginsDirectoryExtensions);
    }

    // now we have all extensions, we can load them
    await this.loadExtensions(analyzedExtensions);
  }

  async analyzeExtension(extensionPath: string, removable: boolean): Promise<AnalyzedExtension | undefined> {
    // do nothing if there is no package.json file
    if (!fs.existsSync(path.resolve(extensionPath, 'package.json'))) {
      console.warn(`Ignoring extension ${extensionPath} without package.json file`);
      return undefined;
    }

    const manifest = await this.loadManifest(extensionPath);

    // create api object
    const api = this.createApi(extensionPath, manifest);

    const disposables: Disposable[] = [];
    const analyzedExtension: AnalyzedExtension = {
      id: `${manifest.publisher}.${manifest.name}`,
      name: manifest.name,
      manifest,
      path: extensionPath,
      mainPath: manifest.main ? path.resolve(extensionPath, manifest.main) : undefined,
      api,
      removable,
      subscriptions: disposables,
      dispose(): void {
        disposables.forEach(disposable => disposable.dispose());
      },
    };

    return analyzedExtension;
  }

  // check if all dependencies are available
  // if not, set the missingDependencies property
  searchForMissingDependencies(analyzedExtensions: AnalyzedExtension[]): void {
    analyzedExtensions.forEach(extension => {
      const missingDependencies: string[] = [];
      extension.manifest?.extensionDependencies?.forEach((dependency: string) => {
        if (!analyzedExtensions.find(analyzedExtension => analyzedExtension.id === dependency)) {
          missingDependencies.push(dependency);
        }
      });
      extension.missingDependencies = missingDependencies;
    });
  }

  async loadExtensions(analyzedExtensions: AnalyzedExtension[]): Promise<void> {
    // check if all dependencies are available
    this.searchForMissingDependencies(analyzedExtensions);

    // do we have circular dependencies?
    this.searchForCircularDependencies(analyzedExtensions);

    // now, need to sort them by extensionDependencies order
    const sortedExtensions = this.sortExtensionsByDependencies(analyzedExtensions);

    // now, load all extensions
    await Promise.all(sortedExtensions.map(extension => this.loadExtension(extension)));
  }

  // do we have circular dependencies?
  // set it in the circularDependencies property
  // search if a dependency is in the extensionDependencies of the other extension
  searchForCircularDependencies(analyzedExtension: AnalyzedExtension[]): void {
    analyzedExtension.forEach(extension => {
      const circularDependencies: string[] = [];
      extension.manifest?.extensionDependencies?.forEach((dependency: string) => {
        if (
          analyzedExtension
            .find(analyzedExtension => analyzedExtension.id === dependency)
            ?.manifest?.extensionDependencies?.includes(extension.id)
        ) {
          circularDependencies.push(dependency);
        }
      });
      extension.circularDependencies = circularDependencies;
    });
  }

  topologicalSort(
    analyzedExtension: AnalyzedExtension,
    allExtensions: AnalyzedExtension[],
    explored: Map<string, boolean>,
    sorted: AnalyzedExtension[],
  ) {
    // flasg the node as explored
    explored.set(analyzedExtension.id, true);

    // visit all the unvisited nodes
    analyzedExtension.manifest?.extensionDependencies?.forEach((dependency: string) => {
      // not visited yet, grab the AnalyzedExtension object and visit it
      if (!explored.has(dependency)) {
        const matchingDependency = allExtensions.find(extension => extension.id === dependency);
        if (matchingDependency) {
          this.topologicalSort(matchingDependency, allExtensions, explored, sorted);
        }
      }
    });
    // add at the end of the sorted array
    sorted.push(analyzedExtension);
  }

  // use topological sort to sort extensions by dependencies
  sortExtensionsByDependencies(analyzedExtensions: AnalyzedExtension[]): AnalyzedExtension[] {
    const sorted: AnalyzedExtension[] = [];
    const explored = new Map<string, boolean>();

    // visit all unvisited nodes
    analyzedExtensions.forEach(node => {
      if (!explored.has(node.id)) {
        this.topologicalSort(node, analyzedExtensions, explored, sorted);
      }
    });

    return sorted;
  }

  async readDevelopmentFolders(folderPath: string): Promise<string[]> {
    const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
    // filter only directories ignoring node_modules directory
    return entries
      .filter(entry => entry.isDirectory())
      .filter(directory => directory.name !== 'node_modules')
      .map(directory => path.join(folderPath, directory.name));
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

  async readProductionFolders(folderPath: string): Promise<string[]> {
    const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });
    return entries
      .filter(entry => entry.isDirectory())
      .filter(directory => directory.name !== 'node_modules')
      .map(directory => path.join(folderPath, directory.name, `/builtin/${directory.name}.cdix`));
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
      return getBase64Image(path.resolve(rootPath, image));
    } else {
      if (image.light) {
        const base64Image = getBase64Image(path.resolve(rootPath, image.light));
        if (base64Image) {
          image.light = base64Image;
        }
      }
      if (image.dark) {
        const base64Image = getBase64Image(path.resolve(rootPath, image.dark));
        if (base64Image) {
          image.dark = base64Image;
        }
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
      const updatedExtension = await this.analyzeExtension(extension.path, removable);

      if (updatedExtension) {
        await this.loadExtension(updatedExtension, true);
      }
    } catch (error) {
      console.error('error while reloading extension', error);
    } finally {
      this.reloadInProgressExtensions.set(extension.id, false);
    }
  }

  async loadExtension(extension: AnalyzedExtension, checkForMissingDependencies = false): Promise<void> {
    // check if all dependencies are available
    if (checkForMissingDependencies && extension?.manifest?.extensionDependencies) {
      // search from existing .this.analyzedExtensions
      const missing: string[] = extension.manifest.extensionDependencies.filter(
        (dependency: string) => !this.analyzedExtensions.get(dependency),
      );
      if (missing.length > 0) {
        extension.missingDependencies = missing;
      }
    }

    const extensionConfiguration = extension.manifest?.contributes?.configuration;
    if (extensionConfiguration) {
      // add information about the current extension
      extensionConfiguration.extension = extension;
      extensionConfiguration.title = `Extension: ${extensionConfiguration.title}`;
      extensionConfiguration.id = 'preferences.' + extension.id;

      extension.subscriptions.push(this.configurationRegistry.registerConfigurations([extensionConfiguration]));
    }

    const menus = extension.manifest?.contributes?.menus;
    if (menus) {
      extension.subscriptions.push(this.menuRegistry.registerMenus(menus));
    }

    const icons = extension.manifest?.contributes?.icons;
    if (icons) {
      this.iconRegistry.registerIconContribution(extension, icons);
    }

    const views = extension.manifest?.contributes?.views;
    if (views) {
      extension.subscriptions.push(this.viewRegistry.registerViews(extension.id, views));
    }

    const onboarding = extension.manifest?.contributes?.onboarding;
    if (onboarding) {
      extension.subscriptions.push(this.onboardingRegistry.registerOnboarding(extension, onboarding));
    }

    this.analyzedExtensions.set(extension.id, extension);
    this.extensionState.delete(extension.id);
    this.extensionStateErrors.delete(extension.id);

    const telemetryOptions = { extensionId: extension.id };

    if (extension.missingDependencies && extension.missingDependencies.length > 0) {
      this.extensionState.set(extension.id, 'failed');
      this.extensionStateErrors.set(
        extension.id,
        `Missing dependencies for this extension: ${extension?.missingDependencies.join(', ')}`,
      );

      return;
    }

    try {
      // in development mode, watch if the extension is updated and reload it
      if (import.meta.env.DEV && !this.watcherExtensions.has(extension.id)) {
        const extensionWatcher = this.fileSystemMonitoring.createFileSystemWatcher(extension.path);
        extensionWatcher.onDidChange(async () => {
          // wait 1 second before trying to reload the extension
          // this is to avoid reloading the extension while it is still being updated
          setTimeout(() => {
            this.reloadExtension(extension, extension.removable).catch((error: unknown) =>
              console.error('error while reloading extension', error),
            );
          }, 1000);
        });
        this.watcherExtensions.set(extension.id, extensionWatcher);
      }

      const runtime = this.loadRuntime(extension);

      await this.activateExtension(extension, runtime);
    } catch (err) {
      this.extensionState.set(extension.id, 'failed');
      this.extensionStateErrors.set(extension.id, err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (telemetryOptions as any).error = err;
    } finally {
      this.telemetry.track('loadExtension', telemetryOptions);
    }
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
        return providerRegistry.createProvider(extensionInfo.id, extensionInfo.label, providerOptions);
      },
      onDidUpdateProvider: (listener, thisArg, disposables) => {
        return providerRegistry.onDidUpdateProvider(listener, thisArg, disposables);
      },
      onDidUpdateContainerConnection: (listener, thisArg, disposables) => {
        return providerRegistry.onDidUpdateContainerConnection(listener, thisArg, disposables);
      },
      onDidUpdateKubernetesConnection: (listener, thisArg, disposables) => {
        return providerRegistry.onDidUpdateKubernetesConnection(listener, thisArg, disposables);
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
      getProviderLifecycleContext(
        providerId: string,
        providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      ): containerDesktopAPI.LifecycleContext {
        return providerRegistry.getMatchingProviderLifecycleContextByProviderId(providerId, providerConnectionInfo);
      },
    };

    const proxyInstance = this.proxy;
    const proxy: typeof containerDesktopAPI.proxy = {
      getProxySettings(): containerDesktopAPI.ProxySettings | undefined {
        return proxyInstance.proxy;
      },
      async setProxy(proxySettings: containerDesktopAPI.ProxySettings): Promise<void> {
        return proxyInstance.setProxy(proxySettings);
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

    const messageBox = this.messageBox;
    const progress = this.progress;
    const notifications = this.notifications;
    const inputQuickPickRegistry = this.inputQuickPickRegistry;
    const customPickRegistry = this.customPickRegistry;
    const windowObj: typeof containerDesktopAPI.window = {
      showInformationMessage: (message: string, ...items: string[]) => {
        return messageBox.showDialog('info', extManifest.displayName, message, items);
      },
      showWarningMessage: (message: string, ...items: string[]) => {
        return messageBox.showDialog('warning', extManifest.displayName, message, items);
      },
      showErrorMessage: (message: string, ...items: string[]) => {
        return messageBox.showDialog('error', extManifest.displayName, message, items);
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
      createCustomPick: <T extends containerDesktopAPI.CustomPickItem>(): containerDesktopAPI.CustomPick<T> => {
        return customPickRegistry.createCustomPick();
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
      async createResources(context, manifests): Promise<void> {
        return kubernetesClient.createResources(context, manifests);
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
      startContainer(engineId: string, id: string) {
        return containerProviderRegistry.startContainer(engineId, id);
      },
      logsContainer(engineId: string, id: string, callback: (name: string, data: string) => void) {
        return containerProviderRegistry.logsContainer(engineId, id, callback);
      },
      stopContainer(engineId: string, id: string) {
        return containerProviderRegistry.stopContainer(engineId, id);
      },
      saveImage(engineId: string, id: string, filename: string) {
        return containerProviderRegistry.saveImage(engineId, id, filename);
      },
      pushImage(
        engineId: string,
        imageId: string,
        callback: (name: string, data: string) => void,
        authInfo: containerDesktopAPI.ContainerAuthInfo | undefined,
      ): Promise<void> {
        return containerProviderRegistry.pushImage(engineId, imageId, callback, authInfo);
      },
      tagImage(engineId: string, imageId: string, repo: string, tag: string | undefined): Promise<void> {
        return containerProviderRegistry.tagImage(engineId, imageId, repo, tag);
      },
      onEvent: (listener, thisArg, disposables) => {
        return containerProviderRegistry.onEvent(listener, thisArg, disposables);
      },
    };

    const authenticationProviderRegistry = this.authenticationProviderRegistry;
    const extensionInfo = {
      id: `${extManifest.publisher}.${extManifest.name}`,
      label: extManifest.displayName,
      version: extManifest.version,
      publisher: extManifest.publisher,
      name: extManifest.name,
    };
    const authentication: typeof containerDesktopAPI.authentication = {
      getSession: (providerId, scopes, options) => {
        return authenticationProviderRegistry.getSession(extensionInfo, providerId, scopes, options);
      },
      registerAuthenticationProvider: (id, label, provider, options) => {
        // update path of images using the extension path
        if (options?.images) {
          const images = options.images;
          instance.updateImage.bind(instance);
          images.icon = instance.updateImage(images.icon, extensionPath);
          images.logo = instance.updateImage(images.logo, extensionPath);
        }
        return authenticationProviderRegistry.registerAuthenticationProvider(id, label, provider, options);
      },
      onDidChangeSessions: (listener, thisArg, disposables) => {
        return authenticationProviderRegistry.onDidChangeSessions(listener, thisArg, disposables);
      },
    };

    const telemetry = this.telemetry;
    const env: typeof containerDesktopAPI.env = {
      get isMac() {
        return isMac();
      },
      get isWindows() {
        return isWindows();
      },
      get isLinux() {
        return isLinux();
      },
      openExternal: async (uri: containerDesktopAPI.Uri): Promise<boolean> => {
        const url = uri.toString();
        try {
          const result = await securityRestrictionCurrentHandler.handler?.(url);
          return result || false;
        } catch (error) {
          console.error(`Unable to open external link  ${uri.toString()} from extension ${extensionInfo.id}`, error);
          return false;
        }
      },
      createTelemetryLogger: (
        sender?: containerDesktopAPI.TelemetrySender,
        options?: containerDesktopAPI.TelemetryLoggerOptions,
      ) => {
        return telemetry.createTelemetryLogger(extensionInfo, sender, options);
      },
      get isTelemetryEnabled() {
        return telemetry.isTelemetryEnabled();
      },
      onDidChangeTelemetryEnabled: (listener, thisArg, disposables) => {
        return telemetry.onDidChangeTelemetryEnabled(listener, thisArg, disposables);
      },
      get clipboard(): containerDesktopAPI.Clipboard {
        return {
          readText: async () => {
            return electronClipboard.readText();
          },
          writeText: async value => {
            return electronClipboard.writeText(value);
          },
        };
      },
    };

    const process: typeof containerDesktopAPI.process = {
      exec: (
        command: string,
        args?: string[],
        options?: containerDesktopAPI.RunOptions,
      ): Promise<containerDesktopAPI.RunResult> => {
        return this.exec.exec(command, args, options);
      },
    };

    const contextAPI: typeof containerDesktopAPI.context = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setValue: (key: string, value: any, scope?: 'onboarding'): void => {
        if (scope === 'onboarding') {
          key = `${extensionInfo.id}.${scope}.${key}`;
        }
        this.context.setValue(key, value);
      },
    };

    return <typeof containerDesktopAPI>{
      // Types
      Disposable: Disposable,
      Uri: Uri,
      EventEmitter: Emitter,
      CancellationTokenSource: CancellationTokenSource,
      TelemetryTrustedValue: TelemetryTrustedValue,
      commands,
      env,
      process,
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
      authentication,
      context: contextAPI,
    };
  }

  // helper function to call require from the given path
  protected doRequire(path: string): NodeRequire {
    return require(path);
  }

  loadRuntime(extension: AnalyzedExtension): NodeRequire | undefined {
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
        if (childMod?.id.startsWith(extension.path) && !childMod.id.endsWith('.node')) {
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
        // delete the entry
        delete require.cache[key];
        const ix = mod?.parent?.children.indexOf(mod) || 0;
        if (ix >= 0) {
          mod?.parent?.children.splice(ix, 1);
        }
      }
    });
    if (extension.mainPath) {
      return this.doRequire(extension.mainPath);
    }
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
  async activateExtension(extension: AnalyzedExtension, extensionMain: any | undefined): Promise<void> {
    this.extensionState.set(extension.id, 'starting');
    this.extensionStateErrors.delete(extension.id);
    this.apiSender.send('extension-starting', {});

    const subscriptions: containerDesktopAPI.Disposable[] = extension.subscriptions;

    const storagePath = path.resolve(this.extensionsStorageDirectory, extension.id);
    const oldStoragePath = path.resolve(this.extensionsStorageDirectory, extension.name);

    // Migrate old storage path to new storage path
    if (fs.existsSync(oldStoragePath) && !fs.existsSync(storagePath)) {
      await fs.promises.rename(oldStoragePath, storagePath);
    }

    const extensionContext: containerDesktopAPI.ExtensionContext = {
      subscriptions,
      storagePath,
    };
    let deactivateFunction = undefined;
    if (typeof extensionMain?.['deactivate'] === 'function') {
      deactivateFunction = extensionMain['deactivate'];
    }

    const telemetryOptions = { extensionId: extension.id };
    try {
      if (typeof extensionMain?.['activate'] === 'function') {
        // maximum time to wait for the extension to activate by reading from configuration
        const delayInSeconds: number =
          this.configurationRegistry
            .getConfiguration(ExtensionLoaderSettings.SectionName)
            .get(ExtensionLoaderSettings.MaxActivationTime) || 5;
        const delayInMilliseconds = delayInSeconds * 1000;

        // reject a promise after this delay
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Extension ${extension.id} activation timed out after ${delayInSeconds} seconds`)),
            delayInMilliseconds,
          ),
        );

        // it returns exports
        console.log(`Activating extension (${extension.id}) with max activation time of ${delayInSeconds} seconds`);

        const beforeActivateTime = performance.now();
        const activatePromise = extensionMain['activate'].apply(undefined, [extensionContext]);

        // if extension reach the timeout, do not wait for it to finish and flag as error
        await Promise.race([activatePromise, timeoutPromise]);
        const afterActivateTime = performance.now();
        console.log(
          `Activating extension (${extension.id}) ended in ${Math.round(
            afterActivateTime - beforeActivateTime,
          )} milliseconds`,
        );
      }
      const id = extension.id;
      const activatedExtension: ActivatedExtension = {
        id,
        deactivateFunction,
        extensionContext,
      };
      this.activatedExtensions.set(extension.id, activatedExtension);
      this.extensionState.set(extension.id, 'started');
      this.apiSender.send('extension-started');
    } catch (err) {
      console.log(`Activating extension ${extension.id} failed error:${err}`);
      this.extensionState.set(extension.id, 'failed');
      this.extensionStateErrors.set(extension.id, err);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (telemetryOptions as any).error = err;
    } finally {
      this.telemetry.track('activateExtension', telemetryOptions);
    }
  }

  async deactivateExtension(extensionId: string): Promise<void> {
    const extension = this.activatedExtensions.get(extensionId);
    if (!extension) {
      return;
    }

    const telemetryOptions = { extensionId: extension.id };

    this.extensionState.set(extension.id, 'stopping');
    this.apiSender.send('extension-stopping');

    if (extension.deactivateFunction) {
      try {
        await extension.deactivateFunction();
      } catch (err) {
        console.log(`Deactivating extension ${extension.id} failed error:${err}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (telemetryOptions as any).error = err;
      }
    }

    const watcher = this.watcherExtensions.get(extensionId);
    watcher?.dispose();

    const analyzedExtension = this.analyzedExtensions.get(extensionId);
    // dispose subscriptions if any
    analyzedExtension?.dispose();
    this.activatedExtensions.delete(extensionId);
    this.extensionState.set(extension.id, 'stopped');
    this.apiSender.send('extension-stopped');
    this.telemetry.track('deactivateExtension', telemetryOptions);
  }

  async stopAllExtensions(): Promise<void> {
    await Promise.all(
      Array.from(this.activatedExtensions.keys()).map(extensionId => this.deactivateExtension(extensionId)),
    );
  }

  async startExtension(extensionId: string): Promise<void> {
    const extension = this.analyzedExtensions.get(extensionId);
    if (extension) {
      const analyzedExtension = await this.analyzeExtension(extension.path, extension.removable);

      if (analyzedExtension) {
        await this.loadExtension(analyzedExtension, true);
      }
    }
  }

  async removeExtensionPerUserRequest(extensionId: string): Promise<void> {
    const telemetryData: {
      extensionId: string;
      error?: unknown;
    } = {
      extensionId,
    };
    try {
      await this.removeExtension(extensionId);
    } catch (error) {
      telemetryData.error = error;
      throw error;
    } finally {
      this.telemetry.track('removeExtension', telemetryData);
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
      this.apiSender.send('extension-removed');
    }
  }

  getConfigurationRegistry(): ConfigurationRegistry {
    return this.configurationRegistry;
  }

  getPluginsDirectory(): string {
    return this.pluginsDirectory;
  }

  setExtensionsUpdates(extensionsToUpdate: ExtensionUpdateInfo[]): void {
    // loop existing extensions and add the data
    for (const extensionToUpdate of extensionsToUpdate) {
      const existingExtension = this.analyzedExtensions.get(extensionToUpdate.id);
      if (existingExtension) {
        existingExtension.update = {
          version: extensionToUpdate.version,
          ociUri: extensionToUpdate.ociUri,
        };
      }
    }

    // ask to refresh
    this.apiSender.send('extensions-updated');
  }
}
