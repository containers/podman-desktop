/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

/* eslint-disable sonarjs/no-unused-collection */

import type { ForwardConfig } from '@desktop-framework/api';
import { WorkloadKind } from '@desktop-framework/api';
import type { OpenDialogOptions, SaveDialogOptions } from '@desktop-framework/extension-api';
import type { ContextBridge, IpcMain, IpcRenderer, IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { buildApiSender, initExposure } from './index.js';

vi.mock(import('electron'), async () => {
  return {
    contextBridge: {
      exposeInMainWorld: vi.fn(),
    } as unknown as ContextBridge,
    ipcRenderer: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
      send: vi.fn(),
      invoke: vi.fn(),
    } as unknown as IpcRenderer,
    ipcMain: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
    } as unknown as IpcMain,
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('build Api Sender', () => {
  const apiSender = buildApiSender();

  expect(apiSender).toBeDefined();

  // add a receiver
  const received: string[] = [];
  const disposable = apiSender.receive('channel', (...val: unknown[]) => {
    received.push(String(val));
  });

  // send a message
  apiSender.send('channel', 'message');
  expect(received.length).toBe(1);
  expect(received[0]).toBe('message');

  // send another message
  apiSender.send('channel', 'message2');
  expect(received.length).toBe(2);
  expect(received[1]).toBe('message2');

  // dispose the receiver
  disposable.dispose();

  // send another message
  apiSender.send('channel', 'message3');
  // should not be received anymore as we disposed the listener
  expect(received.length).toBe(2);
});

describe('collect calls to exposeInMainWorld and ipcRenderer.on and calls initExposure', () => {
  // store the exposeInMainWorld calls
  const exposeInMainWorldCalls: Map<string, (...args: unknown[]) => unknown> = new Map();

  // store the ipcRenderer.on calls
  const ipcRendererOnCalls: Map<string, (event: IpcRendererEvent, ...args: unknown[]) => void> = new Map();

  const getInMainWorld = (s: string): ((...args: unknown[]) => unknown) => {
    const exposure = exposeInMainWorldCalls.get(s);
    expect(exposure).toBeDefined();
    if (!exposure) {
      throw new Error('should be defined');
    }
    return exposure;
  };

  const getRendererOn = (s: string): ((event: IpcRendererEvent, ...args: unknown[]) => void) => {
    const exposure = ipcRendererOnCalls.get(s);
    expect(exposure).toBeDefined();
    if (!exposure) {
      throw new Error('should be defined');
    }
    return exposure;
  };

  beforeEach(() => {
    exposeInMainWorldCalls.clear();
    ipcRendererOnCalls.clear();

    vi.mocked(contextBridge.exposeInMainWorld).mockImplementation(
      (funcName: string, func: (...args: unknown[]) => unknown) => {
        exposeInMainWorldCalls.set(funcName, func);
      },
    );

    vi.mocked(ipcRenderer.on).mockImplementation(
      (eventName: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): IpcRenderer => {
        ipcRendererOnCalls.set(eventName, listener);
        return {} as IpcRenderer;
      },
    );

    initExposure();
  });

  test('openDialog', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ error: undefined, result: undefined });

    // grab openDialog exposure
    const openDialogExposure = getInMainWorld('openDialog');

    // get the 'dialog:open-save-dialog-response'
    const dialogOpenSaveDialogResponse = getRendererOn('dialog:open-save-dialog-response');

    // call the exposure
    const openDialogOptions: OpenDialogOptions = {
      title: 'MyCustomTitle',
    };

    // send the response after the call
    setTimeout(() => {
      dialogOpenSaveDialogResponse({} as IpcRendererEvent, '0', ['file1', 'file2']);
    }, 100);

    const result = await openDialogExposure(openDialogOptions);

    // check we invoke ipcRenderer.invoke
    expect(ipcRenderer.invoke).toBeCalled();

    // check the result
    expect(result).toEqual(['file1', 'file2']);
  });

  test('saveDialog', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ error: undefined, result: undefined });

    // grab openDialog exposure
    const saveDialogExposure = getInMainWorld('saveDialog');

    // get the 'dialog:open-save-dialog-response'
    const dialogOpenSaveDialogResponse = getRendererOn('dialog:open-save-dialog-response');

    // call the exposure
    const saveDialogOptions: SaveDialogOptions = {
      title: 'MyCustomTitle',
    };

    // send the response after the call
    setTimeout(() => {
      dialogOpenSaveDialogResponse({} as IpcRendererEvent, '0', 'file1');
    }, 100);

    const result = await saveDialogExposure(saveDialogOptions);

    // check we invoke ipcRenderer.invoke
    expect(ipcRenderer.invoke).toBeCalled();

    // check the result
    expect(result).toEqual('file1');
  });

  test('getKubernetesPortForwards', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: [] });

    // grab getKubernetesPortForwards exposure
    const getKubernetesPortForwardsExposure = getInMainWorld('getKubernetesPortForwards');

    const result = await getKubernetesPortForwardsExposure();

    // check we invoke ipcRenderer.invoke
    expect(ipcRenderer.invoke).toBeCalled();

    // check the result
    expect(result).toEqual([]);
  });

  test('createKubernetesPortForward', async () => {
    const userPortForward: ForwardConfig = {
      id: 'fake-id',
      namespace: 'kubernetes',
      name: 'service',
      kind: WorkloadKind.SERVICE,
      forward: {
        localPort: 50_050,
        remotePort: 88,
      },
    };

    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: userPortForward });

    // grab createKubernetesPortForward exposure
    const createKubernetesPortForwardExposure = getInMainWorld('createKubernetesPortForward');

    const result = await createKubernetesPortForwardExposure(userPortForward);

    // check we invoke ipcRenderer.invoke
    expect(ipcRenderer.invoke).toBeCalled();

    // check the result
    expect(result).toEqual(userPortForward);
  });

  test('deleteKubernetesPortForward', async () => {
    const userPortForward: ForwardConfig = {
      id: 'fake-id',
      namespace: 'kubernetes',
      name: 'service',
      kind: WorkloadKind.SERVICE,
      forward: {
        localPort: 50_050,
        remotePort: 88,
      },
    };

    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: undefined });

    // grab createKubernetesPortForward exposure
    const deleteKubernetesPortForwardExposure = getInMainWorld('deleteKubernetesPortForward');

    const result = await deleteKubernetesPortForwardExposure(userPortForward);

    // check we invoke ipcRenderer.invoke
    expect(ipcRenderer.invoke).toBeCalled();

    // check the result
    expect(result).toEqual(undefined);
  });

  test('getSearchableNavigationRoutes', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({
      result: [{ routeId: 'ext.dashboard', label: 'Dashboard', icon: 'icon.png' }],
    });

    const getSearchableNavigationRoutesExposure = getInMainWorld('getSearchableNavigationRoutes');

    const result = await getSearchableNavigationRoutesExposure();

    expect(ipcRenderer.invoke).toHaveBeenCalledWith('navigation:getSearchableRoutes');

    expect(result).toEqual([{ routeId: 'ext.dashboard', label: 'Dashboard', icon: 'icon.png' }]);
  });

  test('logger passed to createVmProviderConnection is called during provider-registry:taskConnection-onData', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: undefined });
    const createVmProviderConnectionExposure = getInMainWorld('createVmProviderConnection');
    const logger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void = vi.fn();
    await createVmProviderConnectionExposure('internal', {}, 'key1', logger);
    expect(ipcRenderer.invoke).toHaveBeenCalledOnce();

    const id = vi.mocked(ipcRenderer.invoke).mock.calls[0][3];
    const taskConnectionOnDataExposure = getRendererOn('provider-registry:taskConnection-onData');
    const data = { data: 'data' };
    taskConnectionOnDataExposure({} as IpcRendererEvent, id, 'log', data);
    expect(logger).toHaveBeenCalledWith('key1', 'log', data);
  });

  test('logger passed to startProviderConnectionLifecycle is called during provider-registry:taskConnection-onData', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: undefined });
    const startProviderConnectionLifecycleExposure = getInMainWorld('startProviderConnectionLifecycle');
    const logger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void = vi.fn();
    await startProviderConnectionLifecycleExposure('internal', {}, 'key1', logger);
    expect(ipcRenderer.invoke).toHaveBeenCalledOnce();

    const id = vi.mocked(ipcRenderer.invoke).mock.calls[0][3];
    const taskConnectionOnDataExposure = getRendererOn('provider-registry:taskConnection-onData');
    const data = { data: 'data' };
    taskConnectionOnDataExposure({} as IpcRendererEvent, id, 'log', data);
    expect(logger).toHaveBeenCalledWith('key1', 'log', data);
  });

  test('logger passed to stopProviderConnectionLifecycle is called during provider-registry:taskConnection-onData', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: undefined });
    const stopProviderConnectionLifecycleExposure = getInMainWorld('stopProviderConnectionLifecycle');
    const logger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void = vi.fn();
    await stopProviderConnectionLifecycleExposure('internal', {}, 'key1', logger);
    expect(ipcRenderer.invoke).toHaveBeenCalledOnce();

    const id = vi.mocked(ipcRenderer.invoke).mock.calls[0][3];
    const taskConnectionOnDataExposure = getRendererOn('provider-registry:taskConnection-onData');
    const data = { data: 'data' };
    taskConnectionOnDataExposure({} as IpcRendererEvent, id, 'log', data);
    expect(logger).toHaveBeenCalledWith('key1', 'log', data);
  });

  test('logger passed to editProviderConnectionLifecycle is called during provider-registry:taskConnection-onData', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: undefined });
    const editProviderConnectionLifecycleExposure = getInMainWorld('editProviderConnectionLifecycle');
    const logger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void = vi.fn();
    await editProviderConnectionLifecycleExposure('internal', {}, {}, 'key1', logger, 'token1', 'task1');
    expect(ipcRenderer.invoke).toHaveBeenCalledOnce();

    const id = vi.mocked(ipcRenderer.invoke).mock.calls[0][4];
    const taskConnectionOnDataExposure = getRendererOn('provider-registry:taskConnection-onData');
    const data = { data: 'data' };
    taskConnectionOnDataExposure({} as IpcRendererEvent, id, 'log', data);
    expect(logger).toHaveBeenCalledWith('key1', 'log', data);
  });

  test('logger passed to deleteProviderConnectionLifecycle is called during provider-registry:taskConnection-onData', async () => {
    vi.mocked(ipcRenderer.invoke).mockResolvedValue({ result: undefined });
    const deleteProviderConnectionLifecycleExposure = getInMainWorld('deleteProviderConnectionLifecycle');
    const logger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void = vi.fn();
    await deleteProviderConnectionLifecycleExposure('internal', {}, 'key1', logger);
    expect(ipcRenderer.invoke).toHaveBeenCalledOnce();

    const id = vi.mocked(ipcRenderer.invoke).mock.calls[0][3];
    const taskConnectionOnDataExposure = getRendererOn('provider-registry:taskConnection-onData');
    const data = { data: 'data' };
    taskConnectionOnDataExposure({} as IpcRendererEvent, id, 'log', data);
    expect(logger).toHaveBeenCalledWith('key1', 'log', data);
  });
});
