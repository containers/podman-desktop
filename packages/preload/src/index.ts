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
import EventEmitter from 'events';
import type { ContainerCreateOptions, ContainerInfo } from '../../main/src/plugin/api/container-info';
import type { ImageInfo } from '../../main/src/plugin/api/image-info';
import type { ImageInspectInfo } from '../../main/src/plugin/api/image-inspect-info';
import type { ExtensionInfo } from '../../main/src/plugin/api/extension-info';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../main/src/plugin/api/provider-info';
import type { IConfigurationPropertyRecordedSchema } from '../../main/src/plugin/configuration-registry';
import type { PullEvent } from '../../main/src/plugin/api/pull-event';
import { Deferred } from './util/deferred';

export type DialogResultCallback = (openDialogReturnValue: Electron.OpenDialogReturnValue) => void;

// initialize extension loader mechanism
function initExposure(): void {
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
  ipcRenderer.on('api-sender', (_, channel, data) => {
    apiSender.send(channel, data);
  });

  contextBridge.exposeInMainWorld('listContainers', async (): Promise<ContainerInfo[]> => {
    return ipcRenderer.invoke('container-provider-registry:listContainers');
  });

  contextBridge.exposeInMainWorld('listImages', async (): Promise<ImageInfo[]> => {
    return ipcRenderer.invoke('container-provider-registry:listImages');
  });

  contextBridge.exposeInMainWorld('startContainer', async (engine: string, containerId: string): Promise<void> => {
    return ipcRenderer.invoke('container-provider-registry:startContainer', engine, containerId);
  });

  let onDataCallbacksPullImageId = 0;
  const onDataCallbacksPullImage = new Map<number, (event: PullEvent) => void>();
  contextBridge.exposeInMainWorld(
    'pullImage',
    async (
      providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      imageName: string,
      callback: (event: PullEvent) => void,
    ): Promise<void> => {
      onDataCallbacksPullImageId++;
      onDataCallbacksPullImage.set(onDataCallbacksPullImageId, callback);
      return ipcRenderer.invoke(
        'container-provider-registry:pullImage',
        providerContainerConnectionInfo,
        imageName,
        onDataCallbacksPullImageId,
      );
    },
  );
  ipcRenderer.on(
    'container-provider-registry:pullImage-onData',
    (_, onDataCallbacksPullImageId: number, event: PullEvent) => {
      // grab callback from the map
      const callback = onDataCallbacksPullImage.get(onDataCallbacksPullImageId);
      if (callback) {
        callback(event);
      }
    },
  );

  let onDataCallbacksPushImageId = 0;
  const onDataCallbacksPushImage = new Map<number, (name: string, data: string) => void>();
  contextBridge.exposeInMainWorld(
    'pushImage',
    async (engine: string, imageId: string, callback: (name: string, data: string) => void): Promise<void> => {
      onDataCallbacksPushImageId++;
      onDataCallbacksPushImage.set(onDataCallbacksPushImageId, callback);
      return ipcRenderer.invoke('container-provider-registry:pushImage', engine, imageId, onDataCallbacksPushImageId);
    },
  );
  ipcRenderer.on(
    'container-provider-registry:pushImage-onData',
    (_, onDataCallbacksPushImageId: number, name: string, data: string) => {
      // grab callback from the map
      const callback = onDataCallbacksPushImage.get(onDataCallbacksPushImageId);
      if (callback) {
        callback(name, data);
      }
    },
  );

  contextBridge.exposeInMainWorld('restartContainer', async (engine: string, containerId: string): Promise<void> => {
    return ipcRenderer.invoke('container-provider-registry:restartContainer', engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'createAndStartContainer',
    async (engine: string, options: ContainerCreateOptions): Promise<void> => {
      return ipcRenderer.invoke('container-provider-registry:createAndStartContainer', engine, options);
    },
  );

  contextBridge.exposeInMainWorld('stopContainer', async (engine: string, containerId: string): Promise<void> => {
    return ipcRenderer.invoke('container-provider-registry:stopContainer', engine, containerId);
  });
  contextBridge.exposeInMainWorld('deleteContainer', async (engine: string, containerId: string): Promise<void> => {
    return ipcRenderer.invoke('container-provider-registry:deleteContainer', engine, containerId);
  });

  let onDataCallbacksLogsContainerId = 0;
  const onDataCallbacksLogsContainer = new Map<number, (name: string, data: string) => void>();

  contextBridge.exposeInMainWorld(
    'logsContainer',
    async (engine: string, containerId: string, callback: (name: string, data: string) => void): Promise<void> => {
      onDataCallbacksLogsContainerId++;
      onDataCallbacksLogsContainer.set(onDataCallbacksLogsContainerId, callback);
      return ipcRenderer.invoke(
        'container-provider-registry:logsContainer',
        engine,
        containerId,
        onDataCallbacksLogsContainerId,
      );
    },
  );
  ipcRenderer.on(
    'container-provider-registry:logsContainer-onData',
    (_, onDataCallbacksLogsContainerId: number, name: string, data: string) => {
      // grab callback from the map
      const callback = onDataCallbacksLogsContainer.get(onDataCallbacksLogsContainerId);
      if (callback) {
        callback(name, data);
      }
    },
  );

  // callbacks for shellInContainer
  let onDataCallbacksShellInContainerId = 0;
  const onDataCallbacksShellInContainer = new Map<number, (data: Buffer) => void>();
  contextBridge.exposeInMainWorld(
    'shellInContainer',
    async (engine: string, containerId: string, onData: (data: Buffer) => void): Promise<number> => {
      onDataCallbacksShellInContainerId++;
      onDataCallbacksShellInContainer.set(onDataCallbacksShellInContainerId, onData);
      return ipcRenderer.invoke(
        'container-provider-registry:shellInContainer',
        engine,
        containerId,
        onDataCallbacksShellInContainerId,
      );
    },
  );

  contextBridge.exposeInMainWorld('shellInContainerSend', async (dataId: number, content: string): Promise<void> => {
    return ipcRenderer.invoke('container-provider-registry:shellInContainerSend', dataId, content);
  });

  ipcRenderer.on(
    'container-provider-registry:shellInContainer-onData',
    (_, onDataCallbacksShellInContainerId: number, data: Buffer) => {
      // grab callback from the map
      const callback = onDataCallbacksShellInContainer.get(onDataCallbacksShellInContainerId);
      if (callback) {
        callback(data);
      }
    },
  );

  contextBridge.exposeInMainWorld(
    'getImageInspect',
    async (engine: string, imageId: string): Promise<ImageInspectInfo> => {
      return ipcRenderer.invoke('container-provider-registry:getImageInspect', engine, imageId);
    },
  );

  contextBridge.exposeInMainWorld('deleteImage', async (engine: string, imageId: string): Promise<void> => {
    return ipcRenderer.invoke('container-provider-registry:deleteImage', engine, imageId);
  });

  contextBridge.exposeInMainWorld('startProviderLifecycle', async (providerId: string): Promise<void> => {
    return ipcRenderer.invoke('provider-registry:startProviderLifecycle', providerId);
  });

  contextBridge.exposeInMainWorld('stopProviderLifecycle', async (providerId: string): Promise<void> => {
    return ipcRenderer.invoke('provider-registry:stopProviderLifecycle', providerId);
  });

  contextBridge.exposeInMainWorld(
    'createProviderConnection',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (internalProviderId: string, params: { [key: string]: any }): Promise<void> => {
      return ipcRenderer.invoke('provider-registry:createProviderConnection', internalProviderId, params);
    },
  );

  contextBridge.exposeInMainWorld(
    'startProviderConnectionLifecycle',
    async (providerId: string, providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> => {
      return ipcRenderer.invoke(
        'provider-registry:startProviderConnectionLifecycle',
        providerId,
        providerContainerConnectionInfo,
      );
    },
  );

  contextBridge.exposeInMainWorld(
    'stopProviderConnectionLifecycle',
    async (providerId: string, providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> => {
      return ipcRenderer.invoke(
        'provider-registry:stopProviderConnectionLifecycle',
        providerId,
        providerContainerConnectionInfo,
      );
    },
  );

  contextBridge.exposeInMainWorld(
    'deleteProviderConnectionLifecycle',
    async (providerId: string, providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> => {
      return ipcRenderer.invoke(
        'provider-registry:deleteProviderConnectionLifecycle',
        providerId,
        providerContainerConnectionInfo,
      );
    },
  );

  let onDataCallbacksBuildImageId = 0;
  const onDataCallbacksBuildImage = new Map<number, (eventName: string, data: string) => void>();

  contextBridge.exposeInMainWorld(
    'buildImage',
    async (
      containerBuildContextDirectory: string,
      relativeContainerfilePath: string,
      imageName: string,
      selectedProvider: ProviderContainerConnectionInfo,
      eventCollect: (eventName: string, data: string) => void,
    ): Promise<unknown> => {
      onDataCallbacksBuildImageId++;
      onDataCallbacksBuildImage.set(onDataCallbacksBuildImageId, eventCollect);
      return ipcRenderer.invoke(
        'container-provider-registry:buildImage',
        containerBuildContextDirectory,
        relativeContainerfilePath,
        imageName,
        selectedProvider,
        onDataCallbacksBuildImageId,
      );
    },
  );
  ipcRenderer.on(
    'container-provider-registry:buildImage-onData',
    (_, onDataCallbacksBuildImageId: number, eventName: string, data: string) => {
      // grab callback from the map
      const callback = onDataCallbacksBuildImage.get(onDataCallbacksBuildImageId);
      if (callback) {
        callback(eventName, data);
      }
    },
  );

  contextBridge.exposeInMainWorld('getProviderInfos', async (): Promise<ProviderInfo[]> => {
    return ipcRenderer.invoke('provider-registry:getProviderInfos');
  });

  contextBridge.exposeInMainWorld('getImageRegistries', async (): Promise<readonly containerDesktopAPI.Registry[]> => {
    return ipcRenderer.invoke('image-registry:getRegistries');
  });
  contextBridge.exposeInMainWorld('getImageRegistryProviderNames', async (): Promise<string[]> => {
    return ipcRenderer.invoke('image-registry:getProviderNames');
  });

  contextBridge.exposeInMainWorld('hasAuthconfigForImage', async (imageName: string): Promise<boolean> => {
    return ipcRenderer.invoke('image-registry:hasAuthconfigForImage', imageName);
  });

  contextBridge.exposeInMainWorld(
    'createImageRegistry',
    async (providerName: string, registryCreateOptions: containerDesktopAPI.RegistryCreateOptions): Promise<void> => {
      return ipcRenderer.invoke('image-registry:createRegistry', providerName, registryCreateOptions);
    },
  );

  contextBridge.exposeInMainWorld(
    'unregisterImageRegistry',
    async (registry: containerDesktopAPI.Registry): Promise<void> => {
      return ipcRenderer.invoke('image-registry:unregisterRegistry', registry);
    },
  );

  contextBridge.exposeInMainWorld(
    'getConfigurationProperties',
    async (): Promise<Record<string, IConfigurationPropertyRecordedSchema>> => {
      return ipcRenderer.invoke('configuration-registry:getConfigurationProperties');
    },
  );

  // can't send configuration object as it is not serializable
  // https://www.electronjs.org/docs/latest/api/context-bridge#parameter--error--return-type-support
  contextBridge.exposeInMainWorld(
    'getConfigurationValue',
    <T>(key: string, scope?: containerDesktopAPI.ConfigurationScope): Promise<T | undefined> => {
      return ipcRenderer.invoke('configuration-registry:getConfigurationValue', key, scope);
    },
  );

  contextBridge.exposeInMainWorld(
    'updateConfigurationValue',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (key: string, value: any, scope?: containerDesktopAPI.ConfigurationScope): Promise<void> => {
      return ipcRenderer.invoke('configuration-registry:updateConfigurationValue', key, value, scope);
    },
  );

  contextBridge.exposeInMainWorld('listExtensions', async (): Promise<ExtensionInfo[]> => {
    return ipcRenderer.invoke('extension-loader:listExtensions');
  });

  contextBridge.exposeInMainWorld('stopExtension', async (extensionId: string): Promise<void> => {
    return ipcRenderer.invoke('extension-loader:deactivateExtension', extensionId);
  });

  contextBridge.exposeInMainWorld('startExtension', async (extensionId: string): Promise<void> => {
    return ipcRenderer.invoke('extension-loader:startExtension', extensionId);
  });

  contextBridge.exposeInMainWorld('openExternal', async (link: string): Promise<void> => {
    return ipcRenderer.invoke('shell:openExternal', link);
  });

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

  let idDialog = 0;

  const dialogResponses = new Map<string, DialogResultCallback>();

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
    return ipcRenderer.invoke('system:get-free-port', port);
  });

  type LogFunction = (...data: unknown[]) => void;

  let onDataCallbacksStartReceiveLogsId = 0;

  const onDataCallbacksStartReceiveLogs = new Map<number, containerDesktopAPI.Logger>();
  contextBridge.exposeInMainWorld(
    'startReceiveLogs',
    async (
      providerId: string,
      log: LogFunction,
      warn: LogFunction,
      error: LogFunction,
      containerConnectionInfo?: ProviderContainerConnectionInfo,
    ): Promise<void> => {
      onDataCallbacksStartReceiveLogsId++;
      const logger: containerDesktopAPI.Logger = {
        log,
        warn,
        error,
      };
      onDataCallbacksStartReceiveLogs.set(onDataCallbacksStartReceiveLogsId, logger);
      return ipcRenderer.invoke(
        'provider-registry:startReceiveLogs',
        providerId,
        onDataCallbacksStartReceiveLogsId,
        containerConnectionInfo,
      );
    },
  );
  ipcRenderer.on(
    'provider-registry:startReceiveLogs-onData',
    (_, onDataCallbacksStartReceiveLogsId: number, channel: string, data: unknown[]) => {
      // grab callback from the map
      const callback = onDataCallbacksStartReceiveLogs.get(onDataCallbacksStartReceiveLogsId);
      if (callback) {
        if (channel === 'log') {
          callback.log(data);
        } else if (channel === 'warn') {
          callback.log(data);
        } else if (channel === 'error') {
          callback.log(data);
        }
      }
    },
  );

  contextBridge.exposeInMainWorld(
    'stopReceiveLogs',
    async (providerId: string, containerConnectionInfo?: ProviderContainerConnectionInfo): Promise<void> => {
      return ipcRenderer.invoke('provider-registry:stopReceiveLogs', providerId, containerConnectionInfo);
    },
  );
}

// expose methods
initExposure();
