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

import type * as containerDesktopAPI from '@podman-desktop/api';
import { contextBridge, ipcRenderer } from 'electron';
import EventEmitter from 'events';
import type {
  ContainerCreateOptions,
  ContainerInfo,
  SimpleContainerInfo,
  VolumeCreateOptions,
} from '../../main/src/plugin/api/container-info';
import type { ContributionInfo } from '../../main/src/plugin/api/contribution-info';
import type { ImageInfo } from '../../main/src/plugin/api/image-info';
import type { VolumeInspectInfo, VolumeListInfo } from '../../main/src/plugin/api/volume-info';
import type { PodInfo, PodInspectInfo } from '../../main/src/plugin/api/pod-info';
import type { NetworkInspectInfo } from '../../main/src/plugin/api/network-info';
import type { ImageInspectInfo } from '../../main/src/plugin/api/image-inspect-info';
import type { HistoryInfo } from '../../main/src/plugin/api/history-info';
import type { ContainerInspectInfo } from '../../main/src/plugin/api/container-inspect-info';
import type { ContainerStatsInfo } from '../../main/src/plugin/api/container-stats-info';
import type { IconInfo } from '../../main/src/plugin/api/icon-info';
import type { ExtensionInfo } from '../../main/src/plugin/api/extension-info';
import type { FeaturedExtension } from '../../main/src/plugin/featured/featured-api';
import type { CatalogExtension } from '../../main/src/plugin/extensions-catalog/extensions-catalog-api';

import type { V1Route } from '../../main/src/plugin/api/openshift-types';
import type { AuthenticationProviderInfo } from '../../main/src/plugin/authentication';
import type {
  PreflightCheckEvent,
  PreflightChecksCallback,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '../../main/src/plugin/api/provider-info';
import type { IConfigurationPropertyRecordedSchema } from '../../main/src/plugin/configuration-registry';
import type { PullEvent } from '../../main/src/plugin/api/pull-event';
import { Deferred } from './util/deferred';
import type { StatusBarEntryDescriptor } from '../../main/src/plugin/statusbar/statusbar-registry';
import type {
  PlayKubeInfo,
  PodCreateOptions,
  ContainerCreateOptions as PodmanContainerCreateOptions,
} from '../../main/src/plugin/dockerode/libpod-dockerode';
import type { V1ConfigMap, V1Ingress, V1NamespaceList, V1Pod, V1PodList, V1Service } from '@kubernetes/client-node';
import type { Menu } from '../../main/src/plugin/menu-registry';
import type { MessageBoxOptions, MessageBoxReturnValue } from '../../main/src/plugin/message-box';
import type { ViewInfoUI } from '../../main/src/plugin/api/view-info';
import type { ContextInfo } from '../../main/src/plugin/api/context-info';
import type { OnboardingInfo, OnboardingStatus } from '../../main/src/plugin/api/onboarding';

export type DialogResultCallback = (openDialogReturnValue: Electron.OpenDialogReturnValue) => void;

export type LogType = 'log' | 'warn' | 'trace' | 'debug' | 'error';
const originalConsole = console;
const memoryLogs: { logType: LogType; date: Date; message: string }[] = [];

export interface FeedbackProperties {
  rating: number;
  comment?: string;
  contact?: string;
}

export interface KeyLogger {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(key: symbol, ...data: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(key: symbol, ...data: any[]): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(key: symbol, ...data: any[]): void;
}

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

  interface ErrorMessage {
    name: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extra: any;
  }

  function decodeError(error: ErrorMessage) {
    const e = new Error(error.message);
    e.name = error.name;
    Object.assign(e, error.extra);
    return e;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async function ipcInvoke(channel: string, ...args: any) {
    const { error, result } = await ipcRenderer.invoke(channel, ...args);
    if (error) {
      throw decodeError(error);
    }
    return result;
  }

  contextBridge.exposeInMainWorld('events', apiSender);
  ipcRenderer.on('api-sender', (_, channel, data) => {
    apiSender.send(channel, data);
  });

  // keep console log data
  const types: LogType[] = ['log', 'warn', 'trace', 'debug', 'error'];
  types.forEach(logType => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const originalFunction = (originalConsole as any)[logType];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (console as any)[logType] = (...args: unknown[]) => {
      originalFunction(...args);
      memoryLogs.push({ logType: logType, date: new Date(), message: args.join(' ') });
    };
  });

  ipcRenderer.on('console:output', (_, target: string, ...args) => {
    const prefix = 'main ↪️';
    if (target === 'log') {
      console.log(prefix, ...args);
    } else if (target === 'warn') {
      console.warn(prefix, ...args);
    } else if (target === 'trace') {
      console.trace(prefix, ...args);
    } else if (target === 'debug') {
      console.debug(prefix, ...args);
    } else if (target === 'error') {
      console.error(prefix, ...args);
    }
  });

  // Handle protocol to install extensions by delegating to the renderer process
  ipcRenderer.on('podman-desktop-protocol:install-extension', (_, extensionId: string) => {
    apiSender.send('install-extension:from-id', extensionId);
  });

  contextBridge.exposeInMainWorld('extensionSystemIsReady', async (): Promise<boolean> => {
    return ipcInvoke('extension-system:isReady');
  });

  contextBridge.exposeInMainWorld('extensionSystemIsExtensionsStarted', async (): Promise<boolean> => {
    return ipcInvoke('extension-system:isExtensionsStarted');
  });

  contextBridge.exposeInMainWorld(
    'getDevtoolsConsoleLogs',
    async (): Promise<{ logType: LogType; date: Date; message: string }[]> => {
      return memoryLogs;
    },
  );

  contextBridge.exposeInMainWorld('listContainers', async (): Promise<ContainerInfo[]> => {
    return ipcInvoke('container-provider-registry:listContainers');
  });

  contextBridge.exposeInMainWorld(
    'listSimpleContainersByLabel',
    async (label: string, key: string): Promise<SimpleContainerInfo[]> => {
      return ipcInvoke('container-provider-registry:listSimpleContainersByLabel', label, key);
    },
  );

  contextBridge.exposeInMainWorld('listImages', async (): Promise<ImageInfo[]> => {
    return ipcInvoke('container-provider-registry:listImages');
  });

  contextBridge.exposeInMainWorld('listVolumes', async (fetchUsage = true): Promise<VolumeListInfo[]> => {
    return ipcInvoke('container-provider-registry:listVolumes', fetchUsage);
  });
  contextBridge.exposeInMainWorld('removeVolume', async (engine: string, volumeName: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:removeVolume', engine, volumeName);
  });
  contextBridge.exposeInMainWorld(
    'getVolumeInspect',
    async (engine: string, volumeName: string): Promise<VolumeInspectInfo> => {
      return ipcInvoke('container-provider-registry:getVolumeInspect', engine, volumeName);
    },
  );

  contextBridge.exposeInMainWorld('listPods', async (): Promise<PodInfo[]> => {
    return ipcInvoke('container-provider-registry:listPods');
  });

  contextBridge.exposeInMainWorld('reconnectContainerProviders', async (): Promise<PodInfo[]> => {
    return ipcInvoke('container-provider-registry:reconnectContainerProviders');
  });

  contextBridge.exposeInMainWorld('listNetworks', async (): Promise<NetworkInspectInfo[]> => {
    return ipcInvoke('container-provider-registry:listNetworks');
  });

  contextBridge.exposeInMainWorld(
    'replicatePodmanContainer',
    async (
      source: { engineId: string; id: string },
      target: { engineId: string },
      overrideParameters: PodmanContainerCreateOptions,
    ): Promise<{ Id: string; Warnings: string[] }> => {
      return ipcInvoke('container-provider-registry:replicatePodmanContainer', source, target, overrideParameters);
    },
  );
  contextBridge.exposeInMainWorld(
    'createPod',
    async (
      selectedProvider: ProviderContainerConnectionInfo,
      podCreateOptions: PodCreateOptions,
    ): Promise<{ engineId: string; Id: string }> => {
      return ipcInvoke('container-provider-registry:createPod', selectedProvider, podCreateOptions);
    },
  );
  contextBridge.exposeInMainWorld('startPod', async (engine: string, podId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:startPod', engine, podId);
  });
  contextBridge.exposeInMainWorld('restartPod', async (engine: string, podId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:restartPod', engine, podId);
  });
  contextBridge.exposeInMainWorld('generatePodmanKube', async (engine: string, names: string[]): Promise<string> => {
    return ipcInvoke('container-provider-registry:generatePodmanKube', engine, names);
  });

  contextBridge.exposeInMainWorld(
    'playKube',
    async (
      relativeContainerfilePath: string,
      selectedProvider: ProviderContainerConnectionInfo,
    ): Promise<PlayKubeInfo> => {
      return ipcInvoke('container-provider-registry:playKube', relativeContainerfilePath, selectedProvider);
    },
  );

  contextBridge.exposeInMainWorld('stopPod', async (engine: string, podId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:stopPod', engine, podId);
  });
  contextBridge.exposeInMainWorld('removePod', async (engine: string, podId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:removePod', engine, podId);
  });

  contextBridge.exposeInMainWorld('startContainer', async (engine: string, containerId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:startContainer', engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'pingContainerEngine',
    async (providerContainerConnectionInfo: ProviderContainerConnectionInfo): Promise<unknown> => {
      return ipcInvoke('container-provider-registry:pingContainerEngine', providerContainerConnectionInfo);
    },
  );

  contextBridge.exposeInMainWorld(
    'listContainersFromEngine',
    async (
      providerContainerConnectionInfo: ProviderContainerConnectionInfo,
    ): Promise<{ Id: string; Names: string[] }[]> => {
      return ipcInvoke('container-provider-registry:listContainersFromEngine', providerContainerConnectionInfo);
    },
  );

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
      return ipcInvoke(
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
      return ipcInvoke('container-provider-registry:pushImage', engine, imageId, onDataCallbacksPushImageId);
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
    return ipcInvoke('container-provider-registry:restartContainer', engine, containerId);
  });

  contextBridge.exposeInMainWorld(
    'restartContainersByLabel',
    async (engine: string, label: string, key: string): Promise<void> => {
      return ipcInvoke('container-provider-registry:restartContainersByLabel', engine, label, key);
    },
  );

  contextBridge.exposeInMainWorld(
    'startContainersByLabel',
    async (engine: string, label: string, key: string): Promise<void> => {
      return ipcInvoke('container-provider-registry:startContainersByLabel', engine, label, key);
    },
  );

  contextBridge.exposeInMainWorld(
    'stopContainersByLabel',
    async (engine: string, label: string, key: string): Promise<void> => {
      return ipcInvoke('container-provider-registry:stopContainersByLabel', engine, label, key);
    },
  );

  contextBridge.exposeInMainWorld(
    'deleteContainersByLabel',
    async (engine: string, label: string, key: string): Promise<void> => {
      return ipcInvoke('container-provider-registry:deleteContainersByLabel', engine, label, key);
    },
  );

  contextBridge.exposeInMainWorld(
    'createAndStartContainer',
    async (engine: string, options: ContainerCreateOptions): Promise<{ id: string }> => {
      return ipcInvoke('container-provider-registry:createAndStartContainer', engine, options);
    },
  );

  contextBridge.exposeInMainWorld(
    'createVolume',
    async (
      providerContainerConnectionInfo: ProviderContainerConnectionInfo,
      options: VolumeCreateOptions,
    ): Promise<void> => {
      return ipcInvoke('container-provider-registry:createVolume', providerContainerConnectionInfo, options);
    },
  );

  contextBridge.exposeInMainWorld('stopContainer', async (engine: string, containerId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:stopContainer', engine, containerId);
  });
  contextBridge.exposeInMainWorld('deleteContainer', async (engine: string, containerId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:deleteContainer', engine, containerId);
  });

  let onDataCallbacksLogsContainerId = 0;
  const onDataCallbacksLogsContainer = new Map<number, (name: string, data: string) => void>();

  contextBridge.exposeInMainWorld(
    'logsContainer',
    async (engine: string, containerId: string, callback: (name: string, data: string) => void): Promise<void> => {
      onDataCallbacksLogsContainerId++;
      onDataCallbacksLogsContainer.set(onDataCallbacksLogsContainerId, callback);
      return ipcInvoke(
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
  const onDataCallbacksShellInContainer = new Map<
    number,
    { onData: (data: Buffer) => void; onError: (error: string) => void; onEnd: () => void }
  >();
  contextBridge.exposeInMainWorld(
    'shellInContainer',
    async (
      engine: string,
      containerId: string,
      onData: (data: Buffer) => void,
      onError: (error: string) => void,
      onEnd: () => void,
    ): Promise<number> => {
      onDataCallbacksShellInContainerId++;
      onDataCallbacksShellInContainer.set(onDataCallbacksShellInContainerId, { onData, onError, onEnd });
      return ipcInvoke(
        'container-provider-registry:shellInContainer',
        engine,
        containerId,
        onDataCallbacksShellInContainerId,
      );
    },
  );

  contextBridge.exposeInMainWorld('shellInContainerSend', async (dataId: number, content: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:shellInContainerSend', dataId, content);
  });

  ipcRenderer.on(
    'container-provider-registry:shellInContainer-onData',
    (_, onDataCallbacksShellInContainerId: number, data: Buffer) => {
      // grab callback from the map
      const callback = onDataCallbacksShellInContainer.get(onDataCallbacksShellInContainerId);
      if (callback) {
        callback.onData(data);
      }
    },
  );
  ipcRenderer.on(
    'container-provider-registry:shellInContainer-onError',
    (_, onDataCallbacksShellInContainerId: number, error: string) => {
      // grab callback from the map
      const callback = onDataCallbacksShellInContainer.get(onDataCallbacksShellInContainerId);
      if (callback) {
        callback.onError(error);
      }
    },
  );

  ipcRenderer.on(
    'container-provider-registry:shellInContainer-onEnd',
    (_, onDataCallbacksShellInContainerId: number) => {
      // grab callback from the map
      const callback = onDataCallbacksShellInContainer.get(onDataCallbacksShellInContainerId);
      if (callback) {
        callback.onEnd();
        // remove callback from the map
        onDataCallbacksShellInContainer.delete(onDataCallbacksShellInContainerId);
      }
    },
  );

  // callbacks for attachContainer
  let onDataCallbacksAttachContainerId = 0;
  const onDataCallbacksAttachContainer = new Map<
    number,
    { onData: (data: Buffer) => void; onError: (error: string) => void; onEnd: () => void }
  >();
  contextBridge.exposeInMainWorld(
    'attachContainer',
    async (
      engine: string,
      containerId: string,
      onData: (data: Buffer) => void,
      onError: (error: string) => void,
      onEnd: () => void,
    ): Promise<number> => {
      onDataCallbacksAttachContainerId++;
      onDataCallbacksAttachContainer.set(onDataCallbacksAttachContainerId, { onData, onError, onEnd });
      return ipcInvoke(
        'container-provider-registry:attachContainer',
        engine,
        containerId,
        onDataCallbacksAttachContainerId,
      );
    },
  );

  contextBridge.exposeInMainWorld('attachContainerSend', async (dataId: number, content: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:attachContainerSend', dataId, content);
  });

  ipcRenderer.on('container-provider-registry:attachContainer-onData', (_, callbackId: number, data: Buffer) => {
    // grab callback from the map
    const callback = onDataCallbacksAttachContainer.get(callbackId);
    if (callback) {
      callback.onData(data);
    }
  });
  ipcRenderer.on('container-provider-registry:attachContainer-onError', (_, callbackId: number, error: string) => {
    // grab callback from the map
    const callback = onDataCallbacksAttachContainer.get(callbackId);
    if (callback) {
      callback.onError(error);
    }
  });

  ipcRenderer.on('container-provider-registry:attachContainer-onEnd', (_, callbackId: number) => {
    // grab callback from the map
    const callback = onDataCallbacksAttachContainer.get(callbackId);
    if (callback) {
      callback.onEnd();
      // remove callback from the map
      onDataCallbacksAttachContainer.delete(callbackId);
    }
  });

  contextBridge.exposeInMainWorld(
    'getContainerInspect',
    async (engine: string, containerId: string): Promise<ContainerInspectInfo> => {
      return ipcInvoke('container-provider-registry:getContainerInspect', engine, containerId);
    },
  );

  contextBridge.exposeInMainWorld('getPodInspect', async (engine: string, podId: string): Promise<PodInspectInfo> => {
    return ipcInvoke('container-provider-registry:getPodInspect', engine, podId);
  });

  let onDataCallbacksGetContainerStatsId = 0;
  const onDataCallbacksGetContainerStats = new Map<number, (containerStats: ContainerStatsInfo) => void>();
  contextBridge.exposeInMainWorld(
    'getContainerStats',
    async (
      engineId: string,
      containerId: string,
      callback: (containerStats: ContainerStatsInfo) => void,
    ): Promise<number> => {
      onDataCallbacksGetContainerStatsId++;
      onDataCallbacksGetContainerStats.set(onDataCallbacksGetContainerStatsId, callback);
      return ipcInvoke(
        'container-provider-registry:getContainerStats',
        engineId,
        containerId,
        onDataCallbacksGetContainerStatsId,
      );
    },
  );
  ipcRenderer.on(
    'container-provider-registry:getContainerStats-onData',
    (_, onDataCallbacksGetContainerStatsId: number, containerStats: ContainerStatsInfo) => {
      // grab callback from the map
      const callback = onDataCallbacksGetContainerStats.get(onDataCallbacksGetContainerStatsId);
      if (callback) {
        callback(containerStats);
      }
    },
  );
  contextBridge.exposeInMainWorld('stopContainerStats', async (containerStatsId: number): Promise<void> => {
    return ipcInvoke('container-provider-registry:stopContainerStats', containerStatsId);
  });

  contextBridge.exposeInMainWorld(
    'getImageInspect',
    async (engine: string, imageId: string): Promise<ImageInspectInfo> => {
      return ipcInvoke('container-provider-registry:getImageInspect', engine, imageId);
    },
  );

  contextBridge.exposeInMainWorld(
    'getImageHistory',
    async (engine: string, imageId: string): Promise<HistoryInfo[]> => {
      return ipcInvoke('container-provider-registry:getImageHistory', engine, imageId);
    },
  );

  contextBridge.exposeInMainWorld('deleteImage', async (engine: string, imageId: string): Promise<void> => {
    return ipcInvoke('container-provider-registry:deleteImage', engine, imageId);
  });

  contextBridge.exposeInMainWorld(
    'tagImage',
    async (engine: string, imageId: string, repo: string, tag?: string): Promise<void> => {
      return ipcInvoke('container-provider-registry:tagImage', engine, imageId, repo, tag);
    },
  );

  contextBridge.exposeInMainWorld('startProviderLifecycle', async (providerId: string): Promise<void> => {
    return ipcInvoke('provider-registry:startProviderLifecycle', providerId);
  });

  contextBridge.exposeInMainWorld('stopProviderLifecycle', async (providerId: string): Promise<void> => {
    return ipcInvoke('provider-registry:stopProviderLifecycle', providerId);
  });

  contextBridge.exposeInMainWorld(
    'updateProxySettings',
    async (proxySettings: containerDesktopAPI.ProxySettings): Promise<void> => {
      return ipcInvoke('proxy:updateSettings', proxySettings);
    },
  );

  contextBridge.exposeInMainWorld('getProxySettings', async (): Promise<containerDesktopAPI.ProxySettings> => {
    return ipcInvoke('proxy:getSettings');
  });

  contextBridge.exposeInMainWorld('isProxyEnabled', async (): Promise<boolean> => {
    return ipcInvoke('proxy:isEnabled');
  });
  contextBridge.exposeInMainWorld('setProxyState', async (state: boolean): Promise<void> => {
    return ipcInvoke('proxy:setState', state);
  });

  contextBridge.exposeInMainWorld(
    'getProviderDetectionChecks',
    async (providerId: string): Promise<containerDesktopAPI.ProviderDetectionCheck[]> => {
      return ipcInvoke('provider-registry:getProviderDetectionChecks', providerId);
    },
  );

  contextBridge.exposeInMainWorld(
    'installProvider',
    async (providerId: string): Promise<containerDesktopAPI.ProviderDetectionCheck[]> => {
      return ipcInvoke('provider-registry:installProvider', providerId);
    },
  );

  const preflightChecksCallbacks = new Map<number, PreflightChecksCallback>();
  let checkCallbackId = 0;
  contextBridge.exposeInMainWorld(
    'runInstallPreflightChecks',
    async (providerId: string, callBack: PreflightChecksCallback) => {
      checkCallbackId++;
      preflightChecksCallbacks.set(checkCallbackId, callBack);
      return await ipcInvoke('provider-registry:runInstallPreflightChecks', providerId, checkCallbackId);
    },
  );

  ipcRenderer.on('provider-registry:installPreflightChecksUpdate', (_, callbackId, data: PreflightCheckEvent) => {
    const callback = preflightChecksCallbacks.get(callbackId);
    if (callback) {
      switch (data.type) {
        case 'start':
          callback.startCheck(data.status);
          break;
        case 'stop':
          callback.endCheck(data.status);
          break;
      }
    }
  });

  contextBridge.exposeInMainWorld(
    'runUpdatePreflightChecks',
    async (providerId: string, callBack: PreflightChecksCallback) => {
      checkCallbackId++;
      preflightChecksCallbacks.set(checkCallbackId, callBack);
      return await ipcInvoke('provider-registry:runUpdatePreflightChecks', providerId, checkCallbackId);
    },
  );

  ipcRenderer.on('provider-registry:updatePreflightChecksUpdate', (_, callbackId, data: PreflightCheckEvent) => {
    const callback = preflightChecksCallbacks.get(callbackId);
    if (callback) {
      switch (data.type) {
        case 'start':
          callback.startCheck(data.status);
          break;
        case 'stop':
          callback.endCheck(data.status);
          break;
      }
    }
  });

  contextBridge.exposeInMainWorld(
    'updateProvider',
    async (providerId: string): Promise<containerDesktopAPI.ProviderDetectionCheck[]> => {
      return ipcInvoke('provider-registry:updateProvider', providerId);
    },
  );

  contextBridge.exposeInMainWorld(
    'initializeProvider',
    async (providerId: string): Promise<containerDesktopAPI.ProviderDetectionCheck[]> => {
      return ipcInvoke('provider-registry:initializeProvider', providerId);
    },
  );

  contextBridge.exposeInMainWorld(
    'startProvider',
    async (providerId: string): Promise<containerDesktopAPI.ProviderDetectionCheck[]> => {
      return ipcInvoke('provider-registry:startProvider', providerId);
    },
  );

  let onDataCallbacksTaskConnectionId = 0;

  const onDataCallbacksTaskConnectionLogs = new Map<
    number,
    (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void
  >();
  const onDataCallbacksTaskConnectionKeys = new Map<number, symbol>();

  contextBridge.exposeInMainWorld(
    'createContainerProviderConnection',
    async (
      internalProviderId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: { [key: string]: any },
      key: symbol,
      keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
      tokenId?: number,
    ): Promise<void> => {
      onDataCallbacksTaskConnectionId++;
      onDataCallbacksTaskConnectionKeys.set(onDataCallbacksTaskConnectionId, key);
      onDataCallbacksTaskConnectionLogs.set(onDataCallbacksTaskConnectionId, keyLogger);
      return ipcInvoke(
        'provider-registry:createContainerProviderConnection',
        internalProviderId,
        params,
        onDataCallbacksTaskConnectionId,
        tokenId,
      );
    },
  );

  contextBridge.exposeInMainWorld(
    'auditConnectionParameters',
    async (
      internalProviderId: string,
      params: containerDesktopAPI.AuditRequestItems,
    ): Promise<containerDesktopAPI.AuditResult> => {
      return ipcInvoke('provider-registry:auditConnectionParameters', internalProviderId, params);
    },
  );

  contextBridge.exposeInMainWorld(
    'createKubernetesProviderConnection',
    async (
      internalProviderId: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      params: { [key: string]: any },
      key: symbol,
      keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
      tokenId?: number,
    ): Promise<void> => {
      onDataCallbacksTaskConnectionId++;
      onDataCallbacksTaskConnectionKeys.set(onDataCallbacksTaskConnectionId, key);
      onDataCallbacksTaskConnectionLogs.set(onDataCallbacksTaskConnectionId, keyLogger);
      return ipcInvoke(
        'provider-registry:createKubernetesProviderConnection',
        internalProviderId,
        params,
        onDataCallbacksTaskConnectionId,
        tokenId,
      );
    },
  );

  ipcRenderer.on(
    'provider-registry:taskConnection-onData',
    (_, onDataCallbacksTaskConnectionId: number, channel: string, data: string[]) => {
      // grab callback from the map
      const callback = onDataCallbacksTaskConnectionLogs.get(onDataCallbacksTaskConnectionId);
      const key = onDataCallbacksTaskConnectionKeys.get(onDataCallbacksTaskConnectionId);
      if (callback && key) {
        if (channel === 'log') {
          callback(key, 'log', data);
        } else if (channel === 'warn') {
          callback(key, 'warn', data);
        } else if (channel === 'error') {
          callback(key, 'error', data);
        } else if (channel === 'finish') {
          callback(key, 'finish', data);
        }
      }
    },
  );

  contextBridge.exposeInMainWorld(
    'startProviderConnectionLifecycle',
    async (
      providerId: string,
      providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      key: symbol,
      keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
    ): Promise<void> => {
      onDataCallbacksTaskConnectionId++;
      onDataCallbacksTaskConnectionKeys.set(onDataCallbacksTaskConnectionId, key);
      onDataCallbacksTaskConnectionLogs.set(onDataCallbacksTaskConnectionId, keyLogger);
      return ipcInvoke(
        'provider-registry:startProviderConnectionLifecycle',
        providerId,
        providerConnectionInfo,
        onDataCallbacksTaskConnectionId,
      );
    },
  );

  contextBridge.exposeInMainWorld(
    'stopProviderConnectionLifecycle',
    async (
      providerId: string,
      providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      key: symbol,
      keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
    ): Promise<void> => {
      onDataCallbacksTaskConnectionId++;
      onDataCallbacksTaskConnectionKeys.set(onDataCallbacksTaskConnectionId, key);
      onDataCallbacksTaskConnectionLogs.set(onDataCallbacksTaskConnectionId, keyLogger);
      return ipcInvoke(
        'provider-registry:stopProviderConnectionLifecycle',
        providerId,
        providerConnectionInfo,
        onDataCallbacksTaskConnectionId,
      );
    },
  );

  contextBridge.exposeInMainWorld(
    'deleteProviderConnectionLifecycle',
    async (
      providerId: string,
      providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
      key: symbol,
      keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
    ): Promise<void> => {
      onDataCallbacksTaskConnectionId++;
      onDataCallbacksTaskConnectionKeys.set(onDataCallbacksTaskConnectionId, key);
      onDataCallbacksTaskConnectionLogs.set(onDataCallbacksTaskConnectionId, keyLogger);
      return ipcInvoke(
        'provider-registry:deleteProviderConnectionLifecycle',
        providerId,
        providerConnectionInfo,
        onDataCallbacksTaskConnectionId,
      );
    },
  );

  let onDataCallbacksBuildImageId = 0;
  const onDataCallbacksBuildImage = new Map<
    number,
    (key: symbol, eventName: 'finish' | 'stream' | 'error', data: string) => void
  >();
  const onDataCallbacksBuildImageKeys = new Map<number, symbol>();

  contextBridge.exposeInMainWorld(
    'buildImage',
    async (
      containerBuildContextDirectory: string,
      relativeContainerfilePath: string,
      imageName: string,
      selectedProvider: ProviderContainerConnectionInfo,
      key: symbol,
      eventCollect: (key: symbol, eventName: 'finish' | 'stream' | 'error', data: string) => void,
    ): Promise<unknown> => {
      onDataCallbacksBuildImageId++;
      onDataCallbacksBuildImage.set(onDataCallbacksBuildImageId, eventCollect);
      onDataCallbacksBuildImageKeys.set(onDataCallbacksBuildImageId, key);
      return ipcInvoke(
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
    (_, onDataCallbacksBuildImageId: number, eventName: 'finish' | 'stream' | 'error', data: string) => {
      // grab callback from the map
      const callback = onDataCallbacksBuildImage.get(onDataCallbacksBuildImageId);
      const key = onDataCallbacksBuildImageKeys.get(onDataCallbacksBuildImageId);
      if (key && callback) {
        callback(key, eventName, data);
      }
    },
  );

  contextBridge.exposeInMainWorld('getStatusBarEntries', async (): Promise<StatusBarEntryDescriptor[]> => {
    return ipcInvoke('status-bar:getStatusBarEntries');
  });

  contextBridge.exposeInMainWorld(
    'executeStatusBarEntryCommand',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (command: string, args: any[]): Promise<void> => {
      return ipcInvoke('status-bar:executeStatusBarEntryCommand', command, args);
    },
  );

  contextBridge.exposeInMainWorld('getProviderInfos', async (): Promise<ProviderInfo[]> => {
    return ipcInvoke('provider-registry:getProviderInfos');
  });

  contextBridge.exposeInMainWorld('getContributedMenus', async (context: string): Promise<Menu[]> => {
    return ipcInvoke('menu-registry:getContributedMenus', context);
  });

  contextBridge.exposeInMainWorld('executeCommand', async (command: string, ...args: unknown[]): Promise<unknown> => {
    return ipcInvoke('command-registry:executeCommand', command, ...args);
  });

  contextBridge.exposeInMainWorld(
    'clipboardWriteText',
    async (text: string, type?: 'selection' | 'clipboard'): Promise<void> => {
      return ipcInvoke('clipboard:writeText', text, type);
    },
  );

  let onDidUpdateProviderStatusId = 0;
  const onDidUpdateProviderStatuses = new Map<number, (providerInfo: ProviderInfo) => void>();

  contextBridge.exposeInMainWorld(
    'onDidUpdateProviderStatus',
    async (providerInternalId: string, onDidUpdateProviderStatusCallback: (providerInfo: ProviderInfo) => void) => {
      // generate id
      onDidUpdateProviderStatusId++;

      onDidUpdateProviderStatuses.set(onDidUpdateProviderStatusId, onDidUpdateProviderStatusCallback);
      return ipcInvoke('provider-registry:onDidUpdateProviderStatus', providerInternalId, onDidUpdateProviderStatusId);
    },
  );
  ipcRenderer.on(
    'provider-registry:onDidUpdateProviderStatus-onData',
    (_, onDidUpdateProviderStatusCallbackId: number, providerInfo: ProviderInfo) => {
      // grab callback from the map
      const callback = onDidUpdateProviderStatuses.get(onDidUpdateProviderStatusCallbackId);
      if (callback) {
        callback(providerInfo);
      }
    },
  );

  contextBridge.exposeInMainWorld('getImageRegistries', async (): Promise<readonly containerDesktopAPI.Registry[]> => {
    return ipcInvoke('image-registry:getRegistries');
  });
  contextBridge.exposeInMainWorld(
    'getImageSuggestedRegistries',
    async (): Promise<containerDesktopAPI.RegistrySuggestedProvider[]> => {
      return ipcInvoke('image-registry:getSuggestedRegistries');
    },
  );
  contextBridge.exposeInMainWorld('getImageRegistryProviderNames', async (): Promise<string[]> => {
    return ipcInvoke('image-registry:getProviderNames');
  });

  contextBridge.exposeInMainWorld('hasAuthconfigForImage', async (imageName: string): Promise<boolean> => {
    return ipcInvoke('image-registry:hasAuthconfigForImage', imageName);
  });

  contextBridge.exposeInMainWorld(
    'createImageRegistry',
    async (providerName: string, registryCreateOptions: containerDesktopAPI.RegistryCreateOptions): Promise<void> => {
      return ipcInvoke('image-registry:createRegistry', providerName, registryCreateOptions);
    },
  );

  contextBridge.exposeInMainWorld(
    'checkImageCredentials',
    async (registryCreateOptions: containerDesktopAPI.RegistryCreateOptions): Promise<void> => {
      return ipcInvoke('image-registry:checkCredentials', registryCreateOptions);
    },
  );

  contextBridge.exposeInMainWorld(
    'updateImageRegistry',
    async (registry: containerDesktopAPI.Registry): Promise<void> => {
      return ipcInvoke('image-registry:updateRegistry', registry);
    },
  );

  contextBridge.exposeInMainWorld(
    'unregisterImageRegistry',
    async (registry: containerDesktopAPI.Registry): Promise<void> => {
      return ipcInvoke('image-registry:unregisterRegistry', registry);
    },
  );

  contextBridge.exposeInMainWorld(
    'getAuthenticationProvidersInfo',
    async (): Promise<readonly AuthenticationProviderInfo[]> => {
      return ipcInvoke('authentication-provider-registry:getAuthenticationProvidersInfo');
    },
  );

  contextBridge.exposeInMainWorld(
    'requestAuthenticationProviderSignOut',
    async (providerId: string, sessionId: string): Promise<void> => {
      return ipcInvoke('authentication-provider-registry:requestAuthenticationProviderSignOut', providerId, sessionId);
    },
  );

  contextBridge.exposeInMainWorld('requestAuthenticationProviderSignIn', async (requestId: string): Promise<void> => {
    return ipcInvoke('authentication-provider-registry:requestAuthenticationProviderSignIn', requestId);
  });

  contextBridge.exposeInMainWorld(
    'getConfigurationProperties',
    async (): Promise<Record<string, IConfigurationPropertyRecordedSchema>> => {
      return ipcInvoke('configuration-registry:getConfigurationProperties');
    },
  );

  // can't send configuration object as it is not serializable
  // https://www.electronjs.org/docs/latest/api/context-bridge#parameter--error--return-type-support
  contextBridge.exposeInMainWorld(
    'getConfigurationValue',
    <T>(key: string, scope?: containerDesktopAPI.ConfigurationScope): Promise<T | undefined> => {
      return ipcInvoke('configuration-registry:getConfigurationValue', key, scope);
    },
  );

  contextBridge.exposeInMainWorld(
    'updateConfigurationValue',
    async (
      key: string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      value: any,
      scope?: containerDesktopAPI.ConfigurationScope | containerDesktopAPI.ConfigurationScope[],
    ): Promise<void> => {
      return ipcInvoke('configuration-registry:updateConfigurationValue', key, value, scope);
    },
  );

  contextBridge.exposeInMainWorld('getFeaturedExtensions', async (): Promise<FeaturedExtension[]> => {
    return ipcInvoke('featured:getFeaturedExtensions');
  });
  contextBridge.exposeInMainWorld('getCatalogExtensions', async (): Promise<CatalogExtension[]> => {
    return ipcInvoke('catalog:getExtensions');
  });

  contextBridge.exposeInMainWorld('listExtensions', async (): Promise<ExtensionInfo[]> => {
    return ipcInvoke('extension-loader:listExtensions');
  });

  contextBridge.exposeInMainWorld('stopExtension', async (extensionId: string): Promise<void> => {
    return ipcInvoke('extension-loader:deactivateExtension', extensionId);
  });

  contextBridge.exposeInMainWorld('startExtension', async (extensionId: string): Promise<void> => {
    return ipcInvoke('extension-loader:startExtension', extensionId);
  });

  contextBridge.exposeInMainWorld('updateExtension', async (extensionId: string, ociUri: string): Promise<void> => {
    return ipcInvoke('extension-updater:updateExtension', extensionId, ociUri);
  });

  contextBridge.exposeInMainWorld('removeExtension', async (extensionId: string): Promise<void> => {
    return ipcInvoke('extension-loader:removeExtension', extensionId);
  });

  contextBridge.exposeInMainWorld('openExternal', async (link: string): Promise<void> => {
    return ipcInvoke('shell:openExternal', link);
  });

  contextBridge.exposeInMainWorld('listContributions', async (): Promise<ContributionInfo[]> => {
    return ipcInvoke('contributions:listContributions');
  });

  contextBridge.exposeInMainWorld('listIcons', async (): Promise<IconInfo[]> => {
    return ipcInvoke('iconRegistry:listIcons');
  });

  // Handle callback to open devtools for extensions
  // by delegating to the renderer process
  ipcRenderer.on('dev-tools:open-extension', (_, extensionId: string) => {
    apiSender.send('dev-tools:open-extension', extensionId);
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

  contextBridge.exposeInMainWorld(
    'openFileDialog',
    async (message: string, filter?: { extensions: string[]; name: string }) => {
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
        filter,
      });

      // wait for response
      return defer.promise;
    },
  );

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
    return ipcInvoke('system:get-free-port', port);
  });

  contextBridge.exposeInMainWorld('getFreePortRange', async (rangeSize: number): Promise<string> => {
    return ipcInvoke('system:get-free-port-range', rangeSize);
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
      connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
    ): Promise<void> => {
      onDataCallbacksStartReceiveLogsId++;
      const logger: containerDesktopAPI.Logger = {
        log,
        warn,
        error,
      };
      onDataCallbacksStartReceiveLogs.set(onDataCallbacksStartReceiveLogsId, logger);
      return ipcInvoke(
        'provider-registry:startReceiveLogs',
        providerId,
        onDataCallbacksStartReceiveLogsId,
        connectionInfo,
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
          callback.warn(data);
        } else if (channel === 'error') {
          callback.error(data);
        }
      }
    },
  );

  contextBridge.exposeInMainWorld(
    'stopReceiveLogs',
    async (
      providerId: string,
      connectionInfo?: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
    ): Promise<void> => {
      return ipcInvoke('provider-registry:stopReceiveLogs', providerId, connectionInfo);
    },
  );

  contextBridge.exposeInMainWorld(
    'sendShowInputBoxValue',
    async (inputBoxId: number, value: string | undefined, error: string | undefined): Promise<void> => {
      return ipcInvoke('showInputBox:value', inputBoxId, value, error);
    },
  );

  contextBridge.exposeInMainWorld(
    'sendShowQuickPickValues',
    async (quickPickId: number, selectedIndexes: number[]): Promise<void> => {
      return ipcInvoke('showQuickPick:values', quickPickId, selectedIndexes);
    },
  );

  contextBridge.exposeInMainWorld(
    'sendShowInputBoxValidate',
    async (
      inputBoxId: number,
      value: string,
    ): Promise<string | containerDesktopAPI.InputBoxValidationMessage | undefined | null> => {
      return ipcInvoke('showInputBox:validate', inputBoxId, value);
    },
  );

  contextBridge.exposeInMainWorld(
    'sendShowQuickPickOnSelect',
    async (inputBoxId: number, selectedIndex: number): Promise<void> => {
      return ipcInvoke('showQuickPick:onSelect', inputBoxId, selectedIndex);
    },
  );

  contextBridge.exposeInMainWorld(
    'showMessageBox',
    async (messageBoxOptions: MessageBoxOptions): Promise<MessageBoxReturnValue> => {
      return ipcInvoke('showMessageBox', messageBoxOptions);
    },
  );
  contextBridge.exposeInMainWorld(
    'sendShowMessageBoxOnSelect',
    async (messageBoxId: number, selectedIndex: number | undefined): Promise<void> => {
      return ipcInvoke('showMessageBox:onSelect', messageBoxId, selectedIndex);
    },
  );

  contextBridge.exposeInMainWorld(
    'sendCustomPickItemsOnConfirmation',
    async (customPickId: number, selectedIndexes: number[]): Promise<void> => {
      return ipcInvoke('customPick:values', customPickId, selectedIndexes);
    },
  );

  contextBridge.exposeInMainWorld('closeCustomPick', async (customPickId: number): Promise<void> => {
    return ipcInvoke('customPick:close', customPickId);
  });

  let onDataCallbacksShellInContainerDDExtensionInstallId = 0;
  const onDataCallbacksShellInContainerDDExtension = new Map<number, (data: string) => void>();
  const onDataCallbacksShellInContainerDDExtensionError = new Map<number, (data: string) => void>();
  const onDataCallbacksShellInContainerDDExtensionResolve = new Map<
    number,
    (value: void | PromiseLike<void>) => void
  >();

  contextBridge.exposeInMainWorld(
    'ddExtensionInstall',
    async (
      imageName: string,
      logCallback: (data: string) => void,
      errorCallback: (data: string) => void,
    ): Promise<void> => {
      onDataCallbacksShellInContainerDDExtensionInstallId++;
      onDataCallbacksShellInContainerDDExtension.set(onDataCallbacksShellInContainerDDExtensionInstallId, logCallback);
      onDataCallbacksShellInContainerDDExtensionError.set(
        onDataCallbacksShellInContainerDDExtensionInstallId,
        errorCallback,
      );
      ipcRenderer.send('docker-desktop-plugin:install', imageName, onDataCallbacksShellInContainerDDExtensionInstallId);

      return new Promise(resolve => {
        onDataCallbacksShellInContainerDDExtensionResolve.set(
          onDataCallbacksShellInContainerDDExtensionInstallId,
          resolve,
        );
      });
    },
  );

  ipcRenderer.on('docker-desktop-plugin:install-log', (_, callbackId: number, data: string) => {
    const callback = onDataCallbacksShellInContainerDDExtension.get(callbackId);
    if (callback) {
      callback(data);
    }
  });

  ipcRenderer.on('docker-desktop-plugin:install-error', (_, callbackId: number, data: string) => {
    const callback = onDataCallbacksShellInContainerDDExtensionError.get(callbackId);
    if (callback) {
      callback(data);
    }
  });

  ipcRenderer.on('docker-desktop-plugin:install-end', (_, callbackId: number) => {
    const resolveCallback = onDataCallbacksShellInContainerDDExtensionResolve.get(callbackId);
    if (resolveCallback) {
      resolveCallback();
    }
  });

  contextBridge.exposeInMainWorld('ddExtensionDelete', async (extensionName: string): Promise<void> => {
    return ipcInvoke('docker-desktop-plugin:delete', extensionName);
  });

  contextBridge.exposeInMainWorld('getDDPreloadPath', async (): Promise<string> => {
    return ipcRenderer.invoke('docker-desktop-plugin:get-preload-script');
  });

  contextBridge.exposeInMainWorld('kubernetesListNamespaces', async (): Promise<V1NamespaceList> => {
    return ipcInvoke('kubernetes-client:listNamespaces');
  });

  contextBridge.exposeInMainWorld('kubernetesGetCurrentContextName', async (): Promise<string | undefined> => {
    return ipcInvoke('kubernetes-client:getCurrentContextName');
  });

  contextBridge.exposeInMainWorld('kubernetesGetCurrentNamespace', async (): Promise<string | undefined> => {
    return ipcInvoke('kubernetes-client:getCurrentNamespace');
  });

  contextBridge.exposeInMainWorld(
    'kubernetesListNamespacedPod',
    async (namespace: string, fieldSelector?: string, labelSelector?: string): Promise<V1PodList> => {
      return ipcInvoke('kubernetes-client:listNamespacedPod', namespace, fieldSelector, labelSelector);
    },
  );

  contextBridge.exposeInMainWorld(
    'kubernetesReadNamespacedPod',
    async (name: string, namespace: string): Promise<V1Pod | undefined> => {
      return ipcInvoke('kubernetes-client:readNamespacedPod', name, namespace);
    },
  );

  contextBridge.exposeInMainWorld(
    'kubernetesReadNamespacedConfigMap',
    async (name: string, namespace: string): Promise<V1ConfigMap | undefined> => {
      return ipcInvoke('kubernetes-client:readNamespacedConfigMap', name, namespace);
    },
  );

  contextBridge.exposeInMainWorld('kubernetesIsAPIGroupSupported', async (group: string): Promise<boolean> => {
    return ipcInvoke('kubernetes-client:isAPIGroupSupported', group);
  });

  contextBridge.exposeInMainWorld('kubernetesCreatePod', async (namespace: string, pod: V1Pod): Promise<V1Pod> => {
    return ipcInvoke('kubernetes-client:createPod', namespace, pod);
  });

  contextBridge.exposeInMainWorld(
    'kubernetesCreateService',
    async (namespace: string, service: V1Service): Promise<V1Service> => {
      return ipcInvoke('kubernetes-client:createService', namespace, service);
    },
  );

  contextBridge.exposeInMainWorld(
    'kubernetesCreateIngress',
    async (namespace: string, ingress: V1Ingress): Promise<V1Ingress> => {
      return ipcInvoke('kubernetes-client:createIngress', namespace, ingress);
    },
  );

  contextBridge.exposeInMainWorld('kubernetesListPods', async (): Promise<PodInfo[]> => {
    return ipcInvoke('kubernetes-client:listPods');
  });

  let onDataCallbacksKubernetesPodLogId = 0;
  const onDataCallbacksKubernetesPodLog = new Map<number, (name: string, data: string) => void>();
  contextBridge.exposeInMainWorld(
    'kubernetesReadPodLog',
    async (name: string, container: string, callback: (name: string, data: string) => void): Promise<void> => {
      onDataCallbacksKubernetesPodLog.set(onDataCallbacksKubernetesPodLogId, callback);
      return ipcInvoke('kubernetes-client:readPodLog', name, container, onDataCallbacksKubernetesPodLogId++);
    },
  );
  ipcRenderer.on(
    'kubernetes-client:readPodLog-onData',
    (_, onDataCallbacksKubernetesReadPodLogId: number, name: string, data: string) => {
      // grab callback from the map
      const callback = onDataCallbacksKubernetesPodLog.get(onDataCallbacksKubernetesReadPodLogId);
      if (callback) {
        callback(name, data);
      }
    },
  );

  contextBridge.exposeInMainWorld('kubernetesDeletePod', async (name: string): Promise<void> => {
    return ipcInvoke('kubernetes-client:deletePod', name);
  });

  contextBridge.exposeInMainWorld(
    'kubernetesCreateResourcesFromFile',
    async (context: string, file: string, namespace: string): Promise<void> => {
      return ipcInvoke('kubernetes-client:createResourcesFromFile', context, file, namespace);
    },
  );

  contextBridge.exposeInMainWorld(
    'openshiftCreateRoute',
    async (namespace: string, route: V1Route): Promise<V1Route> => {
      return ipcInvoke('openshift-client:createRoute', namespace, route);
    },
  );

  contextBridge.exposeInMainWorld('pruneContainers', async (engine: string): Promise<string> => {
    return ipcInvoke('container-provider-registry:pruneContainers', engine);
  });

  contextBridge.exposeInMainWorld('prunePods', async (engine: string): Promise<string> => {
    return ipcInvoke('container-provider-registry:prunePods', engine);
  });

  contextBridge.exposeInMainWorld('pruneVolumes', async (engine: string): Promise<string> => {
    return ipcInvoke('container-provider-registry:pruneVolumes', engine);
  });

  contextBridge.exposeInMainWorld('pruneImages', async (engine: string): Promise<string> => {
    return ipcInvoke('container-provider-registry:pruneImages', engine);
  });

  contextBridge.exposeInMainWorld('getOsPlatform', async (): Promise<string> => {
    return ipcInvoke('os:getPlatform');
  });

  contextBridge.exposeInMainWorld('getOsArch', async (): Promise<string> => {
    return ipcInvoke('os:getArch');
  });

  contextBridge.exposeInMainWorld('getOsHostname', async (): Promise<string> => {
    return ipcInvoke('os:getHostname');
  });

  contextBridge.exposeInMainWorld('getCancellableTokenSource', async (): Promise<number> => {
    return ipcInvoke('cancellableTokenSource:create');
  });

  contextBridge.exposeInMainWorld('cancelToken', async (id: number): Promise<void> => {
    return ipcInvoke('cancellableToken:cancel', id);
  });

  contextBridge.exposeInMainWorld('getOsFreeDiskSize', async (): Promise<string> => {
    return ipcInvoke('os:getHostFreeDiskSize');
  });

  contextBridge.exposeInMainWorld('getOsMemory', async (): Promise<string> => {
    return ipcInvoke('os:getHostMemory');
  });

  contextBridge.exposeInMainWorld('getOsCpu', async (): Promise<string> => {
    return ipcInvoke('os:getHostCpu');
  });

  contextBridge.exposeInMainWorld('sendFeedback', async (feedback: FeedbackProperties): Promise<void> => {
    return ipcInvoke('feedback:send', feedback);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  contextBridge.exposeInMainWorld('telemetryTrack', async (event: string, eventProperties?: any): Promise<void> => {
    return ipcInvoke('telemetry:track', event, eventProperties);
  });

  contextBridge.exposeInMainWorld('telemetryPage', async (name: string): Promise<void> => {
    return ipcInvoke('telemetry:page', name);
  });

  contextBridge.exposeInMainWorld('telemetryConfigure', async (): Promise<void> => {
    return ipcInvoke('telemetry:configure');
  });

  let onDataCallbacksShellInContainerExtensionInstallId = 0;
  const onDataCallbacksShellInContainerExtension = new Map<number, (data: string) => void>();
  const onDataCallbacksShellInContainerExtensionError = new Map<number, (data: string) => void>();
  const onDataCallbacksShellInContainerExtensionResolve = new Map<number, (value: void | PromiseLike<void>) => void>();

  contextBridge.exposeInMainWorld(
    'extensionInstallFromImage',
    async (
      imageName: string,
      logCallback: (data: string) => void,
      errorCallback: (data: string) => void,
    ): Promise<void> => {
      onDataCallbacksShellInContainerExtensionInstallId++;
      onDataCallbacksShellInContainerExtension.set(onDataCallbacksShellInContainerExtensionInstallId, logCallback);
      onDataCallbacksShellInContainerExtensionError.set(
        onDataCallbacksShellInContainerExtensionInstallId,
        errorCallback,
      );
      ipcRenderer.send(
        'extension-installer:install-from-image',
        imageName,
        onDataCallbacksShellInContainerExtensionInstallId,
      );

      return new Promise(resolve => {
        onDataCallbacksShellInContainerExtensionResolve.set(onDataCallbacksShellInContainerExtensionInstallId, resolve);
      });
    },
  );

  ipcRenderer.on('extension-installer:install-from-image-log', (_, callbackId: number, data: string) => {
    const callback = onDataCallbacksShellInContainerExtension.get(callbackId);
    if (callback) {
      callback(data);
    }
  });

  ipcRenderer.on('extension-installer:install-from-image-error', (_, callbackId: number, data: string) => {
    const callback = onDataCallbacksShellInContainerExtensionError.get(callbackId);
    if (callback) {
      callback(data);
    }
  });

  ipcRenderer.on('extension-installer:install-from-image-end', (_, callbackId: number) => {
    const resolveCallback = onDataCallbacksShellInContainerExtensionResolve.get(callbackId);
    if (resolveCallback) {
      resolveCallback();
    }
  });

  contextBridge.exposeInMainWorld('getPodmanDesktopVersion', async (): Promise<string> => {
    return ipcInvoke('app:getVersion');
  });

  contextBridge.exposeInMainWorld('listViewsContributions', async (): Promise<ViewInfoUI[]> => {
    return ipcInvoke('viewRegistry:listViewsContributions');
  });

  contextBridge.exposeInMainWorld(
    'fetchExtensionViewsContributions',
    async (extensionId: string): Promise<ViewInfoUI[]> => {
      return ipcInvoke('viewRegistry:fetchViewsContributions', extensionId);
    },
  );

  contextBridge.exposeInMainWorld('listContexts', async (): Promise<ContextInfo[]> => {
    return ipcInvoke('contextRegistry:listContexts');
  });

  contextBridge.exposeInMainWorld('getContext', async (extensionId: string): Promise<ContextInfo> => {
    return ipcInvoke('contextRegistry:getContext', extensionId);
  });

  contextBridge.exposeInMainWorld('windowMinimize', async (): Promise<void> => {
    return ipcInvoke('window:minimize');
  });
  contextBridge.exposeInMainWorld('windowMaximize', async (): Promise<void> => {
    return ipcInvoke('window:maximize');
  });
  contextBridge.exposeInMainWorld('windowClose', async (): Promise<void> => {
    return ipcInvoke('window:close');
  });

  contextBridge.exposeInMainWorld('listOnboarding', async (): Promise<OnboardingInfo[]> => {
    return ipcInvoke('onboardingRegistry:listOnboarding');
  });

  contextBridge.exposeInMainWorld('getOnboarding', async (extension: string): Promise<OnboardingInfo | undefined> => {
    return ipcInvoke('onboardingRegistry:getOnboarding', extension);
  });

  contextBridge.exposeInMainWorld(
    'updateStepState',
    async (status: OnboardingStatus, extension: string, stepId?: string): Promise<void> => {
      return ipcInvoke('onboardingRegistry:updateStepState', status, extension, stepId);
    },
  );

  contextBridge.exposeInMainWorld('resetOnboarding', async (extensions: string[]): Promise<void> => {
    return ipcInvoke('onboardingRegistry:resetOnboarding', extensions);
  });
}

// expose methods
initExposure();
