/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { EventEmitter } from 'node:events';
import { tmpdir } from 'node:os';

import type {
  ImageUpdateInfo,
  NotificationCardOptions,
  ProviderContainerConnectionInfo,
  ProviderInfo,
} from '@desktop-framework/api';
import { ApiSenderType } from '@desktop-framework/api/api-sender';
import type { PlayKubeInfo } from '@desktop-framework/api/libpod';
import type { PullEvent } from '@desktop-framework/extension-api';
import type { IpcMainInvokeEvent, WebContents } from 'electron';
import { app, BrowserWindow, clipboard, ipcMain, shell } from 'electron';
import { Container as InversifyContainer } from 'inversify';
import type { MockInstance } from 'vitest';
import { afterEach, assert, beforeEach, describe, expect, test, vi } from 'vitest';

import { ExtensionLoader } from '/@/plugin/extension/extension-loader.js';
import { Updater } from '/@/plugin/updater.js';
import { securityRestrictionCurrentHandler } from '/@/security-restrictions-handler.js';
import type { TrayMenu } from '/@/tray-menu.js';

import { CancellationTokenRegistry } from './cancellation-token-registry.js';
import { ConfigurationRegistry } from './configuration-registry.js';
import { ContainerProviderRegistry } from './container-registry.js';
import { DefaultConfiguration } from './default-configuration.js';
import { Directories } from './directories.js';
import { Emitter } from './events/emitter.js';
import { ImageRegistry } from './image-registry.js';
import type { LoggerWithEnd } from './index.js';
import { PluginSystem } from './index.js';
import { LockedConfiguration } from './locked-configuration.js';
import type { MessageBox } from './message-box.js';
import { NavigationManager } from './navigation/navigation-manager.js';
import { ProviderRegistry } from './provider-registry.js';
import { TaskImpl } from './tasks/task-impl.js';
import { TaskManager } from './tasks/task-manager.js';
import type { Task, TaskAction } from './tasks/tasks.js';
import { Disposable } from './types/disposable.js';

// vi.mock auto-mocking replaces classes entirely, stripping Inversify
// decorator metadata (@injectable/@inject). This causes .toSelf() bindings
// to fail at resolution time. Instead, we keep the original class (preserving
// metadata) and only replace prototype methods with vi.fn().
async function mockOriginalClass<T extends Record<string, unknown>>(
  importOriginal: () => Promise<T>,
  className: keyof T & string,
): Promise<T> {
  const mod = await importOriginal();
  const prototype = (mod[className] as unknown as { prototype: object }).prototype;
  for (const key of Object.getOwnPropertyNames(prototype)) {
    const desc = Object.getOwnPropertyDescriptor(prototype, key);
    if (key !== 'constructor' && desc?.value && typeof desc.value === 'function') {
      (prototype as Record<string, unknown>)[key] = vi.fn();
    }
  }
  return mod;
}

function getHandler<T>(name: string): T {
  const handler = handlers.get(name);
  assert(handler, `handler '${name}' should be registered`);
  return handler as T;
}

vi.mock(import('/@/plugin/updater.js'), importOriginal => mockOriginalClass(importOriginal, 'Updater'));
vi.mock(import('/@/plugin/extension/extension-loader.js'), importOriginal =>
  mockOriginalClass(importOriginal, 'ExtensionLoader'),
);
vi.mock(import('/@/plugin/extension/catalog/extensions-catalog.js'), importOriginal =>
  mockOriginalClass(importOriginal, 'ExtensionsCatalog'),
);
vi.mock(import('./webview/webview-registry.js'), importOriginal => mockOriginalClass(importOriginal, 'HttpServer'));
vi.mock(import('./extension/extension-api-version.js'));
vi.mock(import('./container-registry.js'), importOriginal =>
  mockOriginalClass(importOriginal, 'ContainerProviderRegistry'),
);
vi.mock(import('./tasks/task-manager.js'), importOriginal => mockOriginalClass(importOriginal, 'TaskManager'));
vi.mock(import('./navigation/navigation-manager.js'), importOriginal =>
  mockOriginalClass(importOriginal, 'NavigationManager'),
);
vi.mock(import('./provider-registry.js'), importOriginal => mockOriginalClass(importOriginal, 'ProviderRegistry'));
vi.mock(import('./image-registry.js'), importOriginal => mockOriginalClass(importOriginal, 'ImageRegistry'));

let pluginSystem: TestPluginSystem;

class TestPluginSystem extends PluginSystem {
  override async initConfigurationRegistry(
    container: InversifyContainer,
    notifications: NotificationCardOptions[],
    configurationRegistryEmitter: Emitter<ConfigurationRegistry>,
  ): Promise<ConfigurationRegistry> {
    if (!container.isBound(ConfigurationRegistry)) {
      container.bind<ConfigurationRegistry>(ConfigurationRegistry).toSelf().inSingletonScope();
    }
    if (!container.isBound(DefaultConfiguration)) {
      const defaultConfigurationMock = {
        getContent: vi.fn().mockResolvedValue({}),
      } as unknown as DefaultConfiguration;
      container.bind<DefaultConfiguration>(DefaultConfiguration).toConstantValue(defaultConfigurationMock);
    }
    if (!container.isBound(LockedConfiguration)) {
      const lockedConfigurationMock = {
        getContent: vi.fn().mockResolvedValue({}),
      } as unknown as LockedConfiguration;
      container.bind<LockedConfiguration>(LockedConfiguration).toConstantValue(lockedConfigurationMock);
    }
    return super.initConfigurationRegistry(container, notifications, configurationRegistryEmitter);
  }

  setQuitting(value: boolean): void {
    this.isQuitting = value;
  }
}

let inversifyContainer: InversifyContainer;
let mainWindowDeferred: PromiseWithResolvers<BrowserWindow>;
let handlers: Map<string, unknown>;
let emitter: EventEmitter;
let webContents: WebContents;

beforeEach(async () => {
  vi.resetAllMocks();
  handlers = new Map<string, unknown>();

  emitter = new EventEmitter();
  webContents = emitter as unknown as WebContents;
  webContents.isDestroyed = vi.fn();
  webContents.send = vi.fn();

  mainWindowDeferred = Promise.withResolvers<BrowserWindow>();
  pluginSystem = new TestPluginSystem({} as unknown as TrayMenu, mainWindowDeferred);

  vi.mocked(ipcMain.handle).mockImplementation((channel: string, listener: unknown) => {
    handlers.set(channel, listener);
  });
  vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
    {
      isDestroyed: () => false,
      webContents,
    } as unknown as BrowserWindow,
  ]);
  vi.mocked(app.getVersion).mockReturnValue('100.0.0');
  vi.mocked(Updater.prototype.init).mockReturnValue(new Disposable(vi.fn()));
  vi.mocked(ExtensionLoader.prototype.listExtensions).mockResolvedValue([]);

  vi.mocked(ProviderRegistry.prototype.getProviderInfos).mockReturnValue([]);
  vi.mocked(ContainerProviderRegistry.prototype.listContainers).mockResolvedValue([]);
  vi.mocked(TaskManager.prototype.createTask).mockReturnValue({
    status: 'in-progress',
    error: '',
  } as unknown as Task);
  vi.mocked(NavigationManager.prototype.navigateToResources).mockResolvedValue(undefined);
  vi.mocked(NavigationManager.prototype.navigateToProviderTask).mockResolvedValue(undefined);
  vi.mocked(NavigationManager.prototype.navigateToProviderConnection).mockReturnValue(undefined);
  vi.mocked(NavigationManager.prototype.navigateToImageBuild).mockResolvedValue(undefined);

  await pluginSystem.initExtensions(new Emitter<ConfigurationRegistry>());
  vi.mocked(webContents.send).mockClear();

  inversifyContainer = new InversifyContainer();
});

afterEach(async () => {
  await inversifyContainer.unbindAllAsync();
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

test('Should drop the queued events when the window has been destroyed while they were queued', async () => {
  const apiSender = pluginSystem.getApiSender(webContents);
  pluginSystem.markAsReady();

  // the UI has not reported being ready yet, so the event is queued
  apiSender.send('foo', 'hello-world');
  expect(webContents.send).not.toHaveBeenCalled();

  // the user closes the window while the event is still queued
  vi.mocked(webContents.isDestroyed).mockReturnValue(true);

  // flushing the queue must drop the events instead of sending to the destroyed window
  expect(() => emitter.emit('dom-ready')).not.toThrow();
  expect(webContents.send).not.toHaveBeenCalled();

  // and the events are not kept around to be flushed again later
  vi.mocked(webContents.isDestroyed).mockReturnValue(false);
  apiSender.send('bar', 'hello-again');
  expect(webContents.send).toHaveBeenCalledTimes(1);
  expect(webContents.send).toHaveBeenCalledWith('api-sender', 'bar', 'hello-again');
});

test('Check SecurityRestrictions on Links and user accept', async () => {
  const showMessageBoxMock = vi.fn();
  const messageBox = {
    showMessageBox: showMessageBoxMock,
  } as unknown as MessageBox;

  // configure
  await pluginSystem.setupSecurityRestrictionsOnLinks(messageBox);

  // expect user click on Yes
  showMessageBoxMock.mockResolvedValue({ response: 'Open' });

  // call with a link
  const value = await securityRestrictionCurrentHandler.handler?.('https://www.my-custom-domain.io');

  expect(showMessageBoxMock).toBeCalledWith({
    buttons: ['Open', 'Copy Link', 'Cancel'],
    message: 'Are you sure you want to open the external website?',
    detail: 'https://www.my-custom-domain.io',
    cancelId: 2,
    title: 'Open External Link?',
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
  showMessageBoxMock.mockResolvedValue({ response: 'Copy Link' });

  // call with a link
  const value = await securityRestrictionCurrentHandler.handler?.('https://www.my-custom-domain.io');

  expect(showMessageBoxMock).toBeCalledWith({
    buttons: ['Open', 'Copy Link', 'Cancel'],
    message: 'Are you sure you want to open the external website?',
    detail: 'https://www.my-custom-domain.io',
    title: 'Open External Link?',
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
  showMessageBoxMock.mockResolvedValue({ response: 'Cancel' });

  // call with a link
  const value = await securityRestrictionCurrentHandler.handler?.('https://www.my-custom-domain.io');

  expect(showMessageBoxMock).toBeCalledWith({
    cancelId: 2,
    buttons: ['Open', 'Copy Link', 'Cancel'],
    message: 'Are you sure you want to open the external website?',
    detail: 'https://www.my-custom-domain.io',
    title: 'Open External Link?',
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
  apiSender.receive('foo', (data: unknown) => {
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
  const defaultConfigurationMock = {
    getContent: vi.fn().mockResolvedValue({}),
  } as unknown as DefaultConfiguration;
  const lockedConfigurationMock = {
    getContent: vi.fn().mockResolvedValue({}),
  } as unknown as LockedConfiguration;
  const notifications: NotificationCardOptions[] = [];

  inversifyContainer.bind<ApiSenderType>(ApiSenderType).toConstantValue(apiSenderMock);
  inversifyContainer.bind<Directories>(Directories).toConstantValue(directoriesMock);
  inversifyContainer.bind<DefaultConfiguration>(DefaultConfiguration).toConstantValue(defaultConfigurationMock);
  inversifyContainer.bind<LockedConfiguration>(LockedConfiguration).toConstantValue(lockedConfigurationMock);

  const configurationRegistry = await pluginSystem.initConfigurationRegistry(
    inversifyContainer,
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

test('push image command sends onData message with callbackId, event name and data, mark task as success on end event', async () => {
  const handle =
    getHandler<(_event: unknown, _engine: string, _imageId: string, _callbackId: number) => Promise<void>>(
      pushImageHandlerId,
    );
  const defaultCallback = vi.fn();
  let registeredCallback: (name: string, data: string) => void = defaultCallback;
  vi.mocked(ContainerProviderRegistry.prototype.pushImage).mockImplementation(
    (_engine, _imageId, callback: (name: string, data: string) => void) => {
      registeredCallback = callback;
      return Promise.resolve();
    },
  );
  await handle(undefined, 'podman', 'registry.com/repo/image:latest', 1);
  expect(registeredCallback).not.equal(defaultCallback);
  registeredCallback('data', 'push image output');
  expect(TaskManager.prototype.createTask).toHaveBeenCalledOnce();
  expect(TaskManager.prototype.createTask).toHaveBeenCalledWith({
    title: `Push image '${'registry.com/repo/image:latest'}'`,
  });
  expect(webContents.send).toBeCalledWith(pushImageHandlerOnDataEvent, 1, 'data', 'push image output');
  registeredCallback('end', '');
  expect(vi.mocked(TaskManager.prototype.createTask).mock.results[0]?.value.status).toBe('success');
});

test('push image sends data event with error, "end" event when fails and set task error value', async () => {
  const pushError = new Error('push error');
  const handle = getHandler<(_event: unknown, _engine: string, _imageId: string, _callbackId: number) => Promise<void>>(
    'container-provider-registry:pushImage',
  );
  vi.mocked(ContainerProviderRegistry.prototype.pushImage).mockImplementation(
    (_engine, _imageId, _callback: (name: string, data: string) => void) => {
      return Promise.reject(pushError);
    },
  );
  vi.mocked(webContents.send).mockReset();
  await handle(undefined, 'podman', 'registry.com/repo/image:latest', 1);
  expect(webContents.send).toBeCalledWith(pushImageHandlerOnDataEvent, 1, 'error', String(pushError));
  expect(webContents.send).toBeCalledWith(pushImageHandlerOnDataEvent, 1, 'end');
  expect(vi.mocked(TaskManager.prototype.createTask).mock.results[0]?.value.error).toBe(String(pushError));
});

test('Pull image creates a task', async () => {
  const handle = getHandler<
    (_event: unknown, _engine: string, _imageName: string, _callbackId: number) => Promise<void>
  >('container-provider-registry:pullImage');
  const defaultCallback = vi.fn();
  let registeredCallback: (event: PullEvent) => void = defaultCallback;
  vi.mocked(ContainerProviderRegistry.prototype.pullImage).mockImplementation(
    (_engine, _imageName, callback: (event: PullEvent) => void) => {
      registeredCallback = callback;
      return Promise.resolve();
    },
  );
  await handle(undefined, 'podman', 'registry.com/repo/image:latest', 1);
  expect(registeredCallback).not.equal(defaultCallback);
  registeredCallback({ id: 'pullEvent1' } as PullEvent);
  expect(TaskManager.prototype.createTask).toHaveBeenCalledOnce();
  expect(TaskManager.prototype.createTask).toHaveBeenCalledWith({
    title: 'Pulling registry.com/repo/image:latest',
    cancellable: false,
    cancellationTokenSourceId: undefined,
  });
  expect(webContents.send).toBeCalledWith('container-provider-registry:pullImage-onData', 1, {
    id: 'pullEvent1',
  } as PullEvent);
  expect(vi.mocked(TaskManager.prototype.createTask).mock.results[0]?.value.status).toBe('success');
});

test('Pull image creates a cancellable task and marks task as canceled on cancellation', async () => {
  const createTokenHandler = getHandler<() => Promise<number | { result: number }>>('cancellableTokenSource:create');
  const cancelTokenHandler = getHandler<(_event: unknown, id: number) => Promise<void>>('cancellableToken:cancel');
  const handle = getHandler<
    (
      _event: unknown,
      _providerId: string,
      _imageName: string,
      _callbackId: number,
      _platform?: string,
      _cancellationTokenSourceId?: number,
    ) => Promise<{ error?: Error }>
  >('container-provider-registry:pullImage');

  const tokenCreationResult = await createTokenHandler();
  const tokenId = typeof tokenCreationResult === 'number' ? tokenCreationResult : tokenCreationResult.result;
  vi.mocked(ContainerProviderRegistry.prototype.pullImage).mockImplementation(
    async (_engine, _imageName, _callback, _platform, abortController) => {
      await Promise.resolve();
      abortController?.abort();
      throw new Error('aborted');
    },
  );

  await cancelTokenHandler(undefined, tokenId);
  const handleReturn = await handle(undefined, 'podman', 'registry.com/repo/image:latest', 1, undefined, tokenId);
  expect(handleReturn.error).toBeInstanceOf(Error);
  expect(handleReturn.error?.message).toBe('aborted');

  expect(ContainerProviderRegistry.prototype.pullImage).toHaveBeenCalled();
  expect(TaskManager.prototype.createTask).toHaveBeenCalledWith({
    title: 'Pulling registry.com/repo/image:latest',
    cancellable: true,
    cancellationTokenSourceId: tokenId,
  });
  expect(vi.mocked(TaskManager.prototype.createTask).mock.results[0]?.value.status).toBe('canceled');
});

test('ipcMain.handle returns caught error as is if it is instance of Error', async () => {
  const handle =
    getHandler<(event?: IpcMainInvokeEvent, taskId?: string) => Promise<{ error?: Error }>>('tasks:execute');
  const errorInstance = new Error('error');
  vi.mocked(TaskManager.prototype.execute).mockImplementation(() => {
    throw errorInstance;
  });

  const handleReturn = await handle(undefined, '1');
  expect(handleReturn.error).toEqual(errorInstance);
});

test('ipcMain.handle returns caught error as objects message property if it is not instance of error', async () => {
  const handle =
    getHandler<(event?: IpcMainInvokeEvent, taskId?: string) => Promise<{ error?: Error }>>('tasks:execute');
  const nonErrorInstance = 'error';
  vi.mocked(TaskManager.prototype.execute).mockImplementation(() => {
    throw nonErrorInstance;
  });

  const handleReturn = await handle(undefined, '1');
  expect(handleReturn.error).toEqual({ message: nonErrorInstance });
});

test('container-provider-registry:logsContainer calls logsContainer without abortController if no tokenId is passed', async () => {
  const handle = getHandler<
    (
      _event: unknown,
      _params: { engineId: string; containerId: string; onDataId: number; cancellableTokenId?: number },
    ) => Promise<void>
  >('container-provider-registry:logsContainer');

  await handle(undefined, {
    engineId: 'engine1',
    containerId: 'container1',
    onDataId: 1,
  });

  expect(ContainerProviderRegistry.prototype.logsContainer).toHaveBeenCalled();
  const params = vi.mocked(ContainerProviderRegistry.prototype.logsContainer).mock.calls[0]?.[0];
  const abortController = params?.abortController;
  expect(abortController).toBeUndefined();
});

test('container-provider-registry:logsContainer calls logsContainer with abortController if tokenId is passed', async () => {
  const cancellationTokenRegistry = new CancellationTokenRegistry();
  const tokenId = cancellationTokenRegistry.createCancellationTokenSource();

  const handle = getHandler<
    (
      _event: unknown,
      _params: { engineId: string; containerId: string; onDataId: number; cancellableTokenId?: number },
    ) => Promise<void>
  >('container-provider-registry:logsContainer');

  await handle(undefined, {
    engineId: 'engine1',
    containerId: 'container1',
    onDataId: 1,
    cancellableTokenId: tokenId,
  });

  expect(ContainerProviderRegistry.prototype.logsContainer).toHaveBeenCalled();
  const params = vi.mocked(ContainerProviderRegistry.prototype.logsContainer).mock.calls[0]?.[0];
  const abortController = params?.abortController;
  expect(abortController).toBeDefined();
});

describe.each<{
  handler: string;
  methodName: 'createContainerProviderConnection' | 'createKubernetesProviderConnection' | 'createVmProviderConnection';
}>([
  {
    handler: 'provider-registry:createContainerProviderConnection',
    methodName: 'createContainerProviderConnection',
  },
  {
    handler: 'provider-registry:createKubernetesProviderConnection',
    methodName: 'createKubernetesProviderConnection',
  },
  {
    handler: 'provider-registry:createVmProviderConnection',
    methodName: 'createVmProviderConnection',
  },
])('$handler', async ({ handler, methodName }) => {
  let originalTask: Task;

  beforeEach(() => {
    originalTask = {
      status: 'in-progress',
      error: '',
    } as unknown as Task;
    vi.mocked(TaskManager.prototype.createTask).mockReturnValue(originalTask);
    vi.mocked(ProviderRegistry.prototype.getProviderInfo).mockReturnValue({
      name: 'provider1',
    } as ProviderInfo);
  });

  test('createTask is called', async () => {
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _loggerId: string,
          _tokenId: string,
          _taskId: string,
        ) => Promise<void>
      >(handler);
    await handle(
      undefined,
      'internal1',
      { key1: 'value1', key2: 42 } as unknown as ProviderContainerConnectionInfo | PlayKubeInfo,
      'logger1',
      'token1',
      'task1',
    );
    expect(TaskManager.prototype.createTask).toHaveBeenCalledOnce();
    const params = vi.mocked(TaskManager.prototype.createTask).mock.calls[0]?.[0];
    assert(params, 'params should be defined');
    expect(params.title).toEqual('Creating provider1 provider');
    expect(params.action?.name).toEqual('Open task');

    const execute = params.action?.execute;
    assert(execute, 'execute should be defined');
    execute(new TaskImpl('task1id', 'task1name'));
    expect(NavigationManager.prototype.navigateToProviderTask).toHaveBeenCalledOnce();
    expect(NavigationManager.prototype.navigateToProviderTask).toHaveBeenCalledWith('internal1', 'task1');
  });

  test(`${methodName} is called and is resolved`, async () => {
    (ProviderRegistry.prototype[methodName] as unknown as MockInstance).mockResolvedValue(undefined);
    const onEndMock = vi.fn();
    const errorMock = vi.fn();
    vi.spyOn(pluginSystem, 'getLogHandler').mockReturnValue({
      onEnd: onEndMock,
      error: errorMock,
    } as unknown as LoggerWithEnd);
    await pluginSystem.initExtensions(new Emitter<ConfigurationRegistry>());
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _loggerId: string,
          _tokenId: string,
          _taskId: string,
        ) => Promise<void>
      >(handler);
    const result = await handle(
      undefined,
      'internal1',
      { key1: 'value1', key2: 42 } as unknown as ProviderContainerConnectionInfo | PlayKubeInfo,
      'logger1',
      'token1',
      'task1',
    );
    expect(result).toEqual({ result: undefined });
    expect(onEndMock).toHaveBeenCalled();
    expect(errorMock).not.toHaveBeenCalled();
    expect(originalTask.status).toEqual('success');
    expect(originalTask.error).toEqual('');
  });

  test(`${methodName} is called and is rejected`, async () => {
    const rejectError = new Error('an error');
    (ProviderRegistry.prototype[methodName] as unknown as MockInstance).mockRejectedValue(rejectError);
    const onEndMock = vi.fn();
    const errorMock = vi.fn();
    vi.spyOn(pluginSystem, 'getLogHandler').mockReturnValue({
      onEnd: onEndMock,
      error: errorMock,
    } as unknown as LoggerWithEnd);
    await pluginSystem.initExtensions(new Emitter<ConfigurationRegistry>());
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _loggerId: string,
          _tokenId: string,
          _taskId: string,
        ) => Promise<void>
      >(handler);
    const result = await handle(
      undefined,
      'internal1',
      { key1: 'value1', key2: 42 } as unknown as ProviderContainerConnectionInfo | PlayKubeInfo,
      'logger1',
      'token1',
      'task1',
    );
    expect(result).toEqual({
      error: rejectError,
    });
    expect(onEndMock).toHaveBeenCalled();
    expect(errorMock).toHaveBeenCalledWith(rejectError);
    expect(originalTask.status).toEqual('in-progress');
    expect(originalTask.error).toEqual('Something went wrong while trying to create provider: Error: an error');
  });
});

describe.each<{
  handler: string;
  methodName: 'startProviderConnection' | 'stopProviderConnection' | 'deleteProviderConnection';
  expectedTitle: string;
  expectedActionName: string;
  expectedError: string;
}>([
  {
    handler: 'provider-registry:startProviderConnectionLifecycle',
    methodName: 'startProviderConnection',
    expectedTitle: 'Starting name1',
    expectedActionName: 'Go to task >',
    expectedError: 'Something went wrong while starting container provider: Error: an error',
  },
  {
    handler: 'provider-registry:stopProviderConnectionLifecycle',
    methodName: 'stopProviderConnection',
    expectedTitle: 'Stopping name1',
    expectedActionName: 'Go to task >',
    expectedError: 'Something went wrong while stopping container provider: Error: an error',
  },
  {
    handler: 'provider-registry:deleteProviderConnectionLifecycle',
    methodName: 'deleteProviderConnection',
    expectedTitle: 'Deleting name1',
    expectedActionName: 'Go to resources',
    expectedError: 'Something went wrong while trying to delete name1',
  },
])('$handler', async ({ handler, methodName, expectedTitle, expectedActionName, expectedError }) => {
  let originalTask: Task;

  beforeEach(() => {
    originalTask = {
      status: 'in-progress',
      error: '',
    } as unknown as Task;
    vi.mocked(TaskManager.prototype.createTask).mockReturnValue(originalTask);
  });

  test('createTask is called', async () => {
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _loggerId: string,
        ) => Promise<void>
      >(handler);
    const connectionInfo = { name: 'name1' } as unknown as ProviderContainerConnectionInfo;
    await handle(undefined, 'internal1', connectionInfo, 'logger');
    expect(TaskManager.prototype.createTask).toHaveBeenCalledOnce();
    const params = vi.mocked(TaskManager.prototype.createTask).mock.calls[0]?.[0];
    assert(params, 'params should be defined');
    expect(params.title).toEqual(expectedTitle);
    expect(params.action?.name).toEqual(expectedActionName);

    const execute = params.action?.execute;
    assert(execute, 'execute should be defined');
    execute(new TaskImpl('task1id', 'task1name'));
    // delete navigates back to resources, start/stop deep-link to the connection page
    if (expectedActionName === 'Go to resources') {
      expect(NavigationManager.prototype.navigateToResources).toHaveBeenCalledOnce();
    } else {
      expect(NavigationManager.prototype.navigateToProviderConnection).toHaveBeenCalledWith(
        'internal1',
        connectionInfo,
      );
    }
  });

  test(`${methodName} is called and is resolved`, async () => {
    (ProviderRegistry.prototype[methodName] as unknown as MockInstance).mockResolvedValue(undefined);
    const onEndMock = vi.fn();
    const errorMock = vi.fn();
    vi.spyOn(pluginSystem, 'getLogHandler').mockReturnValue({
      onEnd: onEndMock,
      error: errorMock,
    } as unknown as LoggerWithEnd);
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _loggerId: string,
        ) => Promise<void>
      >(handler);
    const result = await handle(undefined, 'internal1', { name: 'name1' } as unknown as PlayKubeInfo, 'logger');
    expect(result).toEqual({ result: undefined });
    expect(onEndMock).toHaveBeenCalled();
    expect(errorMock).not.toHaveBeenCalled();
    expect(originalTask.status).toEqual('success');
    expect(originalTask.error).toEqual('');
  });

  test(`${methodName} is called and is rejected`, async () => {
    const rejectError = new Error('an error');
    (ProviderRegistry.prototype[methodName] as unknown as MockInstance).mockRejectedValue(rejectError);
    const onEndMock = vi.fn();
    const errorMock = vi.fn();
    vi.spyOn(pluginSystem, 'getLogHandler').mockReturnValue({
      onEnd: onEndMock,
      error: errorMock,
    } as unknown as LoggerWithEnd);
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _loggerId: string,
        ) => Promise<void>
      >(handler);
    const result = await handle(undefined, 'internal1', { name: 'name1' } as unknown as PlayKubeInfo, 'logger');
    expect(result).toEqual({
      error: rejectError,
    });
    expect(onEndMock).toHaveBeenCalled();
    expect(errorMock).toHaveBeenCalledWith(rejectError);
    expect(originalTask.status).toEqual('in-progress');
    expect(originalTask.error).toEqual(expectedError);
  });
});

describe.each<{
  handler: string;
  methodName: 'editProviderConnection';
}>([
  {
    handler: 'provider-registry:editProviderConnectionLifecycle',
    methodName: 'editProviderConnection',
  },
])('$handler', async ({ handler, methodName }) => {
  let originalTask: Task;

  beforeEach(() => {
    originalTask = {
      status: 'in-progress',
      error: '',
    } as unknown as Task;
    vi.mocked(TaskManager.prototype.createTask).mockReturnValue(originalTask);
  });

  test('createTask is called', async () => {
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _options: unknown,
          _loggerId: string,
          _tokenId: string,
          _taskId: string,
        ) => Promise<void>
      >(handler);
    await handle(
      undefined,
      'internal1',
      { name: 'name1' } as unknown as ProviderContainerConnectionInfo,
      { key1: 'value1', key2: 42 },
      'logger1',
      'token1',
      'task1',
    );
    expect(TaskManager.prototype.createTask).toHaveBeenCalledOnce();
    const params = vi.mocked(TaskManager.prototype.createTask).mock.calls[0]?.[0];
    assert(params, 'params should be defined');
    expect(params.title).toEqual('Updating name1 provider');
    expect(params.action?.name).toEqual('Open task');

    const execute = params.action?.execute;
    assert(execute, 'execute should be defined');
    execute(new TaskImpl('task1id', 'task1name'));
    expect(NavigationManager.prototype.navigateToProviderTask).toHaveBeenCalledOnce();
    expect(NavigationManager.prototype.navigateToProviderTask).toHaveBeenCalledWith('internal1', 'task1');
  });

  test(`${methodName} is called and is resolved`, async () => {
    (ProviderRegistry.prototype[methodName] as unknown as MockInstance).mockResolvedValue(undefined);
    const onEndMock = vi.fn();
    const errorMock = vi.fn();
    vi.spyOn(pluginSystem, 'getLogHandler').mockReturnValue({
      onEnd: onEndMock,
      error: errorMock,
    } as unknown as LoggerWithEnd);
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _options: unknown,
          _loggerId: string,
          _tokenId: string,
          _taskId: string,
        ) => Promise<void>
      >(handler);
    const result = await handle(
      undefined,
      'internal1',
      { name: 'name1' } as unknown as ProviderContainerConnectionInfo,
      { key1: 'value1', key2: 42 },
      'logger1',
      'token1',
      'task1',
    );
    expect(result).toEqual({ result: undefined });
    expect(onEndMock).toHaveBeenCalled();
    expect(errorMock).not.toHaveBeenCalled();
    expect(originalTask.status).toEqual('success');
    expect(originalTask.error).toEqual('');
  });

  test(`${methodName} is called and is rejected`, async () => {
    const rejectError = new Error('an error');
    (ProviderRegistry.prototype[methodName] as unknown as MockInstance).mockRejectedValue(rejectError);
    const onEndMock = vi.fn();
    const errorMock = vi.fn();
    vi.spyOn(pluginSystem, 'getLogHandler').mockReturnValue({
      onEnd: onEndMock,
      error: errorMock,
    } as unknown as LoggerWithEnd);
    const handle =
      getHandler<
        (
          _event: unknown,
          _providerId: string,
          _connectionInfo: ProviderContainerConnectionInfo | PlayKubeInfo,
          _options: unknown,
          _loggerId: string,
          _tokenId: string,
          _taskId: string,
        ) => Promise<void>
      >(handler);
    const result = await handle(
      undefined,
      'internal1',
      { name: 'name1' } as unknown as ProviderContainerConnectionInfo,
      { key1: 'value1', key2: 42 },
      'logger1',
      'token1',
      'task1',
    );
    expect(result).toEqual({
      error: rejectError,
    });
    expect(onEndMock).toHaveBeenCalled();
    expect(errorMock).toHaveBeenCalledWith(rejectError);
    expect(originalTask.status).toEqual('in-progress');
    expect(originalTask.error).toEqual('Something went wrong while updating container provider: Error: an error');
  });
});

describe('Log race condition fix', () => {
  test('should not throw error when window is destroyed during shutdown', () => {
    vi.spyOn(pluginSystem, 'getWebContentsSender').mockImplementation(() => {
      throw new Error('Unable to find the main window');
    });
    pluginSystem.setQuitting(false);

    const logger = pluginSystem.getLogHandler('test-channel', 'test-logger');
    expect(() => {
      logger.log('test');
      logger.warn('test');
      logger.error('test');
      logger.onEnd();
    }).not.toThrow();
  });
});

describe('getWebContentsSender', () => {
  test('should return the webContents of the first window that is not destroyed', () => {
    const destroyedWebContents = { send: vi.fn() } as unknown as WebContents;
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      { isDestroyed: () => true, webContents: destroyedWebContents } as unknown as BrowserWindow,
      { isDestroyed: () => false, webContents } as unknown as BrowserWindow,
    ]);

    expect(pluginSystem.getWebContentsSender()).toBe(webContents);
  });

  // the windows are built lazily: test.each evaluates its table before beforeEach assigns webContents
  test.each([
    // all the windows are gone, like when the application has been closed
    { scenario: 'there is no window anymore', getWindows: (): BrowserWindow[] => [] },
    // the windows are still listed while being closed, but they are already destroyed
    {
      scenario: 'every window is destroyed',
      getWindows: (): BrowserWindow[] => [{ isDestroyed: () => true, webContents } as unknown as BrowserWindow],
    },
    // the renderer is gone, so the window is still alive but it has nothing to send to anymore
    {
      scenario: 'the web contents of the window are destroyed',
      getWindows: (): BrowserWindow[] => [
        { isDestroyed: () => false, webContents: { isDestroyed: () => true } } as unknown as BrowserWindow,
      ],
    },
  ])('should return a sender doing nothing when $scenario', ({ getWindows }) => {
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue(getWindows());

    const sender = pluginSystem.getWebContentsSender();

    expect(sender).not.toBe(webContents);
    expect(sender.isDestroyed()).toBe(true);
    expect(() => sender.send('api-sender', 'foo')).not.toThrow();
    expect(() => sender.on('dom-ready', vi.fn())).not.toThrow();
  });
});

describe('getRequiredWebContentsSender', () => {
  test('should return the webContents of the first window that is not destroyed', () => {
    const destroyedWebContents = { send: vi.fn() } as unknown as WebContents;
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([
      { isDestroyed: () => true, webContents: destroyedWebContents } as unknown as BrowserWindow,
      { isDestroyed: () => false, webContents } as unknown as BrowserWindow,
    ]);

    expect(pluginSystem.getRequiredWebContentsSender()).toBe(webContents);
  });

  test.each([
    { scenario: 'there is no window anymore', getWindows: (): BrowserWindow[] => [] },
    {
      scenario: 'every window is destroyed',
      getWindows: (): BrowserWindow[] => [{ isDestroyed: () => true, webContents } as unknown as BrowserWindow],
    },
    {
      scenario: 'the web contents of the window are destroyed',
      getWindows: (): BrowserWindow[] => [
        { isDestroyed: () => false, webContents: { isDestroyed: () => true } } as unknown as BrowserWindow,
      ],
    },
  ])('should throw when $scenario', ({ getWindows }) => {
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue(getWindows());

    expect(() => pluginSystem.getRequiredWebContentsSender()).toThrow('Unable to find the main window');
  });
});

describe('container-provider-registry:logsContainer', () => {
  type LogsContainerHandler = (
    _event: unknown,
    logsParams: { engineId: string; containerId: string; onDataId: number },
  ) => Promise<void>;

  test('should keep streaming container logs when there is no window anymore', async () => {
    // the window is gone, like when the application is being closed
    vi.mocked(BrowserWindow.getAllWindows).mockReturnValue([]);

    const logsContainerMock = vi.mocked(ContainerProviderRegistry.prototype.logsContainer).mockResolvedValue(undefined);

    const handle = getHandler<LogsContainerHandler>('container-provider-registry:logsContainer');
    await handle(undefined, { engineId: 'engine1', containerId: 'container1', onDataId: 1 });

    // the handler asked the registry for the logs, renaming containerId to id
    expect(logsContainerMock).toHaveBeenCalledWith(expect.objectContaining({ engineId: 'engine1', id: 'container1' }));

    // it gave the registry the callback sending the logs to the renderer
    const logsParams = logsContainerMock.mock.calls[0]?.[0];
    assert(logsParams, 'logsContainer should have been called');
    const sendLogLineToRenderer = logsParams.callback;

    // sending a log line was throwing 'Unable to find the main window' before, and it should not throw anymore
    expect(() => sendLogLineToRenderer('data', 'a log line')).not.toThrow();
  });
});

describe('container-provider-registry:buildImage', () => {
  type BuildImageHandler = (
    _listener: IpcMainInvokeEvent,
    containerBuildContextDirectory: string,
    relativeContainerfilePath: string,
    imageName: string | undefined,
    platform: string,
    selectedProvider: ProviderContainerConnectionInfo,
    onDataCallbacksBuildImageId: number,
    cancellableTokenId?: number,
    buildargs?: { [key: string]: string },
    taskId?: number,
    target?: string,
  ) => Promise<unknown>;

  let handle: BuildImageHandler;
  let createTaskMock: MockInstance;

  beforeEach(() => {
    handle = getHandler<BuildImageHandler>('container-provider-registry:buildImage');
    createTaskMock = vi.mocked(TaskManager.prototype.createTask);
  });

  test('handler should create a task', async () => {
    expect(createTaskMock).not.toHaveBeenCalled();

    await handle(
      {} as unknown as IpcMainInvokeEvent,
      'containerBuildContextDirectory',
      'relativeContainerfilePath',
      'imageName',
      'platform',
      {} as ProviderContainerConnectionInfo,
      1,
    );

    expect(createTaskMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        title: expect.any(String),
        action: {
          name: 'Go to task >',
          execute: expect.any(Function),
        },
      }),
    );
  });

  test('task created should have appropriate title', async () => {
    await handle(
      {} as unknown as IpcMainInvokeEvent,
      'containerBuildContextDirectory',
      'relativeContainerfilePath',
      'imageName',
      'platform',
      {} as ProviderContainerConnectionInfo,
      1,
    );

    expect(createTaskMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        title: 'Building image imageName',
      }),
    );
  });

  test('build image with target options should specify it in the task title', async () => {
    await handle(
      {} as unknown as IpcMainInvokeEvent,
      'containerBuildContextDirectory',
      'relativeContainerfilePath',
      'imageName',
      'platform',
      {} as ProviderContainerConnectionInfo,
      1,
      undefined,
      undefined,
      undefined,
      'dummy-target',
    );

    expect(createTaskMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        title: 'Building image imageName (dummy-target)',
      }),
    );
  });

  test('task created should have correct action', async () => {
    const navigateToImageBuildMock = vi.mocked(NavigationManager.prototype.navigateToImageBuild);

    await handle(
      {} as unknown as IpcMainInvokeEvent,
      'containerBuildContextDirectory',
      'relativeContainerfilePath',
      'imageName',
      'platform',
      {} as ProviderContainerConnectionInfo,
      1,
      undefined,
      undefined,
      55, // taskId
    );

    expect(navigateToImageBuildMock).not.toHaveBeenCalled();

    const action: TaskAction | undefined = createTaskMock.mock.calls[0]?.[0]?.action;
    assert(action, 'task action should be defined');

    action.execute({} as Task);

    await vi.waitFor(() => {
      expect(navigateToImageBuildMock).toHaveBeenCalledExactlyOnceWith(55);
    });
  });
});

describe('checkImageUpdateStatus handler', () => {
  type CheckImageUpdateStatusHandler = (
    _event: unknown,
    _imageReference: string,
    _imageTag: string,
    _localDigests: string[],
  ) => Promise<{ result: { status: string; updateAvailable: boolean; remoteDigest?: string; message: string } }>;

  test('should check image update status and return result', async () => {
    const handle = getHandler<CheckImageUpdateStatusHandler>('image-registry:checkImageUpdateStatus');

    const imageReference = 'docker.io/library/alpine:latest';
    const imageTag = 'latest';
    const localDigests = ['alpine@sha256:abc123'];

    vi.mocked(ImageRegistry.prototype.checkImageUpdateStatus).mockResolvedValue({
      status: 'normal',
      updateAvailable: true,
      remoteDigest: 'sha256:def456',
      message: 'A newer version is available',
    });

    const result = await handle(undefined, imageReference, imageTag, localDigests);

    expect(result.result).toEqual({
      status: 'normal',
      updateAvailable: true,
      remoteDigest: 'sha256:def456',
      message: 'A newer version is available',
    });
    expect(ImageRegistry.prototype.checkImageUpdateStatus).toHaveBeenCalledWith(imageReference, imageTag, localDigests);
  });

  test('should return update not available when image is latest', async () => {
    const handle = getHandler<CheckImageUpdateStatusHandler>('image-registry:checkImageUpdateStatus');

    const imageReference = 'docker.io/library/alpine:latest';
    const imageTag = 'latest';
    const localDigests = ['alpine@sha256:abc123'];

    vi.mocked(ImageRegistry.prototype.checkImageUpdateStatus).mockResolvedValue({
      status: 'normal',
      updateAvailable: false,
      message: 'Image is already the latest version',
    });

    const result = await handle(undefined, imageReference, imageTag, localDigests);

    expect(result.result).toEqual({
      status: 'normal',
      updateAvailable: false,
      message: 'Image is already the latest version',
    });
  });
});

describe('updateImages handler', () => {
  test('should delegate image updates to the container provider registry', async () => {
    const handle = getHandler<
      (
        _event: unknown,
        images: ImageUpdateInfo[],
      ) => Promise<{ result: Awaited<ReturnType<ContainerProviderRegistry['updateImages']>> }>
    >('container-provider-registry:updateImages');

    const images: ImageUpdateInfo[] = [
      { engineId: 'podman.podman-machine-default', image: 'nginx', tag: 'latest' },
      { engineId: 'podman.podman-machine-default', image: 'redis', tag: '7' },
    ];
    const expectedResults = [
      { imageRef: 'nginx', updated: true, status: 'updated', message: 'Image updated successfully' },
      { imageRef: 'redis', updated: false, status: 'normal', message: 'Already up to date' },
    ] as const;
    vi.mocked(ContainerProviderRegistry.prototype.updateImages).mockResolvedValue([...expectedResults]);

    const result = await handle(undefined, images);

    expect(ContainerProviderRegistry.prototype.updateImages).toHaveBeenCalledExactlyOnceWith(images, undefined);
    expect(result.result).toEqual(expectedResults);
  });

  test('should forward an abort signal when a cancellation token id is passed', async () => {
    const createTokenHandler = getHandler<() => Promise<{ result: number }>>('cancellableTokenSource:create');
    const cancelTokenHandler = getHandler<(_event: unknown, id: number) => Promise<void>>('cancellableToken:cancel');
    const { result: tokenId } = await createTokenHandler();

    const handle = getHandler<
      (
        _event: unknown,
        images: ImageUpdateInfo[],
        cancellableTokenId?: number,
      ) => Promise<{ result: Awaited<ReturnType<ContainerProviderRegistry['updateImages']>> }>
    >('container-provider-registry:updateImages');

    const images: ImageUpdateInfo[] = [{ engineId: 'podman.podman-machine-default', image: 'nginx', tag: 'latest' }];
    vi.mocked(ContainerProviderRegistry.prototype.updateImages).mockResolvedValue([]);

    await handle(undefined, images, tokenId);

    expect(ContainerProviderRegistry.prototype.updateImages).toHaveBeenCalledOnce();
    const abortSignal = vi.mocked(ContainerProviderRegistry.prototype.updateImages).mock.calls[0]?.[1];
    expect(abortSignal).toBeInstanceOf(AbortSignal);
    expect(abortSignal?.aborted).toBe(false);

    await cancelTokenHandler(undefined, tokenId);

    expect(abortSignal?.aborted).toBe(true);
  });
});

describe('container-provider-registry:playKube', () => {
  type PlayKubeHandler = (
    _listener: undefined,
    kubernetesYamlFilePath: string,
    selectedProvider: ProviderContainerConnectionInfo,
    options?: {
      build?: boolean;
      replace?: boolean;
      cancellableTokenId?: number;
    },
  ) => Promise<{ result: PlayKubeInfo | { error: Error } }>;

  const PLAY_KUBE_INFO_MOCK: PlayKubeInfo = {
    Pods: [],
    RmReport: [],
    Secrets: [],
    StopReport: [],
    Volumes: [],
  };

  const PROVIDER_CONTAINER_CONNECTION_INFO_MOCK: ProviderContainerConnectionInfo = {
    name: 'Dummy',
    type: 'podman',
    connectionType: 'container',
    displayName: 'Podman',
    status: 'started',
    endpoint: {
      socketPath: '.sock',
    },
    canStart: false,
    canStop: false,
    canEdit: false,
    canDelete: false,
  };

  test('should call ContainerProviderRegistry#playKube', async () => {
    const handle = getHandler<PlayKubeHandler>('container-provider-registry:playKube');

    vi.mocked(ContainerProviderRegistry.prototype.playKube).mockResolvedValue(PLAY_KUBE_INFO_MOCK);

    const result = await handle(undefined, '/foo/bar.yaml', PROVIDER_CONTAINER_CONNECTION_INFO_MOCK, {
      replace: true,
    });
    assert(!('error' in result));

    expect(result.result).toEqual(PLAY_KUBE_INFO_MOCK);
    expect(ContainerProviderRegistry.prototype.playKube).toHaveBeenCalledExactlyOnceWith(
      '/foo/bar.yaml',
      PROVIDER_CONTAINER_CONNECTION_INFO_MOCK,
      { replace: true },
    );
  });

  test('should create a task', async () => {
    const handle = getHandler<PlayKubeHandler>('container-provider-registry:playKube');

    vi.mocked(ContainerProviderRegistry.prototype.playKube).mockResolvedValue(PLAY_KUBE_INFO_MOCK);

    await handle(undefined, '/foo/bar.yaml', PROVIDER_CONTAINER_CONNECTION_INFO_MOCK);

    expect(TaskManager.prototype.createTask).toHaveBeenCalledExactlyOnceWith({
      title: 'Podman Play Kube',
      cancellable: false,
      cancellationTokenSourceId: undefined,
    });

    const createdTask = vi.mocked(TaskManager.prototype.createTask).mock.results[0]?.value;
    expect(createdTask.status).toBe('success');
  });

  test('should create a cancellable task if cancellableTokenId is provided', async () => {
    const createTokenHandler = getHandler<() => Promise<{ result: number }>>('cancellableTokenSource:create');
    const { result: cancellationTokenId } = await createTokenHandler();

    const playKubeHandler = getHandler<PlayKubeHandler>('container-provider-registry:playKube');

    vi.mocked(ContainerProviderRegistry.prototype.playKube).mockResolvedValue(PLAY_KUBE_INFO_MOCK);

    await playKubeHandler(undefined, '/foo/bar.yaml', PROVIDER_CONTAINER_CONNECTION_INFO_MOCK, {
      cancellableTokenId: cancellationTokenId,
    });

    expect(TaskManager.prototype.createTask).toHaveBeenCalledExactlyOnceWith({
      title: 'Podman Play Kube',
      cancellable: true,
      cancellationTokenSourceId: cancellationTokenId,
    });

    const createdTask = vi.mocked(TaskManager.prototype.createTask).mock.results[0]?.value;
    expect(createdTask.status).toBe('success');

    const kubePlayOptions = vi.mocked(ContainerProviderRegistry.prototype.playKube).mock.calls[0]?.[2];
    expect(kubePlayOptions?.abortSignal).toBeDefined();
    expect(kubePlayOptions?.abortSignal).toBeInstanceOf(AbortSignal);
  });

  test('task should be failed if ContainerProviderRegistry#kubePlay throw an error', async () => {
    const handle = getHandler<PlayKubeHandler>('container-provider-registry:playKube');

    vi.mocked(ContainerProviderRegistry.prototype.playKube).mockRejectedValue(new Error('Dummy Foo'));

    const result = await handle(undefined, '/foo/bar.yaml', PROVIDER_CONTAINER_CONNECTION_INFO_MOCK);
    assert('error' in result);
    assert(result.error instanceof Error);
    expect(result?.error?.message).toBe('Dummy Foo');

    expect(TaskManager.prototype.createTask).toHaveBeenCalledExactlyOnceWith({
      title: 'Podman Play Kube',
      cancellable: false,
      cancellationTokenSourceId: undefined,
    });

    const createdTask = vi.mocked(TaskManager.prototype.createTask).mock.results[0]?.value;
    expect(createdTask.status).toBe('failure');
    expect(createdTask.error).toBe('Error: Dummy Foo');
  });
});

test('navigation:getSearchableRoutes handler should delegate to navigationManager', async () => {
  const mockRoutes = [
    { routeId: 'ext.dashboard', label: 'Dashboard' },
    { routeId: 'ext.models', label: 'Models', icon: 'icon.png' },
  ];
  vi.mocked(NavigationManager.prototype.getSearchableRoutes).mockReturnValue(mockRoutes);

  const handle = getHandler<() => Promise<{ result: unknown }>>('navigation:getSearchableRoutes');
  const result = await handle();

  expect(NavigationManager.prototype.getSearchableRoutes).toHaveBeenCalled();
  expect(result).toEqual({ result: mockRoutes });
});
