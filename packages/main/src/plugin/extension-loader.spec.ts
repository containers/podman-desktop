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

import { beforeAll, beforeEach, test, expect, vi, describe } from 'vitest';
import type { CommandRegistry } from './command-registry.js';
import type { ConfigurationRegistry } from './configuration-registry.js';
import type { ContainerProviderRegistry } from './container-registry.js';
import type { ActivatedExtension, AnalyzedExtension } from './extension-loader.js';
import { ExtensionLoader } from './extension-loader.js';
import type { FilesystemMonitoring } from './filesystem-monitoring.js';
import type { ImageRegistry } from './image-registry.js';
import type { InputQuickPickRegistry } from './input-quickpick/input-quickpick-registry.js';
import type { KubernetesClient } from './kubernetes-client.js';
import type { MenuRegistry } from './menu-registry.js';
import type { NotificationImpl } from './notification-impl.js';
import type { ProgressImpl } from './progress-impl.js';
import type { ProviderRegistry } from './provider-registry.js';
import type { Proxy } from './proxy.js';
import type { StatusBarRegistry } from './statusbar/statusbar-registry.js';
import type { TrayMenuRegistry } from './tray-menu-registry.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { ApiSenderType } from './api.js';
import type { AuthenticationImpl } from './authentication.js';
import type { MessageBox } from './message-box.js';
import type { Telemetry } from './telemetry/telemetry.js';
import type * as containerDesktopAPI from '@podman-desktop/api';
import type { IconRegistry } from './icon-registry.js';
import type { Directories } from './directories.js';
import type { CustomPickRegistry } from './custompick/custompick-registry.js';
import type { ViewRegistry } from './view-registry.js';
import { Context } from './context/context.js';
import type { OnboardingRegistry } from './onboarding-registry.js';
import { Exec } from './util/exec.js';

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

  getExtensionState() {
    return this.extensionState;
  }

  getExtensionStateErrors() {
    return this.extensionStateErrors;
  }

  doRequire(module: string): NodeRequire {
    return super.doRequire(module);
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

const providerRegistry: ProviderRegistry = {} as unknown as ProviderRegistry;

const configurationRegistryGetConfigurationMock = vi.fn();
const configurationRegistry: ConfigurationRegistry = {
  getConfiguration: configurationRegistryGetConfigurationMock,
} as unknown as ConfigurationRegistry;

const imageRegistry: ImageRegistry = {} as unknown as ImageRegistry;

const apiSender: ApiSenderType = { send: vi.fn() } as unknown as ApiSenderType;

const trayMenuRegistry: TrayMenuRegistry = {} as unknown as TrayMenuRegistry;

const messageBox: MessageBox = {} as MessageBox;

const progress: ProgressImpl = {} as ProgressImpl;

const notifications: NotificationImpl = {} as unknown as NotificationImpl;

const statusBarRegistry: StatusBarRegistry = {} as unknown as StatusBarRegistry;

const kubernetesClient: KubernetesClient = {} as unknown as KubernetesClient;

const fileSystemMonitoring: FilesystemMonitoring = {} as unknown as FilesystemMonitoring;

const proxy: Proxy = {} as unknown as Proxy;

const containerProviderRegistry: ContainerProviderRegistry = {} as unknown as ContainerProviderRegistry;

const inputQuickPickRegistry: InputQuickPickRegistry = {} as unknown as InputQuickPickRegistry;

const customPickRegistry: CustomPickRegistry = {} as unknown as CustomPickRegistry;

const authenticationProviderRegistry: AuthenticationImpl = {} as unknown as AuthenticationImpl;

const iconRegistry: IconRegistry = {} as unknown as IconRegistry;

const onboardingRegistry: OnboardingRegistry = {} as unknown as OnboardingRegistry;

const telemetryTrackMock = vi.fn();
const telemetry: Telemetry = { track: telemetryTrackMock } as unknown as Telemetry;

const viewRegistry: ViewRegistry = {} as unknown as ViewRegistry;

const context: Context = new Context(apiSender);

const directories = {
  getPluginsDirectory: () => '/fake-plugins-directory',
  getPluginsScanDirectory: () => '/fake-plugins-scanning-directory',
  getExtensionsStorageDirectory: () => '/fake-extensions-storage-directory',
} as unknown as Directories;

const exec = new Exec(proxy);

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
    notifications,
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
});

describe('analyze extension and main', async () => {
  test('check for extension with main entry', async () => {
    vi.mock('node:fs');

    // mock fs.existsSync
    const fsExistsSyncMock = vi.spyOn(fs, 'existsSync');
    fsExistsSyncMock.mockReturnValue(true);

    const fakeManifest = {
      publisher: 'fooPublisher',
      name: 'fooName',
      main: 'main-entry.js',
    };

    // mock loadManifest
    const loadManifestMock = vi.spyOn(extensionLoader, 'loadManifest');
    loadManifestMock.mockResolvedValue(fakeManifest);

    const extension = await extensionLoader.analyzeExtension('/fake/path', false);

    expect(extension).toBeDefined();
    expect(extension?.mainPath).toBe('/fake/path/main-entry.js');
    expect(extension?.id).toBe('fooPublisher.fooName');
  });

  test('check for extension without main entry', async () => {
    vi.mock('node:fs');

    // mock fs.existsSync
    const fsExistsSyncMock = vi.spyOn(fs, 'existsSync');
    fsExistsSyncMock.mockReturnValue(true);

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
    // not set
    expect(extension?.mainPath).toBeUndefined();
    expect(extension?.id).toBe('fooPublisher.fooName');
  });
});

describe('setContextValue', async () => {
  test('without scope the setValue is called with original value', async () => {
    const api = extensionLoader.createApi('path', {
      name: 'name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    });
    const setValueSpy = vi.spyOn(context, 'setValue');

    api.context.setValue('key', 'value');
    expect(setValueSpy).toBeCalledWith('key', 'value');
  });
  test('with onboarding scope the key is prefixed before calling setValue', async () => {
    const api = extensionLoader.createApi('path', {
      name: 'name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    });
    const setValueSpy = vi.spyOn(context, 'setValue');

    api.context.setValue('key', 'value', 'onboarding');
    expect(setValueSpy).toBeCalledWith('publisher.name.onboarding.key', 'value');
  });
});

describe('Removing extension by user', async () => {
  const ExtID = 'company.ext-id';
  test('sends telemetry w/o error when whens succeeds', async () => {
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
