/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import * as fs from 'node:fs';
import { readFile, realpath } from 'node:fs/promises';
import * as path from 'node:path';

import type * as containerDesktopAPI from '@podman-desktop/api';
import { app } from 'electron';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ContributionManager } from '/@/plugin/contribution-manager.js';
import type { KubeGeneratorRegistry } from '/@/plugin/kube-generator-registry.js';
import { NavigationManager } from '/@/plugin/navigation/navigation-manager.js';
import type { WebviewRegistry } from '/@/plugin/webview/webview-registry.js';
import type { ContributionInfo } from '/@api/contribution-info.js';
import { NavigationPage } from '/@api/navigation-page.js';
import type { WebviewInfo } from '/@api/webview-info.js';

import { getBase64Image } from '../util.js';
import type { ApiSenderType } from './api.js';
import type { AuthenticationImpl } from './authentication.js';
import type { CliToolRegistry } from './cli-tool-registry.js';
import type { ColorRegistry } from './color-registry.js';
import type { CommandRegistry } from './command-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import { Context } from './context/context.js';
import type { CustomPickRegistry } from './custompick/custompick-registry.js';
import type { DialogRegistry } from './dialog-registry.js';
import type { Directories } from './directories.js';
import type { ActivatedExtension, AnalyzedExtension, RequireCacheDict } from './extension-loader.js';
import { ExtensionLoader } from './extension-loader.js';
import type { FilesystemMonitoring } from './filesystem-monitoring.js';
import type { IconRegistry } from './icon-registry.js';
import type { ImageCheckerImpl } from './image-checker.js';
import type { ImageFilesRegistry } from './image-files-registry.js';
import type { ImageRegistry } from './image-registry.js';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import type { KubernetesClient } from './kubernetes-client.js';
import type { MenuRegistry } from './menu-registry.js';
import type { MessageBox } from './message-box.js';
import type { NotificationRegistry } from './notification-registry.js';
import type { OnboardingRegistry } from './onboarding-registry.js';
import type { ProgressImpl } from './progress-impl.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { Proxy } from './proxy.js';
import type { ExtensionSecretStorage, SafeStorageRegistry } from './safe-storage/safe-storage-registry.js';
import type { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import type { Telemetry } from './telemetry/telemetry.js';
import type { TrayMenuRegistry } from './tray-menu-registry.js';
import type { IDisposable } from './types/disposable.js';
import { Disposable } from './types/disposable.js';
import { Uri } from './types/uri.js';
import { Exec } from './util/exec.js';
import type { ViewRegistry } from './view-registry.js';

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

  getExtensionState(): Map<string, string> {
    return this.extensionState;
  }
  getActivatedExtensions(): Map<string, ActivatedExtension> {
    return this.activatedExtensions;
  }

  getExtensionStateErrors(): Map<string, unknown> {
    return this.extensionStateErrors;
  }

  doRequire(module: string): NodeRequire {
    return super.doRequire(module);
  }

  getRequireCache(): RequireCacheDict {
    return super.requireCache;
  }

  setActivatedExtension(extensionId: string, activatedExtension: ActivatedExtension): void {
    this.activatedExtensions.set(extensionId, activatedExtension);
  }

  setAnalyzedExtension(extensionId: string, analyzedExtension: AnalyzedExtension): void {
    this.analyzedExtensions.set(extensionId, analyzedExtension);
  }
}

let extensionLoader: TestExtensionLoader;

const commandRegistry: CommandRegistry = {} as unknown as CommandRegistry;

const menuRegistry: MenuRegistry = {} as unknown as MenuRegistry;

const kubernetesGeneratorRegistry: KubeGeneratorRegistry = {} as unknown as KubeGeneratorRegistry;

const providerRegistry: ProviderRegistry = {} as unknown as ProviderRegistry;

const configurationRegistryGetConfigurationMock = vi.fn();
const configurationRegistryUpdateConfigurationMock = vi.fn();
const configurationRegistry: ConfigurationRegistry = {
  getConfiguration: configurationRegistryGetConfigurationMock,
  updateConfigurationValue: configurationRegistryUpdateConfigurationMock,
} as unknown as ConfigurationRegistry;

const imageRegistry: ImageRegistry = {
  registerRegistry: vi.fn(),
} as unknown as ImageRegistry;

const apiSender: ApiSenderType = { send: vi.fn() } as unknown as ApiSenderType;

const trayMenuRegistry: TrayMenuRegistry = {} as unknown as TrayMenuRegistry;

const messageBox: MessageBox = {} as MessageBox;

const progress: ProgressImpl = {} as ProgressImpl;

const statusBarRegistry: StatusBarRegistry = {} as unknown as StatusBarRegistry;

const kubernetesClient: KubernetesClient = {} as unknown as KubernetesClient;

const fileSystemMonitoring: FilesystemMonitoring = {} as unknown as FilesystemMonitoring;

const proxy: Proxy = {} as unknown as Proxy;

const containerProviderRegistry: ContainerProviderRegistry = {
  containerExist: vi.fn(),
  imageExist: vi.fn(),
  volumeExist: vi.fn(),
  podExist: vi.fn(),
  listPods: vi.fn(),
  stopPod: vi.fn(),
  removePod: vi.fn(),
  getContainerStats: vi.fn(),
  stopContainerStats: vi.fn(),
  listImages: vi.fn(),
  podmanListImages: vi.fn(),
  listInfos: vi.fn(),
} as unknown as ContainerProviderRegistry;

const inputQuickPickRegistry: InputQuickPickRegistry = {} as unknown as InputQuickPickRegistry;

const customPickRegistry: CustomPickRegistry = {} as unknown as CustomPickRegistry;

const authenticationProviderRegistry: AuthenticationImpl = {
  registerAuthenticationProvider: vi.fn(),
} as unknown as AuthenticationImpl;

const iconRegistry: IconRegistry = {} as unknown as IconRegistry;

const onboardingRegistry: OnboardingRegistry = {} as unknown as OnboardingRegistry;

const telemetryTrackMock = vi.fn();
const telemetry: Telemetry = { track: telemetryTrackMock } as unknown as Telemetry;

const viewRegistry: ViewRegistry = {} as unknown as ViewRegistry;

const context: Context = new Context(apiSender);

const cliToolRegistry: CliToolRegistry = {
  createCliTool: vi.fn(),
} as unknown as CliToolRegistry;

const safeStorageRegistry: SafeStorageRegistry = {
  getExtensionStorage: vi.fn(),
} as unknown as SafeStorageRegistry;

const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
  getSafeStorageDirectory: () => '/fake-safe-storage-directory',
} as unknown as Directories;

const exec = new Exec(proxy);

const notificationRegistry: NotificationRegistry = {
  registerExtension: vi.fn(),
} as unknown as NotificationRegistry;

const imageCheckerImpl: ImageCheckerImpl = {
  registerImageCheckerProvider: vi.fn(),
} as unknown as ImageCheckerImpl;

const imageFilesImpl: ImageFilesRegistry = {
  registerImageFilesProvider: vi.fn(),
} as unknown as ImageFilesRegistry;

const contributionManager: ContributionManager = {
  listContributions: vi.fn(),
} as unknown as ContributionManager;

const webviewRegistry: WebviewRegistry = {
  listSimpleWebviews: vi.fn(),
  listWebviews: vi.fn(),
} as unknown as WebviewRegistry;

const navigationManager: NavigationManager = new NavigationManager(
  apiSender,
  containerProviderRegistry,
  contributionManager,
  providerRegistry,
  webviewRegistry,
);

const colorRegistry = {
  registerExtensionThemes: vi.fn(),
} as unknown as ColorRegistry;
const openDialogMock = vi.fn();
const saveDialogMock = vi.fn();

const dialogRegistry: DialogRegistry = {
  openDialog: openDialogMock,
  saveDialog: saveDialogMock,
} as unknown as DialogRegistry;

vi.mock('electron', () => {
  return {
    app: {
      getVersion: vi.fn(),
    },
  };
});

vi.mock('../util.js', async () => {
  return {
    getBase64Image: vi.fn(),
  };
});

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
    messageBox,
    progress,
    statusBarRegistry,
    kubernetesClient,
    fileSystemMonitoring,
    proxy,
    containerProviderRegistry,
    inputQuickPickRegistry,
    customPickRegistry,
    authenticationProviderRegistry,
    iconRegistry,
    onboardingRegistry,
    telemetry,
    viewRegistry,
    context,
    directories,
    exec,
    kubernetesGeneratorRegistry,
    cliToolRegistry,
    notificationRegistry,
    imageCheckerImpl,
    imageFilesImpl,
    navigationManager,
    webviewRegistry,
    colorRegistry,
    dialogRegistry,
    safeStorageRegistry,
  );
});

beforeEach(() => {
  telemetryTrackMock.mockImplementation(() => Promise.resolve());
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

test('Verify extension error leads to failed state', async () => {
  const id = 'extension.id';
  await extensionLoader.activateExtension(
    {
      id: id,
      name: 'id',
      path: 'dummy',
      api: {} as typeof containerDesktopAPI,
      mainPath: '',
      removable: false,
      manifest: {},
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
    },
    {
      activate: () => {
        throw Error('Failed');
      },
    },
  );
  expect(extensionLoader.getExtensionState().get(id)).toBe('failed');
});

test('Verify extension subscriptions are disposed when failed state reached', async () => {
  const id = 'extension.id';
  const disposableMock: containerDesktopAPI.Disposable = {
    dispose: vi.fn(),
  };
  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: vi.fn().mockReturnValue(5000),
  });
  await extensionLoader.activateExtension(
    {
      id: id,
      name: 'id',
      path: 'dummy',
      api: {} as typeof containerDesktopAPI,
      mainPath: '',
      removable: false,
      manifest: {},
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
    },
    {
      activate: (extensionContext: containerDesktopAPI.ExtensionContext) => {
        extensionContext.subscriptions.push(disposableMock);
        throw Error('Failed');
      },
    },
  );
  expect(extensionLoader.getExtensionState().get(id)).toBe('failed');
  expect(disposableMock.dispose).toHaveBeenCalledOnce();
});

test('Verify extension activate with a long timeout is flagged as error', async () => {
  const id = 'extension.id';

  // mock getConfiguration
  const getMock = vi.fn();
  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: getMock,
  });
  getMock.mockReturnValue(1);

  await extensionLoader.activateExtension(
    {
      id: id,
      name: 'id',
      path: 'dummy',
      api: {} as typeof containerDesktopAPI,
      mainPath: '',
      removable: false,
      manifest: {},
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
    },
    {
      activate: () => {
        // wait for 20 seconds
        return new Promise(resolve => setTimeout(resolve, 20000));
      },
    },
  );

  expect(extensionLoader.getExtensionStateErrors().get(id)).toBeDefined();
  expect(extensionLoader.getExtensionStateErrors().get(id)?.toString()).toContain(
    'Extension extension.id activation timed out after 1 seconds',
  );
  expect(extensionLoader.getExtensionState().get(id)).toBe('failed');
});

test('Verify extension load', async () => {
  const id = 'extension.foo';

  await extensionLoader.loadExtension({
    id: id,
    name: 'id',
    path: 'dummy',
    api: {} as typeof containerDesktopAPI,
    mainPath: '',
    removable: false,
    manifest: {
      version: '1.1',
    },
    subscriptions: [],
    readme: '',
    dispose: vi.fn(),
  });

  expect(telemetry.track).toBeCalledWith(
    'loadExtension.error',
    expect.objectContaining({ extensionId: id, extensionVersion: '1.1' }),
  );
});

test('Verify disable extension updates configuration', async () => {
  const ids = ['extension.foo'];

  configurationRegistryUpdateConfigurationMock.mockResolvedValue(Promise.resolve);
  extensionLoader.setDisabledExtensionIds(ids);

  expect(configurationRegistryUpdateConfigurationMock).toHaveBeenCalledWith('extensions.disabled', ids);
});

test('Verify enable extension updates configuration', async () => {
  const id = 'extension.no.foo';
  const before = ['a', id, 'b'];
  const after = ['a', 'b'];

  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: () => before,
  });
  configurationRegistryUpdateConfigurationMock.mockResolvedValue(Promise.resolve);
  extensionLoader.ensureExtensionIsEnabled(id);

  expect(configurationRegistryUpdateConfigurationMock).toHaveBeenCalledWith('extensions.disabled', after);
});

test('Verify stopping extension disables it', async () => {
  const id = 'extension.no.foo';
  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: () => [],
  });
  await extensionLoader.stopExtension(id);

  expect(configurationRegistryUpdateConfigurationMock).toHaveBeenCalledWith('extensions.disabled', [id]);
});

test('Verify starting extension enables it', async () => {
  const id = 'extension.no.foo';

  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: () => ['extension.no.foo'],
  });
  await extensionLoader.startExtension(id);

  expect(configurationRegistryUpdateConfigurationMock).toHaveBeenCalledWith('extensions.disabled', []);
});

test('Verify setExtensionsUpdates', async () => {
  // set the private field analyzedExtensions of extensionLoader
  const analyzedExtensions = new Map<string, AnalyzedExtension>();

  const extensionId = 'my.foo.extension';

  const analyzedExtension: AnalyzedExtension = {
    id: extensionId,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtension;
  analyzedExtensions.set(extensionId, analyzedExtension);

  extensionLoader['analyzedExtensions'] = analyzedExtensions;

  // get list of extensions
  const extensions = await extensionLoader.listExtensions();

  // check we have our extension
  expect(extensions.length).toBe(1);
  expect(extensions[0].id).toBe(extensionId);

  // check that update field is empty
  expect(extensions[0].update).toBeUndefined();

  // now call the update

  const ociUri = 'quay.io/extension';
  const newVersion = '2.0.0';
  extensionLoader.setExtensionsUpdates([
    {
      id: extensionId,
      version: newVersion,
      ociUri,
    },
  ]);

  // get list of extensions
  const extensionsAfterUpdate = await extensionLoader.listExtensions();
  // check we have our extension
  expect(extensionsAfterUpdate.length).toBe(1);
  expect(extensionsAfterUpdate[0].id).toBe(extensionId);

  // check that update field is set
  expect(extensionsAfterUpdate[0].update).toStrictEqual({
    ociUri: 'quay.io/extension',
    version: newVersion,
  });

  expect(apiSender.send).toBeCalledWith('extensions-updated');
});

test('Verify searchForCircularDependencies(analyzedExtensions);', async () => {
  // Check if missing dependencies are found
  const extensionId1 = 'foo.extension1';
  const extensionId2 = 'foo.extension2';
  const extensionId3 = 'foo.extension3';

  // extension1 has no dependencies
  const analyzedExtension1: AnalyzedExtension = {
    id: extensionId1,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension2 depends on extension 1 and extension 3
  const analyzedExtension2: AnalyzedExtension = {
    id: extensionId2,
    manifest: {
      extensionDependencies: [extensionId1, extensionId3],
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension3 depends on extension 2 (circular dependency)
  const analyzedExtension3: AnalyzedExtension = {
    id: extensionId3,
    manifest: {
      extensionDependencies: [extensionId2],
      name: 'hello',
    },
  } as AnalyzedExtension;

  expect(analyzedExtension1.circularDependencies).toBeUndefined();
  expect(analyzedExtension2.circularDependencies).toBeUndefined();
  expect(analyzedExtension3.circularDependencies).toBeUndefined();

  const analyzedExtensions = [analyzedExtension1, analyzedExtension2, analyzedExtension3];
  extensionLoader.searchForCircularDependencies(analyzedExtensions);

  // do we have missingDependencies field for extension 3 as it's missing
  expect(analyzedExtension1.circularDependencies).toStrictEqual([]);
  expect(analyzedExtension2.circularDependencies).toStrictEqual([extensionId3]);
  expect(analyzedExtension3.circularDependencies).toStrictEqual([extensionId2]);
});

test('Verify searchForMissingDependencies(analyzedExtensions);', async () => {
  // Check if missing dependencies are found
  const extensionId1 = 'foo.extension1';
  const extensionId2 = 'foo.extension2';
  const extensionId3 = 'foo.extension3';
  const unknownExtensionId = 'foo.unknown';

  // extension1 has no dependencies
  const analyzedExtension1: AnalyzedExtension = {
    id: extensionId1,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension2 depends on extension 1
  const analyzedExtension2: AnalyzedExtension = {
    id: extensionId2,
    manifest: {
      extensionDependencies: [extensionId1],
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension3 depends on unknown extension unknown
  const analyzedExtension3: AnalyzedExtension = {
    id: extensionId3,
    manifest: {
      extensionDependencies: [unknownExtensionId],
      name: 'hello',
    },
  } as AnalyzedExtension;

  expect(analyzedExtension1.missingDependencies).toBeUndefined();
  expect(analyzedExtension2.missingDependencies).toBeUndefined();
  expect(analyzedExtension3.missingDependencies).toBeUndefined();

  const analyzedExtensions = [analyzedExtension1, analyzedExtension2, analyzedExtension3];
  extensionLoader.searchForMissingDependencies(analyzedExtensions);

  // do we have missingDependencies field for extension 3 as it's missing
  expect(analyzedExtension1.missingDependencies).toStrictEqual([]);
  expect(analyzedExtension2.missingDependencies).toStrictEqual([]);
  expect(analyzedExtension3.missingDependencies).toStrictEqual([unknownExtensionId]);
});

test('Verify searchForMissingDependencies(analyzedExtensions);', async () => {
  const extensionId1 = 'foo.extension1';
  const extensionId2 = 'foo.extension2';
  const extensionId3 = 'foo.extension3';
  const extensionId4 = 'foo.extension4';
  const extensionId5 = 'foo.extension5';

  // extension1 has no dependency
  const analyzedExtension1: AnalyzedExtension = {
    id: extensionId1,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension2 depends on extension 1
  const analyzedExtension2: AnalyzedExtension = {
    id: extensionId2,
    manifest: {
      extensionDependencies: [extensionId1],
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension3 depends on extension1 and extension2
  const analyzedExtension3: AnalyzedExtension = {
    id: extensionId3,
    manifest: {
      extensionDependencies: [extensionId1, extensionId2],
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension4 depends on extension3
  const analyzedExtension4: AnalyzedExtension = {
    id: extensionId4,
    manifest: {
      extensionDependencies: [extensionId3],
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension5 depends on extension2
  const analyzedExtension5: AnalyzedExtension = {
    id: extensionId5,
    manifest: {
      extensionDependencies: [extensionId2, extensionId3, extensionId4],
      name: 'hello',
    },
  } as AnalyzedExtension;

  expect(analyzedExtension1.missingDependencies).toBeUndefined();
  expect(analyzedExtension2.missingDependencies).toBeUndefined();
  expect(analyzedExtension3.missingDependencies).toBeUndefined();

  // 1 -> nothing
  // 2 -> 1
  // 3 -> 1, 2
  // 4 -> 3
  // 5 -> 2 & 3 & 4

  // order of loading is
  // 1 then 2 as it depends on it
  // then 3
  // then 5 as it depends on 2
  // and then 4

  // no matter of the initial order, they should always be in the same order
  const analyzedExtensions1 = [
    analyzedExtension5,
    analyzedExtension2,
    analyzedExtension1,
    analyzedExtension4,
    analyzedExtension3,
  ];
  const sortedElements1 = extensionLoader.sortExtensionsByDependencies(analyzedExtensions1);

  const analyzedExtensions2 = [
    analyzedExtension5,
    analyzedExtension4,
    analyzedExtension3,
    analyzedExtension2,
    analyzedExtension1,
  ];
  const sortedElements2 = extensionLoader.sortExtensionsByDependencies(analyzedExtensions2);

  const analyzedExtensions3 = [
    analyzedExtension1,
    analyzedExtension2,
    analyzedExtension3,
    analyzedExtension4,
    analyzedExtension5,
  ];
  const sortedElements3 = extensionLoader.sortExtensionsByDependencies(analyzedExtensions3);

  expect(sortedElements1.map(analyzedExtension => analyzedExtension.id)).toStrictEqual([
    extensionId1,
    extensionId2,
    extensionId3,
    extensionId4,
    extensionId5,
  ]);
  expect(sortedElements2.map(analyzedExtension => analyzedExtension.id)).toStrictEqual([
    extensionId1,
    extensionId2,
    extensionId3,
    extensionId4,
    extensionId5,
  ]);
  expect(sortedElements3.map(analyzedExtension => analyzedExtension.id)).toStrictEqual([
    extensionId1,
    extensionId2,
    extensionId3,
    extensionId4,
    extensionId5,
  ]);
});

describe('check loadRuntime', async () => {
  test('check for extension with main entry', async () => {
    // override doRequire method
    const doRequireMock = vi.spyOn(extensionLoader, 'doRequire');
    doRequireMock.mockResolvedValue({} as NodeRequire);

    const fakeExtension = {
      mainPath: '/fake/path',
    } as unknown as AnalyzedExtension;

    extensionLoader.loadRuntime(fakeExtension);

    // expect require to be called with the mainPath
    expect(doRequireMock).toHaveBeenCalledWith(fakeExtension.mainPath);
  });

  test('check for extension without main entry', async () => {
    // override doRequire method
    const doRequireMock = vi.spyOn(extensionLoader, 'doRequire');
    doRequireMock.mockResolvedValue({} as NodeRequire);

    const fakeExtension = {
      mainPath: undefined,
    } as unknown as AnalyzedExtension;

    extensionLoader.loadRuntime(fakeExtension);

    // expect require to be called with the mainPath
    expect(doRequireMock).not.toBeCalled();
  });

  test('check cache entry without id and children', async () => {
    // override doRequire method
    const doRequireMock = vi.spyOn(extensionLoader, 'doRequire');
    doRequireMock.mockResolvedValue({} as NodeRequire);

    const getRequireCacheMock = vi.spyOn(extensionLoader, 'getRequireCache');
    getRequireCacheMock.mockReturnValue({
      foo: {
        // no id and no children
      } as unknown as NodeModule,
    });

    const fakeExtension = {
      mainPath: '/fake/path',
    } as unknown as AnalyzedExtension;

    extensionLoader.loadRuntime(fakeExtension);

    // expect require to be called with the mainPath and no exception
    expect(doRequireMock).toHaveBeenCalledWith(fakeExtension.mainPath);
  });
});

describe('analyze extension and main', async () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('check for extension with main entry', async () => {
    vi.mock('node:fs');
    vi.mock('node:fs/promises');

    // mock fs.existsSync
    const fsExistsSyncMock = vi.spyOn(fs, 'existsSync');
    fsExistsSyncMock.mockReturnValue(true);

    const readmeContent = 'This is my custom README';

    vi.mocked(realpath).mockResolvedValue('/fake/path');
    // mock readFile
    vi.mocked(readFile).mockResolvedValue(readmeContent);

    const fakeManifest = {
      publisher: 'fooPublisher',
      name: 'fooName',
      main: 'main-entry.js',
    };

    // mock loadManifest
    const loadManifestMock = vi.spyOn(extensionLoader, 'loadManifest');
    loadManifestMock.mockResolvedValue(fakeManifest);

    const extension = await extensionLoader.analyzeExtension(path.resolve('/', 'fake', 'path'), false);

    expect(extension).toBeDefined();
    expect(extension?.error).toBeDefined();
    expect(extension?.mainPath).toBe(path.resolve('/', 'fake', 'path', 'main-entry.js'));
    expect(extension.readme).toBe(readmeContent);
    expect(extension?.id).toBe('fooPublisher.fooName');
  });

  test('check for extension with linked folder', async () => {
    vi.mock('node:fs');
    vi.mock('node:fs/promises');

    // mock fs.existsSync
    const fsExistsSyncMock = vi.spyOn(fs, 'existsSync');
    fsExistsSyncMock.mockReturnValue(true);

    const readmeContent = 'This is my custom README';

    vi.mocked(realpath).mockResolvedValue('/fake/path');
    // mock readFile
    vi.mocked(readFile).mockResolvedValue(readmeContent);

    const fakeManifest = {
      publisher: 'fooPublisher',
      name: 'fooName',
      main: 'main-entry.js',
    };

    // mock loadManifest
    const loadManifestMock = vi.spyOn(extensionLoader, 'loadManifest');
    loadManifestMock.mockResolvedValue(fakeManifest);

    const extension = await extensionLoader.analyzeExtension(path.resolve('/', 'linked', 'path'), false);

    expect(extension).toBeDefined();
    expect(extension?.error).toBeDefined();
    expect(extension?.mainPath).toBe(path.resolve('/', 'fake', 'path', 'main-entry.js'));
    expect(extension.readme).toBe(readmeContent);
    expect(extension?.id).toBe('fooPublisher.fooName');
  });

  test('check for extension without main entry', async () => {
    vi.mock('node:fs');

    // mock fs.existsSync
    const fsExistsSyncMock = vi.spyOn(fs, 'existsSync');
    fsExistsSyncMock.mockReturnValue(true);

    vi.mocked(realpath).mockResolvedValue('/fake/path');
    vi.mocked(readFile).mockResolvedValue('empty');

    const fakeManifest = {
      publisher: 'fooPublisher',
      name: 'fooName',
      // no main entry
    };

    // mock loadManifest
    const loadManifestMock = vi.spyOn(extensionLoader, 'loadManifest');
    loadManifestMock.mockResolvedValue(fakeManifest);

    const extension = await extensionLoader.analyzeExtension('/fake/path', false);

    expect(extension).toBeDefined();
    expect(extension?.error).toBeDefined();
    // not set
    expect(extension?.mainPath).toBeUndefined();
    expect(extension?.id).toBe('fooPublisher.fooName');
  });
});

describe('setContextValue', async () => {
  test('without scope the setValue is called with original value', async () => {
    const disposables: IDisposable[] = [];
    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );
    const setValueSpy = vi.spyOn(context, 'setValue');

    api.context.setValue('key', 'value');
    expect(setValueSpy).toBeCalledWith('key', 'value');
  });
  test('with onboarding scope the key is prefixed before calling setValue', async () => {
    const disposables: IDisposable[] = [];
    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );
    const setValueSpy = vi.spyOn(context, 'setValue');

    api.context.setValue('key', 'value', 'onboarding');
    expect(setValueSpy).toBeCalledWith('publisher.name.onboarding.key', 'value');
  });
});

describe('Removing extension by user', async () => {
  const ExtID = 'company.ext-id';
  test('sends telemetry w/o error when whens succeeds', async () => {
    configurationRegistryGetConfigurationMock.mockReturnValue({
      get: () => [],
    });
    extensionLoader.removeExtension = vi.fn();
    await extensionLoader.removeExtensionPerUserRequest(ExtID);
    expect(extensionLoader.removeExtension).toBeCalledWith(ExtID);
    expect(telemetry.track).toBeCalledWith('removeExtension', { extensionId: ExtID });
  });

  test('sends telemetry w/ error when fails', async () => {
    const RemoveError = 'Error';
    extensionLoader.removeExtension = vi.fn().mockRejectedValue(RemoveError);
    await extensionLoader.removeExtensionPerUserRequest(ExtID).catch(() => undefined);
    expect(extensionLoader.removeExtension).toBeCalledWith(ExtID);
    expect(telemetry.track).toBeCalledWith('removeExtension', { extensionId: ExtID, error: RemoveError });
  });
});

test('check dispose when deactivating', async () => {
  vi.mock('node:fs');

  const extensionId = 'fooPublisher.fooName';
  extensionLoader.setActivatedExtension(extensionId, {
    id: extensionId,
  } as ActivatedExtension);

  const analyzedExtension: AnalyzedExtension = {
    id: extensionId,
    dispose: vi.fn(),
  } as unknown as AnalyzedExtension;
  extensionLoader.setAnalyzedExtension(extensionId, analyzedExtension);

  // should have call the dispose method
  await extensionLoader.deactivateExtension(extensionId);
  expect(analyzedExtension.dispose).toBeCalled();

  expect(telemetry.track).toBeCalledWith('deactivateExtension', { extensionId });
});

test('Verify extension uri', async () => {
  const id = 'extension.id';
  const activateMethod = vi.fn();

  configurationRegistryGetConfigurationMock.mockReturnValue({ get: vi.fn().mockReturnValue(1) });

  await extensionLoader.activateExtension(
    {
      id: id,
      name: 'id',
      path: 'dummy',
      api: {} as typeof containerDesktopAPI,
      mainPath: '',
      removable: false,
      manifest: {},
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
    },
    { activate: activateMethod },
  );

  expect(activateMethod).toBeCalled();

  // check extensionUri
  const grabUri: containerDesktopAPI.Uri = activateMethod.mock.calls[0][0].extensionUri;
  expect(grabUri).toBeDefined();
  expect(grabUri.fsPath).toBe('dummy');
});

test('Verify exports and packageJSON', async () => {
  const id = 'extension.id';
  const activateMethod = vi.fn();
  activateMethod.mockResolvedValue({
    hello: () => 'world',
  });

  configurationRegistryGetConfigurationMock.mockReturnValue({ get: vi.fn().mockReturnValue(1) });

  await extensionLoader.activateExtension(
    {
      id: id,
      name: 'id',
      path: 'dummy',
      api: {} as typeof containerDesktopAPI,
      mainPath: '',
      removable: false,
      manifest: {
        foo: 'bar',
      },
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
    },
    { activate: activateMethod },
  );

  expect(activateMethod).toBeCalled();

  const myActivatedExtension = extensionLoader.getActivatedExtensions().get(id);
  expect(myActivatedExtension).toBeDefined();

  expect(myActivatedExtension?.exports).toBeDefined();
  expect(myActivatedExtension?.exports.hello()).toBe('world');

  expect(myActivatedExtension?.packageJSON).toBeDefined();
  expect((myActivatedExtension?.packageJSON as any)?.foo).toBe('bar');

  const exposed = extensionLoader.getExposedExtension(id);
  expect(exposed).toBeDefined();
  expect(exposed?.exports.hello()).toBe('world');
  expect((exposed as any).packageJSON.foo).toBe('bar');

  const allExtensions = extensionLoader.getAllExposedExtensions();
  expect(allExtensions).toBeDefined();
  // 1 item
  expect(allExtensions.length).toBe(1);
  expect(allExtensions[0].exports.hello()).toBe('world');
  expect((allExtensions[0] as any).packageJSON.foo).toBe('bar');
});

describe('Navigation', async () => {
  test('navigateToContainers', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToContainers();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.CONTAINERS });
  });

  test.each([
    {
      name: 'navigateToContainer valid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) => api.navigateToContainer,
      expected: {
        page: NavigationPage.CONTAINER,
        parameters: {
          id: 'valid',
        },
      },
    },
    {
      name: 'navigateToContainerLogs valid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) =>
        api.navigateToContainerLogs,
      expected: {
        page: NavigationPage.CONTAINER_LOGS,
        parameters: {
          id: 'valid',
        },
      },
    },
    {
      name: 'navigateToContainerInspect valid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) =>
        api.navigateToContainerInspect,
      expected: {
        page: NavigationPage.CONTAINER_INSPECT,
        parameters: {
          id: 'valid',
        },
      },
    },
    {
      name: 'navigateToContainerTerminal valid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) =>
        api.navigateToContainerTerminal,
      expected: {
        page: NavigationPage.CONTAINER_TERMINAL,
        parameters: {
          id: 'valid',
        },
      },
    },
  ])('$name', async ({ method, expected }) => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const containerExistSpy = vi.spyOn(containerProviderRegistry, 'containerExist');
    containerExistSpy.mockImplementation(() => Promise.resolve(true));

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    await method(api.navigation)('valid');

    // Ensure the send method is called properly
    expect(sendMock).toBeCalledWith('navigate', expected);

    // Valid we listed the contains properly
    expect(containerExistSpy).toHaveBeenCalledOnce();
  });

  test.each([
    {
      name: 'navigateToContainer invalid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) => api.navigateToContainer,
    },
    {
      name: 'navigateToContainerLogs invalid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) =>
        api.navigateToContainerLogs,
    },
    {
      name: 'navigateToContainerInspect invalid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) =>
        api.navigateToContainerInspect,
    },
    {
      name: 'navigateToContainerTerminal invalid',
      method: (api: typeof containerDesktopAPI.navigation): ((id: string) => Promise<void>) =>
        api.navigateToContainerTerminal,
    },
  ])('$name', async ({ method }) => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const containerExistSpy = vi.spyOn(containerProviderRegistry, 'containerExist');
    containerExistSpy.mockImplementation(() => Promise.resolve(false));

    // Call the method provided
    let error = undefined;
    try {
      await method(api.navigation)('invalid');
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();

    // Valid we listed the contains properly
    expect(containerExistSpy).toHaveBeenCalledOnce();
  });

  test('navigateToImages', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToImages();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.IMAGES });
  });
  test('navigateToImage existing image', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const imageExistSpy = vi.spyOn(containerProviderRegistry, 'imageExist');
    imageExistSpy.mockImplementation(() => Promise.resolve(true));
    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    await api.navigation.navigateToImage('valid-id', 'valid-engine', 'valid-tag');

    // Ensure the send method is called properly
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.IMAGE,
      parameters: {
        id: 'valid-id',
        engineId: 'valid-engine',
        tag: 'valid-tag',
      },
    });

    // Valid we listed the contains properly each time
    expect(imageExistSpy).toHaveBeenCalledOnce();
  });
  test('navigateToImage non-existent image', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const imageExistSpy = vi.spyOn(containerProviderRegistry, 'imageExist');
    imageExistSpy.mockImplementation(() => Promise.resolve(false));

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    let error = undefined;
    try {
      await api.navigation.navigateToImage('non-valid-id', 'non-valid-engine', 'non-valid-tag');
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();

    // Ensure the send method is never called
    expect(sendMock).toHaveBeenCalledTimes(0);

    // Valid we listed the contains properly each time
    expect(imageExistSpy).toHaveBeenCalledOnce();
  });
  test('navigateToVolumes', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToVolumes();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.VOLUMES });
  });
  test('navigateToVolume existing volume', async () => {
    const disposables: IDisposable[] = [];
    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const volumeExistSpy = vi.spyOn(containerProviderRegistry, 'volumeExist');
    volumeExistSpy.mockImplementation(() => Promise.resolve(true));
    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    await api.navigation.navigateToVolume('valid-name', 'valid-engine');

    // Ensure the send method is called properly
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.VOLUME,
      parameters: {
        name: 'valid-name',
      },
    });

    // Valid we listed the contains properly each time
    expect(volumeExistSpy).toHaveBeenCalledOnce();
  });
  test('navigateToVolume non-existent volume', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const volumeExistSpy = vi.spyOn(containerProviderRegistry, 'volumeExist');
    volumeExistSpy.mockImplementation(() => Promise.resolve(false));

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    let error = undefined;
    try {
      await api.navigation.navigateToVolume('non-valid-name', 'non-valid-engine');
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();

    // Ensure the send method is called properly
    expect(sendMock).toHaveBeenCalledTimes(0);

    // Valid we listed the contains properly each time
    expect(volumeExistSpy).toHaveBeenCalledOnce();
  });
  test('navigateToPods', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToPods();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.PODS });
  });
  test('navigateToPod existing pod', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const podExistSpy = vi.spyOn(containerProviderRegistry, 'podExist');
    podExistSpy.mockImplementation(() => Promise.resolve(true));

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    await api.navigation.navigateToPod('valid-kind', 'valid-name', 'valid-engine');

    // Ensure the send method is called properly
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.POD,
      parameters: {
        kind: 'valid-kind',
        name: 'valid-name',
        engineId: 'valid-engine',
      },
    });

    // Valid we listed the contains properly each time
    expect(podExistSpy).toHaveBeenCalledOnce();
  });
  test('navigateToPod non-existent volume', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const podExistSpy = vi.spyOn(containerProviderRegistry, 'podExist');
    podExistSpy.mockImplementation(() => Promise.resolve(false));

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    let error = undefined;
    try {
      await api.navigation.navigateToPod('non-valid-kind', 'non-valid-name', 'non-valid-engine');
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();

    // Ensure the send method is called properly
    expect(sendMock).toHaveBeenCalledTimes(0);

    // Valid we listed the contains properly each time
    expect(podExistSpy).toHaveBeenCalledOnce();
  });

  test('navigateToContribution existing contribution', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listSimpleContainer implementation
    const listContributionsSpy = vi.spyOn(contributionManager, 'listContributions');
    listContributionsSpy.mockImplementation(() => [
      {
        name: 'valid-name',
      } as unknown as ContributionInfo,
    ]);
    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    await api.navigation.navigateToContribution('valid-name');

    // Ensure the send method is called properly
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.CONTRIBUTION,
      parameters: {
        name: 'valid-name',
      },
    });

    // Valid we listed the contains properly each time
    expect(listContributionsSpy).toHaveBeenCalledOnce();
  });
  test('navigateToContribution non-existent contribution', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    // Mock listContributions implementation
    const listContributionsSpy = vi.spyOn(contributionManager, 'listContributions');
    listContributionsSpy.mockImplementation(() => []);
    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    let error = undefined;
    try {
      await api.navigation.navigateToContribution('non-valid-name');
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();

    // Ensure the send method is called properly
    expect(sendMock).toHaveBeenCalledTimes(0);

    // Valid we listed the contains properly each time
    expect(listContributionsSpy).toHaveBeenCalledOnce();
  });

  test('navigateToWebview', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi(
      'path',
      {
        name: 'name',
        publisher: 'publisher',
        version: '1',
        displayName: 'dname',
      },
      disposables,
    );

    vi.mocked(webviewRegistry.listWebviews).mockReturnValue([
      {
        id: 'myWebviewId',
      } as unknown as WebviewInfo,
    ]);

    await api.navigation.navigateToWebview('myWebviewId');

    // Ensure the send method is called properly
    expect(vi.mocked(apiSender).send).toBeCalledWith('navigate', {
      page: NavigationPage.WEBVIEW,
      parameters: {
        id: 'myWebviewId',
      },
    });

    expect(vi.mocked(webviewRegistry.listWebviews)).toHaveBeenCalled();
  });
});

test('check listWebviews', async () => {
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi(
    'path',
    {
      name: 'name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    },
    disposables,
  );

  // Mock listSimpleWebviews implementation
  const listSimpleWebviewsSpy = vi.spyOn(webviewRegistry, 'listSimpleWebviews');
  listSimpleWebviewsSpy.mockImplementation(() =>
    Promise.resolve([
      {
        id: '123',
        viewType: 'customView',
        title: 'customTitle1',
      },
      {
        id: '456',
        viewType: 'anotherView',
        title: 'customTitle2',
      },
    ]),
  );
  // Call the method provided
  const result = await api.window.listWebviews();

  // check we called method
  expect(listSimpleWebviewsSpy).toHaveBeenCalledOnce();

  // esnure we got result
  expect(result).toBeDefined();
  expect(result.length).toBe(2);
  expect(result[0].id).toBe('123');
  expect(result[0].viewType).toBe('customView');
  expect(result[0].title).toBe('customTitle1');
  expect(result[1].id).toBe('456');
  expect(result[1].viewType).toBe('anotherView');
  expect(result[1].title).toBe('customTitle2');
});

test('check version', async () => {
  const fakeVersion = '1.2.3.4';
  // mock electron.app.getVersion
  vi.mocked(app.getVersion).mockReturnValue(fakeVersion);
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi(
    'path',
    {
      name: 'name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    },
    disposables,
  );

  const readPodmanVersion = api.version;

  // check we called method
  expect(readPodmanVersion).toBe(fakeVersion);
});

test('listPods', async () => {
  const listPodsSpy = vi.spyOn(containerProviderRegistry, 'listPods');
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi(
    'path',
    {
      name: 'name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    },
    disposables,
  );
  await api.containerEngine.listPods();
  expect(listPodsSpy).toHaveBeenCalledOnce();
});

test('stopPod', async () => {
  const stopPodSpy = vi.spyOn(containerProviderRegistry, 'stopPod');
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi(
    'path',
    {
      name: 'name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    },
    disposables,
  );
  await api.containerEngine.stopPod('engine1', 'pod1');
  expect(stopPodSpy).toHaveBeenCalledWith('engine1', 'pod1');
});

test('removePod', async () => {
  const removePodSpy = vi.spyOn(containerProviderRegistry, 'removePod');
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi(
    'path',
    {
      name: 'name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    },
    disposables,
  );
  await api.containerEngine.removePod('engine1', 'pod1');
  expect(removePodSpy).toHaveBeenCalledWith('engine1', 'pod1');
});

describe('authentication Provider', async () => {
  const BASE64ENCODEDIMAGE = 'BASE64ENCODEDIMAGE';

  const providerMock = {
    onDidChangeSessions: vi.fn(),
    getSessions: vi.fn().mockResolvedValue([]),
    createSession: vi.fn(),
    removeSession: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('basic registerAuthenticationProvider ', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();
    // size is 0 for disposables
    expect(disposables.length).toBe(0);
    api.authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock, {
      supportsMultipleAccounts: true,
    });
    // one disposable
    expect(disposables.length).toBe(1);

    expect(authenticationProviderRegistry.registerAuthenticationProvider).toBeCalledWith(
      'provider1.id',
      'Provider1 Label',
      providerMock,
      { supportsMultipleAccounts: true },
    );
  });

  test('allows images option to be undefined or empty', async () => {
    vi.mocked(getBase64Image).mockReturnValue(BASE64ENCODEDIMAGE);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    api.authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock, {});

    // grab the call to authenticationProviderRegistry.registerAuthenticationProvider
    const call = vi.mocked(authenticationProviderRegistry.registerAuthenticationProvider).mock.calls[0];

    // get options from the call
    const options = call[3];

    expect(options?.images?.logo).toBeUndefined();
    expect(options?.images?.icon).toBeUndefined();
  });

  test('allows images option to be single image', async () => {
    vi.mocked(getBase64Image).mockReturnValue(BASE64ENCODEDIMAGE);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    api.authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock, {
      images: {
        icon: './image.png',
        logo: './image.png',
      },
    });
    // grab the call to authenticationProviderRegistry.registerAuthenticationProvider
    const call = vi.mocked(authenticationProviderRegistry.registerAuthenticationProvider).mock.calls[0];

    // get options from the call
    const options = call[3];

    expect(options?.images?.logo).equals(BASE64ENCODEDIMAGE);
    expect(options?.images?.icon).equals(BASE64ENCODEDIMAGE);
  });

  test('allows images option to be light/dark image', async () => {
    vi.mocked(getBase64Image).mockReturnValue(BASE64ENCODEDIMAGE);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    api.authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock, {
      images: {
        icon: {
          light: './image.png',
          dark: './image.png',
        },
        logo: {
          light: './image.png',
          dark: './image.png',
        },
      },
    });
    // grab the call to authenticationProviderRegistry.registerAuthenticationProvider
    const call = vi.mocked(authenticationProviderRegistry.registerAuthenticationProvider).mock.calls[0];

    // get options from the call
    const options = call[3];

    const themeIcon = typeof options?.images?.icon === 'string' ? undefined : options?.images?.icon;
    expect(themeIcon).toBeDefined();
    expect(themeIcon?.light).equals(BASE64ENCODEDIMAGE);
    expect(themeIcon?.dark).equals(BASE64ENCODEDIMAGE);
    const themeLogo = typeof options?.images?.logo === 'string' ? undefined : options?.images?.logo;
    expect(themeLogo).toBeDefined();
    expect(themeLogo?.light).equals(BASE64ENCODEDIMAGE);
    expect(themeLogo?.dark).equals(BASE64ENCODEDIMAGE);
  });
});

test('createCliTool ', async () => {
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi('/path', {}, disposables);
  expect(api).toBeDefined();
  expect(disposables.length).toBe(0);
  const options: containerDesktopAPI.CliToolOptions = {
    name: 'tool-name',
    displayName: 'tool-display-name',
    markdownDescription: 'markdown description',
    images: {},
    version: '1.0.1',
    path: 'path/to/tool-name',
  };

  vi.mocked(cliToolRegistry.createCliTool).mockReturnValue({ id: 'created' } as containerDesktopAPI.CliTool);

  const newCliTool = api.cli.createCliTool(options);
  expect(disposables.length).toBe(1);

  expect(cliToolRegistry.createCliTool).toBeCalledWith(expect.objectContaining({ extensionPath: '/path' }), options);
  expect(newCliTool).toStrictEqual({ id: 'created' });
});

test('registerImageCheckerProvider ', async () => {
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi('/path', {}, disposables);
  expect(api).toBeDefined();

  const provider = {
    check: (
      _image: containerDesktopAPI.ImageInfo,
      _token?: containerDesktopAPI.CancellationToken,
    ): containerDesktopAPI.ProviderResult<containerDesktopAPI.ImageChecks> => {
      return {
        checks: [
          {
            name: 'check1',
            status: 'failed',
          },
        ],
      };
    },
  };

  vi.mocked(imageCheckerImpl.registerImageCheckerProvider).mockReturnValue(Disposable.create(() => {}));
  expect(disposables.length).toBe(0);
  api.imageChecker.registerImageCheckerProvider(provider, { label: 'dummyLabel' });
  expect(disposables.length).toBe(1);
  expect(imageCheckerImpl.registerImageCheckerProvider).toBeCalledWith(
    expect.objectContaining({ extensionPath: '/path' }),
    provider,
    { label: 'dummyLabel' },
  );
});

test('loadExtension with themes', async () => {
  const manifest = {
    name: 'hello',
    contributes: {
      themes: [
        {
          id: 'custom-dark',
          name: 'Custom dark theme',
          parent: 'dark',
          colors: {
            TitlebarBg: 'red',
          },
        },
      ],
    },
  };

  const fakeExtension = {
    manifest,
    subscriptions: [],
  } as unknown as AnalyzedExtension;

  await extensionLoader.loadExtension(fakeExtension);

  expect(colorRegistry.registerExtensionThemes).toBeCalledWith(fakeExtension, manifest.contributes.themes);
});

describe('window', async () => {
  test('showOpenDialog ', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    const filePaths = ['/path-to-file1', '/path-to-file2'];
    vi.mocked(dialogRegistry.openDialog).mockResolvedValue(filePaths);

    const uris = await api.window.showOpenDialog();
    expect(uris?.length).toBe(2);
    const urisArray = uris as containerDesktopAPI.Uri[];

    expect(dialogRegistry.openDialog).toBeCalled();
    expect(urisArray[0].fsPath).toContain('path-to-file1');
    expect(urisArray[1].fsPath).toContain('path-to-file2');
  });

  test('showSaveDialog ', async () => {
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    const filePath = '/path-to-file1';
    vi.mocked(dialogRegistry.saveDialog).mockResolvedValue(Uri.file(filePath));

    const uri = await api.window.showSaveDialog();

    expect(dialogRegistry.saveDialog).toBeCalled();
    expect(uri?.fsPath).toContain('path-to-file1');
  });
});

describe('containerEngine', async () => {
  test('statsContainer ', async () => {
    vi.mocked(containerProviderRegistry.getContainerStats).mockResolvedValue(99);
    vi.mocked(containerProviderRegistry.stopContainerStats).mockResolvedValue(undefined);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    const disposable = await api.containerEngine.statsContainer('dummyEngineId', 'dummyContainerId', () => {});
    expect(disposable).toBeDefined();
    expect(disposable instanceof Disposable).toBeTruthy();
    expect(containerProviderRegistry.getContainerStats).toHaveBeenCalledWith(
      'dummyEngineId',
      'dummyContainerId',
      expect.anything(),
    );

    disposable.dispose();
    await vi.waitUntil(() => {
      expect(containerProviderRegistry.stopContainerStats).toHaveBeenCalledWith(99);
      return true;
    });
  });

  test('listImages without option ', async () => {
    vi.mocked(containerProviderRegistry.podmanListImages).mockResolvedValue([]);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    const images = await api.containerEngine.listImages();
    expect(images.length).toBe(0);
    expect(containerProviderRegistry.podmanListImages).toHaveBeenCalledWith(undefined);
  });

  test('listImages with provider option', async () => {
    vi.mocked(containerProviderRegistry.podmanListImages).mockResolvedValue([]);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    const images = await api.containerEngine.listImages({
      provider: {
        name: 'dummyProvider',
      } as unknown as containerDesktopAPI.ContainerProviderConnection,
    });
    expect(images.length).toBe(0);
    expect(containerProviderRegistry.podmanListImages).toHaveBeenCalledWith({
      provider: {
        name: 'dummyProvider',
      },
    });
  });

  test('listInfos without option', async () => {
    vi.mocked(containerProviderRegistry.listInfos).mockResolvedValue([]);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    const infos = await api.containerEngine.listInfos();
    expect(infos.length).toBe(0);
    expect(containerProviderRegistry.listInfos).toHaveBeenCalledWith(undefined);
  });

  test('listInfos with provider option', async () => {
    vi.mocked(containerProviderRegistry.listInfos).mockResolvedValue([]);
    const disposables: IDisposable[] = [];

    const api = extensionLoader.createApi('/path', {}, disposables);
    expect(api).toBeDefined();

    const infos = await api.containerEngine.listInfos({
      provider: {
        name: 'dummyProvider',
      } as unknown as containerDesktopAPI.ContainerProviderConnection,
    });
    expect(infos.length).toBe(0);
    expect(containerProviderRegistry.listInfos).toHaveBeenCalledWith({
      provider: {
        name: 'dummyProvider',
      },
    });
  });
});

describe('extensionContext', async () => {
  test('secrets', async () => {
    vi.mock('node:fs');

    vi.mocked(fs.existsSync).mockReturnValue(true);

    const extension: AnalyzedExtension = {
      subscriptions: [],
      id: 'fooPublisher.fooName',
      name: 'fooName',
      manifest: {
        version: '1.0',
      },
    } as unknown as AnalyzedExtension;

    vi.mocked(configurationRegistry.getConfiguration).mockReturnValue({
      get: vi.fn().mockReturnValue(5),
    } as unknown as containerDesktopAPI.Configuration);

    const getMock = vi.fn();
    const storeMock = vi.fn();
    const deleteMock = vi.fn();

    vi.mocked(safeStorageRegistry.getExtensionStorage).mockReturnValue({
      get: getMock,
      store: storeMock,
      delete: deleteMock,
    } as unknown as ExtensionSecretStorage);

    let extensionContext: containerDesktopAPI.ExtensionContext | undefined;

    const activateMethod = (context: containerDesktopAPI.ExtensionContext): void => {
      extensionContext = context;
    };

    const extensionMain = {
      activate: activateMethod,
    };

    await extensionLoader.activateExtension(extension, extensionMain);

    expect(extensionContext).toBeDefined();
    expect(extensionContext?.secrets).toBeDefined();
    expect(telemetry.track).toBeCalledWith('activateExtension', {
      extensionId: 'fooPublisher.fooName',
      extensionVersion: '1.0',
      duration: expect.any(Number),
    });

    expect(safeStorageRegistry.getExtensionStorage).toBeCalledWith('fooPublisher.fooName');

    await extensionContext?.secrets.store('key', 'value');
    expect(storeMock).toBeCalledWith('key', 'value');

    await extensionContext?.secrets.get('key');
    expect(getMock).toBeCalledWith('key');

    await extensionContext?.secrets.delete('key');
    expect(deleteMock).toBeCalledWith('key');
  });
});

test('load extensions sequentially', async () => {
  // Check if missing dependencies are found
  const extensionId1 = 'foo.extension1';
  const extensionId2 = 'foo.extension2';
  const extensionId3 = 'foo.extension3';
  const unknownExtensionId = 'foo.unknown';

  // extension1 has no dependencies
  const analyzedExtension1: AnalyzedExtension = {
    id: extensionId1,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension2 depends on extension 1
  const analyzedExtension2: AnalyzedExtension = {
    id: extensionId2,
    manifest: {
      extensionDependencies: [extensionId1],
      name: 'hello',
    },
  } as AnalyzedExtension;

  // extension3 depends on unknown extension unknown
  const analyzedExtension3: AnalyzedExtension = {
    id: extensionId3,
    manifest: {
      extensionDependencies: [unknownExtensionId],
      name: 'hello',
    },
  } as AnalyzedExtension;

  // mock loadExtension
  const loadExtensionMock = vi.spyOn(extensionLoader, 'loadExtension');
  loadExtensionMock.mockImplementation(extension => {
    if (extension.id === extensionId1) {
      // extension 1 takes 1s to load
      return new Promise(resolve => setTimeout(resolve, 1000));
    } else if (extension.id === extensionId2) {
      return new Promise(resolve => setTimeout(resolve, 100));
    } else if (extension.id === extensionId3) {
      return new Promise(resolve => setTimeout(resolve, 1000));
    }
    return Promise.resolve();
  });

  const start = performance.now();
  await extensionLoader.loadExtensions([analyzedExtension1, analyzedExtension2, analyzedExtension3]);
  const end = performance.now();

  const delta = end - start;
  // delta should be greater than 2s as it's sequential (so 1s + 1s + 100ms) > 2s
  expect(delta).toBeGreaterThan(2000);

  // check if loadExtension is called in order
  expect(loadExtensionMock).toBeCalledTimes(3);
  expect(loadExtensionMock.mock.calls[0][0]).toBe(analyzedExtension1);
  expect(loadExtensionMock.mock.calls[1][0]).toBe(analyzedExtension2);
  expect(loadExtensionMock.mock.calls[2][0]).toBe(analyzedExtension3);
});

test('when loading registry registerRegistry, do not push to disposables', async () => {
  const disposables: IDisposable[] = [];

  const api = extensionLoader.createApi('/path', {}, disposables);
  expect(api).toBeDefined();

  const fakeRegistry = {
    source: 'fake',
    serverUrl: 'http://fake',
    username: 'foo',
    password: 'bar',
    secret: 'baz',
  };

  api.registry.registerRegistry(fakeRegistry);

  expect(disposables.length).toBe(0);
});
