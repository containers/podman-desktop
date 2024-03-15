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

import type { OpenDialogOptions, SaveDialogOptions } from '@podman-desktop/api';
import type { IpcRenderer, IpcRendererEvent } from 'electron';
import { contextBridge, ipcRenderer } from 'electron';
import { beforeEach, expect, test, vi } from 'vitest';

import { buildApiSender, initExposure } from '.';

vi.mock('electron', async () => {
  return {
    contextBridge: {
      exposeInMainWorld: vi.fn(),
    },
    ipcRenderer: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
      send: vi.fn(),
      invoke: vi.fn(),
    },
    ipcMain: {
      on: vi.fn(),
      emit: vi.fn(),
      handle: vi.fn(),
    },
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

test('openDialog', async () => {
  // store the exposeInMainWorld calls
  const exposeInMainWorldCalls: Map<string, (...args: unknown[]) => unknown> = new Map();

  vi.mocked(contextBridge.exposeInMainWorld).mockImplementation(
    (funcName: string, func: (...args: unknown[]) => unknown) => {
      exposeInMainWorldCalls.set(funcName, func);
    },
  );

  // store the ipcRenderer.on calls
  const ipcRendererOnCalls: Map<string, (event: IpcRendererEvent, ...args: unknown[]) => void> = new Map();

  vi.mocked(ipcRenderer.on).mockImplementation(
    (eventName: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): IpcRenderer => {
      ipcRendererOnCalls.set(eventName, listener);
      return {} as IpcRenderer;
    },
  );
  // call init exposure
  initExposure();

  // mock ipcRenderer.invoke
  vi.mocked(ipcRenderer.invoke).mockResolvedValue({ error: undefined, result: undefined });

  // grab openDialog exposure
  const openDialogExposure = exposeInMainWorldCalls.get('openDialog');
  expect(openDialogExposure).toBeDefined();

  // get the 'dialog:open-save-dialog-response'
  const dialogOpenSaveDialogResponse = ipcRendererOnCalls.get('dialog:open-save-dialog-response');
  expect(dialogOpenSaveDialogResponse).toBeDefined();

  // call the exposure
  const openDialogOptions: OpenDialogOptions = {
    title: 'MyCustomTitle',
  };

  // send the response after the call
  setTimeout(() => {
    dialogOpenSaveDialogResponse?.({} as IpcRendererEvent, '0', ['file1', 'file2']);
  }, 100);

  const result = await openDialogExposure?.(openDialogOptions);

  // check we invoke ipcRenderer.invoke
  expect(ipcRenderer.invoke).toBeCalled();

  // check the result
  expect(result).toEqual(['file1', 'file2']);
});

test('saveDialog', async () => {
  // store the exposeInMainWorld calls
  const exposeInMainWorldCalls: Map<string, (...args: unknown[]) => unknown> = new Map();

  vi.mocked(contextBridge.exposeInMainWorld).mockImplementation(
    (funcName: string, func: (...args: unknown[]) => unknown) => {
      exposeInMainWorldCalls.set(funcName, func);
    },
  );

  // store the ipcRenderer.on calls
  const ipcRendererOnCalls: Map<string, (event: IpcRendererEvent, ...args: unknown[]) => void> = new Map();

  vi.mocked(ipcRenderer.on).mockImplementation(
    (eventName: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void): IpcRenderer => {
      ipcRendererOnCalls.set(eventName, listener);
      return {} as IpcRenderer;
    },
  );
  // call init exposure
  initExposure();

  // mock ipcRenderer.invoke
  vi.mocked(ipcRenderer.invoke).mockResolvedValue({ error: undefined, result: undefined });

  // grab openDialog exposure
  const saveDialogExposure = exposeInMainWorldCalls.get('saveDialog');
  expect(saveDialogExposure).toBeDefined();

  // get the 'dialog:open-save-dialog-response'
  const dialogOpenSaveDialogResponse = ipcRendererOnCalls.get('dialog:open-save-dialog-response');
  expect(dialogOpenSaveDialogResponse).toBeDefined();

  // call the exposure
  const saveDialogOptions: SaveDialogOptions = {
    title: 'MyCustomTitle',
  };

  // send the response after the call
  setTimeout(() => {
    dialogOpenSaveDialogResponse?.({} as IpcRendererEvent, '0', 'file1');
  }, 100);

  const result = await saveDialogExposure?.(saveDialogOptions);

  // check we invoke ipcRenderer.invoke
  expect(ipcRenderer.invoke).toBeCalled();

  // check the result
  expect(result).toEqual('file1');
});
