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

/* eslint-disable @typescript-eslint/no-explicit-any */

import { type BrowserWindow, dialog } from 'electron';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Deferred } from '/@/plugin/util/deferred.js';

import { DialogRegistry } from './dialog-registry.js';
import { Uri } from './types/uri.js';

let mainWindowDeferred: Deferred<BrowserWindow>;

const fakeBrowserWindow: BrowserWindow = {
  webContents: {
    send: vi.fn(),
  },
} as unknown as BrowserWindow;

vi.mock('electron', async () => {
  return {
    dialog: {
      showOpenDialog: vi.fn(),
      showSaveDialog: vi.fn(),
    },
  };
});

class TestDialogRegistry extends DialogRegistry {}

let dialogRegistry: TestDialogRegistry;

const originalConsoleError = console.error;

const mockedConsoleError = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  console.error = mockedConsoleError;
  mainWindowDeferred = new Deferred<BrowserWindow>();
  mainWindowDeferred.resolve(fakeBrowserWindow);
  dialogRegistry = new TestDialogRegistry(mainWindowDeferred);
  dialogRegistry.init();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// check a failure on init
test('check failure on init method', async () => {
  mainWindowDeferred = new Deferred<BrowserWindow>();
  dialogRegistry = new TestDialogRegistry(mainWindowDeferred);
  mainWindowDeferred.reject(new Error('test error'));

  dialogRegistry.init();
  await vi.waitFor(() => {
    expect(mockedConsoleError).toHaveBeenCalledWith('Error getting main window', 'Error: test error');
  });
});

describe('showOpenDialog', () => {
  beforeEach(() => {
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({
      filePaths: ['/tmp/my/path'],
      canceled: false,
    });
  });

  // check opendialog is failing without browserwindow
  test('check failure on init method', async () => {
    mainWindowDeferred = new Deferred<BrowserWindow>();
    dialogRegistry = new TestDialogRegistry(mainWindowDeferred);
    // we don't resolve the promise

    await expect(dialogRegistry.openDialog()).rejects.toThrow('Browser window is not available');
  });

  test('check with no options should open a file', async () => {
    const result = await dialogRegistry.openDialog();
    expect(result).toStrictEqual(['/tmp/my/path']);

    expect(dialog.showOpenDialog).toHaveBeenCalledWith(
      fakeBrowserWindow,
      expect.objectContaining({ properties: ['openFile'] }),
    );

    // no result sent to browserWindow
    expect(fakeBrowserWindow.webContents.send).not.toHaveBeenCalled();
  });

  test('check with a dialog id should send value to browserWindow', async () => {
    const result = await dialogRegistry.openDialog({}, 'my-dialog-id');
    // no result as it should have been sent to the browserWindow
    expect(result).toBeUndefined();

    expect(fakeBrowserWindow.webContents.send).toHaveBeenCalledWith(
      'dialog:open-save-dialog-response',
      'my-dialog-id',
      ['/tmp/my/path'],
    );

    expect(dialog.showOpenDialog).toHaveBeenCalledWith(
      fakeBrowserWindow,
      expect.objectContaining({ properties: ['openFile'] }),
    );
  });

  test('check with all options with a folder', async () => {
    const result = await dialogRegistry.openDialog({
      selectors: ['openDirectory'],
      filters: [{ name: 'All Files', extensions: ['*'] }],
      defaultUri: { scheme: 'file', fsPath: '/tmp/my/path' } as Uri,
      title: 'my title',
      openLabel: 'my open label',
    });

    expect(result).toStrictEqual(['/tmp/my/path']);

    expect(dialog.showOpenDialog).toHaveBeenCalledWith(
      fakeBrowserWindow,
      expect.objectContaining({
        properties: ['openDirectory'],
        filters: [{ name: 'All Files', extensions: ['*'] }],
        defaultPath: '/tmp/my/path',
        title: 'my title',
        message: 'my title',
        buttonLabel: 'my open label',
      }),
    );

    // no result sent to browserWindow
    expect(fakeBrowserWindow.webContents.send).not.toHaveBeenCalled();
  });
});

describe('showSaveDialog', () => {
  beforeEach(() => {
    vi.mocked(dialog.showSaveDialog).mockResolvedValue({
      filePath: '/tmp/my/path',
      canceled: false,
    });
  });

  // check showSaveDialog is failing without browserwindow
  test('check failure on init method', async () => {
    mainWindowDeferred = new Deferred<BrowserWindow>();
    dialogRegistry = new TestDialogRegistry(mainWindowDeferred);
    // we don't resolve the promise

    await expect(dialogRegistry.saveDialog()).rejects.toThrow('Browser window is not available');
  });

  test('check with no options', async () => {
    const result = await dialogRegistry.saveDialog();
    expect(result).toStrictEqual(Uri.file('/tmp/my/path'));

    expect(dialog.showSaveDialog).toHaveBeenCalledWith(fakeBrowserWindow, expect.anything());

    // no result sent to browserWindow
    expect(fakeBrowserWindow.webContents.send).not.toHaveBeenCalled();
  });

  test('check with a dialog id should send value to browserWindow', async () => {
    const result = await dialogRegistry.saveDialog({}, 'my-dialog-id');
    // no result as it should have been sent to the browserWindow
    expect(result).toBeUndefined();

    expect(fakeBrowserWindow.webContents.send).toHaveBeenCalledWith(
      'dialog:open-save-dialog-response',
      'my-dialog-id',
      Uri.file('/tmp/my/path'),
    );

    expect(dialog.showSaveDialog).toHaveBeenCalledWith(fakeBrowserWindow, expect.anything());
  });

  test('check with all options', async () => {
    const result = await dialogRegistry.saveDialog({
      filters: [{ name: 'All Files', extensions: ['*'] }],
      defaultUri: { scheme: 'file', fsPath: '/tmp/my/path' } as Uri,
      title: 'my title',
      saveLabel: 'my save label',
    });

    expect(result).toStrictEqual(Uri.file('/tmp/my/path'));

    expect(dialog.showSaveDialog).toHaveBeenCalledWith(
      fakeBrowserWindow,
      expect.objectContaining({
        filters: [{ name: 'All Files', extensions: ['*'] }],
        defaultPath: '/tmp/my/path',
        title: 'my title',
        message: 'my title',
        buttonLabel: 'my save label',
      }),
    );

    // no result sent to browserWindow
    expect(fakeBrowserWindow.webContents.send).not.toHaveBeenCalled();
  });
});
