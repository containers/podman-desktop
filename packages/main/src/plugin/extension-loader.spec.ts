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

import { beforeAll, beforeEach, test, expect, vi } from 'vitest';
import type { CommandRegistry } from './command-registry';
import type { ConfigurationRegistry } from './configuration-registry';
import type { ContainerProviderRegistry } from './container-registry';
import type { Dialogs } from './dialog-impl';
import { ExtensionLoader } from './extension-loader';
import type { FilesystemMonitoring } from './filesystem-monitoring';
import type { ImageRegistry } from './image-registry';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry';
import type { KubernetesClient } from './kubernetes-client';
import type { MenuRegistry } from './menu-registry';
import type { NotificationImpl } from './notification-impl';
import type { ProgressImpl } from './progress-impl';
import type { ProviderRegistry } from './provider-registry';
import type { Proxy } from './proxy';
import type { StatusBarRegistry } from './statusbar/statusbar-registry';
import type { TrayMenuRegistry } from './tray-menu-registry';
import * as fs from 'node:fs';
import * as path from 'node:path';

class TestExtensionLoader extends ExtensionLoader {
  public async setupScanningDirectory(): Promise<void> {
    return super.setupScanningDirectory();
  }

  setPluginsScanDirectory(path: string): void {
    this.pluginsScanDirectory = path;
  }

  setWatchTimeout(timeout: number): void {
    this.watchTimeout = timeout;
  }
}

let extensionLoader: TestExtensionLoader;

const commandRegistry: CommandRegistry = {} as unknown as CommandRegistry;

const menuRegistry: MenuRegistry = {} as unknown as MenuRegistry;

const providerRegistry: ProviderRegistry = {} as unknown as ProviderRegistry;

const configurationRegistry: ConfigurationRegistry = {} as unknown as ConfigurationRegistry;

const imageRegistry: ImageRegistry = {} as unknown as ImageRegistry;

const apiSender: any = {};

const trayMenuRegistry: TrayMenuRegistry = {} as unknown as TrayMenuRegistry;

const dialogs: Dialogs = {} as unknown as Dialogs;

const progress: ProgressImpl = {} as ProgressImpl;

const notifications: NotificationImpl = {} as unknown as NotificationImpl;

const statusBarRegistry: StatusBarRegistry = {} as unknown as StatusBarRegistry;

const kubernetesClient: KubernetesClient = {} as unknown as KubernetesClient;

const fileSystemMonitoring: FilesystemMonitoring = {} as unknown as FilesystemMonitoring;

const proxy: Proxy = {} as unknown as Proxy;

const containerProviderRegistry: ContainerProviderRegistry = {} as unknown as ContainerProviderRegistry;

const inputQuickPickRegistry: InputQuickPickRegistry = {} as unknown as InputQuickPickRegistry;

/* eslint-disable @typescript-eslint/no-empty-function */
beforeAll(() => {
  extensionLoader = new TestExtensionLoader(
    commandRegistry,
    menuRegistry,
    providerRegistry,
    configurationRegistry,
    imageRegistry,
    apiSender,
    trayMenuRegistry,
    dialogs,
    progress,
    notifications,
    statusBarRegistry,
    kubernetesClient,
    fileSystemMonitoring,
    proxy,
    containerProviderRegistry,
    inputQuickPickRegistry,
  );
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Should watch for files and load them at startup', async () => {
  const fakeDirectory = '/fake/path/scanning';

  // fake scanning property
  extensionLoader.setPluginsScanDirectory(fakeDirectory);

  vi.mock('node:fs');
  // mock fs.watch
  const fsWatchMock = vi.spyOn(fs, 'watch');
  fsWatchMock.mockReturnValue({} as fs.FSWatcher);

  // mock fs.existsSync
  const fsExistsSyncMock = vi.spyOn(fs, 'existsSync');
  fsExistsSyncMock.mockReturnValue(true);

  // mock fs.promises.readdir
  const readdirMock = vi.spyOn(fs.promises, 'readdir');

  const ent1 = {
    isFile: () => true,
    isDirectory: () => false,
    name: 'foo.cdix',
  } as unknown as fs.Dirent;

  const ent2 = {
    isFile: () => true,
    isDirectory: () => false,
    name: 'bar.foo',
  } as unknown as fs.Dirent;

  const ent3 = {
    isFile: () => false,
    isDirectory: () => true,
    name: 'baz',
  } as unknown as fs.Dirent;
  readdirMock.mockResolvedValue([ent1, ent2, ent3]);

  // mock loadPackagedFile
  const loadPackagedFileMock = vi.spyOn(extensionLoader, 'loadPackagedFile');
  loadPackagedFileMock.mockResolvedValue();

  await extensionLoader.setupScanningDirectory();

  // expect to load only one file (other are invalid files/folder)
  expect(loadPackagedFileMock).toBeCalledWith(path.join(fakeDirectory, 'foo.cdix'));

  // expect watcher is setup
  expect(fsWatchMock).toBeCalledWith(fakeDirectory, expect.anything());
});

test('Should load file from watching scanning folder', async () => {
  const fakeDirectory = '/fake/path/scanning';
  const rootedFakeDirectory = path.resolve(fakeDirectory);

  // fake scanning property
  extensionLoader.setPluginsScanDirectory(fakeDirectory);

  let watchFilename: fs.PathLike | undefined = undefined;
  let watchListener: fs.WatchListener<string> = {} as unknown as fs.WatchListener<string>;

  // reduce timeout delay for tests
  extensionLoader.setWatchTimeout(50);

  vi.mock('node:fs');
  // mock fs.watch
  const fsWatchMock = vi.spyOn(fs, 'watch');
  fsWatchMock.mockImplementation((filename: fs.PathLike, listener?: fs.WatchListener<string>): fs.FSWatcher => {
    watchFilename = filename;
    if (listener) {
      watchListener = listener;
    }
    return {} as fs.FSWatcher;
  });

  // mock fs.existsSync
  const fsExistsSyncMock = vi.spyOn(fs, 'existsSync');
  fsExistsSyncMock.mockReturnValue(true);

  // mock fs.promises.readdir
  const readdirMock = vi.spyOn(fs.promises, 'readdir');
  readdirMock.mockResolvedValue([]);

  // mock loadPackagedFile
  const loadPackagedFileMock = vi.spyOn(extensionLoader, 'loadPackagedFile');
  loadPackagedFileMock.mockResolvedValue();

  await extensionLoader.setupScanningDirectory();

  // no loading for now as no files in the folder
  expect(loadPackagedFileMock).not.toBeCalled();

  // expect watcher is setup
  expect(fsWatchMock).toBeCalledWith(fakeDirectory, expect.anything());
  expect(watchFilename).toBeDefined();
  expect(watchListener).toBeDefined();

  expect(watchFilename).toBe(fakeDirectory);

  // call the watcher callback
  if (watchListener) {
    watchListener('rename', 'watch.cdix');
  }

  // wait more than the watchListener timeout
  await new Promise(resolve => setTimeout(resolve, 100));

  // expect to load only one file (other are invalid files/folder)
  expect(loadPackagedFileMock).toBeCalledWith(path.resolve(rootedFakeDirectory, 'watch.cdix'));
});
