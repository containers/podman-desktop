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
import { readFile, realpath } from 'node:fs/promises';
import * as path from 'node:path';

import type * as containerDesktopAPI from '@podman-desktop/api';
import AdmZip from 'adm-zip';
import { app, clipboard as electronClipboard } from 'electron';

import type { ColorRegistry } from '/@/plugin/color-registry.js';
import type { KubeGeneratorRegistry, KubernetesGeneratorProvider } from '/@/plugin/kube-generator-registry.js';
import type { MenuRegistry } from '/@/plugin/menu-registry.js';
import type { NavigationManager } from '/@/plugin/navigation/navigation-manager.js';
import type { WebviewRegistry } from '/@/plugin/webview/webview-registry.js';
import type { ExtensionError, ExtensionInfo, ExtensionUpdateInfo } from '/@api/extension-info.js';
import type { ImageInspectInfo } from '/@api/image-inspect-info.js';

import { securityRestrictionCurrentHandler } from '../security-restrictions-handler.js';
import { getBase64Image, isLinux, isMac, isWindows } from '../util.js';
import type { ApiSenderType } from './api.js';
import type { PodInfo } from './api/pod-info.js';
import type { AuthenticationImpl } from './authentication.js';
import { CancellationTokenSource } from './cancellation-token.js';
import type { CliToolRegistry } from './cli-tool-registry.js';
import type { CommandRegistry } from './command-registry.js';
import type { ConfigurationRegistry, IConfigurationNode } from './configuration-registry.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import type { Context } from './context/context.js';
import type { CustomPickRegistry } from './custompick/custompick-registry.js';
import type { DialogRegistry } from './dialog-registry.js';
import type { Directories } from './directories.js';
import type { Event } from './events/emitter.js';
import { Emitter } from './events/emitter.js';
import { DEFAULT_TIMEOUT, ExtensionLoaderSettings } from './extension-loader-settings.js';
import type { FilesystemMonitoring } from './filesystem-monitoring.js';
import type { IconRegistry } from './icon-registry.js';
import type { ImageCheckerImpl } from './image-checker.js';
import type { ImageFilesRegistry } from './image-files-registry.js';
import type { ImageRegistry } from './image-registry.js';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import { InputBoxValidationSeverity, QuickPickItemKind } from './input-quickpick/input-quickpick-registry.js';
import type { KubernetesClient } from './kubernetes-client.js';
import type { MessageBox } from './message-box.js';
import { ModuleLoader } from './module-loader.js';
import type { NotificationRegistry } from './notification-registry.js';
import type { OnboardingRegistry } from './onboarding-registry.js';
import type { ProgressImpl } from './progress-impl.js';
import { ProgressLocation } from './progress-impl.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { Proxy } from './proxy.js';
import { createHttpPatchedModules } from './proxy-resolver.js';
import { type SafeStorageRegistry } from './safe-storage/safe-storage-registry.js';
import {
  StatusBarAlignLeft,
  StatusBarAlignRight,
  StatusBarItemDefaultPriority,
  StatusBarItemImpl,
} from './statusbar/statusbar-item.js';
import type { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';
import type { TrayMenuRegistry } from './tray-menu-registry.js';
import type { IDisposable } from './types/disposable.js';
import { Disposable } from './types/disposable.js';
import { TelemetryTrustedValue } from './types/telemetry.js';
import { Uri } from './types/uri.js';
import type { Exec } from './util/exec.js';
import type { ViewRegistry } from './view-registry.js';

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

  readme: string;

  update?: {
    version: string;
    ociUri: string;
  };

  missingDependencies?: string[];
  circularDependencies?: string[];

  error?: string;

  readonly subscriptions: { dispose(): unknown }[];

  dispose(): void;
}

export interface ActivatedExtension {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  deactivateFunction: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exports: any;
  extensionContext: containerDesktopAPI.ExtensionContext;
  packageJSON: unknown;
}

const EXTENSION_OPTION = '--extension-folder';

export interface RequireCacheDict {
  [key: string]: NodeModule | undefined;
}

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

  private readonly _onDidChange = new Emitter<void>();
  readonly onDidChange: Event<void> = this._onDidChange.event;

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
    private kubeGeneratorRegistry: KubeGeneratorRegistry,
    private cliToolRegistry: CliToolRegistry,
    private notificationRegistry: NotificationRegistry,
    private imageCheckerProvider: ImageCheckerImpl,
    private imageFilesRegistry: ImageFilesRegistry,
    private navigationManager: NavigationManager,
    private webviewRegistry: WebviewRegistry,
    private colorRegistry: ColorRegistry,
    private dialogRegistry: DialogRegistry,
    private safeStorageRegistry: SafeStorageRegistry,
  ) {
    this.pluginsDirectory = directories.getPluginsDirectory();
    this.pluginsScanDirectory = directories.getPluginsScanDirectory();
    this.extensionsStorageDirectory = directories.getExtensionsStorageDirectory();
    this.moduleLoader = new ModuleLoader(require('node:module'), this.analyzedExtensions);
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
      state: this.extensionState.get(extension.id) ?? 'stopped',
      error: this.mapError(this.extensionStateErrors.get(extension.id)),
      id: extension.id,
      path: extension.path,
      removable: extension.removable,
      update: extension.update,
      readme: extension.readme,
      icon: extension.manifest.icon ? this.updateImage(extension.manifest.icon, extension.path) : undefined,
    }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transformActivatedExtensionToExposedExtension<T = any>(
    activatedExtension: ActivatedExtension,
  ): containerDesktopAPI.Extension<T> {
    return {
      id: activatedExtension.id,
      exports: activatedExtension.exports,
      extensionUri: activatedExtension.extensionContext.extensionUri,
      extensionPath: activatedExtension.extensionContext.extensionUri.fsPath,
      packageJSON: activatedExtension.packageJSON,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getExposedExtension<T = any>(extensionId: string): containerDesktopAPI.Extension<T> | undefined {
    // do we have a matching extension?
    const activatedExtension = this.activatedExtensions.get(extensionId);
    if (activatedExtension) {
      return this.transformActivatedExtensionToExposedExtension(activatedExtension);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllExposedExtensions(): containerDesktopAPI.Extension<any>[] {
    return Array.from(this.activatedExtensions.values()).map(activatedExtension =>
      this.transformActivatedExtensionToExposedExtension(activatedExtension),
    );
  }

  async loadPackagedFile(filePath: string): Promise<void> {
    // need to unpack the file before load it
    const filename = path.basename(filePath);
    const dirname = path.dirname(filePath);

    const unpackedDirectory = path.resolve(dirname, `../unpacked/${filename}`);
    fs.mkdirSync(unpackedDirectory, { recursive: true });
    // extract to an existing directory
    const admZip = new AdmZip(filePath);
    admZip.extractAllTo(unpackedDirectory, true);

    const extension = await this.analyzeExtension(unpackedDirectory, true);
    if (!extension.error) {
      await this.loadExtension(extension);
      this.apiSender.send('extension-started', {});
      this._onDidChange.fire();
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
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [ExtensionLoaderSettings.SectionName + '.' + ExtensionLoaderSettings.MaxActivationTime]: {
          description: 'Maximum activation time for an extension, in seconds.',
          type: 'number',
          default: DEFAULT_TIMEOUT,
          minimum: 1,
          maximum: 100,
        },
      },
    };

    const disabledExtensionConfiguration: IConfigurationNode = {
      id: 'preferences.extensions',
      title: 'Extensions',
      type: 'object',
      properties: {
        [ExtensionLoaderSettings.SectionName + '.' + ExtensionLoaderSettings.Disabled]: {
          description: 'Disabled extensions',
          type: 'array',
          hidden: true,
        },
      },
    };

    this.configurationRegistry.registerConfigurations([maxActivationTimeConfiguration, disabledExtensionConfiguration]);
  }

  getDisabledExtensionIds(): string[] {
    return this.configurationRegistry
      .getConfiguration(ExtensionLoaderSettings.SectionName)
      .get<string[]>(ExtensionLoaderSettings.Disabled, []);
  }

  setDisabledExtensionIds(disabledExtensionIds: string[]): void {
    this.configurationRegistry
      .updateConfigurationValue(
        ExtensionLoaderSettings.SectionName + '.' + ExtensionLoaderSettings.Disabled,
        disabledExtensionIds,
      )
      .catch((error: unknown) => console.error('error while saving list of disabled extensions', error));
  }

  ensureExtensionIsEnabled(extensionId: string): void {
    // the extension is getting intentionally started or uninstalled.
    // if it is on the list of disabled extensions remove it
    const disabledExtensionIds = this.getDisabledExtensionIds();
    const index = disabledExtensionIds.indexOf(extensionId);
    if (index > -1) {
      disabledExtensionIds.splice(index, 1);

      this.setDisabledExtensionIds(disabledExtensionIds);
    }
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

  async start(): Promise<void> {
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
    ).filter(extension => !extension.error);
    analyzedExtensions.push(...analyzedFoldersExtension);

    const analyzedExternalExtensions = (
      await Promise.all(externalExtensions.map(folder => this.analyzeExtension(folder, false)))
    ).filter(extension => !extension.error);
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
      ).filter(extension => !extension.error);
      analyzedExtensions.push(...analyzedPluginsDirectoryExtensions);
    }

    // now we have all extensions, we can load them
    await this.loadExtensions(analyzedExtensions);
  }

  async analyzeExtension(extensionPath: string, removable: boolean): Promise<AnalyzedExtension> {
    const resolvedExtensionPath = await realpath(extensionPath);
    // do nothing if there is no package.json file
    let error = undefined;
    if (!fs.existsSync(path.resolve(resolvedExtensionPath, 'package.json'))) {
      error = `Ignoring extension ${resolvedExtensionPath} without package.json file`;
      console.warn(error);
      const analyzedExtension: AnalyzedExtension = {
        id: '<unknown>',
        name: '<unknown>',
        path: resolvedExtensionPath,
        manifest: undefined,
        readme: '',
        api: <typeof containerDesktopAPI>{},
        removable,
        subscriptions: [],
        dispose(): void {},
        error,
      };
      return analyzedExtension;
    }

    // log error if the manifest is missing required entries
    const manifest = await this.loadManifest(resolvedExtensionPath);
    if (!manifest.name || !manifest.displayName || !manifest.version || !manifest.publisher || !manifest.description) {
      error = `Extension ${resolvedExtensionPath} missing required manifest entry in package.json (name, displayName, version, publisher, description)`;
      console.warn(error);
    }

    // create api object
    const disposables: Disposable[] = [];
    const api = this.createApi(resolvedExtensionPath, manifest, disposables);

    // is there a README.md file in the extension folder ?
    let readme = '';
    if (fs.existsSync(path.resolve(resolvedExtensionPath, 'README.md'))) {
      readme = await readFile(path.resolve(resolvedExtensionPath, 'README.md'), 'utf8');
    }

    const analyzedExtension: AnalyzedExtension = {
      id: `${manifest.publisher}.${manifest.name}`,
      name: manifest.name,
      manifest,
      path: resolvedExtensionPath,
      mainPath: manifest.main ? path.resolve(resolvedExtensionPath, manifest.main) : undefined,
      readme,
      api,
      removable,
      subscriptions: disposables,
      dispose(): void {
        disposables.forEach(disposable => disposable.dispose());
      },
      error,
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

    for (const extension of sortedExtensions) {
      await this.loadExtension(extension);
    }
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
  ): void {
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

      if (!updatedExtension.error) {
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

    const extensionCommands = extension.manifest?.contributes?.commands;
    if (extensionCommands) {
      const disposable = this.commandRegistry.registerCommandsFromExtension(extension.id, extensionCommands);
      extension.subscriptions.push(disposable);
    }

    // register menus after the contributed commands so we can see if contributed commands have icons
    const menus = extension.manifest?.contributes?.menus;
    if (menus) {
      extension.subscriptions.push(this.menuRegistry.registerMenus(menus));
    }

    const icons = extension.manifest?.contributes?.icons;
    if (icons) {
      this.iconRegistry.registerIconContribution(extension, icons);
    }

    const themes = extension.manifest?.contributes?.themes;
    if (themes) {
      const disposable = this.colorRegistry.registerExtensionThemes(extension, themes);
      extension.subscriptions.push(disposable);
    }

    const views = extension.manifest?.contributes?.views;
    if (views) {
      extension.subscriptions.push(this.viewRegistry.registerViews(extension.id, views));
    }

    const onboarding = extension.manifest?.contributes?.onboarding;
    if (onboarding) {
      extension.subscriptions.push(this.onboardingRegistry.registerOnboarding(extension, onboarding));
    }

    extension.subscriptions.push(this.notificationRegistry.registerExtension(extension.id));
    this.analyzedExtensions.set(extension.id, extension);
    this.extensionState.delete(extension.id);
    this.extensionStateErrors.delete(extension.id);

    const telemetryOptions: Record<string, unknown> = {
      extensionId: extension.id,
      extensionVersion: extension.manifest?.version,
    };

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
      if (!this.getDisabledExtensionIds().includes(extension.id)) {
        const beforeLoadingRuntime = performance.now();
        const runtime = this.loadRuntime(extension);
        const afterLoadingRuntime = performance.now();

        telemetryOptions['loadingRuntimeDuration'] = afterLoadingRuntime - beforeLoadingRuntime;

        await this.activateExtension(extension, runtime);
      } else {
        console.log(`Extension (${extension.id}) not activated because it is disabled`);
      }
    } catch (err) {
      this.extensionState.set(extension.id, 'failed');
      this.extensionStateErrors.set(extension.id, err);
      telemetryOptions['error'] = err;
      this.telemetry.track('loadExtension.error', telemetryOptions);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createApi(extensionPath: string, extManifest: any, disposables: IDisposable[]): typeof containerDesktopAPI {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const instance = this;
    const extensionInfo = {
      id: `${extManifest.publisher}.${extManifest.name}`,
      label: extManifest.displayName,
      version: extManifest.version,
      publisher: extManifest.publisher,
      name: extManifest.name,
      extensionPath,
      icon: extManifest.icon ? instance.updateImage(extManifest.icon, extensionPath) : undefined,
    };

    const commandRegistry = this.commandRegistry;
    const commands: typeof containerDesktopAPI.commands = {
      registerCommand(
        command: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (...args: any[]) => any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        thisArg?: any,
      ): containerDesktopAPI.Disposable {
        const registration = commandRegistry.registerCommand(command, callback, thisArg);
        disposables.push(registration);
        return registration;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      executeCommand<T = unknown>(commandId: string, ...args: any[]): PromiseLike<T> {
        return commandRegistry.executeCommand(commandId, ...args);
      },
    };

    //export function executeCommand<T = unknown>(command: string, ...rest: any[]): PromiseLike<T>;

    const providerRegistry = this.providerRegistry;
    const imageFilesRegistry = this.imageFilesRegistry;

    const provider: typeof containerDesktopAPI.provider = {
      createProvider(providerOptions: containerDesktopAPI.ProviderOptions): containerDesktopAPI.Provider {
        // update path of images using the extension path
        if (providerOptions.images) {
          const images = providerOptions.images;
          instance.updateImage.bind(instance);
          images.icon = instance.updateImage(images.icon, extensionPath);
          images.logo = instance.updateImage(images.logo, extensionPath);
        }
        const registration = providerRegistry.createProvider(extensionInfo.id, extensionInfo.label, providerOptions);
        disposables.push(registration);
        return registration;
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
        providerConnectionInfo: containerDesktopAPI.ContainerProviderConnection,
      ): containerDesktopAPI.LifecycleContext {
        return providerRegistry.getMatchingProviderLifecycleContextByProviderId(providerId, providerConnectionInfo);
      },
      createImageFilesProvider: (
        provider: containerDesktopAPI.ImageFilesCallbacks,
        metadata?: containerDesktopAPI.ImageFilesProviderMetadata,
      ): containerDesktopAPI.ImageFilesProvider => {
        const imageFilesProvider = imageFilesRegistry.create(extensionInfo, provider, metadata);
        disposables.push(imageFilesProvider);
        return imageFilesProvider;
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
        const registration = trayMenuRegistry.registerMenuItem(item);
        disposables.push(registration);
        return registration;
      },
      registerProviderMenuItem(providerId: string, item: containerDesktopAPI.MenuItem): containerDesktopAPI.Disposable {
        const registration = trayMenuRegistry.registerProviderMenuItem(providerId, item);
        disposables.push(registration);
        return registration;
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
        const registration = imageRegistry.registerRegistryProvider(registryProvider);
        disposables.push(registration);
        return registration;
      },
    };

    const messageBox = this.messageBox;
    const progress = this.progress;
    const inputQuickPickRegistry = this.inputQuickPickRegistry;
    const customPickRegistry = this.customPickRegistry;
    const webviewRegistry = this.webviewRegistry;
    const dialogRegistry = this.dialogRegistry;
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

      showNotification: (notificationInfo: containerDesktopAPI.NotificationOptions): containerDesktopAPI.Disposable => {
        const notification = this.notificationRegistry.addNotification({
          ...notificationInfo,
          extensionId: extensionInfo.id,
          type: notificationInfo.type ?? 'info',
          title: notificationInfo.title ?? extensionInfo.name,
        });
        disposables.push(notification);
        return notification;
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

        const statusBarItem = new StatusBarItemImpl(this.statusBarRegistry, alignment, priority);
        disposables.push(statusBarItem);
        return statusBarItem;
      },
      createCustomPick: <T extends containerDesktopAPI.CustomPickItem>(): containerDesktopAPI.CustomPick<T> => {
        const customPick: containerDesktopAPI.CustomPick<T> = customPickRegistry.createCustomPick();
        disposables.push(customPick);
        return customPick;
      },
      createWebviewPanel: (
        viewType: string,
        title: string,
        options?: containerDesktopAPI.WebviewOptions,
      ): containerDesktopAPI.WebviewPanel => {
        const webviewPanel = webviewRegistry.createWebviewPanel(extensionInfo, viewType, title, options);
        disposables.push(webviewPanel);
        return webviewPanel;
      },
      listWebviews(): Promise<containerDesktopAPI.WebviewInfo[]> {
        return webviewRegistry.listSimpleWebviews();
      },
      showOpenDialog: async (
        options?: containerDesktopAPI.OpenDialogOptions,
      ): Promise<containerDesktopAPI.Uri[] | undefined> => {
        const result = await dialogRegistry.openDialog(options);
        if (result) {
          return result.map(uri => Uri.file(uri));
        }
      },
      showSaveDialog: async (
        options?: containerDesktopAPI.SaveDialogOptions,
      ): Promise<containerDesktopAPI.Uri | undefined> => {
        return dialogRegistry.saveDialog(options);
      },
    };

    const fileSystemMonitoring = this.fileSystemMonitoring;
    const fs: typeof containerDesktopAPI.fs = {
      createFileSystemWatcher(path: string): containerDesktopAPI.FileSystemWatcher {
        const filesystemWatcher = fileSystemMonitoring.createFileSystemWatcher(path);
        disposables.push(filesystemWatcher);
        return filesystemWatcher;
      },
    };

    const kubernetesClient = this.kubernetesClient;
    const kubernetesGeneratorRegistry = this.kubeGeneratorRegistry;
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
      registerKubernetesGenerator(provider: KubernetesGeneratorProvider): containerDesktopAPI.Disposable {
        return kubernetesGeneratorRegistry.registerKubeGenerator(provider);
      },
    };

    const containerProviderRegistry = this.containerProviderRegistry;
    const containerEngine: typeof containerDesktopAPI.containerEngine = {
      listContainers(): Promise<containerDesktopAPI.ContainerInfo[]> {
        return containerProviderRegistry.listSimpleContainers();
      },
      createContainer(
        engineId: string,
        containerCreateOptions: containerDesktopAPI.ContainerCreateOptions,
      ): Promise<containerDesktopAPI.ContainerCreateResult> {
        return containerProviderRegistry.createContainer(engineId, containerCreateOptions);
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
      deleteContainer(engineId: string, id: string) {
        return containerProviderRegistry.deleteContainer(engineId, id);
      },
      buildImage(
        context: string,
        eventCollect: (eventName: 'stream' | 'error' | 'finish', data: string) => void,
        options?: containerDesktopAPI.BuildImageOptions,
      ) {
        return containerProviderRegistry.buildImage(context, eventCollect, options);
      },
      listImages(options?: containerDesktopAPI.ListImagesOptions): Promise<containerDesktopAPI.ImageInfo[]> {
        return containerProviderRegistry.podmanListImages(options);
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
      pullImage(
        providerContainerConnection: containerDesktopAPI.ContainerProviderConnection,
        imageName: string,
        callback: (event: containerDesktopAPI.PullEvent) => void,
      ): Promise<void> {
        return containerProviderRegistry.pullImage(providerContainerConnection, imageName, callback);
      },
      tagImage(engineId: string, imageId: string, repo: string, tag: string | undefined): Promise<void> {
        return containerProviderRegistry.tagImage(engineId, imageId, repo, tag);
      },
      deleteImage(engineId: string, id: string) {
        return containerProviderRegistry.deleteImage(engineId, id);
      },
      getImageInspect(engineId: string, id: string): Promise<ImageInspectInfo> {
        return containerProviderRegistry.getImageInspect(engineId, id);
      },
      info(engineId: string): Promise<containerDesktopAPI.ContainerEngineInfo> {
        return containerProviderRegistry.info(engineId);
      },
      listInfos(options?: containerDesktopAPI.ListInfosOptions): Promise<containerDesktopAPI.ContainerEngineInfo[]> {
        return containerProviderRegistry.listInfos(options);
      },
      onEvent: (listener, thisArg, disposables) => {
        return containerProviderRegistry.onEvent(listener, thisArg, disposables);
      },
      listNetworks(): Promise<containerDesktopAPI.NetworkInspectInfo[]> {
        return containerProviderRegistry.listNetworks();
      },
      createNetwork(
        providerContainerConnection: containerDesktopAPI.ContainerProviderConnection,
        networkCreateOptions: containerDesktopAPI.NetworkCreateOptions,
      ): Promise<containerDesktopAPI.NetworkCreateResult> {
        return containerProviderRegistry.createNetwork(providerContainerConnection, networkCreateOptions);
      },
      listVolumes(): Promise<containerDesktopAPI.VolumeListInfo[]> {
        return containerProviderRegistry.listVolumes();
      },
      createVolume(
        volumeCreateOptions?: containerDesktopAPI.VolumeCreateOptions,
      ): Promise<containerDesktopAPI.VolumeCreateResponseInfo> {
        return containerProviderRegistry.createVolume(volumeCreateOptions?.provider, volumeCreateOptions);
      },
      deleteVolume(volumeName: string, options?: containerDesktopAPI.VolumeDeleteOptions): Promise<void> {
        return containerProviderRegistry.deleteVolume(volumeName, options);
      },
      createPod(podOptions: containerDesktopAPI.PodCreateOptions): Promise<{ engineId: string; Id: string }> {
        return containerProviderRegistry.createPod(podOptions);
      },
      listPods(): Promise<PodInfo[]> {
        return containerProviderRegistry.listPods();
      },
      stopPod(engineId: string, podId: string): Promise<void> {
        return containerProviderRegistry.stopPod(engineId, podId);
      },
      removePod(engineId: string, podId: string): Promise<void> {
        return containerProviderRegistry.removePod(engineId, podId);
      },
      createManifest(
        manifestOptions: containerDesktopAPI.ManifestCreateOptions,
      ): Promise<{ engineId: string; Id: string }> {
        return containerProviderRegistry.createManifest(manifestOptions);
      },
      inspectManifest(engineId: string, id: string): Promise<containerDesktopAPI.ManifestInspectInfo> {
        return containerProviderRegistry.inspectManifest(engineId, id);
      },
      removeManifest(engineId: string, id: string): Promise<void> {
        return containerProviderRegistry.removeManifest(engineId, id);
      },
      replicatePodmanContainer(
        source: { engineId: string; id: string },
        target: { engineId: string },
        overrideParameters: containerDesktopAPI.ContainerCreateOptions,
      ): Promise<{ Id: string; Warnings: string[] }> {
        return containerProviderRegistry.replicatePodmanContainer(source, target, overrideParameters);
      },
      startPod(engineId: string, podId: string): Promise<void> {
        return containerProviderRegistry.startPod(engineId, podId);
      },
      async statsContainer(
        engineId: string,
        containerId: string,
        callback: (stats: containerDesktopAPI.ContainerStatsInfo) => void,
      ): Promise<Disposable> {
        const identifier = await containerProviderRegistry.getContainerStats(engineId, containerId, callback);
        return Disposable.create(() => {
          containerProviderRegistry.stopContainerStats(identifier).catch((err: unknown): void => {
            console.error('Something went wrong while trying to stop container stats', err);
          });
        });
      },
    };

    const authenticationProviderRegistry = this.authenticationProviderRegistry;

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
        const authenticationProvider = authenticationProviderRegistry.registerAuthenticationProvider(
          id,
          label,
          provider,
          options,
        );
        disposables.push(authenticationProvider);
        return authenticationProvider;
      },
      onDidChangeSessions: (listener, thisArg, disposables) => {
        return authenticationProviderRegistry.onDidChangeSessions(listener, thisArg, disposables);
      },
    };

    const extensions: typeof containerDesktopAPI.extensions = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      getExtension<T = any>(extensionId: string): containerDesktopAPI.Extension<T> | undefined {
        return instance.getExposedExtension(extensionId);
      },
      get all() {
        return instance.getAllExposedExtensions();
      },
      onDidChange: (listener, thisArg, disposables) => {
        return instance.onDidChange(listener, thisArg, disposables);
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
          return !!result;
        } catch (error) {
          console.error(`Unable to open external link  ${uri.toString()} from extension ${extensionInfo.id}`, error);
          return false;
        }
      },
      createTelemetryLogger: (
        sender?: containerDesktopAPI.TelemetrySender,
        options?: containerDesktopAPI.TelemetryLoggerOptions,
      ) => {
        const telemetryLogger = telemetry.createTelemetryLogger(extensionInfo, sender, options);
        disposables.push(telemetryLogger);
        return telemetryLogger;
      },
      get isTelemetryEnabled() {
        return telemetry.isTelemetryEnabled();
      },
      onDidChangeTelemetryEnabled: (listener, thisArg, disposables) => {
        return telemetry.onDidChangeTelemetryEnabled(listener, thisArg, disposables);
      },
      get clipboard(): containerDesktopAPI.Clipboard {
        return {
          readText: async (): Promise<string> => {
            return electronClipboard.readText();
          },
          writeText: async (value): Promise<void> => {
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

    const cli: typeof containerDesktopAPI.cli = {
      createCliTool: (options: containerDesktopAPI.CliToolOptions): containerDesktopAPI.CliTool => {
        if (options.images) {
          options.images.icon = instance.updateImage(options?.images?.icon, extensionPath);
        }
        const cliTool = this.cliToolRegistry.createCliTool(extensionInfo, options);
        disposables.push(cliTool);
        return cliTool;
      },
    };

    const imageCheckerProvider = this.imageCheckerProvider;
    const imageChecker: typeof containerDesktopAPI.imageChecker = {
      registerImageCheckerProvider: (
        provider: containerDesktopAPI.ImageCheckerProvider,
        metadata?: containerDesktopAPI.ImageCheckerProviderMetadata,
      ): containerDesktopAPI.Disposable => {
        const imageCheckerProviderRegistration = imageCheckerProvider.registerImageCheckerProvider(
          extensionInfo,
          provider,
          metadata,
        );
        disposables.push(imageCheckerProviderRegistration);
        return imageCheckerProviderRegistration;
      },
    };

    const navigation: typeof containerDesktopAPI.navigation = {
      navigateToContainers: async (): Promise<void> => {
        await this.navigationManager.navigateToContainers();
      },
      navigateToContainer: async (id: string): Promise<void> => {
        await this.navigationManager.navigateToContainer(id);
      },
      navigateToContainerLogs: async (id: string): Promise<void> => {
        await this.navigationManager.navigateToContainerLogs(id);
      },
      navigateToContainerInspect: async (id: string): Promise<void> => {
        await this.navigationManager.navigateToContainerInspect(id);
      },
      navigateToContainerTerminal: async (id: string): Promise<void> => {
        await this.navigationManager.navigateToContainerTerminal(id);
      },
      navigateToImages: async (): Promise<void> => {
        await this.navigationManager.navigateToImages();
      },
      navigateToImage: async (id: string, engineId: string, tag: string): Promise<void> => {
        await this.navigationManager.navigateToImage(id, engineId, tag);
      },
      navigateToVolumes: async (): Promise<void> => {
        await this.navigationManager.navigateToVolumes();
      },
      navigateToVolume: async (name: string, engineId: string): Promise<void> => {
        await this.navigationManager.navigateToVolume(name, engineId);
      },
      navigateToPods: async (): Promise<void> => {
        await this.navigationManager.navigateToPods();
      },
      navigateToPod: async (kind: string, name: string, engineId: string): Promise<void> => {
        await this.navigationManager.navigateToPod(kind, name, engineId);
      },
      navigateToContribution: async (name: string): Promise<void> => {
        await this.navigationManager.navigateToContribution(name);
      },
      navigateToWebview: async (webviewId: string): Promise<void> => {
        await this.navigationManager.navigateToWebview(webviewId);
      },
      navigateToAuthentication: async (): Promise<void> => {
        await this.navigationManager.navigateToAuthentication();
      },
      navigateToResources: async (): Promise<void> => {
        await this.navigationManager.navigateToResources();
      },
      navigateToEditProviderContainerConnection: async (
        connection: containerDesktopAPI.ProviderContainerConnection,
      ): Promise<void> => {
        await this.navigationManager.navigateToEditProviderContainerConnection(connection);
      },
    };

    const version = app.getVersion();

    return <typeof containerDesktopAPI>{
      // Types
      Disposable: Disposable,
      Uri: Uri,
      EventEmitter: Emitter,
      CancellationTokenSource: CancellationTokenSource,
      TelemetryTrustedValue: TelemetryTrustedValue,
      version,
      commands,
      env,
      process,
      registry,
      extensions,
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
      cli,
      imageChecker,
      navigation,
    };
  }

  // helper function to call require from the given path
  protected doRequire(path: string): NodeRequire {
    return require(path);
  }

  // helper function to get require cache
  protected get requireCache(): RequireCacheDict {
    return require.cache;
  }

  loadRuntime(extension: AnalyzedExtension): NodeRequire | undefined {
    // cleaning the cache for all files of that plug-in.
    Object.keys(this.requireCache).forEach(key => {
      const mod: NodeJS.Module | undefined = this.requireCache[key];

      // attempting to reload a native module will throw an error, so skip them
      if (mod?.id?.endsWith('.node')) {
        return;
      }

      // remove children that are part of the plug-in
      let i = mod?.children?.length ?? 0;
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
        const ix = mod?.parent?.children.indexOf(mod) ?? 0;
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

    const extensionUri = Uri.file(extension.path);

    // Migrate old storage path to new storage path
    if (fs.existsSync(oldStoragePath) && !fs.existsSync(storagePath)) {
      await fs.promises.rename(oldStoragePath, storagePath);
    }

    const secrets = this.safeStorageRegistry.getExtensionStorage(extension.id);

    const extensionContext: containerDesktopAPI.ExtensionContext = {
      subscriptions,
      storagePath,
      extensionUri,
      secrets,
    };
    let deactivateFunction = undefined;
    if (typeof extensionMain?.['deactivate'] === 'function') {
      deactivateFunction = extensionMain['deactivate'];
    }

    const telemetryOptions: Record<string, unknown> = {
      extensionId: extension.id,
      extensionVersion: extension.manifest?.version,
    };
    let exports: unknown;
    try {
      if (typeof extensionMain?.['activate'] === 'function') {
        // maximum time to wait for the extension to activate by reading from configuration
        const delayInSeconds: number = this.configurationRegistry
          .getConfiguration(ExtensionLoaderSettings.SectionName)
          .get(ExtensionLoaderSettings.MaxActivationTime, DEFAULT_TIMEOUT);
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
        exports = await Promise.race([activatePromise, timeoutPromise]);
        const afterActivateTime = performance.now();

        // Computing activation duration
        const duration = afterActivateTime - beforeActivateTime;
        telemetryOptions['duration'] = duration;

        console.log(`Activating extension (${extension.id}) ended in ${Math.round(duration)} milliseconds`);
      }
      const id = extension.id;
      const packageJSON = extension.manifest;
      const activatedExtension: ActivatedExtension = {
        id,
        packageJSON,
        deactivateFunction,
        extensionContext,
        exports,
      };
      this.activatedExtensions.set(extension.id, activatedExtension);
      this.extensionState.set(extension.id, 'started');
      this.apiSender.send('extension-started');
    } catch (err) {
      console.log(`Activating extension ${extension.id} failed error:${err}`);

      // dispose resources
      for (const subscription of extensionContext.subscriptions) {
        try {
          subscription.dispose();
        } catch (err: unknown) {
          console.error('Something went wrong while trying to dispose extension subscription', err);
        }
      }

      this.extensionState.set(extension.id, 'failed');
      this.extensionStateErrors.set(extension.id, err);
      // Storing error in the telemetry options
      telemetryOptions['error'] = err;
    } finally {
      this.telemetry.track('activateExtension', telemetryOptions);
    }
  }

  async stopExtension(extensionId: string): Promise<void> {
    // the user explicitly stopped (disabled) this extension, so save the configuration
    const disabledExtensions = this.getDisabledExtensionIds();
    if (!disabledExtensions.includes(extensionId)) {
      disabledExtensions.push(extensionId);
      this.setDisabledExtensionIds(disabledExtensions);
    }

    await this.deactivateExtension(extensionId);
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
    this._onDidChange.fire();
    this.telemetry.track('deactivateExtension', telemetryOptions);
  }

  async stopAllExtensions(): Promise<void> {
    await Promise.all(
      Array.from(this.activatedExtensions.keys()).map(extensionId => this.deactivateExtension(extensionId)),
    );
    this.kubernetesClient.dispose();
  }

  async startExtension(extensionId: string): Promise<void> {
    this.ensureExtensionIsEnabled(extensionId);

    const extension = this.analyzedExtensions.get(extensionId);
    if (extension) {
      const analyzedExtension = await this.analyzeExtension(extension.path, extension.removable);

      if (!analyzedExtension.error) {
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

      this.ensureExtensionIsEnabled(extensionId);
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
      this._onDidChange.fire();
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
