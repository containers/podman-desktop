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

/* eslint-disable @typescript-eslint/no-explicit-any */
import type { v1 as dockerDesktopAPI } from '@docker/extension-api-client-types';
import type { ExecStreamOptions, NavigationIntents, RequestConfig } from '@docker/extension-api-client-types/dist/v1';
import type { Dialog, OpenDialogResult } from '@docker/extension-api-client-types/dist/v1/dialog';
import { contextBridge, ipcRenderer } from 'electron';

import type { SimpleContainerInfo } from '/@api/container-info';
import type { ImageInfo } from '/@api/image-info';

import { lines, parseJsonLines, parseJsonObject } from './exec-result-helper';

interface ErrorMessage {
  name: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  extra: any;
}
function decodeError(error: ErrorMessage): Error {
  const e = new Error(error.message);
  e.name = error.name;
  Object.assign(e, error.extra);
  return e;
}

async function ipcInvoke(channel: string, ...args: any): Promise<any> {
  const { error, result } = await ipcRenderer.invoke(channel, ...args);
  if (error) {
    throw decodeError(error);
  }
  return result;
}

export class DockerExtensionPreload {
  private onDockerPluginExecWithOptionsCallbacksId = 0;
  private onDockerPluginExecWithOptionsCallbacks = new Map<number, ExecStreamOptions>();

  listImages(options?: any): Promise<ImageInfo[]> {
    return ipcInvoke('container-provider-registry:listImages', options);
  }

  listContainers(options?: any): Promise<SimpleContainerInfo[]> {
    return ipcInvoke('container-provider-registry:listSimpleContainers', options);
  }

  async exec(
    extensionName: string,
    launcher: string | undefined,
    cmd: string,
    args: string[],
    execOptions?: dockerDesktopAPI.ExecOptions,
  ): Promise<dockerDesktopAPI.ExecResult> {
    let command = cmd;
    let _args = args;
    if (process.env.FLATPAK_ID) {
      _args = ['--host', cmd, ...args];
      command = 'flatpak-spawn';
    }
    const rawResult = await ipcRenderer.invoke(
      'docker-plugin-adapter:exec',
      extensionName,
      launcher,
      command,
      _args,
      execOptions,
    );

    if (rawResult.code !== 0) {
      const error: any = { toString: () => rawResult.stderr };
      error.stderr = rawResult.stderr;
      error.stdout = rawResult.stdout;
      throw error;
    }

    const execResult: dockerDesktopAPI.ExecResult = rawResult;

    // implements lines method
    execResult.lines = (): string[] => {
      return lines(rawResult);
    };

    /**
     * Parse each output line as a JSON object.
     * @returns The list of lines where each line is a JSON object.
     */
    execResult.parseJsonLines = (): any[] => {
      return parseJsonLines(rawResult);
    };

    /**
     * Parse a well-formed JSON output.
     * @returns The JSON object.
     */
    execResult.parseJsonObject = (): any => {
      return parseJsonObject(rawResult);
    };
    return execResult;
  }

  execWithOptions(
    extensionName: string,
    launcher: string | undefined,
    cmd: string,
    args: string[],
    options: {
      stream: dockerDesktopAPI.ExecStreamOptions;
    },
  ): dockerDesktopAPI.ExecProcess {
    const callbackId = this.onDockerPluginExecWithOptionsCallbacksId++;
    this.onDockerPluginExecWithOptionsCallbacks.set(callbackId, options.stream);
    const strippedCallbacksOptions: any = {};
    if (options.stream.splitOutputLines) {
      strippedCallbacksOptions.splitOutputLines = options.stream.splitOutputLines;
    }
    ipcRenderer.send(
      'docker-plugin-adapter:execWithOptions',
      extensionName,
      launcher,
      cmd,
      callbackId,
      strippedCallbacksOptions,
      args,
    );
    const execProcess: dockerDesktopAPI.ExecProcess = {
      close(): void {
        // send abort on the remote side
        ipcRenderer.invoke('docker-plugin-adapter:execAbort', callbackId).catch((err: unknown) => {
          console.error('docker-plugin-adapter:execAbort', err);
        });
      },
    };
    return execProcess;
  }

  getExec(launcher: string | undefined): dockerDesktopAPI.Exec {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const nameParam = urlParams.get('extensionName') ?? '';

    const execFunction: dockerDesktopAPI.Exec = (
      cmd: string,
      args: string[],
      options: undefined | dockerDesktopAPI.SpawnOptions | dockerDesktopAPI.ExecOptions,
    ): any => {
      // no options, it is promise
      if (!options) {
        return this.exec(nameParam, launcher, cmd, args);
      } else if ((options as any).stream) {
        // if we have stream options, it means we're using stream/exec
        return this.execWithOptions(nameParam, launcher, cmd, args, options as dockerDesktopAPI.SpawnOptions);
      } else {
        // else we use promise as well
        return this.exec(nameParam, launcher, cmd, args, options as dockerDesktopAPI.ExecOptions);
      }
    };
    return execFunction;
  }

  initializeDesktopClientAPI(): dockerDesktopAPI.DockerDesktopClient {
    const cli: dockerDesktopAPI.DockerCommand = {
      exec: this.getExec('podman'),
    };

    ipcRenderer.on(
      'docker-plugin-adapter:execWithOptions-callback-stdout',
      (_event, callbackId: number, data: string) => {
        const streamOptions = this.onDockerPluginExecWithOptionsCallbacks.get(callbackId);
        if (streamOptions?.onOutput) {
          streamOptions.onOutput({ stdout: data });
        }
      },
    );
    ipcRenderer.on(
      'docker-plugin-adapter:execWithOptions-callback-stderr',
      (_event, callbackId: number, data: string) => {
        const streamOptions = this.onDockerPluginExecWithOptionsCallbacks.get(callbackId);
        if (streamOptions?.onOutput) {
          streamOptions.onOutput({ stderr: data });
        }
      },
    );
    ipcRenderer.on(
      'docker-plugin-adapter:execWithOptions-callback-close',
      (_event, callbackId: number, exitCode: number) => {
        const streamOptions = this.onDockerPluginExecWithOptionsCallbacks.get(callbackId);
        if (streamOptions?.onClose) {
          streamOptions.onClose(exitCode);
        }
      },
    );
    ipcRenderer.on('docker-plugin-adapter:execWithOptions-callback-error', (_event, callbackId: number, error: any) => {
      const streamOptions = this.onDockerPluginExecWithOptionsCallbacks.get(callbackId);
      if (streamOptions?.onError) {
        streamOptions.onError(error);
      }
    });
    const toast: dockerDesktopAPI.Toast = {
      success(msg: string): void {
        console.info('docker-desktop-adapter:toast:success', msg);
        ipcRenderer.invoke('docker-desktop-adapter:desktopUIToast', 'success', msg).catch((err: unknown) => {
          console.error('docker-desktop-adapter:toast:success:error', err);
        });
      },

      warning(msg: string): void {
        console.warn('docker-desktop-adapter:toast:warning', msg);
        ipcRenderer.invoke('docker-desktop-adapter:desktopUIToast', 'warning', msg).catch((err: unknown) => {
          console.error('docker-desktop-adapter:toast:warning', err);
        });
      },
      error(msg: string): void {
        console.error('docker-desktop-adapter:toast:error', msg);
        ipcRenderer.invoke('docker-desktop-adapter:desktopUIToast', 'error', msg).catch((err: unknown) => {
          console.error('docker-desktop-adapter:toast:error', err);
        });
      },
    };

    const dialog: Dialog = {
      showOpenDialog(dialogProperties: any): Promise<OpenDialogResult> {
        return ipcRenderer.invoke('docker-desktop-adapter:desktopUIshowOpenDialog', dialogProperties);
      },
    };

    const navigate: NavigationIntents = {
      viewContainers: async (): Promise<void> => {
        console.error('navigationIntents.viewContainers not implemented');
      },
      viewContainer: async (id: string): Promise<void> => {
        console.error('navigationIntents.viewContainer not implemented', id);
      },
      viewContainerLogs: async (id: string): Promise<void> => {
        console.error('navigationIntents.viewContainerLogs not implemented', id);
      },
      viewContainerInspect: async (id: string): Promise<void> => {
        console.error('navigationIntents.viewContainerInspect not implemented', id);
      },
      viewContainerStats: async (id: string): Promise<void> => {
        console.error('navigationIntents.viewContainerStats not implemented', id);
      },
      viewImages: async (): Promise<void> => {
        console.error('navigationIntents.viewImages not implemented');
      },
      viewImage: async (id: string, tag: string): Promise<void> => {
        console.error('navigationIntents.viewImage not implemented', id, tag);
      },
      viewVolumes: async (): Promise<void> => {
        console.error('navigationIntents.viewVolumes not implemented');
      },
      viewVolume: async (volume: string): Promise<void> => {
        console.error('navigationIntents.viewVolume not implemented', volume);
      },
      viewDevEnvironments: async (): Promise<void> => {
        console.error('navigationIntents.viewDevEnvironments not implemented');
      },
      viewContainerTerminal: async (id: string): Promise<void> => {
        console.error('navigationIntents.viewContainerTerminal not implemented', id);
      },
    };

    const desktopUI: dockerDesktopAPI.DesktopUI = { toast, dialog, navigate };
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const arch = urlParams.get('arch') ?? '';
    const hostname = urlParams.get('hostname') ?? '';
    const platform = urlParams.get('platform') ?? '';
    const host: dockerDesktopAPI.Host = {
      openExternal: (link: string) => {
        ipcInvoke('shell:openExternal', link).catch((err: unknown) => {
          console.error('dockerDesktopAPI.Host.openExternal', err);
        });
      },
      platform,
      arch,
      hostname,
    };

    const vmServicePort = urlParams.get('vmServicePort') ?? undefined;

    // do we have a service being exposed ?
    const doRequest = async (config: RequestConfig): Promise<unknown> => {
      if (vmServicePort) {
        return ipcRenderer.invoke('docker-desktop-adapter:extensionVMServiceRequest', vmServicePort, config);
      } else {
        throw new Error(`no service port defined for request ${config}`);
      }
    };

    const extensionVMService: dockerDesktopAPI.HttpService = {
      get: async (url: string): Promise<unknown> => {
        return doRequest({ url, method: 'GET', headers: {}, data: undefined });
      },
      post: async (url: string, data: any): Promise<unknown> => {
        return doRequest({ url, method: 'POST', headers: {}, data });
      },
      put: async (url: string, data: any): Promise<unknown> => {
        return doRequest({ url, method: 'PUT', headers: {}, data });
      },
      patch: async (url: string, data: any): Promise<unknown> => {
        return doRequest({ url, method: 'PATCH', headers: {}, data });
      },
      delete: async (url: string): Promise<unknown> => {
        return doRequest({ url, method: 'DELETE', headers: {}, data: undefined });
      },
      head: async (url: string): Promise<unknown> => {
        return doRequest({ url, method: 'HEAD', headers: {}, data: undefined });
      },
      request: async (config: RequestConfig): Promise<unknown> => {
        return doRequest(config);
      },
    };

    const extensionCliVM: dockerDesktopAPI.ExtensionCli = {
      // need to call exec inside a container for the VM service
      exec: this.getExec('VM_SERVICE'),
    };

    const extensionVM: dockerDesktopAPI.ExtensionVM = {
      cli: extensionCliVM,
      service: extensionVMService,
    };

    const extensionHostExec: dockerDesktopAPI.Exec = this.getExec(undefined);

    const extensionHostCli: dockerDesktopAPI.ExtensionCli = {
      exec: extensionHostExec,
    };

    const extensionHost: dockerDesktopAPI.ExtensionHost = {
      cli: extensionHostCli,
    };

    const extension: dockerDesktopAPI.Extension = {
      vm: extensionVM,
      host: extensionHost,
      image: '',
    };

    const docker: dockerDesktopAPI.Docker = {
      listImages: this.listImages,
      listContainers: this.listContainers,
      cli,
    };

    const result = {
      extension,
      desktopUI,
      host,
      docker,
    };

    const toastError = (error: Error): void => {
      console.error(error);
      ipcRenderer.invoke('docker-desktop-adapter:desktopUIToast', 'error', error?.toString()).catch((err: unknown) => {
        console.error('docker-desktop-adapter:desktopUIToast', err);
      });
    };
    (result as any).toastError = toastError;

    return result;
  }
}

// initialize extension loader mechanism
function initExposure(): void {
  /*
ipcRenderer.on(
  'docker-plugin-adapter:exec-onClose',
  (_, onDockerPluginExecOnCloseCallbackId: number) => {
    // grab callback from the map
    const callback = this.onDockerPluginExecOnCloseCallback.get(onDockerPluginExecOnCloseCallbackId);
    if (callback) {
      callback();
    }
  },
);
*/

  const dockerExtensionPreload = new DockerExtensionPreload();
  const ddClient = dockerExtensionPreload.initializeDesktopClientAPI();
  contextBridge.exposeInMainWorld('ddClient', ddClient);
}

// expose methods
initExposure();
