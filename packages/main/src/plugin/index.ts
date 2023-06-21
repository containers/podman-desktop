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

/**
 * @module preload
 */
import * as os from 'node:os';
import * as path from 'path';
import type * as containerDesktopAPI from '@podman-desktop/api';
import { CommandRegistry } from './command-registry.js';
import { ContainerProviderRegistry } from './container-registry.js';
import { ExtensionLoader } from './extension-loader.js';
import { TrayMenuRegistry } from './tray-menu-registry.js';
import { ProviderRegistry } from './provider-registry.js';
import type { IConfigurationPropertyRecordedSchema } from './configuration-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import { TerminalInit } from './terminal-init.js';
import { ImageRegistry } from './image-registry.js';
import { EventEmitter } from 'node:events';
import type {
  PreflightCheckEvent,
  PreflightChecksCallback,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from './api/provider-info.js';
import type { WebContents } from 'electron';
import { app, ipcMain, BrowserWindow, shell, clipboard } from 'electron';
import type { ContainerCreateOptions, ContainerInfo, SimpleContainerInfo } from './api/container-info.js';
import type { ImageInfo } from './api/image-info.js';
import type { PullEvent } from './api/pull-event.js';
import type { ExtensionInfo } from './api/extension-info.js';
import type { ImageInspectInfo } from './api/image-inspect-info.js';
import type { TrayMenu } from '../tray-menu.js';
import { getFreePort } from './util/port.js';
import { isLinux, isMac } from '../util.js';
import type { MessageBoxOptions, MessageBoxReturnValue } from './message-box.js';
import { MessageBox } from './message-box.js';
import { ProgressImpl } from './progress-impl.js';
import type { ContributionInfo } from './api/contribution-info.js';
import { ContributionManager } from './contribution-manager.js';
import { DockerDesktopInstallation } from './docker-extension/docker-desktop-installation.js';
import { DockerPluginAdapter } from './docker-extension/docker-plugin-adapter.js';
import { PAGE_EVENT_TYPE, Telemetry } from './telemetry/telemetry.js';
import { NotificationImpl } from './notification-impl.js';
import { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import type { StatusBarEntryDescriptor } from './statusbar/statusbar-registry.js';
import type { IpcMainInvokeEvent } from 'electron/main';
import type { ContainerInspectInfo } from './api/container-inspect-info.js';
import type { HistoryInfo } from './api/history-info.js';
import type { PodInfo, PodInspectInfo } from './api/pod-info.js';
import type { VolumeInspectInfo, VolumeListInfo } from './api/volume-info.js';
import type { ContainerStatsInfo } from './api/container-stats-info.js';
import type {
  PlayKubeInfo,
  PodCreateOptions,
  ContainerCreateOptions as PodmanContainerCreateOptions,
} from './dockerode/libpod-dockerode.js';
import type Dockerode from 'dockerode';
import { AutostartEngine } from './autostart-engine.js';
import { CloseBehavior } from './close-behavior.js';
import { TrayIconColor } from './tray-icon-color.js';
import { KubernetesClient } from './kubernetes-client.js';
import type { V1Pod, V1ConfigMap, V1NamespaceList, V1PodList, V1Service, V1Ingress } from '@kubernetes/client-node';
import type { V1Route } from './api/openshift-types.js';
import type { NetworkInspectInfo } from './api/network-info.js';
import { FilesystemMonitoring } from './filesystem-monitoring.js';
import { Certificates } from './certificates.js';
import { Proxy } from './proxy.js';
import { EditorInit } from './editor-init.js';
import { WelcomeInit } from './welcome/welcome-init.js';
import { ExtensionInstaller } from './install/extension-installer.js';
import { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import type { Menu } from '/@/plugin/menu-registry.js';
import { MenuRegistry } from '/@/plugin/menu-registry.js';
import { CancellationTokenRegistry } from './cancellation-token-registry.js';
import type { UpdateCheckResult } from 'electron-updater';
import { autoUpdater } from 'electron-updater';
import type { ApiSenderType } from './api.js';
import type { AuthenticationProviderInfo } from './authentication.js';
import { AuthenticationImpl } from './authentication.js';
import checkDiskSpacePkg from 'check-disk-space';
// workaround for ESM
const checkDiskSpace: (path: string) => Promise<{ free: number }> = checkDiskSpacePkg as unknown as (
  path: string,
) => Promise<{ free: number }>;
import { TaskManager } from '/@/plugin/task-manager.js';
import { Featured } from './featured/featured.js';
import type { FeaturedExtension } from './featured/featured-api.js';
import { ExtensionsCatalog } from './extensions-catalog/extensions-catalog.js';
import { securityRestrictionCurrentHandler } from '../security-restrictions-handler.js';
import { ExtensionsUpdater } from './extensions-updater/extensions-updater.js';
import type { CatalogExtension } from './extensions-catalog/extensions-catalog-api.js';
import { ActiveOnboarding, OnboardingInputResponse } from './api/onboarding.js';
import { OnboardingRegistry } from './onboarding-registry.js';

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

  constructor(private trayMenu: TrayMenu) {
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
  encodeIpcError(e: unknown) {
    let builtError;
    if (e instanceof Error) {
      builtError = { name: e.name, message: e.message, extra: { ...e } };
    } else {
      builtError = { message: e };
    }
    return builtError;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ipcHandle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => Promise<void> | any) {
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
  async getExtName() {
    //Create an error for its stack property
    const stack = new Error().stack;
    //Create a map for extension path => extension name
    const extensions: Map<string, string> = new Map();

    //Check if index.ts private member extensionLoader initialized
    //If it is grab listExtensions()
    if (!this.extensionLoader) return;

    const currentExtList = await this.extensionLoader.listExtensions();

    //Only loop through if list of extensions is different than last time
    if (this.validExtList != currentExtList) {
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

      if (toAppend != '') return `[${toAppend}]`;
    }
  }

  // log locally and also send it to the renderer process
  // so client can see logs in the developer console
  redirectConsole(logType: LogType): void {
    // keep original method
    const originalConsoleMethod = console[logType];
    console[logType] = (...args) => {
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
  redirectLogging() {
    const logTypes: LogType[] = ['log', 'warn', 'trace', 'debug', 'error'];
    logTypes.forEach(logType => this.redirectConsole(logType));
  }

  getApiSender(webContents: WebContents): ApiSenderType {
    const queuedEvents: { channel: string; data: string }[] = [];

    const flushQueuedEvents = () => {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      send: (channel: string, data: any) => {
        // send only when the UI is ready
        if (this.uiReady && this.isReady) {
          flushQueuedEvents();
          webContents.send('api-sender', channel, data);
        } else {
          // add to the queue
          queuedEvents.push({ channel, data });
        }
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      receive: (channel: string, func: any) => {
        eventEmitter.on(channel, data => {
          func(data);
        });
      },
    };
  }

  async setupSecurityRestrictionsOnLinks(messageBox: MessageBox) {
    // external URLs should be validated by the user
    securityRestrictionCurrentHandler.handler = async (url: string) => {
      if (!url) {
        return false;
      }

      // if url is a known domain, open it directly
      const urlObject = new URL(url);
      const validDomains = ['podman-desktop.io', 'podman.io'];
      const skipConfirmationUrl = validDomains.some(
        domain => urlObject.hostname.endsWith(domain) || urlObject.hostname === domain,
      );

      if (skipConfirmationUrl) {
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

    const configurationRegistry = new ConfigurationRegistry();
    configurationRegistry.init();

    const telemetry = new Telemetry(configurationRegistry);
    await telemetry.init();

    const proxy = new Proxy(configurationRegistry);
    await proxy.init();

    const commandRegistry = new CommandRegistry(telemetry);
    const menuRegistry = new MenuRegistry(commandRegistry);
    const certificates = new Certificates();
    await certificates.init();
    const imageRegistry = new ImageRegistry(apiSender, telemetry, certificates, proxy);
    const containerProviderRegistry = new ContainerProviderRegistry(apiSender, imageRegistry, telemetry);
    const cancellationTokenRegistry = new CancellationTokenRegistry();
    const providerRegistry = new ProviderRegistry(apiSender, containerProviderRegistry, telemetry);
    const trayMenuRegistry = new TrayMenuRegistry(this.trayMenu, commandRegistry, providerRegistry, telemetry);
    const statusBarRegistry = new StatusBarRegistry(apiSender);
    const inputQuickPickRegistry = new InputQuickPickRegistry(apiSender);
    const fileSystemMonitoring = new FilesystemMonitoring();
    const onboardingRegistry = new OnboardingRegistry(apiSender, commandRegistry);

    const kubernetesClient = new KubernetesClient(apiSender, configurationRegistry, fileSystemMonitoring, telemetry);
    await kubernetesClient.init();
    const closeBehaviorConfiguration = new CloseBehavior(configurationRegistry);
    await closeBehaviorConfiguration.init();

    // Don't show the tray icon options on Mac
    if (!isMac()) {
      const trayIconColor = new TrayIconColor(configurationRegistry, providerRegistry);
      await trayIconColor.init();
    }

    const autoStartConfiguration = new AutostartEngine(configurationRegistry, providerRegistry);
    await autoStartConfiguration.init();

    providerRegistry.addProviderListener((name: string, providerInfo: ProviderInfo) => {
      if (name === 'provider:update-status') {
        apiSender.send('provider:update-status', providerInfo.name);
      }
    });

    statusBarRegistry.setEntry('help', false, 0, undefined, 'Help', 'fa fa-question-circle', true, 'help', undefined);

    statusBarRegistry.setEntry(
      'tasks',
      false,
      0,
      undefined,
      'Tasks',
      'fa fa-bell',
      true,
      'show-task-manager',
      undefined,
    );
    commandRegistry.registerCommand('show-task-manager', () => {
      apiSender.send('toggle-task-manager', '');
    });

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

    // Get the current version of our application
    const currentVersion = `v${app.getVersion()}`;

    // Add version entry to the status bar
    const defaultVersionEntry = () => {
      statusBarRegistry.setEntry(
        'version',
        false,
        0,
        currentVersion,
        `Using version ${currentVersion}`,
        undefined,
        true,
        'version',
        undefined,
      );
    };
    defaultVersionEntry();

    // Show a "No update available" only for macOS and Windows users and on production builds
    let detailMessage: string;
    if (!isLinux() && import.meta.env.PROD) {
      detailMessage = 'No update available';
    }

    // Register command 'version' that will display the current version and say that no update is available.
    // Only show the "no update available" command for macOS and Windows users, not linux users.
    commandRegistry.registerCommand('version', async () => {
      await messageBox.showMessageBox({
        type: 'info',
        title: 'Version',
        message: `Using version ${currentVersion}`,
        detail: detailMessage,
      });
    });

    // Only check on production builds for Windows and macOS users
    if (import.meta.env.PROD && !isLinux()) {
      // disable auto download
      autoUpdater.autoDownload = false;

      let updateInProgress = false;
      let updateAlreadyDownloaded = false;

      // setup the event listeners
      autoUpdater.on('update-available', () => {
        updateInProgress = false;
        updateAlreadyDownloaded = false;

        // Update the 'version' entry in the status bar to show that an update is available
        // this uses setEntry to update the existing entry
        statusBarRegistry.setEntry(
          'version',
          false,
          0,
          currentVersion,
          'Update available',
          UPDATER_UPDATE_AVAILABLE_ICON,
          true,
          'update',
          undefined,
        );
      });

      autoUpdater.on('update-not-available', () => {
        updateInProgress = false;
        updateAlreadyDownloaded = false;

        // Update the 'version' entry in the status bar to show that no update is available
        defaultVersionEntry();
      });

      autoUpdater.on('update-downloaded', () => {
        updateAlreadyDownloaded = true;
        updateInProgress = false;
        messageBox
          .showMessageBox({
            title: 'Update Downloaded',
            message: 'Update downloaded, Do you want to restart Podman Desktop ?',
            cancelId: 1,
            type: 'info',
            buttons: ['Restart', 'Cancel'],
          })
          .then(result => {
            if (result.response === 0) {
              setImmediate(() => autoUpdater.quitAndInstall());
            }
          })
          .catch((error: unknown) => {
            console.error('unable to show message box', error);
          });
      });

      autoUpdater.on('error', error => {
        updateInProgress = false;
        // local build not pushed to GitHub so prevent any 'update'
        if (error?.message?.includes('No published versions on GitHub')) {
          console.log('Cannot check for updates, no published versions on GitHub');
          defaultVersionEntry();
          return;
        }
        console.error('unable to check for updates', error);
      });

      // check for updates now
      let updateCheckResult: UpdateCheckResult | null;

      try {
        updateCheckResult = await autoUpdater.checkForUpdates();
      } catch (error) {
        console.error('unable to check for updates', error);
      }

      // Create an interval to check for updates every 12 hours
      setInterval(() => {
        autoUpdater
          .checkForUpdates()
          .then(result => (updateCheckResult = result))
          .catch((error: unknown) => {
            console.log('unable to check for updates', error);
          });
      }, 1000 * 60 * 60 * 12);

      // Update will create a standard "autoUpdater" dialog / update process
      commandRegistry.registerCommand('update', async () => {
        if (updateAlreadyDownloaded) {
          const result = await messageBox.showMessageBox({
            type: 'info',
            title: 'Update',
            message: 'There is already an update downloaded. Please Restart Podman Desktop.',
            cancelId: 1,
            buttons: ['Restart', 'Cancel'],
          });
          if (result.response === 0) {
            setImmediate(() => autoUpdater.quitAndInstall());
          }
          return;
        }

        if (updateInProgress) {
          await messageBox.showMessageBox({
            type: 'info',
            title: 'Update',
            message: 'There is already an update in progress. Please wait until it is downloaded',
            buttons: ['OK'],
          });
          return;
        }

        // Get the version of the update
        const updateVersion = updateCheckResult?.updateInfo.version ? `v${updateCheckResult?.updateInfo.version}` : '';

        const result = await messageBox.showMessageBox({
          type: 'info',
          title: 'Update Available',
          message: `A new version ${updateVersion} of Podman Desktop is available. Do you want to update your current version ${currentVersion}?`,
          buttons: ['Update', 'Cancel'],
          cancelId: 1,
        });
        if (result.response === 0) {
          updateInProgress = true;
          updateAlreadyDownloaded = false;

          // Download update and try / catch it and create a dialog if it fails
          try {
            await autoUpdater.downloadUpdate();
          } catch (error) {
            console.error('Update error: ', error);
            await messageBox.showMessageBox({
              type: 'error',
              title: 'Update Failed',
              message: `An error occurred while trying to update to version ${updateVersion}. See the developer console for more information.`,
              buttons: ['OK'],
            });
          }
        }
      });
    }

    commandRegistry.registerCommand('feedback', () => {
      apiSender.send('display-feedback', '');
    });

    commandRegistry.registerCommand('help', () => {
      apiSender.send('display-help', '');
    });

    const terminalInit = new TerminalInit(configurationRegistry);
    terminalInit.init();

    // init editor configuration
    const editorInit = new EditorInit(configurationRegistry);
    editorInit.init();

    // init welcome configuration
    const welcomeInit = new WelcomeInit(configurationRegistry);
    welcomeInit.init();

    const messageBox = new MessageBox(apiSender);

    const authentication = new AuthenticationImpl(apiSender);

    const taskManager = new TaskManager(apiSender);

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
      new NotificationImpl(),
      statusBarRegistry,
      kubernetesClient,
      fileSystemMonitoring,
      proxy,
      containerProviderRegistry,
      inputQuickPickRegistry,
      authentication,
      telemetry,
      onboardingRegistry,
    );
    await this.extensionLoader.init();

    const extensionsCatalog = new ExtensionsCatalog(certificates, proxy);
    const featured = new Featured(this.extensionLoader, extensionsCatalog);
    // do not wait
    featured.init().catch((e: unknown) => {
      console.error('Unable to initialized the featured extensions', e);
    });

    // setup security restrictions on links
    await this.setupSecurityRestrictionsOnLinks(messageBox);

    const contributionManager = new ContributionManager(apiSender);
    this.ipcHandle('container-provider-registry:listContainers', async (): Promise<ContainerInfo[]> => {
      return containerProviderRegistry.listContainers();
    });
    this.ipcHandle('container-provider-registry:listSimpleContainers', async (): Promise<SimpleContainerInfo[]> => {
      return containerProviderRegistry.listSimpleContainers();
    });
    this.ipcHandle('container-provider-registry:listImages', async (): Promise<ImageInfo[]> => {
      return containerProviderRegistry.listImages();
    });
    this.ipcHandle('container-provider-registry:listPods', async (): Promise<PodInfo[]> => {
      return containerProviderRegistry.listPods();
    });
    this.ipcHandle('container-provider-registry:listNetworks', async (): Promise<NetworkInspectInfo[]> => {
      return containerProviderRegistry.listNetworks();
    });
    this.ipcHandle('container-provider-registry:listVolumes', async (): Promise<VolumeListInfo[]> => {
      return containerProviderRegistry.listVolumes();
    });
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
        selectedProvider: ProviderContainerConnectionInfo,
        createOptions: PodCreateOptions,
      ): Promise<{ engineId: string; Id: string }> => {
        return containerProviderRegistry.createPod(selectedProvider, createOptions);
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
    this.ipcHandle(
      'container-provider-registry:generatePodmanKube',
      async (_listener, engine: string, names: string[]): Promise<string> => {
        return containerProviderRegistry.generatePodmanKube(engine, names);
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
      'container-provider-registry:createAndStartContainer',
      async (_listener, engine: string, options: ContainerCreateOptions): Promise<void> => {
        return containerProviderRegistry.createAndStartContainer(engine, options);
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

    const containerProviderRegistryShellInContainerSendCallback = new Map<number, (param: string) => void>();
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
        selectedProvider: ProviderContainerConnectionInfo,
        onDataCallbacksBuildImageId: number,
      ): Promise<unknown> => {
        return containerProviderRegistry.buildImage(
          containerBuildContextDirectory,
          relativeContainerfilePath,
          imageName,
          selectedProvider,
          (eventName: string, data: string) => {
            this.getWebContentsSender().send(
              'container-provider-registry:buildImage-onData',
              onDataCallbacksBuildImageId,
              eventName,
              data,
            );
          },
        );
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

    this.ipcHandle('menu-registry:getContributedMenus', async (_, context: string): Promise<Menu[]> => {
      return menuRegistry.getContributedMenus(context);
    });

    this.ipcHandle('command-registry:executeCommand', async (_, command: string, ...args: unknown[]): Promise<void> => {
      return commandRegistry.executeCommand(command, ...args);
    });

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

    this.ipcHandle(
      'provider-registry:startReceiveLogs',
      async (
        _listener,
        providerId: string,
        callbackId: number,
        containerConnectionInfo?: ProviderContainerConnectionInfo,
      ): Promise<void> => {
        let context;
        if (containerConnectionInfo) {
          context = providerRegistry.getMatchingContainerLifecycleContext(providerId, containerConnectionInfo);
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
        containerConnectionInfo?: ProviderContainerConnectionInfo,
      ): Promise<void> => {
        let context;
        if (containerConnectionInfo) {
          context = providerRegistry.getMatchingContainerLifecycleContext(providerId, containerConnectionInfo);
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

    this.ipcHandle('showMessageBox:onSelect', async (_listener, id: number, index: number): Promise<void> => {
      return messageBox.onDidSelectButton(id, index);
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
        return authentication.executeSessionRequest(requestId);
      },
    );

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
        scope?: containerDesktopAPI.ConfigurationScope,
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

    this.ipcHandle('catalog:getExtensions', async (): Promise<CatalogExtension[]> => {
      return extensionsCatalog.getExtensions();
    });

    this.ipcHandle(
      'extension-loader:deactivateExtension',
      async (_listener: Electron.IpcMainInvokeEvent, extensionId: string): Promise<void> => {
        return this.extensionLoader.deactivateExtension(extensionId);
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
        return this.extensionLoader.removeExtension(extensionId);
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
        const logger = this.getLogHandlerCreateConnection('provider-registry:taskConnection-onData', loggerId);
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
        const logger = this.getLogHandlerCreateConnection('provider-registry:taskConnection-onData', loggerId);
        await providerRegistry.stopProviderConnection(providerId, providerConnectionInfo, logger);
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
        const logger = this.getLogHandlerCreateConnection('provider-registry:taskConnection-onData', loggerId);
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
        const logger = this.getLogHandlerCreateConnection('provider-registry:taskConnection-onData', loggerId);
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
      'provider-registry:createKubernetesProviderConnection',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: { [key: string]: unknown },
        loggerId: string,
        tokenId?: number,
      ): Promise<void> => {
        const logger = this.getLogHandlerCreateConnection('provider-registry:taskConnection-onData', loggerId);
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.ipcHandle(
      'kubernetes-client:createResourcesFromFile',
      async (_listener, context: string, file: string, namespace: string): Promise<void> => {
        return kubernetesClient.createResourcesFromFile(context, file, namespace);
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

    this.ipcHandle('kubernetes-client:getCurrentNamespace', async (): Promise<string | undefined> => {
      return kubernetesClient.getCurrentNamespace();
    });

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

    this.ipcHandle('onboarding:getOnboardingStep', async (_listener, extension: string): Promise<ActiveOnboarding> => {
      return onboardingRegistry.getOnboardingStep(extension);
    });

    this.ipcHandle('onboarding:getActiveOnboardings', async (): Promise<ActiveOnboarding[]> => {
      return onboardingRegistry.getActiveOnboardings();
    });

    this.ipcHandle('onboarding:executeOnboardingCommand', async (_listener, extension: string, command: string): Promise<void> => {
      return onboardingRegistry.executeOnboardingCommand(extension, command);
    });

    this.ipcHandle('onboarding:doNext', async (_listener, extension: string): Promise<void> => {
      return onboardingRegistry.doNext(extension);
    });

    this.ipcHandle('onboarding:setOnboardingRadioInputSelection', async (_listener, extension: string, idRadioGroup: string, idSelected: string): Promise<OnboardingInputResponse> => {
      return onboardingRegistry.setOnboardingRadioInputSelection(extension, idRadioGroup, idSelected);
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

    const dockerDesktopInstallation = new DockerDesktopInstallation(
      apiSender,
      containerProviderRegistry,
      contributionManager,
    );
    await dockerDesktopInstallation.init();

    const dockerExtensionAdapter = new DockerPluginAdapter(contributionManager);
    dockerExtensionAdapter.init();

    const extensionInstaller = new ExtensionInstaller(apiSender, this.extensionLoader, imageRegistry);
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
    autoStartConfiguration.start().catch((err: unknown) => console.error('Unable to perform autostart', err));
    return this.extensionLoader;
  }

  markAsExtensionsStarted(): void {
    this.isExtensionsStarted = true;
  }

  markAsReady(): void {
    this.isReady = true;
  }

  getLogHandlerCreateConnection(channel: string, loggerId: string): LoggerWithEnd {
    return {
      log: (...data: unknown[]) => {
        this.getWebContentsSender().send(channel, loggerId, 'log', data);
      },
      warn: (...data: unknown[]) => {
        this.getWebContentsSender().send(channel, loggerId, 'warn', data);
      },
      error: (...data: unknown[]) => {
        this.getWebContentsSender().send(channel, loggerId, 'error', data);
      },
      onEnd: () => {
        this.getWebContentsSender().send(channel, loggerId, 'finish');
      },
    };
  }
}
