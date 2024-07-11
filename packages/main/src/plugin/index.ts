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

/**
 * @module preload
 */
import { EventEmitter } from 'node:events';
import * as os from 'node:os';
import * as path from 'node:path';

import type {
  Cluster,
  Context as KubernetesContext,
  KubernetesObject,
  V1ConfigMap,
  V1Deployment,
  V1Ingress,
  V1NamespaceList,
  V1Node,
  V1PersistentVolumeClaim,
  V1Pod,
  V1PodList,
  V1Secret,
  V1Service,
} from '@kubernetes/client-node';
import type * as containerDesktopAPI from '@podman-desktop/api';
import checkDiskSpacePkg from 'check-disk-space';
import type Dockerode from 'dockerode';
import type { WebContents } from 'electron';
import { app, BrowserWindow, clipboard, ipcMain, shell } from 'electron';
import type { IpcMainInvokeEvent } from 'electron/main';

import type { KubernetesGeneratorInfo } from '/@/plugin/api/KubernetesGeneratorInfo.js';
import type {
  GenerateKubeResult,
  KubernetesGeneratorArgument,
  KubernetesGeneratorSelector,
} from '/@/plugin/kube-generator-registry.js';
import { KubeGeneratorRegistry } from '/@/plugin/kube-generator-registry.js';
import type { Menu } from '/@/plugin/menu-registry.js';
import { MenuRegistry } from '/@/plugin/menu-registry.js';
import { NavigationManager } from '/@/plugin/navigation/navigation-manager.js';
import type { ExtensionBanner, RecommendedRegistry } from '/@/plugin/recommendations/recommendations-api.js';
import { TaskManager } from '/@/plugin/task-manager.js';
import { Updater } from '/@/plugin/updater.js';
import type { CliToolInfo } from '/@api/cli-tool-info.js';
import type { ColorInfo } from '/@api/color-info.js';
import type { CommandInfo } from '/@api/command-info.js';
import type {
  ContainerCreateOptions,
  ContainerExportOptions,
  ContainerImportOptions,
  ContainerInfo,
  ImageLoadOptions,
  ImagesSaveOptions,
  SimpleContainerInfo,
  VolumeCreateOptions,
  VolumeCreateResponseInfo,
} from '/@api/container-info.js';
import type { ContainerInspectInfo } from '/@api/container-inspect-info.js';
import type { ContainerStatsInfo } from '/@api/container-stats-info.js';
import type { ContributionInfo } from '/@api/contribution-info.js';
import type { ExtensionInfo } from '/@api/extension-info.js';
import type { HistoryInfo } from '/@api/history-info.js';
import type { IconInfo } from '/@api/icon-info.js';
import type { ImageCheckerInfo } from '/@api/image-checker-info.js';
import type { ImageFilesInfo } from '/@api/image-files-info.js';
import type { ImageInfo } from '/@api/image-info.js';
import type { ImageInspectInfo } from '/@api/image-inspect-info.js';
import type { ImageSearchOptions, ImageSearchResult } from '/@api/image-registry.js';
import type { ManifestCreateOptions, ManifestInspectInfo } from '/@api/manifest-info.js';
import type { NetworkInspectInfo } from '/@api/network-info.js';
import type { NotificationCard, NotificationCardOptions } from '/@api/notification.js';
import type { OnboardingInfo, OnboardingStatus } from '/@api/onboarding.js';
import type { V1Route } from '/@api/openshift-types.js';
import type {
  PreflightCheckEvent,
  PreflightChecksCallback,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info.js';
import type { PullEvent } from '/@api/pull-event.js';
import type { ViewInfoUI } from '/@api/view-info.js';
import type { VolumeInspectInfo, VolumeListInfo } from '/@api/volume-info.js';
import type { WebviewInfo } from '/@api/webview-info.js';

import { securityRestrictionCurrentHandler } from '../security-restrictions-handler.js';
import type { TrayMenu } from '../tray-menu.js';
import { isMac } from '../util.js';
import type { ApiSenderType } from './api.js';
import type { PodInfo, PodInspectInfo } from './api/pod-info.js';
import { AppearanceInit } from './appearance-init.js';
import type { AuthenticationProviderInfo } from './authentication.js';
import { AuthenticationImpl } from './authentication.js';
import { showAccountsMenu } from './authentication-menu.js';
import { AutostartEngine } from './autostart-engine.js';
import { CancellationTokenRegistry } from './cancellation-token-registry.js';
import { Certificates } from './certificates.js';
import { CliToolRegistry } from './cli-tool-registry.js';
import { CloseBehavior } from './close-behavior.js';
import { ColorRegistry } from './color-registry.js';
import { CommandRegistry } from './command-registry.js';
import type { IConfigurationPropertyRecordedSchema } from './configuration-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import { ConfirmationInit } from './confirmation-init.js';
import { ContainerProviderRegistry } from './container-registry.js';
import { Context } from './context/context.js';
import { ContributionManager } from './contribution-manager.js';
import { CustomPickRegistry } from './custompick/custompick-registry.js';
import { DialogRegistry } from './dialog-registry.js';
import { Directories } from './directories.js';
import { DockerDesktopInstallation } from './docker-extension/docker-desktop-installation.js';
import { DockerPluginAdapter } from './docker-extension/docker-plugin-adapter.js';
import type {
  ContainerCreateOptions as PodmanContainerCreateOptions,
  PlayKubeInfo,
} from './dockerode/libpod-dockerode.js';
import { EditorInit } from './editor-init.js';
import { ExtensionLoader } from './extension-loader.js';
import { ExtensionsCatalog } from './extensions-catalog/extensions-catalog.js';
import type { CatalogExtension } from './extensions-catalog/extensions-catalog-api.js';
import { ExtensionsUpdater } from './extensions-updater/extensions-updater.js';
import { Featured } from './featured/featured.js';
import type { FeaturedExtension } from './featured/featured-api.js';
import { FilesystemMonitoring } from './filesystem-monitoring.js';
import { IconRegistry } from './icon-registry.js';
import { ImageCheckerImpl } from './image-checker.js';
import { ImageFilesRegistry } from './image-files-registry.js';
import { ImageRegistry } from './image-registry.js';
import { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import { ExtensionInstaller } from './install/extension-installer.js';
import { KubernetesClient } from './kubernetes-client.js';
import type { KubeContext } from './kubernetes-context.js';
import type { ContextGeneralState, ResourceName } from './kubernetes-context-state.js';
import { downloadGuideList } from './learning-center/learning-center.js';
import { LibpodApiInit } from './libpod-api-enable/libpod-api-init.js';
import type { MessageBoxOptions, MessageBoxReturnValue } from './message-box.js';
import { MessageBox } from './message-box.js';
import { NotificationRegistry } from './notification-registry.js';
import { OnboardingRegistry } from './onboarding-registry.js';
import { OpenDevToolsInit } from './open-devtools-init.js';
import { ProgressImpl } from './progress-impl.js';
import { ProviderRegistry } from './provider-registry.js';
import { Proxy } from './proxy.js';
import { RecommendationsRegistry } from './recommendations/recommendations-registry.js';
import { SafeStorageRegistry } from './safe-storage/safe-storage-registry.js';
import type { StatusBarEntryDescriptor } from './statusbar/statusbar-registry.js';
import { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import { PAGE_EVENT_TYPE, Telemetry } from './telemetry/telemetry.js';
import { TerminalInit } from './terminal-init.js';
import { TrayIconColor } from './tray-icon-color.js';
import { TrayMenuRegistry } from './tray-menu-registry.js';
import { Troubleshooting } from './troubleshooting.js';
import type { IDisposable } from './types/disposable.js';
import type { Deferred } from './util/deferred.js';
import { Exec } from './util/exec.js';
import { getFreePort, getFreePortRange, isFreePort } from './util/port.js';
import { ViewRegistry } from './view-registry.js';
import { WebviewRegistry } from './webview/webview-registry.js';
import { WelcomeInit } from './welcome/welcome-init.js';

// workaround for ESM
const checkDiskSpace: (path: string) => Promise<{ free: number }> = checkDiskSpacePkg as unknown as (
  path: string,
) => Promise<{ free: number }>;

type LogType = 'log' | 'warn' | 'trace' | 'debug' | 'error';

export const UPDATER_UPDATE_AVAILABLE_ICON = 'fa fa-exclamation-triangle';

export interface LoggerWithEnd extends containerDesktopAPI.Logger {
  // when task is finished, this function is called
  onEnd: () => void;
}

export class PluginSystem {
  // ready is when we've finished to initialize extension system
  private isReady = false;

  // ready when all extensions have been started
  private isExtensionsStarted = false;

  // notified when UI is dom-ready
  private uiReady = false;

  // true if the application is quitting
  private isQuitting = false;

  // The yet to be init ExtensionLoader
  private extensionLoader!: ExtensionLoader;
  private validExtList!: ExtensionInfo[];

  constructor(
    private trayMenu: TrayMenu,
    private mainWindowDeferred: Deferred<BrowserWindow>,
  ) {
    app.on('before-quit', () => {
      this.isQuitting = true;
    });
  }

  getWebContentsSender(): WebContents {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (!window) {
      throw new Error('Unable to find the main window');
    }
    return window.webContents;
  }

  // encode the error to be sent over IPC
  // this is needed because on the client it will display
  // a generic error message 'Error invoking remote method' and
  // it's not useful for end user
  encodeIpcError(e: unknown): { name?: string; message: unknown; extra?: Record<string, unknown> } {
    let builtError;
    if (e instanceof Error) {
      builtError = { name: e.name, message: e.message, extra: { ...e } };
    } else {
      builtError = { message: e };
    }
    return builtError;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcHandle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<void> | any): any {
    ipcMain.handle(channel, async (...args) => {
      try {
        return { result: await Promise.resolve(listener(...args)) };
      } catch (e) {
        return { error: this.encodeIpcError(e) };
      }
    });
  }

  // Create an Error to access stack trace
  // Match a regex for the file name and return it
  // return nothing if file name not found
  async getExtName(): Promise<string | undefined> {
    //Create an error for its stack property
    const stack = new Error().stack;
    //Create a map for extension path => extension name
    const extensions: Map<string, string> = new Map();

    //Check if index.ts private member extensionLoader initialized
    //If it is grab listExtensions()
    if (!this.extensionLoader) return;

    const currentExtList = await this.extensionLoader.listExtensions();

    //Only loop through if list of extensions is different than last time
    if (this.validExtList !== currentExtList) {
      this.validExtList = currentExtList;
      //start setting path => name
      this.validExtList.forEach((extInfo: ExtensionInfo) => {
        extensions.set(extInfo.path, extInfo.name);
      });
    }

    if (extensions.size > 0 && stack) {
      let toAppend = '';
      extensions.forEach((name, extPath) => {
        extPath = path.normalize(extPath);

        if (stack.includes(extPath)) toAppend = name;
      });

      if (toAppend !== '') return `[${toAppend}]`;
    }
  }

  // log locally and also send it to the renderer process
  // so client can see logs in the developer console
  redirectConsole(logType: LogType): void {
    // keep original method
    const originalConsoleMethod = console[logType];
    console[logType] = (...args): void => {
      this.getExtName()
        .then(extName => {
          if (extName) args.unshift(extName);

          // still display as before by invoking original method
          originalConsoleMethod(...args);

          // but also send the content remotely
          if (!this.isQuitting) {
            try {
              this.getWebContentsSender().send('console:output', logType, ...args);
            } catch (err) {
              originalConsoleMethod(err);
            }
          }
        })
        .catch((err: unknown) => {
          console.error('Error in redirectConsole', err);
        });
    };
  }

  // setup pipe/redirect for console.log, console.warn, console.trace, console.debug, console.error
  redirectLogging(): void {
    const logTypes: LogType[] = ['log', 'warn', 'trace', 'debug', 'error'];
    logTypes.forEach(logType => this.redirectConsole(logType));
  }

  getApiSender(webContents: WebContents): ApiSenderType {
    const queuedEvents: { channel: string; data: unknown }[] = [];

    const flushQueuedEvents = (): void => {
      // flush queued events ?
      if (this.uiReady && this.isReady && queuedEvents.length > 0) {
        console.log(`Delayed startup, flushing ${queuedEvents.length} events`);
        queuedEvents.forEach(({ channel, data }) => {
          webContents.send('api-sender', channel, data);
        });
        queuedEvents.length = 0;
      }
    };

    webContents.on('dom-ready', () => {
      console.log('PluginSystem: received dom-ready event from the UI');
      this.uiReady = true;
      flushQueuedEvents();
    });

    const eventEmitter = new EventEmitter();
    return {
      send: (channel: string, data: unknown): void => {
        // send only when the UI is ready
        if (this.uiReady && this.isReady) {
          flushQueuedEvents();
          if (!webContents.isDestroyed()) {
            webContents.send('api-sender', channel, data);
          }
        } else {
          // add to the queue
          queuedEvents.push({ channel, data });
        }
        eventEmitter.emit(channel, data);
      },
      receive: (channel: string, func: (...args: unknown[]) => void): IDisposable => {
        eventEmitter.on(channel, func);
        return {
          dispose: (): void => {
            eventEmitter.removeListener(channel, func);
          },
        };
      },
    };
  }

  async setupSecurityRestrictionsOnLinks(messageBox: MessageBox): Promise<void> {
    // external URLs should be validated by the user
    securityRestrictionCurrentHandler.handler = async (url: string): Promise<boolean> => {
      if (!url) {
        return false;
      }

      // if url is a known domain, open it directly
      const urlObject = new URL(url);
      const validDomains = ['podman-desktop.io', 'podman.io', 'localhost', '127.0.0.1'];
      const skipConfirmationUrl = validDomains.some(
        domain => urlObject.hostname.endsWith(domain) || urlObject.hostname === domain,
      );

      if (skipConfirmationUrl || urlObject.protocol === 'file:') {
        await shell.openExternal(url);
        return true;
      }

      const result = await messageBox.showMessageBox({
        title: 'Open External Website',
        message: 'Are you sure you want to open the external website ?',
        detail: url,
        type: 'question',
        buttons: ['Yes', 'Copy link', 'Cancel'],
        cancelId: 2,
      });

      if (result.response === 0) {
        // open externally the URL
        await shell.openExternal(url);
        return true;
      } else if (result.response === 1) {
        // copy to clipboard
        clipboard.writeText(url);
      }
      return false;
    };
  }

  // initialize extension loader mechanism
  async initExtensions(): Promise<ExtensionLoader> {
    const notifications: NotificationCardOptions[] = [];

    this.isReady = false;
    this.uiReady = false;
    this.ipcHandle('extension-system:isReady', async (): Promise<boolean> => {
      return this.isReady;
    });

    this.ipcHandle('extension-system:isExtensionsStarted', async (): Promise<boolean> => {
      return this.isExtensionsStarted;
    });

    // redirect main process logs to the extension loader
    this.redirectLogging();

    // init api sender
    const apiSender = this.getApiSender(this.getWebContentsSender());

    const iconRegistry = new IconRegistry(apiSender);
    const directories = new Directories();
    const statusBarRegistry = new StatusBarRegistry(apiSender);

    const safeStorageRegistry = new SafeStorageRegistry(directories);
    notifications.push(...(await safeStorageRegistry.init()));

    const configurationRegistry = new ConfigurationRegistry(apiSender, directories);
    notifications.push(...configurationRegistry.init());

    const colorRegistry = new ColorRegistry(apiSender, configurationRegistry);
    colorRegistry.init();

    const proxy = new Proxy(configurationRegistry);
    await proxy.init();

    const telemetry = new Telemetry(configurationRegistry, proxy);
    await telemetry.init();

    const exec = new Exec(proxy);

    const commandRegistry = new CommandRegistry(apiSender, telemetry);
    const taskManager = new TaskManager(apiSender, statusBarRegistry, commandRegistry);
    taskManager.init();

    const notificationRegistry = new NotificationRegistry(apiSender, taskManager);
    const menuRegistry = new MenuRegistry(commandRegistry);
    const kubeGeneratorRegistry = new KubeGeneratorRegistry();
    const certificates = new Certificates();
    await certificates.init();
    const imageRegistry = new ImageRegistry(apiSender, telemetry, certificates, proxy);
    const viewRegistry = new ViewRegistry();
    const context = new Context(apiSender);
    const containerProviderRegistry = new ContainerProviderRegistry(
      apiSender,
      configurationRegistry,
      imageRegistry,
      telemetry,
    );
    const cancellationTokenRegistry = new CancellationTokenRegistry();
    const providerRegistry = new ProviderRegistry(apiSender, containerProviderRegistry, telemetry);
    const trayMenuRegistry = new TrayMenuRegistry(this.trayMenu, commandRegistry, providerRegistry, telemetry);
    const inputQuickPickRegistry = new InputQuickPickRegistry(apiSender);
    const fileSystemMonitoring = new FilesystemMonitoring();
    const customPickRegistry = new CustomPickRegistry(apiSender);
    const onboardingRegistry = new OnboardingRegistry(configurationRegistry, context);
    const kubernetesClient = new KubernetesClient(apiSender, configurationRegistry, fileSystemMonitoring, telemetry);
    await kubernetesClient.init();
    const closeBehaviorConfiguration = new CloseBehavior(configurationRegistry);
    await closeBehaviorConfiguration.init();

    const messageBox = new MessageBox(apiSender);

    // Don't show the tray icon options on Mac
    if (!isMac()) {
      const trayIconColor = new TrayIconColor(configurationRegistry, providerRegistry);
      await trayIconColor.init();
    }

    // Add all notifications to notification registry
    notifications.forEach(notification => notificationRegistry.addNotification(notification));
    notifications.length = 0;
    Object.freeze(notifications);
    kubeGeneratorRegistry.registerDefaultKubeGenerator({
      name: 'PodmanKube',
      types: ['Compose', 'Container', 'Pod'],
      generate: async (kubernetesGeneratorArguments: KubernetesGeneratorArgument[]) => {
        const results: string[] = await Promise.all(
          kubernetesGeneratorArguments.map(argument => {
            if (argument.containers)
              return containerProviderRegistry.generatePodmanKube(argument.engineId, argument.containers);
            else if (argument.compose)
              return containerProviderRegistry.generatePodmanKube(argument.engineId, argument.compose);
            else if (argument.pods)
              return containerProviderRegistry.generatePodmanKube(argument.engineId, argument.pods);
            else throw new Error('Either containers, compose or pods property must be defined.');
          }),
        );

        return {
          yaml: results.join('\n---\n'),
        };
      },
    });

    const autoStartEngine = new AutostartEngine(configurationRegistry, providerRegistry);
    providerRegistry.registerAutostartEngine(autoStartEngine);

    providerRegistry.addProviderListener((name: string, providerInfo: ProviderInfo) => {
      if (name === 'provider:update-status') {
        apiSender.send('provider:update-status', providerInfo.name);
      }
    });

    statusBarRegistry.setEntry('help', false, -1, undefined, 'Help', 'fa fa-question-circle', true, 'help', undefined);

    statusBarRegistry.setEntry(
      'troubleshooting',
      false,
      0,
      undefined,
      'Troubleshooting',
      'fa fa-lightbulb',
      true,
      'troubleshooting',
      undefined,
    );

    statusBarRegistry.setEntry(
      'feedback',
      false,
      0,
      undefined,
      'Share your feedback',
      'fa fa-comment',
      true,
      'feedback',
      undefined,
    );

    // Init update logic
    new Updater(messageBox, configurationRegistry, statusBarRegistry, commandRegistry, taskManager).init();

    commandRegistry.registerCommand('feedback', () => {
      apiSender.send('display-feedback', '');
    });

    commandRegistry.registerCommand('help', () => {
      return navigationManager.navigateToHelp();
    });

    commandRegistry.registerCommand('troubleshooting', () => {
      return navigationManager.navigateToTroubleshooting();
    });

    // register appearance (light, dark, auto being system)
    const appearanceConfiguration = new AppearanceInit(configurationRegistry);
    appearanceConfiguration.init();

    const confirmationConfiguration = new ConfirmationInit(configurationRegistry);
    confirmationConfiguration.init();

    const terminalInit = new TerminalInit(configurationRegistry);
    terminalInit.init();

    // only in development mode
    if (import.meta.env.DEV) {
      const openDevToolsInit = new OpenDevToolsInit(configurationRegistry);
      openDevToolsInit.init();
    }

    // init editor configuration
    const editorInit = new EditorInit(configurationRegistry);
    editorInit.init();

    // init welcome configuration
    const welcomeInit = new WelcomeInit(configurationRegistry);
    welcomeInit.init();

    // init libpod API configuration
    const libpodApiInit = new LibpodApiInit(configurationRegistry);
    libpodApiInit.init();

    const authentication = new AuthenticationImpl(apiSender, messageBox);

    const cliToolRegistry = new CliToolRegistry(apiSender, exec, telemetry);

    const imageChecker = new ImageCheckerImpl(apiSender);

    const imageFiles = new ImageFilesRegistry(apiSender);

    const troubleshooting = new Troubleshooting(apiSender);

    const contributionManager = new ContributionManager(apiSender, directories, containerProviderRegistry, exec);

    const webviewRegistry = new WebviewRegistry(apiSender);
    await webviewRegistry.start();

    const dialogRegistry = new DialogRegistry(this.mainWindowDeferred);
    dialogRegistry.init();

    const navigationManager = new NavigationManager(
      apiSender,
      containerProviderRegistry,
      contributionManager,
      providerRegistry,
      webviewRegistry,
    );

    this.extensionLoader = new ExtensionLoader(
      commandRegistry,
      menuRegistry,
      providerRegistry,
      configurationRegistry,
      imageRegistry,
      apiSender,
      trayMenuRegistry,
      messageBox,
      new ProgressImpl(taskManager),
      statusBarRegistry,
      kubernetesClient,
      fileSystemMonitoring,
      proxy,
      containerProviderRegistry,
      inputQuickPickRegistry,
      customPickRegistry,
      authentication,
      iconRegistry,
      onboardingRegistry,
      telemetry,
      viewRegistry,
      context,
      directories,
      exec,
      kubeGeneratorRegistry,
      cliToolRegistry,
      notificationRegistry,
      imageChecker,
      imageFiles,
      navigationManager,
      webviewRegistry,
      colorRegistry,
      dialogRegistry,
      safeStorageRegistry,
    );
    await this.extensionLoader.init();

    const extensionsCatalog = new ExtensionsCatalog(certificates, proxy, configurationRegistry);
    extensionsCatalog.init();
    const featured = new Featured(this.extensionLoader, extensionsCatalog);

    const recommendationsRegistry = new RecommendationsRegistry(
      configurationRegistry,
      featured,
      this.extensionLoader,
      extensionsCatalog,
    );
    recommendationsRegistry.init();

    // do not wait
    featured.init().catch((e: unknown) => {
      console.error('Unable to initialized the featured extensions', e);
    });

    // setup security restrictions on links
    await this.setupSecurityRestrictionsOnLinks(messageBox);

    this.ipcHandle('container-provider-registry:listContainers', async (): Promise<ContainerInfo[]> => {
      return containerProviderRegistry.listContainers();
    });

    this.ipcHandle(
      'container-provider-registry:listSimpleContainersByLabel',
      async (_listener, label: string, key: string): Promise<SimpleContainerInfo[]> => {
        return containerProviderRegistry.listSimpleContainersByLabel(label, key);
      },
    );

    this.ipcHandle('container-provider-registry:listSimpleContainers', async (): Promise<SimpleContainerInfo[]> => {
      return containerProviderRegistry.listSimpleContainers();
    });
    this.ipcHandle('container-provider-registry:listImages', async (): Promise<ImageInfo[]> => {
      return containerProviderRegistry.podmanListImages();
    });
    this.ipcHandle('container-provider-registry:listPods', async (): Promise<PodInfo[]> => {
      return containerProviderRegistry.listPods();
    });
    this.ipcHandle('container-provider-registry:listNetworks', async (): Promise<NetworkInspectInfo[]> => {
      return containerProviderRegistry.listNetworks();
    });
    this.ipcHandle(
      'container-provider-registry:listVolumes',
      async (_listener, fetchUsage: boolean): Promise<VolumeListInfo[]> => {
        return containerProviderRegistry.listVolumes(fetchUsage);
      },
    );

    this.ipcHandle('container-provider-registry:reconnectContainerProviders', async (): Promise<void> => {
      return containerProviderRegistry.reconnectContainerProviders();
    });

    this.ipcHandle(
      'container-provider-registry:pingContainerEngine',
      async (_listener, providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<unknown> => {
        return containerProviderRegistry.pingContainerEngine(providerContainerConnectionInfo);
      },
    );

    this.ipcHandle(
      'container-provider-registry:listContainersFromEngine',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      ): Promise<{ Id: string; Names: string[] }[]> => {
        return containerProviderRegistry.listContainersFromEngine(providerContainerConnectionInfo);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pruneVolumes',
      async (_listener, engine: string): Promise<Dockerode.PruneVolumesInfo> => {
        return containerProviderRegistry.pruneVolumes(engine);
      },
    );

    this.ipcHandle(
      'container-provider-registry:getVolumeInspect',
      async (_listener, engine: string, volumeName: string): Promise<VolumeInspectInfo> => {
        return containerProviderRegistry.getVolumeInspect(engine, volumeName);
      },
    );
    this.ipcHandle(
      'container-provider-registry:removeVolume',
      async (_listener, engine: string, volumeName: string): Promise<void> => {
        return containerProviderRegistry.removeVolume(engine, volumeName);
      },
    );

    this.ipcHandle(
      'container-provider-registry:replicatePodmanContainer',
      async (
        _listener,
        source: { engineId: string; id: string },
        target: { engineId: string },
        overrideParameters: PodmanContainerCreateOptions,
      ): Promise<{ Id: string; Warnings: string[] }> => {
        return containerProviderRegistry.replicatePodmanContainer(source, target, overrideParameters);
      },
    );

    this.ipcHandle(
      'container-provider-registry:createPod',
      async (
        _listener,
        createOptions: containerDesktopAPI.PodCreateOptions,
      ): Promise<{ engineId: string; Id: string }> => {
        return containerProviderRegistry.createPod(createOptions);
      },
    );
    this.ipcHandle(
      'container-provider-registry:startPod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.startPod(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:restartPod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.restartPod(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:stopPod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.stopPod(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:removePod',
      async (_listener, engine: string, podId: string): Promise<void> => {
        return containerProviderRegistry.removePod(engine, podId);
      },
    );

    // manifest
    this.ipcHandle(
      'container-provider-registry:createManifest',
      async (_listener, manifestOptions: ManifestCreateOptions): Promise<{ engineId: string; Id: string }> => {
        return containerProviderRegistry.createManifest(manifestOptions);
      },
    );

    this.ipcHandle(
      'container-provider-registry:inspectManifest',
      async (_listener, engine: string, manifestId: string): Promise<ManifestInspectInfo> => {
        return containerProviderRegistry.inspectManifest(engine, manifestId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:generatePodmanKube',
      async (_listener, engine: string, names: string[]): Promise<string> => {
        const kubeGenerator = kubeGeneratorRegistry.getKubeGenerator();
        if (!kubeGenerator) throw new Error(`Cannot find default KubeGenerator.`);

        return (
          await kubeGenerator.generate([
            {
              engineId: engine,
              containers: names,
            },
          ])
        ).yaml;
      },
    );

    this.ipcHandle(
      'kubernetes-generator-registry:generateKube',
      async (
        _listener,
        kubernetesGeneratorArguments: KubernetesGeneratorArgument[],
        kubeGeneratorId?: string,
      ): Promise<GenerateKubeResult> => {
        const kubeGenerator = kubeGeneratorRegistry.getKubeGenerator(kubeGeneratorId);
        if (!kubeGenerator) throw new Error(`kubeGenerator with id ${kubeGeneratorId} cannot be found.`);

        return kubeGenerator.generate(kubernetesGeneratorArguments);
      },
    );

    this.ipcHandle(
      'container-provider-registry:playKube',
      async (
        _listener,
        yamlFilePath: string,
        selectedProvider: ProviderContainerConnectionInfo,
      ): Promise<PlayKubeInfo> => {
        return containerProviderRegistry.playKube(yamlFilePath, selectedProvider);
      },
    );
    this.ipcHandle(
      'container-provider-registry:startContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.startContainer(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:stopContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.stopContainer(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:deleteContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.deleteContainer(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:deleteImage',
      async (_listener, engine: string, imageId: string): Promise<void> => {
        return containerProviderRegistry.deleteImage(engine, imageId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:tagImage',
      async (_listener, engine: string, imageTag: string, repo: string, tag?: string): Promise<void> => {
        return containerProviderRegistry.tagImage(engine, imageTag, repo, tag);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getImageInspect',
      async (_listener, engine: string, imageId: string): Promise<ImageInspectInfo> => {
        return containerProviderRegistry.getImageInspect(engine, imageId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getImageHistory',
      async (_listener, engine: string, imageId: string): Promise<HistoryInfo[]> => {
        return containerProviderRegistry.getImageHistory(engine, imageId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getContainerInspect',
      async (_listener, engine: string, containerId: string): Promise<ContainerInspectInfo> => {
        return containerProviderRegistry.getContainerInspect(engine, containerId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getPodInspect',
      async (_listener, engine: string, podId: string): Promise<PodInspectInfo> => {
        return containerProviderRegistry.getPodInspect(engine, podId);
      },
    );
    this.ipcHandle(
      'container-provider-registry:getContainerStats',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<number> => {
        return containerProviderRegistry.getContainerStats(engine, containerId, (stats: ContainerStatsInfo) => {
          this.getWebContentsSender().send('container-provider-registry:getContainerStats-onData', onDataId, stats);
        });
      },
    );

    this.ipcHandle(
      'container-provider-registry:stopContainerStats',
      async (_listener, containerStatsId: number): Promise<void> => {
        return containerProviderRegistry.stopContainerStats(containerStatsId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pruneContainers',
      async (_listener, engine: string): Promise<Dockerode.PruneContainersInfo> => {
        return containerProviderRegistry.pruneContainers(engine);
      },
    );

    this.ipcHandle('container-provider-registry:prunePods', async (_listener, engine: string): Promise<void> => {
      return containerProviderRegistry.prunePods(engine);
    });

    this.ipcHandle('container-provider-registry:pruneImages', async (_listener, engine: string): Promise<void> => {
      return containerProviderRegistry.pruneImages(engine);
    });

    this.ipcHandle(
      'container-provider-registry:restartContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.restartContainer(engine, containerId);
      },
    );

    this.ipcHandle(
      'container-provider-registry:restartContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.restartContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:startContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.startContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:stopContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.stopContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:deleteContainersByLabel',
      async (_listener, engine: string, label: string, key: string): Promise<void> => {
        return containerProviderRegistry.deleteContainersByLabel(engine, label, key);
      },
    );

    this.ipcHandle(
      'container-provider-registry:createAndStartContainer',
      async (_listener, engine: string, options: ContainerCreateOptions): Promise<{ id: string }> => {
        options.start = true;
        return containerProviderRegistry.createContainer(engine, options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:createVolume',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
        options: VolumeCreateOptions,
      ): Promise<VolumeCreateResponseInfo> => {
        return containerProviderRegistry.createVolume(providerContainerConnectionInfo, options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:pullImage',
      async (
        _listener,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
        imageName: string,
        callbackId: number,
      ): Promise<void> => {
        return containerProviderRegistry.pullImage(providerContainerConnectionInfo, imageName, (event: PullEvent) => {
          this.getWebContentsSender().send('container-provider-registry:pullImage-onData', callbackId, event);
        });
      },
    );
    this.ipcHandle(
      'container-provider-registry:pushImage',
      async (_listener, engine: string, imageId: string, callbackId: number): Promise<void> => {
        return containerProviderRegistry.pushImage(engine, imageId, (name: string, data: string) => {
          this.getWebContentsSender().send('container-provider-registry:pushImage-onData', callbackId, name, data);
        });
      },
    );
    this.ipcHandle(
      'container-provider-registry:logsContainer',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<void> => {
        return containerProviderRegistry.logsContainer(engine, containerId, (name: string, data: string) => {
          this.getWebContentsSender().send('container-provider-registry:logsContainer-onData', onDataId, name, data);
        });
      },
    );

    const containerProviderRegistryShellInContainerSendCallback = new Map<
      number,
      { write: (param: string) => void; resize: (w: number, h: number) => void }
    >();
    this.ipcHandle(
      'container-provider-registry:shellInContainer',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<number> => {
        // provide the data content to the remote side
        const shellInContainerInvocation = await containerProviderRegistry.shellInContainer(
          engine,
          containerId,
          (content: Buffer) => {
            this.getWebContentsSender().send('container-provider-registry:shellInContainer-onData', onDataId, content);
          },
          (error: string) => {
            this.getWebContentsSender().send('container-provider-registry:shellInContainer-onError', onDataId, error);
          },
          () => {
            this.getWebContentsSender().send('container-provider-registry:shellInContainer-onEnd', onDataId);
            // delete the callback
            containerProviderRegistryShellInContainerSendCallback.delete(onDataId);
          },
        );
        // store the callback
        containerProviderRegistryShellInContainerSendCallback.set(onDataId, shellInContainerInvocation);
        return onDataId;
      },
    );

    this.ipcHandle(
      'container-provider-registry:shellInContainerSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = containerProviderRegistryShellInContainerSendCallback.get(onDataId);
        if (callback) {
          callback.write(content);
        }
      },
    );

    this.ipcHandle(
      'container-provider-registry:shellInContainerResize',
      async (_listener, onDataId: number, width: number, height: number): Promise<void> => {
        const callback = containerProviderRegistryShellInContainerSendCallback.get(onDataId);
        if (callback) {
          callback.resize(width, height);
        }
      },
    );

    const containerProviderRegistryAttachContainerSendCallback = new Map<number, (param: string) => void>();
    this.ipcHandle(
      'container-provider-registry:attachContainer',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<number> => {
        // provide the data content to the remote side
        const attachContainerInvocation = await containerProviderRegistry.attachContainer(
          engine,
          containerId,
          (content: string) => {
            this.getWebContentsSender().send('container-provider-registry:attachContainer-onData', onDataId, content);
          },
          (error: string) => {
            this.getWebContentsSender().send('container-provider-registry:attachContainer-onError', onDataId, error);
          },
          () => {
            this.getWebContentsSender().send('container-provider-registry:attachContainer-onEnd', onDataId);
            // delete the callback
            containerProviderRegistryAttachContainerSendCallback.delete(onDataId);
          },
        );
        // store the callback
        containerProviderRegistryAttachContainerSendCallback.set(onDataId, attachContainerInvocation);
        return onDataId;
      },
    );

    this.ipcHandle(
      'container-provider-registry:attachContainerSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = containerProviderRegistryAttachContainerSendCallback.get(onDataId);
        if (callback) {
          callback(content);
        }
      },
    );

    this.ipcHandle(
      'container-provider-registry:buildImage',
      async (
        _listener,
        containerBuildContextDirectory: string,
        relativeContainerfilePath: string,
        imageName: string,
        platform: string,
        selectedProvider: ProviderContainerConnectionInfo,
        onDataCallbacksBuildImageId: number,
        cancellableTokenId?: number,
        buildargs?: { [key: string]: string },
      ): Promise<unknown> => {
        const abortController = this.createAbortControllerOnCancellationToken(
          cancellationTokenRegistry,
          cancellableTokenId,
        );
        return containerProviderRegistry.buildImage(
          containerBuildContextDirectory,
          (eventName: string, data: string) => {
            this.getWebContentsSender().send(
              'container-provider-registry:buildImage-onData',
              onDataCallbacksBuildImageId,
              eventName,
              data,
            );
          },
          {
            containerFile: relativeContainerfilePath,
            tag: imageName,
            platform,
            provider: selectedProvider,
            abortController,
            buildargs,
          },
        );
      },
    );

    this.ipcHandle(
      'container-provider-registry:exportContainer',
      async (_listener, engine: string, options: ContainerExportOptions): Promise<void> => {
        return containerProviderRegistry.exportContainer(engine, options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:importContainer',
      async (_listener, options: ContainerImportOptions): Promise<void> => {
        return containerProviderRegistry.importContainer(options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:saveImages',
      async (_listener, options: ImagesSaveOptions): Promise<void> => {
        return containerProviderRegistry.saveImages(options);
      },
    );

    this.ipcHandle(
      'container-provider-registry:loadImages',
      async (_listener, options: ImageLoadOptions): Promise<void> => {
        return containerProviderRegistry.loadImages(options);
      },
    );

    this.ipcHandle('status-bar:getStatusBarEntries', async (): Promise<StatusBarEntryDescriptor[]> => {
      return statusBarRegistry.getStatusBarEntries();
    });

    this.ipcHandle(
      'status-bar:executeStatusBarEntryCommand',
      async (
        _,
        command: string,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        args: any[],
      ): Promise<void> => {
        await commandRegistry.executeCommand(command, args);
      },
    );

    this.ipcHandle('provider-registry:getProviderInfos', async (): Promise<ProviderInfo[]> => {
      return providerRegistry.getProviderInfos();
    });

    this.ipcHandle(
      'provider-registry:cleanup',
      async (_listener, providerIds: string[], loggerId: string, tokenId: number): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:cleanup-onData', loggerId);

        const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
        const token = tokenSource?.token;

        return providerRegistry.executeCleanupActions(logger, providerIds, token);
      },
    );

    this.ipcHandle('cli-tool-registry:getCliToolInfos', async (): Promise<CliToolInfo[]> => {
      return cliToolRegistry.getCliToolInfos();
    });

    this.ipcHandle(
      'troubleshooting:saveLogs',
      async (
        _listener,
        consoleLogs: { logType: LogType; message: string }[],
        destinaton: string,
      ): Promise<string[]> => {
        return troubleshooting.saveLogs(consoleLogs, destinaton);
      },
    );

    this.ipcHandle(
      'troubleshooting:generateLogFileName',
      async (_listener, filename: string, prefix?: string): Promise<string> => {
        return troubleshooting.generateLogFileName(filename, prefix);
      },
    );

    this.ipcHandle(
      'cli-tool-registry:updateCliTool',
      async (_listener, id: string, loggerId: string): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:updateCliTool-onData', loggerId);
        try {
          await cliToolRegistry.updateCliTool(id, logger);
        } catch (error) {
          logger.error(error);
          throw error;
        } finally {
          logger.onEnd();
        }
      },
    );

    this.ipcHandle('menu-registry:getContributedMenus', async (_, context: string): Promise<Menu[]> => {
      return menuRegistry.getContributedMenus(context);
    });

    this.ipcHandle(
      'kube-generator-registry:getKubeGeneratorsInfos',
      async (_, selector?: KubernetesGeneratorSelector): Promise<KubernetesGeneratorInfo[]> => {
        return kubeGeneratorRegistry.getKubeGeneratorsInfos(selector);
      },
    );

    this.ipcHandle(
      'command-registry:executeCommand',
      async (_, command: string, ...args: unknown[]): Promise<unknown> => {
        return commandRegistry.executeCommand(command, ...args);
      },
    );

    this.ipcHandle('clipboard:writeText', async (_, text: string, type?: 'selection' | 'clipboard'): Promise<void> => {
      return clipboard.writeText(text, type);
    });

    this.ipcHandle(
      'provider-registry:onDidUpdateProviderStatus',
      async (_, providerInternalId: string, onDidUpdateProviderStatusCallbackIdnumber: number): Promise<void> => {
        return providerRegistry.onDidUpdateProviderStatus(providerInternalId, (providerInfo: ProviderInfo) => {
          this.getWebContentsSender().send(
            'provider-registry:onDidUpdateProviderStatus-onData',
            onDidUpdateProviderStatusCallbackIdnumber,
            providerInfo,
          );
        });
      },
    );

    this.ipcHandle(
      'provider-registry:getProviderDetectionChecks',
      async (_, providerInternalId: string): Promise<containerDesktopAPI.ProviderDetectionCheck[]> => {
        return providerRegistry.getProviderDetectionChecks(providerInternalId);
      },
    );

    this.ipcHandle('provider-registry:updateProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.updateProvider(providerInternalId);
    });

    this.ipcHandle('provider-registry:installProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.installProvider(providerInternalId);
    });

    this.ipcHandle(
      'provider-registry:runInstallPreflightChecks',
      async (_, providerInternalId: string, callbackId: number): Promise<boolean> => {
        const callback: PreflightChecksCallback = {
          startCheck: status => {
            this.getWebContentsSender().send('provider-registry:installPreflightChecksUpdate', callbackId, {
              type: 'start',
              status,
            } as PreflightCheckEvent);
          },
          endCheck: status => {
            this.getWebContentsSender().send('provider-registry:installPreflightChecksUpdate', callbackId, {
              type: 'stop',
              status,
            } as PreflightCheckEvent);
          },
        };
        return providerRegistry.runPreflightChecks(providerInternalId, callback, false);
      },
    );

    this.ipcHandle(
      'provider-registry:runUpdatePreflightChecks',
      async (_, providerInternalId: string, callbackId: number): Promise<boolean> => {
        const callback: PreflightChecksCallback = {
          startCheck: status => {
            this.getWebContentsSender().send('provider-registry:updatePreflightChecksUpdate', callbackId, {
              type: 'start',
              status,
            } as PreflightCheckEvent);
          },
          endCheck: status => {
            this.getWebContentsSender().send('provider-registry:updatePreflightChecksUpdate', callbackId, {
              type: 'stop',
              status,
            } as PreflightCheckEvent);
          },
        };
        return providerRegistry.runPreflightChecks(providerInternalId, callback, true);
      },
    );

    this.ipcHandle('provider-registry:startProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.startProvider(providerInternalId);
    });

    this.ipcHandle('provider-registry:initializeProvider', async (_, providerInternalId: string): Promise<void> => {
      return providerRegistry.initializeProvider(providerInternalId);
    });

    this.ipcHandle('system:get-free-port', async (_, port: number): Promise<number> => {
      return getFreePort(port);
    });

    this.ipcHandle('system:get-free-port-range', async (_, rangeSize: number): Promise<string> => {
      return getFreePortRange(rangeSize);
    });

    this.ipcHandle('system:is-port-free', async (_, port: number): Promise<boolean> => {
      return isFreePort(port);
    });

    this.ipcHandle(
      'provider-registry:startReceiveLogs',
      async (
        _listener,
        providerId: string,
        callbackId: number,
        connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      ): Promise<void> => {
        let context;
        if (connectionInfo) {
          context = providerRegistry.getMatchingConnectionLifecycleContext(providerId, connectionInfo);
        } else {
          context = providerRegistry.getMatchingLifecycleContext(providerId);
        }
        context.log.setLogHandler({
          log: (...data: unknown[]) => {
            this.getWebContentsSender().send('provider-registry:startReceiveLogs-onData', callbackId, 'log', data);
          },
          warn: (...data: unknown[]) => {
            this.getWebContentsSender().send('provider-registry:startReceiveLogs-onData', callbackId, 'warn', data);
          },
          error: (...data: unknown[]) => {
            this.getWebContentsSender().send('provider-registry:startReceiveLogs-onData', callbackId, 'error', data);
          },
        });
      },
    );

    this.ipcHandle(
      'provider-registry:stopReceiveLogs',
      async (
        _listener,
        providerId: string,
        connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      ): Promise<void> => {
        let context;
        if (connectionInfo) {
          context = providerRegistry.getMatchingConnectionLifecycleContext(providerId, connectionInfo);
        } else {
          context = providerRegistry.getMatchingLifecycleContext(providerId);
        }
        context.log.removeLogHandler();
      },
    );

    this.ipcHandle(
      'showInputBox:value',
      async (_listener, id: number, value: string | undefined, error?: string): Promise<void> => {
        return inputQuickPickRegistry.onInputBoxValueEntered(id, value, error);
      },
    );

    this.ipcHandle('showQuickPick:values', async (_listener, id: number, indexes: number[]): Promise<void> => {
      return inputQuickPickRegistry.onQuickPickValuesSelected(id, indexes);
    });

    this.ipcHandle(
      'showInputBox:validate',
      async (
        _listener,
        id: number,
        value: string,
      ): Promise<string | containerDesktopAPI.InputBoxValidationMessage | undefined | null> => {
        return inputQuickPickRegistry.validate(id, value);
      },
    );

    this.ipcHandle('showQuickPick:onSelect', async (_listener, id: number, selectedId: number): Promise<void> => {
      return inputQuickPickRegistry.onDidSelectQuickPickItem(id, selectedId);
    });

    this.ipcHandle('showMessageBox', async (_listener, options: MessageBoxOptions): Promise<MessageBoxReturnValue> => {
      return messageBox.showMessageBox(options);
    });

    this.ipcHandle(
      'showMessageBox:onSelect',
      async (_listener, id: number, index: number | undefined): Promise<void> => {
        return messageBox.onDidSelectButton(id, index);
      },
    );

    this.ipcHandle('customPick:values', async (_listener, id: number, indexes: number[]): Promise<void> => {
      return customPickRegistry.onConfirmSelection(id, indexes);
    });

    this.ipcHandle('customPick:close', async (_listener, id: number): Promise<void> => {
      return customPickRegistry.onClose(id);
    });

    this.ipcHandle('image-registry:getRegistries', async (): Promise<readonly containerDesktopAPI.Registry[]> => {
      return imageRegistry.getRegistries();
    });

    this.ipcHandle(
      'image-registry:getSuggestedRegistries',
      async (): Promise<containerDesktopAPI.RegistrySuggestedProvider[]> => {
        return imageRegistry.getSuggestedRegistries();
      },
    );

    this.ipcHandle('image-registry:hasAuthconfigForImage', async (_listener, imageName: string): Promise<boolean> => {
      if (imageName.indexOf(',') !== -1) {
        const allImageNames = imageName.split(',');
        let hasAuth = false;
        for (const imageName of allImageNames) {
          hasAuth = hasAuth || imageRegistry.getAuthconfigForImage(imageName) !== undefined;
        }
        return hasAuth;
      }
      const authconfig = imageRegistry.getAuthconfigForImage(imageName);
      return authconfig !== undefined;
    });

    this.ipcHandle('image-registry:getProviderNames', async (): Promise<string[]> => {
      return imageRegistry.getProviderNames();
    });

    this.ipcHandle(
      'image-registry:unregisterRegistry',
      async (_listener, registry: containerDesktopAPI.Registry): Promise<void> => {
        return imageRegistry.unregisterRegistry(registry);
      },
    );

    // Check credentials for a registry
    this.ipcHandle(
      'image-registry:checkCredentials',
      async (_listener, registryCreateOptions: containerDesktopAPI.RegistryCreateOptions): Promise<void> => {
        return imageRegistry.checkCredentials(
          registryCreateOptions.serverUrl,
          registryCreateOptions.username,
          registryCreateOptions.secret,
        );
      },
    );

    this.ipcHandle(
      'image-registry:createRegistry',
      async (
        _listener,
        providerName: string,
        registryCreateOptions: containerDesktopAPI.RegistryCreateOptions,
      ): Promise<void> => {
        await imageRegistry.createRegistry(providerName, registryCreateOptions);
      },
    );

    this.ipcHandle(
      'image-registry:updateRegistry',
      async (_listener, registry: containerDesktopAPI.Registry): Promise<void> => {
        await imageRegistry.updateRegistry(registry);
      },
    );

    this.ipcHandle(
      'image-registry:searchImages',
      async (_listener, options: ImageSearchOptions): Promise<ImageSearchResult[]> => {
        return imageRegistry.searchImages(options);
      },
    );

    this.ipcHandle(
      'authentication-provider-registry:getAuthenticationProvidersInfo',
      async (): Promise<readonly AuthenticationProviderInfo[]> => {
        return authentication.getAuthenticationProvidersInfo();
      },
    );

    this.ipcHandle(
      'authentication-provider-registry:requestAuthenticationProviderSignOut',
      async (_listener, providerId: string, sessionId): Promise<void> => {
        return authentication.signOut(providerId, sessionId);
      },
    );

    this.ipcHandle(
      'authentication-provider-registry:requestAuthenticationProviderSignIn',
      async (_listener, requestId: string): Promise<void> => {
        await authentication.executeSessionRequest(requestId);
      },
    );

    this.ipcHandle('authentication:showAccountsMenu', async (_listener, x: number, y: number): Promise<void> => {
      return showAccountsMenu(x, y, authentication, navigationManager);
    });

    this.ipcHandle(
      'configuration-registry:getConfigurationProperties',
      async (): Promise<Record<string, IConfigurationPropertyRecordedSchema>> => {
        return configurationRegistry.getConfigurationProperties();
      },
    );
    this.ipcHandle(
      'configuration-registry:getConfigurationValue',
      async <T>(
        _listener: Electron.IpcMainInvokeEvent,
        key: string,
        scope?: containerDesktopAPI.ConfigurationScope,
      ): Promise<T | undefined> => {
        // extract parent key with first name before first . notation
        const parentKey = key.substring(0, key.indexOf('.'));
        // extract child key with first name after first . notation
        const childKey = key.substring(key.indexOf('.') + 1);
        return configurationRegistry.getConfiguration(parentKey, scope).get(childKey);
      },
    );

    this.ipcHandle(
      'configuration-registry:updateConfigurationValue',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        key: string,
        value: unknown,
        scope?: containerDesktopAPI.ConfigurationScope | containerDesktopAPI.ConfigurationScope[],
      ): Promise<void> => {
        return configurationRegistry.updateConfigurationValue(key, value, scope);
      },
    );

    this.ipcHandle('contributions:listContributions', async (): Promise<ContributionInfo[]> => {
      return contributionManager.listContributions();
    });

    this.ipcHandle('extension-loader:listExtensions', async (): Promise<ExtensionInfo[]> => {
      return this.extensionLoader.listExtensions();
    });

    this.ipcHandle('featured:getFeaturedExtensions', async (): Promise<FeaturedExtension[]> => {
      return featured.getFeaturedExtensions();
    });

    this.ipcHandle('recommended:getExtensionBanners', async (): Promise<ExtensionBanner[]> => {
      return recommendationsRegistry.getExtensionBanners();
    });

    this.ipcHandle('recommended:getRegistries', async (): Promise<RecommendedRegistry[]> => {
      return recommendationsRegistry.getRegistries();
    });

    this.ipcHandle('catalog:getExtensions', async (): Promise<CatalogExtension[]> => {
      return extensionsCatalog.getExtensions();
    });

    this.ipcHandle('commands:getCommandPaletteCommands', async (): Promise<CommandInfo[]> => {
      return commandRegistry.getCommandPaletteCommands();
    });

    this.ipcHandle(
      'extension-loader:stopExtension',
      async (_listener: Electron.IpcMainInvokeEvent, extensionId: string): Promise<void> => {
        return this.extensionLoader.stopExtension(extensionId);
      },
    );
    this.ipcHandle(
      'extension-loader:startExtension',
      async (_listener: Electron.IpcMainInvokeEvent, extensionId: string): Promise<void> => {
        return this.extensionLoader.startExtension(extensionId);
      },
    );
    this.ipcHandle(
      'extension-updater:updateExtension',
      async (_listener: Electron.IpcMainInvokeEvent, extensionId: string, ociUri: string): Promise<void> => {
        return extensionsUpdater.updateExtension(extensionId, ociUri);
      },
    );
    this.ipcHandle(
      'extension-loader:removeExtension',
      async (_listener: Electron.IpcMainInvokeEvent, extensionId: string): Promise<void> => {
        return this.extensionLoader.removeExtensionPerUserRequest(extensionId);
      },
    );

    this.ipcHandle(
      'shell:openExternal',
      async (_listener: Electron.IpcMainInvokeEvent, link: string): Promise<void> => {
        if (securityRestrictionCurrentHandler.handler) {
          await securityRestrictionCurrentHandler.handler(link);
        } else {
          await shell.openExternal(link);
        }
      },
    );

    this.ipcHandle('os:getPlatform', async (): Promise<string> => {
      return os.platform();
    });
    this.ipcHandle('os:getArch', async (): Promise<string> => {
      return os.arch();
    });
    this.ipcHandle('os:getHostname', async (): Promise<string> => {
      return os.hostname();
    });
    this.ipcHandle('os:getHostFreeDiskSize', async (): Promise<number> => {
      return (await checkDiskSpace(os.homedir())).free;
    });
    this.ipcHandle('os:getHostMemory', async (): Promise<number> => {
      return os.totalmem();
    });
    this.ipcHandle('os:getHostCpu', async (): Promise<number> => {
      return os.cpus().length;
    });

    this.ipcHandle(
      'provider-registry:startProviderLifecycle',
      async (_listener: Electron.IpcMainInvokeEvent, providerId: string): Promise<void> => {
        return providerRegistry.startProviderLifecycle(providerId);
      },
    );

    this.ipcHandle(
      'provider-registry:stopProviderLifecycle',
      async (_listener: Electron.IpcMainInvokeEvent, providerId: string): Promise<void> => {
        return providerRegistry.stopProviderLifecycle(providerId);
      },
    );

    this.ipcHandle(
      'proxy:updateSettings',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        proxySettings: containerDesktopAPI.ProxySettings,
      ): Promise<void> => {
        return proxy.setProxy(proxySettings);
      },
    );

    this.ipcHandle('proxy:setState', async (_listener: Electron.IpcMainInvokeEvent, state: boolean): Promise<void> => {
      return proxy.setState(state);
    });

    this.ipcHandle('proxy:getSettings', async (): Promise<containerDesktopAPI.ProxySettings | undefined> => {
      return proxy.proxy;
    });

    this.ipcHandle('proxy:isEnabled', async (): Promise<boolean> => {
      return proxy.isEnabled();
    });

    this.ipcHandle(
      'provider-registry:startProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
        loggerId: string,
      ): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        await providerRegistry.startProviderConnection(providerId, providerConnectionInfo, logger);
        logger.onEnd();
      },
    );

    this.ipcHandle(
      'provider-registry:stopProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
        loggerId: string,
      ): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        await providerRegistry.stopProviderConnection(providerId, providerConnectionInfo, logger);
        logger.onEnd();
      },
    );

    this.ipcHandle(
      'provider-registry:editProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params: { [key: string]: any },
        loggerId: string,
        tokenId?: number,
      ): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        let token;
        if (tokenId) {
          const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
          token = tokenSource?.token;
        }
        await providerRegistry.editProviderConnection(providerId, providerConnectionInfo, params, logger, token);
        logger.onEnd();
      },
    );

    this.ipcHandle(
      'provider-registry:deleteProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
        loggerId: string,
      ): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        await providerRegistry.deleteProviderConnection(providerId, providerConnectionInfo, logger);
        logger.onEnd();
      },
    );

    this.ipcHandle(
      'provider-registry:createContainerProviderConnection',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: { [key: string]: unknown },
        loggerId: string,
        tokenId?: number,
      ): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        let token;
        if (tokenId) {
          const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
          token = tokenSource?.token;
        }
        try {
          await providerRegistry.createContainerProviderConnection(internalProviderId, params, logger, token);
        } catch (error) {
          logger.error(error);
          throw error;
        } finally {
          logger.onEnd();
        }
      },
    );

    this.ipcHandle(
      'provider-registry:auditConnectionParameters',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: containerDesktopAPI.AuditRequestItems,
      ): Promise<containerDesktopAPI.AuditResult> => {
        return await providerRegistry.auditConnectionParameters(internalProviderId, params);
      },
    );

    this.ipcHandle(
      'provider-registry:createKubernetesProviderConnection',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: { [key: string]: unknown },
        loggerId: string,
        tokenId?: number,
      ): Promise<void> => {
        const logger = this.getLogHandler('provider-registry:taskConnection-onData', loggerId);
        let token;
        if (tokenId) {
          const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
          token = tokenSource?.token;
        }
        try {
          await providerRegistry.createKubernetesProviderConnection(internalProviderId, params, logger, token);
        } catch (error) {
          logger.error(error);
          throw error;
        } finally {
          logger.onEnd();
        }
      },
    );

    this.ipcHandle('kubernetes-client:createPod', async (_listener, namespace: string, pod: V1Pod): Promise<V1Pod> => {
      return kubernetesClient.createPod(namespace, pod);
    });

    this.ipcHandle(
      'kubernetes-client:createService',
      async (_listener, namespace: string, service: V1Service): Promise<V1Service> => {
        return kubernetesClient.createService(namespace, service);
      },
    );

    this.ipcHandle(
      'kubernetes-client:createIngress',
      async (_listener, namespace: string, ingress: V1Ingress): Promise<V1Ingress> => {
        return kubernetesClient.createIngress(namespace, ingress);
      },
    );

    this.ipcHandle('kubernetes-client:listPods', async (): Promise<PodInfo[]> => {
      return kubernetesClient.listPods();
    });

    this.ipcHandle('kubernetes-client:listDeployments', async (): Promise<V1Deployment[]> => {
      return kubernetesClient.listDeployments();
    });

    this.ipcHandle('kubernetes-client:listIngresses', async (): Promise<V1Ingress[]> => {
      return kubernetesClient.listIngresses();
    });

    this.ipcHandle('kubernetes-client:listRoutes', async (): Promise<V1Route[]> => {
      return kubernetesClient.listRoutes();
    });

    this.ipcHandle('kubernetes-client:listServices', async (): Promise<V1Service[]> => {
      return kubernetesClient.listServices();
    });

    this.ipcHandle(
      'kubernetes-client:readPodLog',
      async (_listener, name: string, container: string, onDataId: number): Promise<void> => {
        return kubernetesClient.readPodLog(name, container, (name: string, data: string) => {
          this.getWebContentsSender().send('kubernetes-client:readPodLog-onData', onDataId, name, data);
        });
      },
    );

    this.ipcHandle('kubernetes-client:deletePod', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deletePod(name);
    });

    this.ipcHandle('kubernetes-client:deleteDeployment', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteDeployment(name);
    });

    this.ipcHandle('kubernetes-client:deleteConfigMap', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteConfigMap(name);
    });

    this.ipcHandle('kubernetes-client:deleteSecret', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteSecret(name);
    });

    this.ipcHandle('kubernetes-client:deletePersistentVolumeClaim', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deletePersistentVolumeClaim(name);
    });

    this.ipcHandle('kubernetes-client:deleteIngress', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteIngress(name);
    });

    this.ipcHandle('kubernetes-client:deleteRoute', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteRoute(name);
    });

    this.ipcHandle('kubernetes-client:deleteService', async (_listener, name: string): Promise<void> => {
      return kubernetesClient.deleteService(name);
    });

    this.ipcHandle(
      'kubernetes-client:readNamespacedSecret',
      async (_listener, name: string, namespace: string): Promise<V1Secret | undefined> => {
        return kubernetesClient.readNamespacedSecret(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedPersistentVolumeClaim',
      async (_listener, name: string, namespace: string): Promise<V1PersistentVolumeClaim | undefined> => {
        return kubernetesClient.readNamespacedPersistentVolumeClaim(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedDeployment',
      async (_listener, name: string, namespace: string): Promise<V1Deployment | undefined> => {
        return kubernetesClient.readNamespacedDeployment(name, namespace);
      },
    );

    this.ipcHandle('kubernetes-client:readNode', async (_listener, name: string): Promise<V1Node | undefined> => {
      return kubernetesClient.readNode(name);
    });

    this.ipcHandle(
      'kubernetes-client:readNamespacedIngress',
      async (_listener, name: string, namespace: string): Promise<V1Ingress | undefined> => {
        return kubernetesClient.readNamespacedIngress(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedRoute',
      async (_listener, name: string, namespace: string): Promise<V1Route | undefined> => {
        return kubernetesClient.readNamespacedRoute(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedService',
      async (_listener, name: string, namespace: string): Promise<V1Service | undefined> => {
        return kubernetesClient.readNamespacedService(name, namespace);
      },
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.ipcHandle(
      'kubernetes-client:createResourcesFromFile',
      async (_listener, context: string, file: string, namespace: string): Promise<void> => {
        return kubernetesClient.createResourcesFromFile(context, file, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:applyResourcesFromFile',
      async (_listener, context: string, file: string, namespace?: string): Promise<KubernetesObject[]> => {
        return kubernetesClient.applyResourcesFromFile(context, file, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:applyResourcesFromYAML',
      async (_listener, context: string, yaml: string): Promise<KubernetesObject[]> => {
        return kubernetesClient.applyResourcesFromYAML(context, yaml);
      },
    );

    this.ipcHandle(
      'openshift-client:createRoute',
      async (_listener, namespace: string, route: V1Route): Promise<V1Route> => {
        return kubernetesClient.createOpenShiftRoute(namespace, route);
      },
    );

    this.ipcHandle(
      'kubernetes-client:listNamespacedPod',
      async (_listener, namespace: string, fieldSelector?: string, labelSelector?: string): Promise<V1PodList> => {
        return kubernetesClient.listNamespacedPod(namespace, fieldSelector, labelSelector);
      },
    );

    this.ipcHandle('kubernetes-client:listNamespaces', async (): Promise<V1NamespaceList> => {
      return kubernetesClient.listNamespaces();
    });

    this.ipcHandle(
      'kubernetes-client:readNamespacedPod',
      async (_listener, name: string, namespace: string): Promise<V1Pod | undefined> => {
        return kubernetesClient.readNamespacedPod(name, namespace);
      },
    );

    this.ipcHandle(
      'kubernetes-client:readNamespacedConfigMap',
      async (_listener, name: string, namespace: string): Promise<V1ConfigMap | undefined> => {
        return kubernetesClient.readNamespacedConfigMap(name, namespace);
      },
    );

    this.ipcHandle('kubernetes-client:isAPIGroupSupported', async (_listener, group): Promise<boolean> => {
      return kubernetesClient.isAPIGroupSupported(group);
    });

    this.ipcHandle('kubernetes-client:getCurrentContextName', async (): Promise<string | undefined> => {
      return kubernetesClient.getCurrentContextName();
    });

    this.ipcHandle('kubernetes-client:getContexts', async (): Promise<KubernetesContext[]> => {
      return kubernetesClient.getContexts();
    });

    this.ipcHandle('kubernetes-client:getDetailedContexts', async (): Promise<KubeContext[]> => {
      return kubernetesClient.getDetailedContexts();
    });

    this.ipcHandle('kubernetes-client:getClusters', async (): Promise<Cluster[]> => {
      return kubernetesClient.getClusters();
    });

    this.ipcHandle('kubernetes-client:getCurrentNamespace', async (): Promise<string | undefined> => {
      return kubernetesClient.getCurrentNamespace();
    });

    this.ipcHandle(
      'kubernetes-client:deleteContext',
      async (_listener, contextName: string): Promise<KubernetesContext[]> => {
        return kubernetesClient.deleteContext(contextName);
      },
    );

    this.ipcHandle('kubernetes-client:setContext', async (_listener, contextName: string): Promise<void> => {
      return kubernetesClient.setContext(contextName);
    });

    this.ipcHandle('kubernetes-client:getContextsGeneralState', async (): Promise<Map<string, ContextGeneralState>> => {
      return kubernetesClient.getContextsGeneralState();
    });

    this.ipcHandle('kubernetes-client:getCurrentContextGeneralState', async (): Promise<ContextGeneralState> => {
      return kubernetesClient.getCurrentContextGeneralState();
    });

    this.ipcHandle(
      'kubernetes-client:registerGetCurrentContextResources',
      async (_listener, resourceName: ResourceName): Promise<KubernetesObject[]> => {
        return kubernetesClient.registerGetCurrentContextResources(resourceName);
      },
    );

    this.ipcHandle(
      'kubernetes-client:unregisterGetCurrentContextResources',
      async (_listener, resourceName: ResourceName): Promise<KubernetesObject[]> => {
        return kubernetesClient.unregisterGetCurrentContextResources(resourceName);
      },
    );

    const kubernetesExecCallbackMap = new Map<
      number,
      { onStdIn: (data: string) => void; onResize: (columns: number, rows: number) => void }
    >();
    this.ipcHandle(
      'kubernetes-client:execIntoContainer',
      async (_listener, podName: string, containerName: string, onDataId: number): Promise<number> => {
        const execInvocation = await kubernetesClient.execIntoContainer(
          podName,
          containerName,
          (stdOut: Buffer) => {
            this.getWebContentsSender().send('kubernetes-client:execIntoContainer-onData', onDataId, stdOut);
          },
          (stdErr: Buffer) => {
            this.getWebContentsSender().send('kubernetes-client:execIntoContainer-onError', onDataId, stdErr);
          },
          () => {
            this.getWebContentsSender().send('kubernetes-client:execIntoContainer-onClose', onDataId);
            kubernetesExecCallbackMap.delete(onDataId);
          },
        );
        kubernetesExecCallbackMap.set(onDataId, execInvocation);

        return onDataId;
      },
    );

    this.ipcHandle(
      'kubernetes-client:execIntoContainerSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = kubernetesExecCallbackMap.get(onDataId);
        if (callback) {
          callback.onStdIn(content);
        }
      },
    );

    this.ipcHandle(
      'kubernetes-client:execIntoContainerResize',
      async (_listener, onDataId: number, width: number, height: number): Promise<void> => {
        const callback = kubernetesExecCallbackMap.get(onDataId);
        if (callback) {
          callback.onResize(width, height);
        }
      },
    );

    this.ipcHandle('feedback:send', async (_listener, feedbackProperties: unknown): Promise<void> => {
      return telemetry.sendFeedback(feedbackProperties);
    });

    this.ipcHandle('cancellableTokenSource:create', async (): Promise<number> => {
      return cancellationTokenRegistry.createCancellationTokenSource();
    });

    this.ipcHandle('cancellableToken:cancel', async (_listener, id: number): Promise<void> => {
      const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(id);
      if (!tokenSource?.token.isCancellationRequested) {
        tokenSource?.dispose(true);
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.ipcHandle('telemetry:track', async (_listener, event: string, eventProperties?: any): Promise<void> => {
      return telemetry.track(event, eventProperties);
    });

    this.ipcHandle('telemetry:page', async (_listener, name: string): Promise<void> => {
      return telemetry.track(PAGE_EVENT_TYPE, { name: name });
    });

    this.ipcHandle('telemetry:configure', async (): Promise<void> => {
      return telemetry.configureTelemetry();
    });

    this.ipcHandle('app:getVersion', async (): Promise<string> => {
      return app.getVersion();
    });

    this.ipcHandle('iconRegistry:listIcons', async (): Promise<IconInfo[]> => {
      return iconRegistry.listIcons();
    });

    this.ipcHandle('colorRegistry:listColors', async (_listener, themeId: string): Promise<ColorInfo[]> => {
      return colorRegistry.listColors(themeId);
    });

    this.ipcHandle('colorRegistry:isDarkTheme', async (_listener, themeId: string): Promise<boolean> => {
      return colorRegistry.isDarkTheme(themeId);
    });

    this.ipcHandle('viewRegistry:listViewsContributions', async (_listener): Promise<ViewInfoUI[]> => {
      return viewRegistry.listViewsContributions();
    });
    this.ipcHandle('webviewRegistry:listWebviews', async (_listener): Promise<WebviewInfo[]> => {
      return webviewRegistry.listWebviews();
    });
    this.ipcHandle(
      'webviewRegistry:post-message',
      async (_listener, id: string, message: { data: unknown }): Promise<void> => {
        return webviewRegistry.postMessageToWebview(id, message);
      },
    );
    this.ipcHandle('webviewRegistry:update-state', async (_listener, id: string, state: unknown): Promise<void> => {
      return webviewRegistry.updateWebviewState(id, state);
    });

    this.ipcHandle('webviewRegistry:makeDefaultWebviewVisible', async (_listener, webviewId: string): Promise<void> => {
      return webviewRegistry.makeDefaultWebviewVisible(webviewId);
    });

    this.ipcHandle('viewRegistry:fetchViewsContributions', async (_listener, id: string): Promise<ViewInfoUI[]> => {
      return viewRegistry.fetchViewsContributions(id);
    });

    this.ipcHandle('window:minimize', async (): Promise<void> => {
      const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (!window) {
        return;
      }
      window.minimize();
    });

    this.ipcHandle('window:maximize', async (): Promise<void> => {
      const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (!window) {
        return;
      }
      if (window.isMaximized()) {
        window.unmaximize();
        return;
      }
      window.maximize();
    });

    this.ipcHandle('window:close', async (): Promise<void> => {
      const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
      if (!window) {
        return;
      }
      window.close();
    });

    this.ipcHandle('onboardingRegistry:listOnboarding', async (): Promise<OnboardingInfo[]> => {
      return onboardingRegistry.listOnboarding();
    });

    this.ipcHandle(
      'onboardingRegistry:getOnboarding',
      async (_listener, extension: string): Promise<OnboardingInfo | undefined> => {
        return onboardingRegistry.getOnboarding(extension);
      },
    );

    this.ipcHandle(
      'onboardingRegistry:updateStepState',
      async (_listener, status: OnboardingStatus, extension: string, stepId?: string): Promise<void> => {
        return onboardingRegistry.updateStepState(status, extension, stepId);
      },
    );

    this.ipcHandle('onboardingRegistry:resetOnboarding', async (_listener, extensions: string[]): Promise<void> => {
      return onboardingRegistry.resetOnboarding(extensions);
    });

    this.ipcHandle('notificationRegistry:listNotifications', async (): Promise<NotificationCard[]> => {
      return notificationRegistry.getNotifications();
    });

    this.ipcHandle(
      'notificationRegistry:addNotification',
      async (_listener, notification: NotificationCardOptions): Promise<void> => {
        notificationRegistry.addNotification(notification);
      },
    );

    this.ipcHandle('notificationRegistry:removeNotification', async (_listener, id: number): Promise<void> => {
      return notificationRegistry.removeNotificationById(id);
    });

    this.ipcHandle('notificationRegistry:clearNotificationsQueue', async (): Promise<void> => {
      return notificationRegistry.removeAll();
    });

    this.ipcHandle('image-checker:getProviders', async (): Promise<ImageCheckerInfo[]> => {
      return imageChecker.getImageCheckerProviders();
    });

    this.ipcHandle(
      'image-checker:check',
      async (
        _listener,
        id: string,
        image: ImageInfo,
        tokenId?: number,
      ): Promise<containerDesktopAPI.ImageChecks | undefined> => {
        let token;
        if (tokenId) {
          const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
          token = tokenSource?.token;
        }
        return imageChecker.check(id, image, token);
      },
    );

    this.ipcHandle('image-files:getProviders', async (): Promise<ImageFilesInfo[]> => {
      return imageFiles.getImageFilesProviders();
    });

    this.ipcHandle(
      'image-files:getFilesystemLayers',
      async (
        _listener,
        id: string,
        image: ImageInfo,
        tokenId?: number,
      ): Promise<containerDesktopAPI.ImageFilesystemLayers | undefined> => {
        let token;
        if (tokenId) {
          const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
          token = tokenSource?.token;
        }
        return imageFiles.getFilesystemLayers(id, image, token);
      },
    );

    this.ipcHandle('webview:get-preload-script', async (): Promise<string> => {
      const preloadScriptPath = path.join(__dirname, '../../preload-webview/dist/index.cjs');
      return `file://${preloadScriptPath}`;
    });

    this.ipcHandle('webview:get-registry-http-port', async (): Promise<number> => {
      return webviewRegistry.getRegistryHttpPort();
    });

    this.ipcHandle('learning-center:listGuides', async () => {
      return downloadGuideList();
    });

    this.ipcHandle(
      'dialog:openDialog',
      async (_listener, dialogId: string, options: containerDesktopAPI.OpenDialogOptions): Promise<void> => {
        dialogRegistry.openDialog(options, dialogId).catch((error: unknown) => {
          console.error('Error opening dialog', error);
        });
      },
    );
    this.ipcHandle(
      'dialog:saveDialog',
      async (
        _listener,
        dialogId: string,
        options: containerDesktopAPI.SaveDialogOptions,
      ): Promise<containerDesktopAPI.Uri | undefined> => {
        return dialogRegistry.saveDialog(options, dialogId);
      },
    );
    this.ipcHandle(
      'context:collectAllValues',
      async (): Promise<Record<string, unknown>> => context.collectAllValues(),
    );

    const dockerDesktopInstallation = new DockerDesktopInstallation(
      apiSender,
      containerProviderRegistry,
      contributionManager,
      directories,
    );
    await dockerDesktopInstallation.init();

    const dockerExtensionAdapter = new DockerPluginAdapter(contributionManager, containerProviderRegistry);
    dockerExtensionAdapter.init();

    const extensionInstaller = new ExtensionInstaller(
      apiSender,
      this.extensionLoader,
      imageRegistry,
      extensionsCatalog,
      telemetry,
      directories,
      contributionManager,
    );
    await extensionInstaller.init();

    // launch the updater
    const extensionsUpdater = new ExtensionsUpdater(
      extensionsCatalog,
      this.extensionLoader,
      configurationRegistry,
      extensionInstaller,
      telemetry,
    );

    await contributionManager.init();

    this.markAsReady();

    apiSender.send('starting-extensions', `${this.isReady}`);
    console.log('System ready. Loading extensions...');
    try {
      await this.extensionLoader.start();
      console.log('PluginSystem: initialization done.');
    } finally {
      apiSender.send('extensions-started');
      this.markAsExtensionsStarted();
    }
    extensionsUpdater.init().catch((err: unknown) => console.error('Unable to perform extension updates', err));
    autoStartEngine.start().catch((err: unknown) => console.error('Unable to perform autostart', err));
    return this.extensionLoader;
  }

  markAsExtensionsStarted(): void {
    this.isExtensionsStarted = true;
  }

  markAsReady(): void {
    this.isReady = true;
  }

  getLogHandler(channel: string, loggerId: string): LoggerWithEnd {
    return {
      log: (...data: unknown[]): void => {
        this.getWebContentsSender().send(channel, loggerId, 'log', data);
      },
      warn: (...data: unknown[]): void => {
        this.getWebContentsSender().send(channel, loggerId, 'warn', data);
      },
      error: (...data: unknown[]): void => {
        this.getWebContentsSender().send(channel, loggerId, 'error', data);
      },
      onEnd: (): void => {
        this.getWebContentsSender().send(channel, loggerId, 'finish');
      },
    };
  }

  createAbortControllerOnCancellationToken(
    cancellationTokenRegistry: CancellationTokenRegistry,
    cancellableTokenId?: number,
  ): AbortController | undefined {
    if (!cancellableTokenId) {
      return undefined;
    }
    const abortController = new AbortController();
    const tokenSource = cancellationTokenRegistry.getCancellationTokenSource(cancellableTokenId);
    const token = tokenSource?.token;
    token?.onCancellationRequested(() => {
      // if the token is cancelled, we trigger the abort on the AbortController
      abortController.abort();
    });
    return abortController;
  }
}
