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

/**
 * @module preload
 */

import type * as containerDesktopAPI from '@tmpwip/extension-api';
import { CommandRegistry } from './command-registry';
import { ContainerProviderRegistry } from './container-registry';
import { ExtensionLoader } from './extension-loader';
import { TrayMenuRegistry } from './tray-menu-registry';
import { ProviderRegistry } from './provider-registry';
import type { IConfigurationPropertyRecordedSchema } from './configuration-registry';
import { ConfigurationRegistry } from './configuration-registry';
import { TerminalInit } from './terminal-init';
import { ImageRegistry } from './image-registry';
import { EventEmitter } from 'node:events';
import type { ProviderContainerConnectionInfo, ProviderInfo } from './api/provider-info';
import type { WebContents } from 'electron';
import { ipcMain, BrowserWindow } from 'electron';
import type { ContainerCreateOptions, ContainerInfo } from './api/container-info';
import type { ImageInfo } from './api/image-info';
import type { PullEvent } from './api/pull-event';
import type { ExtensionInfo } from './api/extension-info';
import { shell } from 'electron';
import type { ImageInspectInfo } from './api/image-inspect-info';
import type { TrayMenu } from '../tray-menu';
import { getFreePort } from './util/port';
import { Dialogs } from './dialog-impl';
import { ProgressImpl } from './progress-impl';
import type { ContributionInfo } from './api/contribution-info';
import { ContributionManager } from './contribution-manager';
import { DockerDesktopInstallation } from './docker-extension/docker-desktop-installation';
import { DockerPluginAdapter } from './docker-extension/docker-plugin-adapter';
import { Telemetry } from './telemetry/telemetry';
import { NotificationImpl } from './notification-impl';

export class PluginSystem {
  constructor(private trayMenu: TrayMenu) {}

  getWebContentsSender(): WebContents {
    const window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());
    if (!window) {
      throw new Error('Unable to find the main window');
    }
    return window.webContents;
  }

  // initialize extension loader mechanism
  async initExtensions(): Promise<void> {
    const eventEmitter = new EventEmitter();
    const apiSender = {
      send: (channel: string, data: string) => {
        this.getWebContentsSender().send('api-sender', channel, data);
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      receive: (channel: string, func: any) => {
        eventEmitter.on(channel, data => {
          func(data);
        });
      },
    };

    const configurationRegistry = new ConfigurationRegistry();
    configurationRegistry.init();

    const telemetry = new Telemetry(configurationRegistry);
    await telemetry.init();

    const commandRegistry = new CommandRegistry();
    const imageRegistry = new ImageRegistry(apiSender, telemetry);
    const containerProviderRegistry = new ContainerProviderRegistry(apiSender, imageRegistry, telemetry);
    const providerRegistry = new ProviderRegistry(containerProviderRegistry, telemetry);
    const trayMenuRegistry = new TrayMenuRegistry(this.trayMenu, commandRegistry, providerRegistry, telemetry);

    providerRegistry.addProviderListener((name: string, providerInfo: ProviderInfo) => {
      if (name === 'provider:update-status') {
        apiSender.send('provider:update-status', providerInfo.name);
      }
    });

    const terminalInit = new TerminalInit(configurationRegistry);
    terminalInit.init();

    const extensionLoader = new ExtensionLoader(
      commandRegistry,
      providerRegistry,
      configurationRegistry,
      imageRegistry,
      apiSender,
      trayMenuRegistry,
      new Dialogs(),
      new ProgressImpl(),
      new NotificationImpl(),
    );

    const contributionManager = new ContributionManager(apiSender);
    ipcMain.handle('container-provider-registry:listContainers', async (): Promise<ContainerInfo[]> => {
      return containerProviderRegistry.listContainers();
    });
    ipcMain.handle('container-provider-registry:listImages', async (): Promise<ImageInfo[]> => {
      return containerProviderRegistry.listImages();
    });

    ipcMain.handle(
      'container-provider-registry:startContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.startContainer(engine, containerId);
      },
    );
    ipcMain.handle(
      'container-provider-registry:stopContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.stopContainer(engine, containerId);
      },
    );
    ipcMain.handle(
      'container-provider-registry:deleteContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.deleteContainer(engine, containerId);
      },
    );
    ipcMain.handle(
      'container-provider-registry:deleteImage',
      async (_listener, engine: string, imageId: string): Promise<void> => {
        return containerProviderRegistry.deleteImage(engine, imageId);
      },
    );
    ipcMain.handle(
      'container-provider-registry:getImageInspect',
      async (_listener, engine: string, imageId: string): Promise<ImageInspectInfo> => {
        return containerProviderRegistry.getImageInspect(engine, imageId);
      },
    );
    ipcMain.handle(
      'container-provider-registry:restartContainer',
      async (_listener, engine: string, containerId: string): Promise<void> => {
        return containerProviderRegistry.restartContainer(engine, containerId);
      },
    );
    ipcMain.handle(
      'container-provider-registry:createAndStartContainer',
      async (_listener, engine: string, options: ContainerCreateOptions): Promise<void> => {
        return containerProviderRegistry.createAndStartContainer(engine, options);
      },
    );

    ipcMain.handle(
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
    ipcMain.handle(
      'container-provider-registry:pushImage',
      async (_listener, engine: string, imageId: string, callbackId: number): Promise<void> => {
        return containerProviderRegistry.pushImage(engine, imageId, (name: string, data: string) => {
          this.getWebContentsSender().send('container-provider-registry:pushImage-onData', callbackId, name, data);
        });
      },
    );
    ipcMain.handle(
      'container-provider-registry:logsContainer',
      async (_listener, engine: string, containerId: string, onDataId: number): Promise<void> => {
        return containerProviderRegistry.logsContainer(engine, containerId, (name: string, data: string) => {
          this.getWebContentsSender().send('container-provider-registry:logsContainer-onData', onDataId, name, data);
        });
      },
    );

    const containerProviderRegistryShellInContainerSendCallback = new Map<number, (param: string) => void>();
    ipcMain.handle(
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

    ipcMain.handle(
      'container-provider-registry:shellInContainerSend',
      async (_listener, onDataId: number, content: string): Promise<void> => {
        const callback = containerProviderRegistryShellInContainerSendCallback.get(onDataId);
        if (callback) {
          callback(content);
        }
      },
    );

    ipcMain.handle(
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

    ipcMain.handle('provider-registry:getProviderInfos', async (): Promise<ProviderInfo[]> => {
      return providerRegistry.getProviderInfos();
    });

    ipcMain.handle('system:get-free-port', async (_, port: number): Promise<number> => {
      return getFreePort(port);
    });

    ipcMain.handle(
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

    ipcMain.handle(
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

    ipcMain.handle('image-registry:getRegistries', async (): Promise<readonly containerDesktopAPI.Registry[]> => {
      return imageRegistry.getRegistries();
    });

    ipcMain.handle('image-registry:hasAuthconfigForImage', async (_listener, imageName: string): Promise<boolean> => {
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

    ipcMain.handle('image-registry:getProviderNames', async (): Promise<string[]> => {
      return imageRegistry.getProviderNames();
    });

    ipcMain.handle(
      'image-registry:unregisterRegistry',
      async (_listener, registry: containerDesktopAPI.Registry): Promise<void> => {
        return imageRegistry.unregisterRegistry(registry);
      },
    );

    ipcMain.handle(
      'image-registry:registerRegistry',
      async (_listener, registry: containerDesktopAPI.Registry): Promise<void> => {
        await imageRegistry.registerRegistry(registry);
      },
    );

    ipcMain.handle(
      'image-registry:createRegistry',
      async (
        _listener,
        providerName: string,
        registryCreateOptions: containerDesktopAPI.RegistryCreateOptions,
      ): Promise<void> => {
        await imageRegistry.createRegistry(providerName, registryCreateOptions);
      },
    );

    ipcMain.handle(
      'image-registry:updateRegistry',
      async (_listener, registryUrl: string, registry: containerDesktopAPI.Registry): Promise<void> => {
        await imageRegistry.updateRegistry(registryUrl, registry);
      },
    );

    ipcMain.handle(
      'configuration-registry:getConfigurationProperties',
      async (): Promise<Record<string, IConfigurationPropertyRecordedSchema>> => {
        return configurationRegistry.getConfigurationProperties();
      },
    );
    ipcMain.handle(
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

    ipcMain.handle(
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

    ipcMain.handle('contributions:listContributions', async (): Promise<ContributionInfo[]> => {
      return contributionManager.listContributions();
    });

    ipcMain.handle('extension-loader:listExtensions', async (): Promise<ExtensionInfo[]> => {
      return extensionLoader.listExtensions();
    });

    ipcMain.handle(
      'extension-loader:deactivateExtension',
      async (_listener: Electron.IpcMainInvokeEvent, extensionId: string): Promise<void> => {
        return extensionLoader.deactivateExtension(extensionId);
      },
    );
    ipcMain.handle(
      'extension-loader:startExtension',
      async (_listener: Electron.IpcMainInvokeEvent, extensionId: string): Promise<void> => {
        return extensionLoader.startExtension(extensionId);
      },
    );

    ipcMain.handle(
      'shell:openExternal',
      async (_listener: Electron.IpcMainInvokeEvent, link: string): Promise<void> => {
        shell.openExternal(link);
      },
    );

    ipcMain.handle(
      'provider-registry:startProviderLifecycle',
      async (_listener: Electron.IpcMainInvokeEvent, providerId: string): Promise<void> => {
        return providerRegistry.startProviderLifecycle(providerId);
      },
    );

    ipcMain.handle(
      'provider-registry:stopProviderLifecycle',
      async (_listener: Electron.IpcMainInvokeEvent, providerId: string): Promise<void> => {
        return providerRegistry.stopProviderLifecycle(providerId);
      },
    );

    ipcMain.handle(
      'provider-registry:updateProxySettings',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        proxySettings: containerDesktopAPI.ProviderProxySettings,
      ): Promise<void> => {
        return providerRegistry.updateProxySettings(providerId, proxySettings);
      },
    );

    ipcMain.handle(
      'provider-registry:startProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      ): Promise<void> => {
        return providerRegistry.startProviderConnection(providerId, providerContainerConnectionInfo);
      },
    );

    ipcMain.handle(
      'provider-registry:stopProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      ): Promise<void> => {
        return providerRegistry.stopProviderConnection(providerId, providerContainerConnectionInfo);
      },
    );

    ipcMain.handle(
      'provider-registry:deleteProviderConnectionLifecycle',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        providerId: string,
        providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      ): Promise<void> => {
        return providerRegistry.deleteProviderConnection(providerId, providerContainerConnectionInfo);
      },
    );

    ipcMain.handle(
      'provider-registry:createProviderConnection',
      async (
        _listener: Electron.IpcMainInvokeEvent,
        internalProviderId: string,
        params: { [key: string]: unknown },
      ): Promise<void> => {
        return providerRegistry.createProviderConnection(internalProviderId, params);
      },
    );

    const dockerDesktopInstallation = new DockerDesktopInstallation(
      apiSender,
      containerProviderRegistry,
      contributionManager,
    );
    await dockerDesktopInstallation.init();

    const dockerExtensionAdapter = new DockerPluginAdapter(contributionManager);
    dockerExtensionAdapter.init();

    await contributionManager.init();

    await extensionLoader.start();
  }
}
