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
import { contextBridge, ipcRenderer } from 'electron';
import type { ContainerCreateOptions, ContainerInfo } from './api/container-info';
import type { ExtensionInfo } from './api/extension-info';
import { CommandRegistry } from './command-registry';
import type { PullEvent } from './container-registry';
import { ContainerProviderRegistry } from './container-registry';
import { ExtensionLoader } from './extension-loader';
import EventEmitter from 'events';
import type { ImageInfo } from './api/image-info';
import type { ImageInspectInfo } from './api/image-inspect-info';
import type { ProviderContainerConnectionInfo, ProviderInfo } from './api/provider-info';
import { TrayMenuRegistry } from './tray-menu-registry';
import { ProviderRegistry } from './provider-registry';
import type { IConfigurationPropertyRecordedSchema } from './configuration-registry';
import { ConfigurationRegistry } from './configuration-registry';
import { TerminalInit } from './terminal-init';
import { Deferred } from './util/deferred';
import { getFreePort } from './util/port';
import { ImageRegistry } from './image-registry';
import { Dialogs } from './dialog-impl';
import { ProgressImpl } from './progress-impl';

const shell = require('electron').shell;

let idDialog = 0;
export type DialogResultCallback = (openDialogReturnValue: Electron.OpenDialogReturnValue) => void;

const dialogResponses = new Map<string, DialogResultCallback>();

// initialize extension loader mechanism
function initExtensions(): void {
  const eventEmitter = new EventEmitter();
  const apiSender = {
    send: (channel: string, data: string) => {
      eventEmitter.emit(channel, data);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (channel: string, func: any) => {
      eventEmitter.on(channel, data => {
        func(data);
      });
    },
  };

  contextBridge.exposeInMainWorld('events', apiSender);

  const commandRegistry = new CommandRegistry();
  const imageRegistry = new ImageRegistry(apiSender);
  const containerProviderRegistry = new ContainerProviderRegistry(apiSender, imageRegistry);
  const providerRegistry = new ProviderRegistry(containerProviderRegistry);
  const trayMenuRegistry = new TrayMenuRegistry(commandRegistry, providerRegistry);

  providerRegistry.addProviderListener((name: string, providerInfo: ProviderInfo) => {
    if (name === 'provider:update-status') {
      apiSender.send('provider:update-status', providerInfo.name);
    }
  });

  const configurationRegistry = new ConfigurationRegistry();
  configurationRegistry.init();
  const terminalInit = new TerminalInit(configurationRegistry);
  terminalInit.init();

  contextBridge.exposeInMainWorld('listContainers', async (): Promise<ContainerInfo[]> => {
    return containerProviderRegistry.listContainers();
  });

  contextBridge.exposeInMainWorld('listImages', async (): Promise<ImageInfo[]> => {
    return containerProviderRegistry.listImages();
  });

  contextBridge.exposeInMainWorld('startContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.startContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'pullImage',
    async (
      providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      imageName: string,
      callback: (event: PullEvent) => void,
    ): Promise<void> => {
      return containerProviderRegistry.pullImage(providerContainerConnectionInfo, imageName, callback);
    },
  );

  contextBridge.exposeInMainWorld(
    'pushImage',
    async (engine: string, imageId: string, callback: (name: string, data: string) => void): Promise<void> => {
      return containerProviderRegistry.pushImage(engine, imageId, callback);
    },
  );

  contextBridge.exposeInMainWorld('restartContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.restartContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'createAndStartContainer',
    async (engine: string, options: ContainerCreateOptions): Promise<void> => {
      return containerProviderRegistry.createAndStartContainer(engine, options);
    },
  );

  contextBridge.exposeInMainWorld('stopContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.stopContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'logsContainer',
    async (engine: string, containerId: string, callback: (name: string, data: string) => void): Promise<void> => {
      return containerProviderRegistry.logsContainer(engine, containerId, callback);
    },
  );

  contextBridge.exposeInMainWorld(
    'shellInContainer',
    async (engine: string, containerId: string, onData: (data: Buffer) => void): Promise<(param: string) => void> => {
      return containerProviderRegistry.shellInContainer(engine, containerId, onData);
    },
  );

  contextBridge.exposeInMainWorld('deleteImage', async (engine: string, imageId: string): Promise<void> => {
    return containerProviderRegistry.deleteImage(engine, imageId);
  });

  contextBridge.exposeInMainWorld('deleteContainer', async (engine: string, containerId: string): Promise<void> => {
    return containerProviderRegistry.deleteContainer(engine, containerId);
  });

  contextBridge.exposeInMainWorld('startProviderLifecycle', async (providerId: string): Promise<void> => {
    return providerRegistry.startProviderLifecycle(providerId);
  });

  contextBridge.exposeInMainWorld('stopProviderLifecycle', async (providerId: string): Promise<void> => {
    return providerRegistry.stopProviderLifecycle(providerId);
  });

  contextBridge.exposeInMainWorld('providerConnectionLifecycle', {
    start: async (
      providerId: string,
      providerContainerConnectionInfo: ProviderContainerConnectionInfo,
    ): Promise<void> => {
      return providerRegistry.startProviderConnection(providerId, providerContainerConnectionInfo);
    },
    stop: async (
      providerId: string,
      providerContainerConnectionInfo: ProviderContainerConnectionInfo,
    ): Promise<void> => {
      return providerRegistry.stopProviderConnection(providerId, providerContainerConnectionInfo);
    },
    delete: async (
      providerId: string,
      providerContainerConnectionInfo: ProviderContainerConnectionInfo,
    ): Promise<void> => {
      return providerRegistry.deleteProviderConnection(providerId, providerContainerConnectionInfo);
    },
  });

  contextBridge.exposeInMainWorld(
    'buildImage',
    async (
      containerBuildContextDirectory: string,
      relativeContainerfilePath: string,
      imageName: string,
      selectedProvider: ProviderContainerConnectionInfo,
      eventCollect: (eventName: string, data: string) => void,
    ): Promise<unknown> => {
      return containerProviderRegistry.buildImage(
        containerBuildContextDirectory,
        relativeContainerfilePath,
        imageName,
        selectedProvider,
        eventCollect,
      );
    },
  );

  contextBridge.exposeInMainWorld(
    'getImageInspect',
    async (engine: string, imageId: string): Promise<ImageInspectInfo> => {
      return containerProviderRegistry.getImageInspect(engine, imageId);
    },
  );

  contextBridge.exposeInMainWorld('getProviderInfos', async (): Promise<ProviderInfo[]> => {
    return providerRegistry.getProviderInfos();
  });

  contextBridge.exposeInMainWorld('registry', {
    hasAuthconfigForImage: (imageName: string): boolean => {
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
    },
    getRegistries: async (): Promise<readonly containerDesktopAPI.Registry[]> => {
      return imageRegistry.getRegistries();
    },
    getProviderNames: async (): Promise<string[]> => {
      return imageRegistry.getProviderNames();
    },
    unregisterRegistry: async (registry: containerDesktopAPI.Registry): Promise<void> => {
      return imageRegistry.unregisterRegistry(registry);
    },
    registerRegistry: async (registry: containerDesktopAPI.Registry): Promise<containerDesktopAPI.Disposable> => {
      return imageRegistry.registerRegistry(registry);
    },
    createRegistry: async (
      providerName: string,
      registryCreateOptions: containerDesktopAPI.RegistryCreateOptions,
    ): Promise<containerDesktopAPI.Disposable> => {
      return imageRegistry.createRegistry(providerName, registryCreateOptions);
    },
  });

  contextBridge.exposeInMainWorld(
    'getConfigurationProperties',
    async (): Promise<Record<string, IConfigurationPropertyRecordedSchema>> => {
      return configurationRegistry.getConfigurationProperties();
    },
  );

  // can't send configuration object as it is not serializable
  // https://www.electronjs.org/docs/latest/api/context-bridge#parameter--error--return-type-support
  contextBridge.exposeInMainWorld(
    'getConfigurationValue',
    <T>(key: string, scope?: containerDesktopAPI.ConfigurationScope): T | undefined => {
      // extract parent key with first name before first . notation
      const parentKey = key.substring(0, key.indexOf('.'));
      // extract child key with first name after first . notation
      const childKey = key.substring(key.indexOf('.') + 1);
      return configurationRegistry.getConfiguration(parentKey, scope).get(childKey);
    },
  );

  contextBridge.exposeInMainWorld(
    'updateConfigurationValue',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (key: string, value: any, scope?: containerDesktopAPI.ConfigurationScope): Promise<void> => {
      return configurationRegistry.updateConfigurationValue(key, value, scope);
    },
  );

  contextBridge.exposeInMainWorld(
    'createProviderConnection',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (internalProviderId: string, params: { [key: string]: any }): Promise<void> => {
      return providerRegistry.createProviderConnection(internalProviderId, params);
    },
  );

  const extensionLoader = new ExtensionLoader(
    commandRegistry,
    providerRegistry,
    configurationRegistry,
    imageRegistry,
    apiSender,
    trayMenuRegistry,
    new Dialogs(),
    new ProgressImpl(),
  );
  contextBridge.exposeInMainWorld('listExtensions', async (): Promise<ExtensionInfo[]> => {
    return extensionLoader.listExtensions();
  });

  contextBridge.exposeInMainWorld('stopExtension', async (extensionId: string): Promise<void> => {
    return extensionLoader.deactivateExtension(extensionId);
  });
  contextBridge.exposeInMainWorld('startExtension', async (extensionId: string): Promise<void> => {
    return extensionLoader.startExtension(extensionId);
  });

  contextBridge.exposeInMainWorld('openExternal', (link: string): void => {
    shell.openExternal(link);
  });

  contextBridge.exposeInMainWorld('trayMenu', trayMenuRegistry);

  // Handle callback on dialog file/folder by calling the callback once we get the answer
  ipcRenderer.on(
    'dialog:open-file-or-folder-response',
    (_, dialogId: string, openDialogReturnValue: Electron.OpenDialogReturnValue) => {
      // grab from stored map
      const callback = dialogResponses.get(dialogId);
      if (callback) {
        callback(openDialogReturnValue);

        // remove callback
        dialogResponses.delete(dialogId);
      } else {
        console.error('Got response for an unknown dialog id', dialogId);
      }
    },
  );

  contextBridge.exposeInMainWorld('openFileDialog', async (message: string) => {
    // generate id
    const dialogId = idDialog;
    idDialog++;

    // create defer object
    const defer = new Deferred<Electron.OpenDialogReturnValue>();

    // store the dialogID
    dialogResponses.set(`${dialogId}`, (result: Electron.OpenDialogReturnValue) => {
      defer.resolve(result);
    });

    // ask to open file dialog
    ipcRenderer.send('dialog:openFile', {
      dialogId: `${dialogId}`,
      message,
    });

    // wait for response
    return defer.promise;
  });

  contextBridge.exposeInMainWorld('openFolderDialog', async (message: string) => {
    // generate id
    const dialogId = idDialog;
    idDialog++;

    // create defer object
    const defer = new Deferred<Electron.OpenDialogReturnValue>();

    // store the dialogID
    dialogResponses.set(`${dialogId}`, (result: Electron.OpenDialogReturnValue) => {
      defer.resolve(result);
    });

    // ask to open file dialog
    ipcRenderer.send('dialog:openFolder', {
      dialogId: `${dialogId}`,
      message,
    });

    // wait for response
    return defer.promise;
  });

  contextBridge.exposeInMainWorld('getFreePort', async (port: number): Promise<number> => {
    return getFreePort(port);
  });

  type logFn = (...data: unknown[]) => void;

  contextBridge.exposeInMainWorld('providerLogs', {
    startReceiveLogs: (
      providerId: string,
      log: logFn,
      warn: logFn,
      error: logFn,
      containerConnectionInfo?: ProviderContainerConnectionInfo,
    ) => {
      let context;
      if (containerConnectionInfo) {
        context = providerRegistry.getMatchingContainerLifecycleContext(providerId, containerConnectionInfo);
      } else {
        context = providerRegistry.getMatchingLifecycleContext(providerId);
      }
      context.log.setLogHandler({ log: log, warn: warn, error: error });
    },

    stopReceiveLogs: (providerId: string, containerConnectionInfo?: ProviderContainerConnectionInfo) => {
      let context;
      if (containerConnectionInfo) {
        context = providerRegistry.getMatchingContainerLifecycleContext(providerId, containerConnectionInfo);
      } else {
        context = providerRegistry.getMatchingLifecycleContext(providerId);
      }
      context.log.removeLogHandler();
    },
  });
  extensionLoader.start();
}

// start extensions
initExtensions();
