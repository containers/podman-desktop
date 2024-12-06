/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { EventEmitter } from 'node:events';
import { tmpdir } from 'node:os';

import type { WebContents } from 'electron';
import { app, BrowserWindow, clipboard, ipcMain, shell } from 'electron';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { Updater } from '/@/plugin/updater.js';
import type { NotificationCardOptions } from '/@api/notification.js';

import { securityRestrictionCurrentHandler } from '../security-restrictions-handler.js';
import type { TrayMenu } from '../tray-menu.js';
import type { ApiSenderType } from './api.js';
import { CancellationTokenRegistry } from './cancellation-token-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import { ContainerProviderRegistry } from './container-registry.js';
import type { Directories } from './directories.js';
import { Emitter } from './events/emitter.js';
import { ExtensionLoader } from './extension-loader.js';
import { PluginSystem } from './index.js';
import type { MessageBox } from './message-box.js';
import { Deferred } from './util/deferred.js';

let pluginSystem: TestPluginSystem;

class TestPluginSystem extends PluginSystem {
  override initConfigurationRegistry(
    apiSender: ApiSenderType,
    directories: Directories,
    notifications: NotificationCardOptions[],
    configurationRegistryEmitter: Emitter<ConfigurationRegistry>,
  ): ConfigurationRegistry {
    return super.initConfigurationRegistry(apiSender, directories, notifications, configurationRegistryEmitter);
  }
}

const emitter = new EventEmitter();
const webContents = emitter as unknown as WebContents;
webContents.isDestroyed = vi.fn();

// add send method
webContents.send = vi.fn();

const mainWindowDeferred = new Deferred<BrowserWindow>();

beforeAll(() => {
  vi.mock('electron', () => {
    return {
      shell: {
        openExternal: vi.fn(),
      },
      app: {
        on: vi.fn(),
        getVersion: vi.fn(),
      },
      clipboard: {
        writeText: vi.fn(),
      },
      ipcMain: {
        handle: vi.fn(),
        emit: vi.fn().mockReturnValue(true),
        on: vi.fn(),
      },
      BrowserWindow: {
        getAllWindows: vi.fn(),
      },
    };
  });
  const trayMenuMock = {} as unknown as TrayMenu;
  pluginSystem = new TestPluginSystem(trayMenuMock, mainWindowDeferred);
});

const handlers = new Map<string, any>();
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ipcMain.handle).mockImplementation((channel: string, listener: any) => {
    handlers.set(channel, listener);
  });
  vi.mocked(BrowserWindow.getAllWindows).mockImplementation(() => {
    return [
      {
        isDestroyed: () => false,
        webContents,
      } as unknown as BrowserWindow,
    ];
  });
  vi.mocked(app.getVersion).mockReturnValue('100.0.0');
  vi.spyOn(Updater.prototype, 'init').mockReturnValue({ dispose: vi.fn() } as any);
  vi.spyOn(ExtensionLoader.prototype, 'readDevelopmentFolders').mockResolvedValue([]);
});

test('Should queue events until we are ready', async () => {
  const apiSender = pluginSystem.getApiSender(webContents);
  expect(apiSender).toBeDefined();

  // try to send data
  apiSender.send('foo', 'hello-world');

  // data should not be sent because it is not yet ready
  expect(webContents.send).not.toBeCalled();

  // ready on server side
  pluginSystem.markAsReady();

  // notify the app is loaded on client side
  emitter.emit('dom-ready');

  // data should be sent when flushing queue
  expect(webContents.send).toBeCalledWith('api-sender', 'foo', 'hello-world');
});

test('Check SecurityRestrictions on Links and user accept', async () => {
  const showMessageBoxMock = vi.fn();
  const messageBox = {
    showMessageBox: showMessageBoxMock,
  } as unknown as MessageBox;

  // configure
  await pluginSystem.setupSecurityRestrictionsOnLinks(messageBox);

  // expect user click on Yes
  showMessageBoxMock.mockResolvedValue({ response: 0 });

  // call with a link
  const value = await securityRestrictionCurrentHandler.handler?.('https://www.my-custom-domain.io');

  expect(showMessageBoxMock).toBeCalledWith({
    buttons: ['Yes', 'Copy link', 'Cancel'],
    message: 'Are you sure you want to open the external website ?',
    detail: 'https://www.my-custom-domain.io',
    cancelId: 2,
    title: 'Open External Website',
    type: 'question',
  });
  expect(value).toBeTruthy();
});

test('Check SecurityRestrictions on Links and user copy link', async () => {
  const showMessageBoxMock = vi.fn();
  const messageBox = {
    showMessageBox: showMessageBoxMock,
  } as unknown as MessageBox;

  // configure
  await pluginSystem.setupSecurityRestrictionsOnLinks(messageBox);

  // expect user click on Yes
  showMessageBoxMock.mockResolvedValue({ response: 1 });

  // call with a link
  const value = await securityRestrictionCurrentHandler.handler?.('https://www.my-custom-domain.io');

  expect(showMessageBoxMock).toBeCalledWith({
    buttons: ['Yes', 'Copy link', 'Cancel'],
    message: 'Are you sure you want to open the external website ?',
    detail: 'https://www.my-custom-domain.io',
    title: 'Open External Website',
    cancelId: 2,
    type: 'question',
  });
  expect(value).toBeFalsy();

  // expect clipboard has been called
  expect(clipboard.writeText).toBeCalledWith('https://www.my-custom-domain.io');
});

test('Check SecurityRestrictions on Links and user refuses', async () => {
  const showMessageBoxMock = vi.fn();
  const messageBox = {
    showMessageBox: showMessageBoxMock,
  } as unknown as MessageBox;

  // configure
  await pluginSystem.setupSecurityRestrictionsOnLinks(messageBox);

  // expect user click on Yes
  showMessageBoxMock.mockResolvedValue({ response: 2 });

  // call with a link
  const value = await securityRestrictionCurrentHandler.handler?.('https://www.my-custom-domain.io');

  expect(showMessageBoxMock).toBeCalledWith({
    cancelId: 2,
    buttons: ['Yes', 'Copy link', 'Cancel'],
    message: 'Are you sure you want to open the external website ?',
    detail: 'https://www.my-custom-domain.io',
    title: 'Open External Website',
    type: 'question',
  });
  expect(value).toBeFalsy();
});

test('Check SecurityRestrictions on known domains', async () => {
  const showMessageBoxMock = vi.fn();
  const messageBox = {
    showMessageBox: showMessageBoxMock,
  } as unknown as MessageBox;

  // configure
  await pluginSystem.setupSecurityRestrictionsOnLinks(messageBox);

  // call with a link
  const value = await securityRestrictionCurrentHandler.handler?.('https://www.podman-desktop.io');
  expect(value).toBeTruthy();

  expect(showMessageBoxMock).not.toBeCalled();

  // expect openExternal has been called
  expect(shell.openExternal).toBeCalledWith('https://www.podman-desktop.io');
});

test('Check no securityRestrictions on open external files', async () => {
  const showMessageBoxMock = vi.fn();
  const messageBox = {
    showMessageBox: showMessageBoxMock,
  } as unknown as MessageBox;

  // configure
  await pluginSystem.setupSecurityRestrictionsOnLinks(messageBox);

  // call with a file link
  const value = await securityRestrictionCurrentHandler.handler?.('file:///foobar');
  expect(value).toBeTruthy();

  expect(showMessageBoxMock).not.toBeCalled();

  // expect openExternal has been called
  expect(shell.openExternal).toBeCalledWith(expect.stringContaining('file://'));
  expect(shell.openExternal).toBeCalledWith(expect.stringContaining('foobar'));
});

test('Should apiSender handle local receive events', async () => {
  const apiSender = pluginSystem.getApiSender(webContents);
  expect(apiSender).toBeDefined();

  let fooReceived = '';
  apiSender.receive('foo', (data: any) => {
    fooReceived = String(data);
  });

  // try to send data
  apiSender.send('foo', 'hello-world');

  // data should have been received
  expect(fooReceived).toBe('hello-world');
});

test('Should return no AbortController if the token is undefined', async () => {
  const cancellationTokenRegistry = new CancellationTokenRegistry();
  const abortController = pluginSystem.createAbortControllerOnCancellationToken(cancellationTokenRegistry);
  expect(abortController).toBeUndefined();
});

test('Should return AbortController that should be aborted if token is cancelled', async () => {
  const abortMock = vi.spyOn(AbortController.prototype, 'abort');
  const cancellationTokenRegistry = new CancellationTokenRegistry();
  const tokenId = cancellationTokenRegistry.createCancellationTokenSource();
  const abortController = pluginSystem.createAbortControllerOnCancellationToken(cancellationTokenRegistry, tokenId);

  expect(abortController).toBeDefined();

  const token = cancellationTokenRegistry.getCancellationTokenSource(tokenId);
  token?.cancel();

  expect(abortMock).toBeCalled();
});

test('configurationRegistry propagated', async () => {
  const configurationRegistryEmitter = new Emitter<ConfigurationRegistry>();
  const onDidCallConfigurationRegistry = configurationRegistryEmitter.event;

  const spyFire = vi.spyOn(configurationRegistryEmitter, 'fire');

  let receivedConfig: ConfigurationRegistry | undefined;
  onDidCallConfigurationRegistry(config => (receivedConfig = config));

  const apiSenderMock = {} as unknown as ApiSenderType;
  const directoriesMock = {
    getConfigurationDirectory: vi.fn().mockReturnValue(tmpdir()),
  } as unknown as Directories;
  const notifications: NotificationCardOptions[] = [];

  const configurationRegistry = pluginSystem.initConfigurationRegistry(
    apiSenderMock,
    directoriesMock,
    notifications,
    configurationRegistryEmitter,
  );

  expect(spyFire).toHaveBeenCalled();
  expect(receivedConfig).toBeDefined();
  expect(receivedConfig).toBe(configurationRegistry);
  expect(notifications.length).toBe(0);
});

const pushImageHandlerId = 'container-provider-registry:pushImage';
const pushImageHandlerOnDataEvent = `${pushImageHandlerId}-onData`;

test('push image command sends onData message with callbackId, event name and event data ', async () => {
  await pluginSystem.initExtensions(new Emitter<ConfigurationRegistry>());
  const handle = handlers.get(pushImageHandlerId);
  expect(handle).not.equal(undefined);
  let registeredCallback: (name: string, data: string) => void | undefined;
  vi.spyOn(ContainerProviderRegistry.prototype, 'pushImage').mockImplementation(
    (_engine, _imageId, callback: (name: string, data: string) => void) => {
      registeredCallback = callback;
      return Promise.resolve();
    },
  );
  await handle(undefined, 'podman', 'registry.com/repo/image:latest', 1);
  expect(registeredCallback!).not.equal(undefined);
  registeredCallback!('data', 'push image output');
  expect(webContents.send).toBeCalledWith(pushImageHandlerOnDataEvent, 1, 'data', 'push image output');
});

test('push image sends data event with error and end event when fails', async () => {
  const pushError = new Error('push error');
  await pluginSystem.initExtensions(new Emitter<ConfigurationRegistry>());
  const handle = handlers.get('container-provider-registry:pushImage');
  expect(handle).not.equal(undefined);
  vi.spyOn(ContainerProviderRegistry.prototype, 'pushImage').mockImplementation(
    (_engine, _imageId, _callback: (name: string, data: string) => void) => {
      return Promise.reject(pushError);
    },
  );
  vi.mocked(webContents.send).mockReset();
  await handle(undefined, 'podman', 'registry.com/repo/image:latest', 1);
  expect(webContents.send).toBeCalledWith(
    pushImageHandlerOnDataEvent,
    1,
    'data',
    JSON.stringify({ error: String(pushError) }),
  );
  expect(webContents.send).toBeCalledWith(pushImageHandlerOnDataEvent, 1, 'end');
});
