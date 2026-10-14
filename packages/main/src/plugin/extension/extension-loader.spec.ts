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

/* eslint-disable @typescript-eslint/no-explicit-any */

import * as fs from 'node:fs';
import * as path from 'node:path';

import type {
  BuildImageOptions as InternalBuildImageOptions,
  ContributionInfo,
  IDisposable,
  OnboardingInfo,
  PodInspectInfo,
  WebviewInfo,
} from '@desktop-framework/api';
import { ExtensionLoaderSettings, NavigationPage } from '@desktop-framework/api';
import type { ApiSenderType } from '@desktop-framework/api/api-sender';
import type * as containerDesktopAPI from '@desktop-framework/extension-api';
import { app } from 'electron';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import type { AuthenticationImpl } from '/@/plugin/authentication.js';
import type { Certificates } from '/@/plugin/certificates.js';
import type { CliToolRegistry } from '/@/plugin/cli-tool-registry.js';
import type { ColorRegistry } from '/@/plugin/color-registry.js';
import type { CommandRegistry } from '/@/plugin/command-registry.js';
import type { ConfigurationRegistry } from '/@/plugin/configuration-registry.js';
import type { ContainerProviderRegistry } from '/@/plugin/container-registry.js';
import { Context } from '/@/plugin/context/context.js';
import type { ContributionManager } from '/@/plugin/contribution-manager.js';
import type { CustomPickRegistry } from '/@/plugin/custompick/custompick-registry.js';
import type { DialogRegistry } from '/@/plugin/dialog-registry.js';
import type { Directories } from '/@/plugin/directories.js';
import type { ExtensionApiVersion } from '/@/plugin/extension/extension-api-version.js';
import type { ExtensionsBundle } from '/@/plugin/extension/local/extensions-bundle.js';
import type { FeatureRegistry } from '/@/plugin/feature-registry.js';
import type { FilesystemMonitoring } from '/@/plugin/filesystem-monitoring.js';
import type { IconRegistry } from '/@/plugin/icon-registry.js';
import type { ImageCheckerImpl } from '/@/plugin/image-checker.js';
import type { ImageFilesRegistry } from '/@/plugin/image-files-registry.js';
import type { ImageRegistry } from '/@/plugin/image-registry.js';
import type { InputQuickPickRegistry } from '/@/plugin/input-quickpick/input-quickpick-registry.js';
import type { KubeGeneratorRegistry } from '/@/plugin/kubernetes/kube-generator-registry.js';
import type { KubernetesClient } from '/@/plugin/kubernetes/kubernetes-client.js';
import type { MenuRegistry } from '/@/plugin/menu-registry.js';
import type { MessageBox } from '/@/plugin/message-box.js';
import { NavigationManager } from '/@/plugin/navigation/navigation-manager.js';
import type { OnboardingRegistry } from '/@/plugin/onboarding-registry.js';
import type { ProviderRegistry } from '/@/plugin/provider-registry.js';
import type { Proxy } from '/@/plugin/proxy.js';
import type { ExtensionSecretStorage, SafeStorageRegistry } from '/@/plugin/safe-storage/safe-storage-registry.js';
import type { StatusBarRegistry } from '/@/plugin/statusbar/statusbar-registry.js';
import type { NotificationRegistry } from '/@/plugin/tasks/notification-registry.js';
import { type ProgressImpl, ProgressLocation } from '/@/plugin/tasks/progress-impl.js';
import type { Telemetry } from '/@/plugin/telemetry/telemetry.js';
import type { TrayMenuRegistry } from '/@/plugin/tray-menu-registry.js';
import { Disposable } from '/@/plugin/types/disposable.js';
import { Uri } from '/@/plugin/types/uri.js';
import { Exec } from '/@/plugin/util/exec.js';
import type { ViewRegistry } from '/@/plugin/view-registry.js';
import type { WebviewRegistry } from '/@/plugin/webview/webview-registry.js';
import { getBase64Image } from '/@/util.js';
import product from '/@product.json' with { type: 'json' };

import type { AnalyzedExtension, ExtensionAnalyzer } from './extension-analyzer.js';
import type { ExtensionDevelopmentFolders } from './extension-development-folders.js';
import type { ActivatedExtension, AnalyzedExtensionWithApi, RequireCacheDict } from './extension-loader.js';
import { ExtensionLoader } from './extension-loader.js';
import type { ExtensionManifest } from './extension-manifest-schema.js';
import type { ExtensionWatcher } from './extension-watcher.js';
import type { ExtensionsExternal } from './local/extensions-external.js';

vi.mock(import('node:fs'));

class TestExtensionLoader extends ExtensionLoader {
  public override async setupScanningDirectory(): Promise<void> {
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

  getAnalyzedExtensions(): Map<string, AnalyzedExtension> {
    return this.analyzedExtensions;
  }

  getExtensionStateErrors(): Map<string, unknown> {
    return this.extensionStateErrors;
  }

  override doRequire(module: string): NodeRequire {
    return super.doRequire(module);
  }

  getRequireCache(): RequireCacheDict {
    return super.requireCache;
  }

  setActivatedExtension(extensionId: string, activatedExtension: ActivatedExtension): void {
    this.activatedExtensions.set(extensionId, activatedExtension);
  }

  setAnalyzedExtension(extensionId: string, analyzedExtension: AnalyzedExtensionWithApi): void {
    this.analyzedExtensions.set(extensionId, analyzedExtension);
  }

  override reloadExtension(extension: AnalyzedExtension, removable: boolean): Promise<void> {
    return super.reloadExtension(extension, removable);
  }

  override loadDevelopmentFolderExtensions(analyzedExtensions: AnalyzedExtension[]): Promise<void> {
    return super.loadDevelopmentFolderExtensions(analyzedExtensions);
  }
}

let extensionLoader: TestExtensionLoader;

/**
 * Build an analyzed extension of the plugins directory, the given fields taking precedence.
 */
function buildAnalyzedExtension(id: string, fields: Partial<AnalyzedExtensionWithApi> = {}): AnalyzedExtensionWithApi {
  const name = id.substring(id.indexOf('.') + 1);
  return {
    id,
    name,
    path: `/plugins/${name}`,
    manifest: { name, displayName: name, version: '1.0.0', publisher: 'podman-desktop', description: name },
    api: {} as typeof containerDesktopAPI,
    readme: '',
    removable: true,
    devMode: false,
    bundled: false,
    subscriptions: [],
    dispose: (): void => {},
    ...fields,
  };
}

/**
 * Build a directory entry, as returned by readdir with file types.
 */
function buildDirectoryEntry(name: string): fs.Dirent<string> {
  return { name, isFile: (): boolean => false, isDirectory: (): boolean => true } as unknown as fs.Dirent<string>;
}

let bundledPodmanExtension: AnalyzedExtensionWithApi;

const commandRegistry: CommandRegistry = {
  registerCommandsFromExtension: vi.fn(),
} as unknown as CommandRegistry;

const menuRegistry: MenuRegistry = {
  registerMenus: vi.fn(),
} as unknown as MenuRegistry;

const kubernetesGeneratorRegistry: KubeGeneratorRegistry = {} as unknown as KubeGeneratorRegistry;

const providerRegistry: ProviderRegistry = {} as unknown as ProviderRegistry;

const configurationRegistryGetConfigurationMock = vi.fn();
const configurationRegistryUpdateConfigurationMock = vi.fn();
const configurationRegistry: ConfigurationRegistry = {
  getConfiguration: configurationRegistryGetConfigurationMock,
  registerConfigurations: vi.fn(),
  updateConfigurationValue: configurationRegistryUpdateConfigurationMock,
} as unknown as ConfigurationRegistry;

const imageRegistry: ImageRegistry = {
  registerRegistry: vi.fn(),
} as unknown as ImageRegistry;

const featureRegistry: FeatureRegistry = {
  registerFeatures: vi.fn(),
} as unknown as FeatureRegistry;

const apiSender: ApiSenderType = { send: vi.fn() } as unknown as ApiSenderType;

const trayMenuRegistry: TrayMenuRegistry = {} as unknown as TrayMenuRegistry;

const messageBox: MessageBox = {
  showDialog: vi.fn(),
} as unknown as MessageBox;

const progress: ProgressImpl = {
  withProgress: vi.fn(),
} as unknown as ProgressImpl;

const statusBarRegistry: StatusBarRegistry = {} as unknown as StatusBarRegistry;

const kubernetesClient: KubernetesClient = {
  dispose: vi.fn(),
} as unknown as KubernetesClient;

const fileSystemMonitoring: FilesystemMonitoring = {
  asyncDispose: vi.fn().mockResolvedValue(undefined),
} as unknown as FilesystemMonitoring;

const proxy: Proxy = {} as unknown as Proxy;

const containerProviderRegistry: ContainerProviderRegistry = {
  buildImage: vi.fn(),
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
  pullImage: vi.fn(),
  getPodInspect: vi.fn(),
} as unknown as ContainerProviderRegistry;

const inputQuickPickRegistry: InputQuickPickRegistry = {} as unknown as InputQuickPickRegistry;

const customPickRegistry: CustomPickRegistry = {} as unknown as CustomPickRegistry;

const authenticationProviderRegistry: AuthenticationImpl = {
  registerAuthenticationProvider: vi.fn(),
} as unknown as AuthenticationImpl;

const iconRegistry: IconRegistry = {
  registerIconContribution: vi.fn(),
} as unknown as IconRegistry;

const onboardingRegistry: OnboardingRegistry = {
  getOnboarding: vi.fn(),
  registerOnboarding: vi.fn(),
} as unknown as OnboardingRegistry;

const telemetryTrackMock = vi.fn();
const telemetry: Telemetry = { aggregateTrack: vi.fn(), track: telemetryTrackMock } as unknown as Telemetry;

const viewRegistry: ViewRegistry = {
  registerViews: vi.fn(),
} as unknown as ViewRegistry;

const context: Context = new Context(apiSender);

const cliToolRegistry: CliToolRegistry = {
  createCliTool: vi.fn(),
} as unknown as CliToolRegistry;

const safeStorageRegistry: SafeStorageRegistry = {
  getExtensionStorage: vi.fn(),
} as unknown as SafeStorageRegistry;

const directories = {
  getPluginsDirectory: () => path.resolve('/fake-plugins-directory'),
  getPluginsScanDirectory: () => path.resolve('/fake-plugins-scanning-directory'),
  getExtensionsStorageDirectory: () => path.resolve('/fake-extensions-storage-directory'),
  getSafeStorageDirectory: () => path.resolve('/fake-safe-storage-directory'),
} as unknown as Directories;

const exec = new Exec(proxy);

const notificationRegistry: NotificationRegistry = {
  registerExtension: vi.fn(),
  addNotification: vi.fn(),
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
  stop: vi.fn(),
} as unknown as WebviewRegistry;

const navigationManager: NavigationManager = new NavigationManager(
  apiSender,
  containerProviderRegistry,
  contributionManager,
  providerRegistry,
  webviewRegistry,
  commandRegistry,
  onboardingRegistry,
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

const certificates: Certificates = {} as unknown as Certificates;

const extensionApiVersion: ExtensionApiVersion = {
  getApiVersion: vi.fn(),
};

const extensionWatcher = {
  monitor: vi.fn(),
  untrack: vi.fn(),
  stop: vi.fn(),
  dispose: vi.fn(),
  reloadExtension: vi.fn(),
  onNeedToReloadExtension: vi.fn(),
} as unknown as ExtensionWatcher;

const extensionDevelopmentFolder = {
  getDevelopmentFolders: vi.fn(),
  onNeedToLoadExension: vi.fn(),
  addExternalExtensionId: vi.fn(),
  removeExternalExtensionId: vi.fn(),
} as unknown as ExtensionDevelopmentFolders;

const extensionAnalyzer = {
  analyzeExtension: vi.fn(),
} as unknown as ExtensionAnalyzer;

const extensionsBundle = {
  all: vi.fn(),
} as unknown as ExtensionsBundle;

const extensionsExternal = {
  all: vi.fn(),
} as unknown as ExtensionsExternal;

const createApi = (disposables?: { dispose(): unknown }[]): typeof containerDesktopAPI => {
  const analyzedExtension = {
    path: '/path',
    manifest: {
      name: 'extension-name',
      publisher: 'publisher',
      version: '1',
      displayName: 'dname',
    },
    subscriptions: disposables ?? [],
  } as AnalyzedExtension;
  return extensionLoader.createApi(analyzedExtension);
};

vi.mock(import('/@/util.js'));

vi.mock(import('node:fs/promises'));
// mock fs.promises.readdir and use Dirent<string> as return type
const readdirMock = vi.mocked(
  fs.promises.readdir as (path: string, options?: { withFileTypes: true }) => Promise<fs.Dirent<string>[]>,
);
const mkdirMock = vi.mocked(fs.promises.mkdir);

/* eslint-disable @typescript-eslint/no-empty-function */
beforeEach(() => {
  vi.resetAllMocks();
  Object.defineProperty(process, 'resourcesPath', {
    value: '/resources',
  });

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
    certificates,
    extensionWatcher,
    extensionDevelopmentFolder,
    extensionAnalyzer,
    extensionApiVersion,
    featureRegistry,
    extensionsBundle,
    extensionsExternal,
  );
});

vi.mock(import('node:fs'));

beforeEach(() => {
  telemetryTrackMock.mockResolvedValue(undefined);
  vi.clearAllMocks();

  bundledPodmanExtension = buildAnalyzedExtension('podman-desktop.podman', {
    path: '/bundled/podman',
    removable: false,
    bundled: true,
  });

  vi.mocked(extensionsBundle.all).mockReturnValue([]);
  vi.mocked(extensionsExternal.all).mockReturnValue([]);

  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: vi.fn().mockImplementation((key: string, defaultValue?: unknown) => {
      if (key === 'disabled') {
        return [];
      }
      return defaultValue;
    }),
  });
  vi.mocked(extensionDevelopmentFolder).getDevelopmentFolders.mockReturnValue([]);
});

describe('extensionLoader#start', () => {
  test('error in one of analyzeExtension should not be dramatic', async () => {
    const fakeDirectory = '/fake/path/scanning';

    // fake scanning property
    extensionLoader.setPluginsScanDirectory(fakeDirectory);

    const analyzeExtensionMock = vi.spyOn(extensionLoader, 'analyzeExtension');
    analyzeExtensionMock.mockRejectedValueOnce(new Error('Failed one'));
    analyzeExtensionMock.mockResolvedValue({
      id: 'oui',
      manifest: {
        name: 'hello',
      },
    } as AnalyzedExtensionWithApi);

    const loadExtensionsMock = vi.spyOn(extensionLoader, 'loadExtensions');
    loadExtensionsMock.mockResolvedValue(undefined);

    vi.mocked(
      fs.promises.readdir as (path: string, options?: { withFileTypes: true }) => Promise<fs.Dirent[]>,
    ).mockImplementation(async path => {
      switch (path) {
        case directories.getPluginsDirectory():
          return [
            {
              name: 'foo',
              isFile: () => false,
              isDirectory: () => true,
            } as unknown as fs.Dirent,
            {
              name: 'bar',
              isFile: () => false,
              isDirectory: () => true,
            } as unknown as fs.Dirent,
          ];
        default:
          return [];
      }
    });
    vi.mocked(fs.existsSync).mockImplementation(path => {
      switch (path) {
        case directories.getPluginsDirectory():
          return true;
        default:
          return false;
      }
    });

    await extensionLoader.start();

    expect(analyzeExtensionMock).toHaveBeenCalledTimes(2);
    expect(analyzeExtensionMock).toHaveBeenCalledWith({
      extensionPath: path.join(directories.getPluginsDirectory(), 'foo'),
      removable: true,
    });
    expect(analyzeExtensionMock).toHaveBeenCalledWith({
      extensionPath: path.join(directories.getPluginsDirectory(), 'bar'),
      removable: true,
    });

    // only one extension should have been loaded as we rejected one analyzeExtensionMock
    expect(vi.mocked(loadExtensionsMock).mock.calls[0]?.[0]).toHaveLength(1);
  });

  test('an extension of the plugins directory overrides the bundled one having the same id', async () => {
    extensionLoader.setPluginsScanDirectory('/fake/path/scanning');
    vi.mocked(extensionsBundle.all).mockReturnValue([bundledPodmanExtension]);

    const installedExtension = buildAnalyzedExtension('podman-desktop.podman', {
      path: path.join(directories.getPluginsDirectory(), 'podman'),
    });

    vi.spyOn(extensionLoader, 'analyzeExtension').mockResolvedValue(installedExtension);
    const loadExtensionsMock = vi.spyOn(extensionLoader, 'loadExtensions');
    loadExtensionsMock.mockResolvedValue(undefined);

    readdirMock.mockImplementation(async p =>
      p === directories.getPluginsDirectory() ? [buildDirectoryEntry('podman')] : [],
    );
    vi.mocked(fs.existsSync).mockImplementation(p => p === directories.getPluginsDirectory());

    await extensionLoader.start();

    // only the extension of the plugins directory is loaded, flagged as overriding
    expect(loadExtensionsMock).toHaveBeenCalledWith([installedExtension]);
    expect(installedExtension.overrides).toEqual({ id: 'podman-desktop.podman', version: '1.0.0' });
  });

  test('a bundled extension without any matching installed extension is kept as is', async () => {
    extensionLoader.setPluginsScanDirectory('/fake/path/scanning');
    vi.mocked(extensionsBundle.all).mockReturnValue([bundledPodmanExtension]);

    const loadExtensionsMock = vi.spyOn(extensionLoader, 'loadExtensions');
    loadExtensionsMock.mockResolvedValue(undefined);

    vi.mocked(fs.existsSync).mockReturnValue(false);

    await extensionLoader.start();

    expect(loadExtensionsMock).toHaveBeenCalledWith([bundledPodmanExtension]);
    expect(bundledPodmanExtension.overrides).toBeUndefined();
  });

  test('a development folder extension having the id of a bundled extension is ignored, as before', async () => {
    extensionLoader.setPluginsScanDirectory('/fake/path/scanning');
    vi.mocked(extensionsBundle.all).mockReturnValue([bundledPodmanExtension]);

    // a development folder exposing the very same extension id
    vi.mocked(extensionDevelopmentFolder).getDevelopmentFolders.mockReturnValue([{ path: '/dev/podman' }]);
    const developmentExtension = buildAnalyzedExtension('podman-desktop.podman', {
      path: '/dev/podman',
      removable: false,
      devMode: true,
    });
    vi.spyOn(extensionLoader, 'analyzeExtension').mockResolvedValue(developmentExtension);
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension').mockResolvedValue(undefined);

    vi.mocked(fs.existsSync).mockImplementation(p => p === '/dev/podman');

    await extensionLoader.start();

    expect(loadExtensionSpy).toHaveBeenCalledOnce();
    expect(loadExtensionSpy).toHaveBeenCalledWith(bundledPodmanExtension);
    expect(developmentExtension.overrides).toBeUndefined();
  });

  test('an --extension-folder extension overrides the bundled one having the same id', async () => {
    extensionLoader.setPluginsScanDirectory('/fake/path/scanning');
    vi.mocked(extensionsBundle.all).mockReturnValue([bundledPodmanExtension]);

    const externalExtension = buildAnalyzedExtension('podman-desktop.podman', {
      path: '/external/podman',
      removable: false,
      devMode: true,
    });
    vi.mocked(extensionsExternal.all).mockReturnValue([externalExtension]);
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension').mockResolvedValue(undefined);

    vi.mocked(fs.existsSync).mockReturnValue(false);

    await extensionLoader.start();

    expect(loadExtensionSpy).toHaveBeenCalledOnce();
    expect(loadExtensionSpy).toHaveBeenCalledWith(externalExtension);
    expect(externalExtension.overrides).toEqual({ id: 'podman-desktop.podman', version: '1.0.0' });
  });

  test('an extension of the plugins directory analyzed with an error does not override a bundled one', async () => {
    extensionLoader.setPluginsScanDirectory('/fake/path/scanning');
    vi.mocked(extensionsBundle.all).mockReturnValue([bundledPodmanExtension]);

    const installedExtension = buildAnalyzedExtension('podman-desktop.podman', {
      path: path.join(directories.getPluginsDirectory(), 'podman'),
      error: 'missing required manifest entry',
    });
    vi.spyOn(extensionLoader, 'analyzeExtension').mockResolvedValue(installedExtension);
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension').mockResolvedValue(undefined);

    readdirMock.mockImplementation(async p =>
      p === directories.getPluginsDirectory() ? [buildDirectoryEntry('podman')] : [],
    );
    vi.mocked(fs.existsSync).mockImplementation(p => p === directories.getPluginsDirectory());

    await extensionLoader.start();

    // the bundled extension is kept, loaded first
    expect(loadExtensionSpy).toHaveBeenCalledOnce();
    expect(loadExtensionSpy).toHaveBeenCalledWith(bundledPodmanExtension);
    expect(installedExtension.overrides).toBeUndefined();
  });
});

describe('restore of a bundled extension on removal', () => {
  let overridingExtension: AnalyzedExtensionWithApi;

  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    overridingExtension = buildAnalyzedExtension('podman-desktop.podman', {
      overrides: { id: 'podman-desktop.podman', version: '1.0.0' },
    });
    extensionLoader.setAnalyzedExtension(overridingExtension.id, overridingExtension);
    vi.mocked(extensionsBundle.all).mockReturnValue([bundledPodmanExtension]);
    vi.spyOn(extensionLoader, 'deactivateExtension').mockResolvedValue(undefined);
  });

  test('removeExtensionPerUserRequest of an overriding extension re-analyzes and loads the bundled one', async () => {
    const restoredExtension = buildAnalyzedExtension('podman-desktop.podman', {
      path: '/bundled/podman',
      removable: false,
      bundled: true,
    });
    const analyzeExtensionSpy = vi.spyOn(extensionLoader, 'analyzeExtension').mockResolvedValue(restoredExtension);
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension').mockResolvedValue(undefined);

    await extensionLoader.removeExtensionPerUserRequest(overridingExtension.id);

    // the bundled extension is analyzed again, not reused from the bundle
    expect(analyzeExtensionSpy).toHaveBeenCalledWith({
      extensionPath: '/bundled/podman',
      removable: false,
      devMode: false,
      bundled: true,
    });
    expect(loadExtensionSpy).toHaveBeenCalledWith(restoredExtension, true);
  });

  test('removeExtension alone, as done by an update, does not restore the bundled extension', async () => {
    const analyzeExtensionSpy = vi.spyOn(extensionLoader, 'analyzeExtension');
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension');

    await extensionLoader.removeExtension(overridingExtension.id);

    expect(analyzeExtensionSpy).not.toHaveBeenCalled();
    expect(loadExtensionSpy).not.toHaveBeenCalled();
  });

  test('removeExtensionPerUserRequest of a non overriding extension does not restore anything', async () => {
    const extension = buildAnalyzedExtension('my.extension');
    extensionLoader.setAnalyzedExtension(extension.id, extension);
    const analyzeExtensionSpy = vi.spyOn(extensionLoader, 'analyzeExtension');
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension');

    await extensionLoader.removeExtensionPerUserRequest(extension.id);

    expect(analyzeExtensionSpy).not.toHaveBeenCalled();
    expect(loadExtensionSpy).not.toHaveBeenCalled();
  });

  test('removeExtensionPerUserRequest does not fail when no bundled extension matches the removed one', async () => {
    vi.mocked(extensionsBundle.all).mockReturnValue([]);
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension');

    await expect(extensionLoader.removeExtensionPerUserRequest(overridingExtension.id)).resolves.toBeUndefined();

    expect(loadExtensionSpy).not.toHaveBeenCalled();
  });

  test('removeExtensionPerUserRequest does not load a bundled extension analyzed with an error', async () => {
    vi.spyOn(extensionLoader, 'analyzeExtension').mockResolvedValue(
      buildAnalyzedExtension('podman-desktop.podman', { error: 'invalid manifest' }),
    );
    const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension');

    await extensionLoader.removeExtensionPerUserRequest(overridingExtension.id);

    expect(loadExtensionSpy).not.toHaveBeenCalled();
    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      'Error while restoring bundled extension podman-desktop.podman',
      'invalid manifest',
    );
    expect(apiSender.send).toHaveBeenCalledWith('extension-removed');
  });

  test('removeExtensionPerUserRequest completes the removal when the restore of the bundled extension fails', async () => {
    const error = new Error('analyze failed');
    vi.spyOn(extensionLoader, 'analyzeExtension').mockRejectedValue(error);

    await expect(extensionLoader.removeExtensionPerUserRequest(overridingExtension.id)).resolves.toBeUndefined();

    expect(vi.mocked(console.error)).toHaveBeenCalledWith(
      'Error while restoring bundled extension podman-desktop.podman',
      error,
    );
    expect(apiSender.send).toHaveBeenCalledWith('extension-removed');
    expect(await extensionLoader.listExtensions()).toHaveLength(0);
  });
});

test('Should watch for files and load them at startup', async () => {
  const fakeDirectory = '/fake/path/scanning';

  // fake scanning property
  extensionLoader.setPluginsScanDirectory(fakeDirectory);

  // mock fs.watch
  const fsWatchMock = vi.mocked(fs.watch);
  fsWatchMock.mockReturnValue({} as fs.FSWatcher);

  // mock fs.existsSync
  const fsExistsSyncMock = vi.mocked(fs.existsSync);
  fsExistsSyncMock.mockReturnValue(true);

  const ent1 = {
    isFile: () => true,
    isDirectory: () => false,
    name: 'foo.cdix',
  } as unknown as fs.Dirent<string>;

  const ent2 = {
    isFile: () => true,
    isDirectory: () => false,
    name: 'bar.foo',
  } as unknown as fs.Dirent<string>;

  const ent3 = {
    isFile: () => false,
    isDirectory: () => true,
    name: 'baz',
  } as unknown as fs.Dirent<string>;
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

  // mock fs.watch
  const fsWatchMock = vi.mocked(fs.watch);
  fsWatchMock.mockImplementation((filename: fs.PathLike, listener?: fs.WatchListener<string>): fs.FSWatcher => {
    watchFilename = filename;
    if (listener) {
      watchListener = listener;
    }
    return {} as fs.FSWatcher;
  });

  // mock fs.existsSync
  const fsExistsSyncMock = vi.mocked(fs.existsSync);
  fsExistsSyncMock.mockReturnValue(true);

  // mock fs.promises.readdir
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
      devMode: false,
      bundled: false,
      manifest: {} as unknown as ExtensionManifest,
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

test('creates extension storage before activation', async () => {
  const id = 'extension.id';
  let extensionContext: containerDesktopAPI.ExtensionContext | undefined;
  const activateMock = vi.fn((context: containerDesktopAPI.ExtensionContext) => {
    extensionContext = context;
  });

  await extensionLoader.activateExtension(
    {
      id,
      name: id,
      path: 'dummy',
      api: {} as typeof containerDesktopAPI,
      mainPath: '',
      removable: false,
      devMode: false,
      bundled: false,
      manifest: {} as unknown as ExtensionManifest,
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
    },
    { activate: activateMock },
  );

  const storagePath = path.resolve('/fake-extensions-storage-directory', id);
  expect(mkdirMock).toHaveBeenCalledWith(storagePath, { recursive: true });
  expect(extensionContext?.storagePath).toBe(storagePath);
  const mkdirInvocation = mkdirMock.mock.invocationCallOrder[0];
  const activateInvocation = activateMock.mock.invocationCallOrder[0];
  expect(mkdirInvocation).toBeDefined();
  expect(activateInvocation).toBeDefined();
  expect(mkdirInvocation!).toBeLessThan(activateInvocation!);
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
      devMode: false,
      bundled: false,
      manifest: {} as unknown as ExtensionManifest,
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
      devMode: false,
      bundled: false,
      manifest: {} as unknown as ExtensionManifest,
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
    'Extension extension.id activation timed out after 1000ms',
  );
  expect(extensionLoader.getExtensionState().get(id)).toBe('failed');
});

test('Verify extension load triggers an onDidChange event', async () => {
  const id = 'extension.foo';
  const onDidChangeMock: (e: void) => unknown = vi.fn();
  extensionLoader.onDidChange(onDidChangeMock);
  const analyzedExtension: AnalyzedExtension = {
    id: id,
    name: 'id',
    path: 'dummy',
    api: {} as typeof containerDesktopAPI,
    mainPath: '',
    removable: false,
    devMode: false,
    bundled: false,
    manifest: {} as unknown as ExtensionManifest,
    subscriptions: [],
    readme: '',
    dispose: vi.fn(),
  };
  expect(onDidChangeMock).not.toHaveBeenCalled();
  await extensionLoader.activateExtension(analyzedExtension, {});
  expect(onDidChangeMock).toHaveBeenCalled();
});

test('Verify extension load', async () => {
  const id = 'extension.foo';

  await extensionLoader.loadExtension({
    id: id,
    name: 'id',
    path: 'dummy',
    api: {} as typeof containerDesktopAPI,
    mainPath: '',
    removable: true,
    devMode: false,
    bundled: false,
    manifest: {
      version: '1.1',
    } as unknown as ExtensionManifest,
    subscriptions: [],
    readme: '',
    dispose: vi.fn(),
  });

  expect(extensionDevelopmentFolder.addExternalExtensionId).toBeCalledWith(id);

  // remove extension
  await extensionLoader.removeExtension(id);
  expect(extensionDevelopmentFolder.removeExternalExtensionId).toBeCalledWith(id);
});

test('Verify disabled extension skips registering contributions and runtime activation', async () => {
  const id = 'extension.disabled';

  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: vi.fn().mockImplementation((key: string, defaultValue?: unknown) => {
      if (key === 'disabled') {
        return [id];
      }
      return defaultValue;
    }),
  });

  const loadRuntimeSpy = vi.spyOn(extensionLoader, 'loadRuntime' as keyof TestExtensionLoader);

  const subscriptions: IDisposable[] = [];

  await extensionLoader.loadExtension({
    id: id,
    name: 'disabled-ext',
    path: 'dummy',
    api: {} as typeof containerDesktopAPI,
    mainPath: 'main.js',
    removable: true,
    devMode: false,
    bundled: false,
    manifest: {
      version: '1.0',
      contributes: {
        commands: [{ command: 'ext.cmd', title: 'Test Command' }],
        menus: { 'dashboard/image': [{ command: 'ext.cmd' }] },
        icons: { 'ext-icon': { default: 'icon.png' } },
        themes: [{ id: 'ext-theme', name: 'Theme', parent: 'dark', colors: {} }],
        views: { icons: [{ id: 'ext-view', name: 'View', when: '' }] },
        onboarding: { title: 'Onboarding', steps: [] },
      },
    } as unknown as ExtensionManifest,
    subscriptions: subscriptions,
    readme: '',
    dispose: vi.fn(),
  });

  expect(commandRegistry.registerCommandsFromExtension).not.toHaveBeenCalled();
  expect(menuRegistry.registerMenus).not.toHaveBeenCalled();
  expect(iconRegistry.registerIconContribution).not.toHaveBeenCalled();
  expect(colorRegistry.registerExtensionThemes).not.toHaveBeenCalled();
  expect(viewRegistry.registerViews).not.toHaveBeenCalled();
  expect(onboardingRegistry.registerOnboarding).not.toHaveBeenCalled();
  expect(notificationRegistry.registerExtension).not.toHaveBeenCalled();

  expect(loadRuntimeSpy).not.toHaveBeenCalled();
});

test('Verify enabled extension registers contributions and activates runtime', async () => {
  const id = 'extension.enabled';

  vi.mocked(commandRegistry.registerCommandsFromExtension).mockReturnValue(Disposable.create(() => {}));
  vi.mocked(menuRegistry.registerMenus).mockReturnValue(Disposable.create(() => {}));
  vi.mocked(colorRegistry.registerExtensionThemes).mockReturnValue(Disposable.create(() => {}));
  vi.mocked(viewRegistry.registerViews).mockReturnValue(Disposable.create(() => {}));
  vi.mocked(onboardingRegistry.registerOnboarding).mockReturnValue(Disposable.create(() => {}));
  vi.mocked(notificationRegistry.registerExtension).mockReturnValue(Disposable.create(() => {}));

  const subscriptions: IDisposable[] = [];

  await extensionLoader.loadExtension({
    id: id,
    name: 'enabled-ext',
    path: 'dummy',
    api: {} as typeof containerDesktopAPI,
    mainPath: '',
    removable: true,
    devMode: false,
    bundled: false,
    manifest: {
      version: '1.0',
      contributes: {
        commands: [{ command: 'ext.cmd', title: 'Test Command' }],
        menus: { 'dashboard/image': [{ command: 'ext.cmd' }] },
        icons: { 'ext-icon': { default: 'icon.png' } },
        themes: [{ id: 'ext-theme', name: 'Theme', parent: 'dark', colors: {} }],
        views: { icons: [{ id: 'ext-view', name: 'View', when: '' }] },
        onboarding: { title: 'Onboarding', steps: [] },
      },
    } as unknown as ExtensionManifest,
    subscriptions: subscriptions,
    readme: '',
    dispose: vi.fn(),
  });

  expect(commandRegistry.registerCommandsFromExtension).toHaveBeenCalledWith(id, [
    { command: 'ext.cmd', title: 'Test Command' },
  ]);
  expect(menuRegistry.registerMenus).toHaveBeenCalledWith({ 'dashboard/image': [{ command: 'ext.cmd' }] });
  expect(iconRegistry.registerIconContribution).toHaveBeenCalled();
  expect(colorRegistry.registerExtensionThemes).toHaveBeenCalled();
  expect(viewRegistry.registerViews).toHaveBeenCalledWith(id, {
    icons: [{ id: 'ext-view', name: 'View', when: '' }],
  });
  expect(onboardingRegistry.registerOnboarding).toHaveBeenCalled();
  expect(notificationRegistry.registerExtension).toHaveBeenCalledWith(id);
});

test('Verify extension do not add configuration to subscriptions', async () => {
  const id = 'extension.foo';

  const disposable = {
    dispose: vi.fn(),
  } as unknown as Disposable;
  vi.mocked(configurationRegistry.registerConfigurations).mockReturnValue(disposable);

  const subscriptions: Disposable[] = [];

  await extensionLoader.loadExtension({
    id: id,
    name: 'id',
    path: 'dummy',
    api: {} as typeof containerDesktopAPI,
    mainPath: '',
    removable: false,
    devMode: false,
    bundled: false,
    manifest: {
      version: '1.1',
      contributes: {
        configuration: {
          title: 'dummy-configuration-title',
        },
      },
    } as unknown as ExtensionManifest,
    subscriptions: subscriptions,
    readme: '',
    dispose: vi.fn(),
  });

  expect(configurationRegistry.registerConfigurations).toHaveBeenCalled();
  expect(subscriptions).not.toContain(disposable);

  await extensionLoader.deactivateExtension(id);
  expect(disposable.dispose).not.toHaveBeenCalled();
});

test('Verify extension activate registers extension features and the disposable is added to subscriptions', async () => {
  const id = 'extension.foo';
  const subscriptions: Disposable[] = [];
  const disposable = {
    dispose: vi.fn(),
  } as unknown as Disposable;
  vi.mocked(featureRegistry.registerFeatures).mockReturnValue(disposable);
  const analyzedExtension: AnalyzedExtension = {
    id: id,
    name: 'id',
    path: 'dummy',
    api: {} as typeof containerDesktopAPI,
    mainPath: '',
    removable: false,
    devMode: false,
    bundled: false,
    manifest: {
      contributes: {
        features: ['feature1', 'feature2'],
      },
    } as unknown as ExtensionManifest,
    subscriptions,
    readme: '',
    dispose: vi.fn(),
  };

  expect(featureRegistry.registerFeatures).not.toHaveBeenCalled();
  expect(subscriptions.length).toBe(0);
  await extensionLoader.activateExtension(analyzedExtension, {});

  expect(featureRegistry.registerFeatures).toHaveBeenCalledWith(id, ['feature1', 'feature2']);
  expect(subscriptions.length).greaterThanOrEqual(1);
  expect(subscriptions[0]).toBe(disposable);
});

test('Verify disable extension updates configuration', async () => {
  const ids = ['extension.foo'];

  configurationRegistryUpdateConfigurationMock.mockResolvedValue(undefined);
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
  configurationRegistryUpdateConfigurationMock.mockResolvedValue(undefined);
  extensionLoader.ensureExtensionIsEnabled(id);

  expect(configurationRegistryUpdateConfigurationMock).toHaveBeenCalledWith('extensions.disabled', after);
});

test('Verify stopping extension disables it', async () => {
  configurationRegistryUpdateConfigurationMock.mockResolvedValue(undefined);

  const id = 'extension.no.foo';
  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: () => [],
  });
  await extensionLoader.stopExtension(id);

  expect(configurationRegistryUpdateConfigurationMock).toHaveBeenCalledWith('extensions.disabled', [id]);
});

test('Verify starting extension enables it', async () => {
  configurationRegistryUpdateConfigurationMock.mockResolvedValue(undefined);

  const id = 'extension.no.foo';

  configurationRegistryGetConfigurationMock.mockReturnValue({
    get: () => ['extension.no.foo'],
  });
  await extensionLoader.startExtension(id);

  expect(configurationRegistryUpdateConfigurationMock).toHaveBeenCalledWith('extensions.disabled', []);
});

test('Verify setExtensionsUpdates', async () => {
  const extensionId = 'my.foo.extension';

  const analyzedExtension: AnalyzedExtensionWithApi = {
    id: extensionId,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtensionWithApi;
  extensionLoader.setAnalyzedExtension(extensionId, analyzedExtension);

  // get list of extensions
  const extensions = await extensionLoader.listExtensions();

  console.log('ext ', extensions);

  // check we have our extension
  expect(extensions.length).toBe(1);
  expect(extensions[0]?.id).toBe(extensionId);

  // check that update field is empty
  expect(extensions[0]?.update).toBeUndefined();

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
  expect(extensionsAfterUpdate[0]?.id).toBe(extensionId);

  // check that update field is set
  expect(extensionsAfterUpdate[0]?.update).toStrictEqual({
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

test('Verify searchForMissingDependencies(analyzedExtensions); with already loaded extensions', async () => {
  // Check if missing dependencies are found
  const extensionId1 = 'foo.extension1';
  const extensionId2 = 'foo.extension2';
  const extensionId3 = 'foo.extension3';
  const extensionId4 = 'foo.extension4';
  const unknownExtensionId = 'foo.unknown';

  // extension1 has no dependencies and has already been loaded
  const analyzedExtension1: AnalyzedExtensionWithApi = {
    id: extensionId1,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtensionWithApi;

  // extension2 has no dependencies and has already been loaded
  const analyzedExtension2: AnalyzedExtensionWithApi = {
    id: extensionId2,
    manifest: {
      name: 'hello',
    },
  } as AnalyzedExtensionWithApi;

  // extension3 depends on unknown extension unknown
  const analyzedExtension3: AnalyzedExtensionWithApi = {
    id: extensionId3,
    manifest: {
      extensionDependencies: [unknownExtensionId],
      name: 'hello',
    },
  } as AnalyzedExtensionWithApi;

  // extension4 depends on extension1
  const analyzedExtension4: AnalyzedExtensionWithApi = {
    id: extensionId4,
    manifest: {
      extensionDependencies: [extensionId1],
      name: 'hello',
    },
  } as AnalyzedExtensionWithApi;

  extensionLoader.setAnalyzedExtension(extensionId1, analyzedExtension1);
  extensionLoader.setAnalyzedExtension(extensionId2, analyzedExtension1);

  expect(analyzedExtension1.missingDependencies).toBeUndefined();
  expect(analyzedExtension2.missingDependencies).toBeUndefined();
  expect(analyzedExtension3.missingDependencies).toBeUndefined();
  expect(analyzedExtension4.missingDependencies).toBeUndefined();

  extensionLoader.searchForMissingDependencies([analyzedExtension3, analyzedExtension4]);

  // do we have missingDependencies field for extension 3 as it's missing
  expect(analyzedExtension4.missingDependencies).toStrictEqual([]);
  expect(analyzedExtension3.missingDependencies).toStrictEqual([unknownExtensionId]);
});

test('Verify sortExtensionsByDependencies(analyzedExtensions);', async () => {
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

describe('setContextValue', async () => {
  test('without scope the setValue is called with original value', async () => {
    const api = createApi();

    const setValueSpy = vi.spyOn(context, 'setValue');

    api.context.setValue('key', 'value');
    expect(setValueSpy).toBeCalledWith('key', 'value');
  });
  test('with onboarding scope the key is prefixed before calling setValue', async () => {
    const api = createApi();
    const setValueSpy = vi.spyOn(context, 'setValue');

    api.context.setValue('key', 'value', 'onboarding');
    expect(setValueSpy).toBeCalledWith('publisher.extension-name.onboarding.key', 'value');
  });

  test('with DockerCompatibility scope the key is prefixed before calling setValue', async () => {
    const api = createApi();
    const setValueSpy = vi.spyOn(context, 'setValue');

    api.context.setValue('key', 'value', 'DockerCompatibility');
    expect(setValueSpy).toBeCalledWith('publisher.extension-name.DockerCompatibility.key', 'value');
  });
});

describe('showDangerMessage', () => {
  test('should call messageBox.showDialog with danger type', async () => {
    const api = createApi();

    vi.mocked(messageBox.showDialog).mockResolvedValue('Yes');

    const result = await api.window.showDangerMessage('Are you sure?', 'Yes', 'No');

    expect(messageBox.showDialog).toHaveBeenCalledWith('danger', 'dname', 'Are you sure?', ['Yes', 'No']);
    expect(result).toBe('Yes');
  });

  test('should call messageBox.showDialog with no items', async () => {
    const api = createApi();

    vi.mocked(messageBox.showDialog).mockResolvedValue(undefined);

    const result = await api.window.showDangerMessage('Danger message');

    expect(messageBox.showDialog).toHaveBeenCalledWith('danger', 'dname', 'Danger message', []);
    expect(result).toBeUndefined();
  });
});

describe('Removing extension by user', async () => {
  test('restores the bundled extension enabled when the extension overriding it was stopped', async () => {
    // the overriding extension was stopped before being uninstalled
    let disabledExtensionIds = ['podman-desktop.podman'];
    configurationRegistryGetConfigurationMock.mockReturnValue({
      get: (key: string, defaultValue?: unknown) => (key === 'disabled' ? [...disabledExtensionIds] : defaultValue),
    });
    configurationRegistryUpdateConfigurationMock.mockImplementation(async (_key: string, value: string[]) => {
      disabledExtensionIds = value;
    });

    extensionLoader.setAnalyzedExtension(
      'podman-desktop.podman',
      buildAnalyzedExtension('podman-desktop.podman', {
        overrides: { id: 'podman-desktop.podman', version: '1.0.0' },
      }),
    );
    vi.mocked(extensionsBundle.all).mockReturnValue([bundledPodmanExtension]);
    vi.spyOn(extensionLoader, 'deactivateExtension').mockResolvedValue(undefined);
    vi.spyOn(extensionLoader, 'analyzeExtension').mockResolvedValue(bundledPodmanExtension);

    // record whether the restored extension is disabled when loaded
    let disabledWhenRestored: boolean | undefined;
    vi.spyOn(extensionLoader, 'loadExtension').mockImplementation(async extension => {
      disabledWhenRestored = extensionLoader.getDisabledExtensionIds().includes(extension.id);
    });

    await extensionLoader.removeExtensionPerUserRequest('podman-desktop.podman');

    expect(disabledWhenRestored).toBe(false);
  });

  test('keeps the extension disabled when its removal fails', async () => {
    configurationRegistryGetConfigurationMock.mockReturnValue({
      get: (key: string, defaultValue?: unknown) => (key === 'disabled' ? ['podman-desktop.podman'] : defaultValue),
    });
    vi.spyOn(extensionLoader, 'removeExtension').mockRejectedValue(new Error('removal failed'));

    await expect(extensionLoader.removeExtensionPerUserRequest('podman-desktop.podman')).rejects.toThrow(
      'removal failed',
    );

    expect(configurationRegistryUpdateConfigurationMock).not.toHaveBeenCalled();
  });

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

  test('no error in dev mode', async () => {
    const deactivateExtensionSpy = vi.spyOn(extensionLoader, 'deactivateExtension');
    const fakeAnalyzedExtension = {
      id: ExtID,
      devMode: true,
      manifest: {
        name: 'name',
        publisher: 'publisher',
        version: '1.0.0',
      },
    };
    extensionLoader.getAnalyzedExtensions().set(ExtID, fakeAnalyzedExtension as AnalyzedExtension);
    await extensionLoader.removeExtension(ExtID);
    expect(extensionDevelopmentFolder.removeExternalExtensionId).toBeCalledWith(ExtID);
    expect(deactivateExtensionSpy).toBeCalledWith(ExtID);
    expect(extensionLoader.getAnalyzedExtensions().size).toBe(0);
  });

  test('error if not in dev mode', async () => {
    const deactivateExtensionSpy = vi.spyOn(extensionLoader, 'deactivateExtension');
    const fakeAnalyzedExtension = {
      id: ExtID,
      devMode: false,
      manifest: {
        name: 'name',
        publisher: 'publisher',
        version: '1.0.0',
      },
    };
    extensionLoader.getAnalyzedExtensions().set(ExtID, fakeAnalyzedExtension as AnalyzedExtension);
    await expect(extensionLoader.removeExtension(ExtID)).rejects.toThrow('is not removable');
    expect(deactivateExtensionSpy).toBeCalledWith(ExtID);
  });
});

test('check dispose when deactivating', async () => {
  const extensionId = 'fooPublisher.fooName';
  extensionLoader.setActivatedExtension(extensionId, {
    id: extensionId,
  } as ActivatedExtension);

  const analyzedExtension: AnalyzedExtensionWithApi = {
    id: extensionId,
    dispose: vi.fn(),
  } as unknown as AnalyzedExtensionWithApi;
  extensionLoader.setAnalyzedExtension(extensionId, analyzedExtension);

  // should have call the dispose method
  await extensionLoader.deactivateExtension(extensionId);
  expect(analyzedExtension.dispose).toBeCalled();

  expect(extensionWatcher.untrack).toBeCalled();

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
      devMode: false,
      bundled: false,
      manifest: {} as unknown as ExtensionManifest,
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
    },
    { activate: activateMethod },
  );

  expect(activateMethod).toBeCalled();

  // check extensionUri
  const grabUri: containerDesktopAPI.Uri = activateMethod.mock.calls[0]?.[0].extensionUri;
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
      devMode: false,
      bundled: false,
      manifest: {
        foo: 'bar',
      } as unknown as ExtensionManifest,
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
  expect(allExtensions[0]?.exports.hello()).toBe('world');
  expect((allExtensions[0] as any).packageJSON.foo).toBe('bar');
});

describe('Navigation', async () => {
  test('navigateToContainers', async () => {
    const api = createApi();

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToContainers();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.CONTAINERS });
  });

  test('navigateToImageBuild', async () => {
    const api = createApi();

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToImageBuild();
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.IMAGE_BUILD,
      parameters: { taskId: undefined },
    });
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
    const api = createApi();

    // Mock listSimpleContainer implementation
    const containerExistSpy = vi.spyOn(containerProviderRegistry, 'containerExist');
    containerExistSpy.mockResolvedValue(true);

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
    const api = createApi();

    // Mock listSimpleContainer implementation
    const containerExistSpy = vi.spyOn(containerProviderRegistry, 'containerExist');
    containerExistSpy.mockResolvedValue(false);

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
    const api = createApi();

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToImages();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.IMAGES });
  });
  test('navigateToImage existing image', async () => {
    const api = createApi();

    // Mock listSimpleContainer implementation
    const imageExistSpy = vi.spyOn(containerProviderRegistry, 'imageExist');
    imageExistSpy.mockResolvedValue(true);
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
    const api = createApi();

    // Mock listSimpleContainer implementation
    const imageExistSpy = vi.spyOn(containerProviderRegistry, 'imageExist');
    imageExistSpy.mockResolvedValue(false);

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
  test('navigateToImageRun', async () => {
    vi.mocked(containerProviderRegistry.imageExist).mockResolvedValue(true);

    const api = createApi();

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToImageRun('sha256:55', 'podman.Podman', 'localhost/squid:latest');
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.IMAGE_RUN,
      parameters: {
        id: 'sha256:55',
        engineId: 'podman.Podman',
        tag: 'localhost/squid:latest',
      },
    });
  });
  test('navigateToVolumes', async () => {
    const api = createApi();

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToVolumes();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.VOLUMES });
  });
  test('navigateToVolume existing volume', async () => {
    const api = createApi();

    // Mock listSimpleContainer implementation
    const volumeExistSpy = vi.spyOn(containerProviderRegistry, 'volumeExist');
    volumeExistSpy.mockResolvedValue(true);
    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    await api.navigation.navigateToVolume('valid-name', 'valid-engine');

    // Ensure the send method is called properly
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.VOLUME,
      parameters: {
        name: 'valid-name',
        engineId: 'valid-engine',
      },
    });

    // Valid we listed the contains properly each time
    expect(volumeExistSpy).toHaveBeenCalledOnce();
  });
  test('navigateToVolume non-existent volume', async () => {
    const api = createApi();

    // Mock listSimpleContainer implementation
    const volumeExistSpy = vi.spyOn(containerProviderRegistry, 'volumeExist');
    volumeExistSpy.mockResolvedValue(false);

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
    const api = createApi();

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToPods();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.PODMAN_PODS });
  });
  test('navigateToPod existing pod', async () => {
    const api = createApi();

    // Mock listSimpleContainer implementation
    const podExistSpy = vi.spyOn(containerProviderRegistry, 'podExist');
    podExistSpy.mockResolvedValue(true);

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    // Call the method provided
    await api.navigation.navigateToPod('valid-kind', 'valid-name', 'valid-engine');

    // Ensure the send method is called properly
    expect(sendMock).toBeCalledWith('navigate', {
      page: NavigationPage.PODMAN_POD,
      parameters: {
        name: 'valid-name',
        engineId: 'valid-engine',
      },
    });

    // Valid we listed the contains properly each time
    expect(podExistSpy).toHaveBeenCalledOnce();
  });
  test('navigateToPod non-existent volume', async () => {
    const api = createApi();

    // Mock listSimpleContainer implementation
    const podExistSpy = vi.spyOn(containerProviderRegistry, 'podExist');
    podExistSpy.mockResolvedValue(false);

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
    const api = createApi();

    // Mock listSimpleContainer implementation
    const listContributionsSpy = vi.spyOn(contributionManager, 'listContributions');
    listContributionsSpy.mockReturnValue([
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
    const api = createApi();

    // Mock listContributions implementation
    const listContributionsSpy = vi.spyOn(contributionManager, 'listContributions');
    listContributionsSpy.mockReturnValue([]);
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
    const api = createApi();

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

  test('navigateToOnboarding without parameter', async () => {
    const api = createApi();

    vi.mocked(onboardingRegistry.getOnboarding).mockReturnValue({
      extension: 'foo',
    } as OnboardingInfo);

    await api.navigation.navigateToOnboarding();
    expect(vi.mocked(apiSender.send)).toBeCalledWith('navigate', {
      page: NavigationPage.ONBOARDING,
      parameters: {
        extensionId: 'publisher.extension-name',
      },
    });

    // checked on onboarding registry
    expect(vi.mocked(onboardingRegistry.getOnboarding)).toHaveBeenCalledWith('publisher.extension-name');
  });

  test('navigateToOnboarding with parameter', async () => {
    vi.mocked(onboardingRegistry.getOnboarding).mockReturnValue({
      extension: 'foo',
    } as OnboardingInfo);

    const api = createApi();

    // Call the method provided
    await api.navigation.navigateToOnboarding('my.extension');

    // Ensure the send method is called properly
    expect(vi.mocked(apiSender.send)).toBeCalledWith('navigate', {
      page: NavigationPage.ONBOARDING,
      parameters: {
        extensionId: 'my.extension',
      },
    });

    // checked on onboarding registry
    expect(vi.mocked(onboardingRegistry.getOnboarding)).toHaveBeenCalledWith('my.extension');
  });

  test('navigateToOnboarding but no onboarding available', async () => {
    vi.mocked(onboardingRegistry.getOnboarding).mockReturnValue(undefined);

    const api = createApi();

    // Call the method provided
    let error = undefined;
    try {
      await api.navigation.navigateToOnboarding('do.not-exists');
    } catch (e) {
      error = e;
    }
    expect(error).toBeDefined();

    // Ensure the send method is never called
    expect(vi.mocked(apiSender.send)).not.toHaveBeenCalled();

    // checked on onboarding registry
    expect(vi.mocked(onboardingRegistry.getOnboarding)).toHaveBeenCalledWith('do.not-exists');
  });

  test('navigateToCliTools', async () => {
    const api = createApi();

    // Spy send method
    const sendMock = vi.spyOn(apiSender, 'send');

    await api.navigation.navigateToCliTools();
    expect(sendMock).toBeCalledWith('navigate', { page: NavigationPage.CLI_TOOLS });
  });
});

describe('navigation history', () => {
  test('pushHistoryEntry delegates to navigationManager with the calling extension id', () => {
    const api = createApi();

    const pushHistoryEntrySpy = vi.spyOn(navigationManager, 'pushHistoryEntry');

    const entry = { id: 'model-1', label: 'Model 1' };
    api.navigation.pushHistoryEntry(entry);

    expect(pushHistoryEntrySpy).toHaveBeenCalledWith('publisher.extension-name', entry);
  });

  test('onDidNavigateToHistoryEntry delegates to navigationManager with the calling extension id', () => {
    const api = createApi();

    const onDidNavigateToHistoryEntrySpy = vi.spyOn(navigationManager, 'onDidNavigateToHistoryEntry');

    const listener = vi.fn();
    api.navigation.onDidNavigateToHistoryEntry(listener);

    expect(onDidNavigateToHistoryEntrySpy).toHaveBeenCalledWith(
      'publisher.extension-name',
      listener,
      undefined,
      undefined,
    );
  });

  test('onDidNavigateToHistoryEntry fires the listener when the extension navigates back to its own entry', () => {
    const api = createApi();

    const listener = vi.fn();
    api.navigation.onDidNavigateToHistoryEntry(listener);

    navigationManager.navigateToHistoryEntry('publisher.extension-name', 'model-1');

    expect(listener).toHaveBeenCalledWith({ id: 'model-1' });
  });
});

test('check listWebviews', async () => {
  const api = createApi();

  // Mock listSimpleWebviews implementation
  const listSimpleWebviewsSpy = vi.spyOn(webviewRegistry, 'listSimpleWebviews');
  listSimpleWebviewsSpy.mockResolvedValue([
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
  ]);
  // Call the method provided
  const result = await api.window.listWebviews();

  // check we called method
  expect(listSimpleWebviewsSpy).toHaveBeenCalledOnce();

  // esnure we got result
  expect(result).toBeDefined();
  expect(result.length).toBe(2);
  expect(result[0]?.id).toBe('123');
  expect(result[0]?.viewType).toBe('customView');
  expect(result[0]?.title).toBe('customTitle1');
  expect(result[1]?.id).toBe('456');
  expect(result[1]?.viewType).toBe('anotherView');
  expect(result[1]?.title).toBe('customTitle2');
});

test('check version', async () => {
  const fakeVersion = '1.2.3.4';
  // mock electron.app.getVersion
  vi.mocked(app.getVersion).mockReturnValue(fakeVersion);
  const api = createApi();

  const readPodmanVersion = api.version;

  // check we called method
  expect(readPodmanVersion).toBe(fakeVersion);
});

describe('apiVersion', () => {
  const APP_VERSION_MOCK = '1.2.3';

  test('expect apiVersion to be the return value of ExtensionApiVersion#getApiVersion', async () => {
    vi.mocked(extensionApiVersion.getApiVersion).mockReturnValue(APP_VERSION_MOCK);
    const api = createApi();

    expect(api.apiVersion).toEqual(APP_VERSION_MOCK);
  });
});

test('listPods', async () => {
  const listPodsSpy = vi.spyOn(containerProviderRegistry, 'listPods');

  const api = createApi();

  await api.containerEngine.listPods();
  expect(listPodsSpy).toHaveBeenCalledOnce();
});

test('stopPod', async () => {
  const stopPodSpy = vi.spyOn(containerProviderRegistry, 'stopPod');
  const api = createApi();
  await api.containerEngine.stopPod('engine1', 'pod1');
  expect(stopPodSpy).toHaveBeenCalledWith('engine1', 'pod1');
});

test('removePod', async () => {
  const removePodSpy = vi.spyOn(containerProviderRegistry, 'removePod');
  const api = createApi();
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

    const api = createApi(disposables);
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
    const api = createApi();

    expect(api).toBeDefined();

    api.authentication.registerAuthenticationProvider('provider1.id', 'Provider1 Label', providerMock, {});

    // grab the call to authenticationProviderRegistry.registerAuthenticationProvider
    const call = vi.mocked(authenticationProviderRegistry.registerAuthenticationProvider).mock.calls[0];

    // get options from the call
    const options = call?.[3];

    expect(options?.images?.logo).toBeUndefined();
    expect(options?.images?.icon).toBeUndefined();
  });

  test('allows images option to be single image', async () => {
    vi.mocked(getBase64Image).mockReturnValue(BASE64ENCODEDIMAGE);
    const api = createApi();

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
    const options = call?.[3];

    expect(options?.images?.logo).equals(BASE64ENCODEDIMAGE);
    expect(options?.images?.icon).equals(BASE64ENCODEDIMAGE);
  });

  test('allows images option to be light/dark image', async () => {
    vi.mocked(getBase64Image).mockReturnValue(BASE64ENCODEDIMAGE);
    const api = createApi();

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
    const options = call?.[3];

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

  const api = createApi(disposables);

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

  const api = createApi(disposables);

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
    api: {},
    subscriptions: [],
  } as unknown as AnalyzedExtension;

  await extensionLoader.loadExtension(fakeExtension);

  expect(colorRegistry.registerExtensionThemes).toBeCalledWith(fakeExtension, manifest.contributes.themes);
});

describe('window', async () => {
  test('showOpenDialog ', async () => {
    const api = createApi();

    expect(api).toBeDefined();

    const filePaths = ['/path-to-file1', '/path-to-file2'];
    vi.mocked(dialogRegistry.openDialog).mockResolvedValue(filePaths);

    const uris = await api.window.showOpenDialog();
    expect(uris?.length).toBe(2);
    const urisArray = uris as containerDesktopAPI.Uri[];

    expect(dialogRegistry.openDialog).toBeCalled();
    expect(urisArray[0]?.fsPath).toContain('path-to-file1');
    expect(urisArray[1]?.fsPath).toContain('path-to-file2');
  });

  test('showSaveDialog ', async () => {
    const api = createApi();

    expect(api).toBeDefined();

    const filePath = '/path-to-file1';
    vi.mocked(dialogRegistry.saveDialog).mockResolvedValue(Uri.file(filePath));

    const uri = await api.window.showSaveDialog();

    expect(dialogRegistry.saveDialog).toBeCalled();
    expect(uri?.fsPath).toContain('path-to-file1');
  });
});

describe('containerEngine', async () => {
  const CONTAINER_PROVIDER_MOCK = {
    name: 'dummyProvider',
  } as unknown as containerDesktopAPI.ContainerProviderConnection;

  describe('buildImage', () => {
    let api: typeof containerDesktopAPI;
    beforeEach(() => {
      api = createApi();
      expect(api).toBeDefined();
    });

    test('buildImage without options should call ContainerProviderRegistry#buildImage without options', async () => {
      const callbackMock = vi.fn();
      await api.containerEngine.buildImage('context', callbackMock);

      expect(containerProviderRegistry.buildImage).toHaveBeenCalledOnce();
      expect(containerProviderRegistry.buildImage).toHaveBeenCalledWith('context', callbackMock, undefined);
    });

    test('non-(string | boolean) pull option should throw an error', async () => {
      await expect(async () => {
        await api.containerEngine.buildImage('context', vi.fn(), {
          pull: { foo: 'bar' }, // non-sense
        } as unknown as containerDesktopAPI.BuildImageOptions);
      }).rejects.toThrowError('option pull should be of type string or boolean got object');
    });

    type TestCase = {
      name: string;
      options?: containerDesktopAPI.BuildImageOptions;
      expected?: InternalBuildImageOptions;
    };

    test.each([
      {
        name: 'pull options as true string',
        options: {
          pull: 'true',
        },
        expected: {
          pull: true,
        },
      },
      {
        name: 'pull options as True string (uppercase)',
        options: {
          pull: 'True',
        },
        expected: {
          pull: true,
        },
      },
      {
        name: 'pull options as non-true string',
        options: {
          pull: 'false',
        },
        expected: {
          pull: false,
        },
      },
    ] as Array<TestCase>)('$name', async ({ options, expected }) => {
      await api.containerEngine.buildImage('context', vi.fn(), options);

      expect(containerProviderRegistry.buildImage).toHaveBeenCalledWith('context', expect.any(Function), expected);
    });
  });

  test('statsContainer ', async () => {
    vi.mocked(containerProviderRegistry.getContainerStats).mockResolvedValue(99);
    vi.mocked(containerProviderRegistry.stopContainerStats).mockResolvedValue(undefined);

    const api = createApi();

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
    vi.mocked(containerProviderRegistry.listImages).mockResolvedValue([]);

    const api = createApi();

    expect(api).toBeDefined();

    const images = await api.containerEngine.listImages();
    expect(images.length).toBe(0);
    expect(containerProviderRegistry.listImages).toHaveBeenCalledWith(undefined);
  });

  test('listImages with provider option', async () => {
    vi.mocked(containerProviderRegistry.listImages).mockResolvedValue([]);
    const api = createApi();

    expect(api).toBeDefined();

    const images = await api.containerEngine.listImages({
      provider: CONTAINER_PROVIDER_MOCK,
    });
    expect(images.length).toBe(0);
    expect(containerProviderRegistry.listImages).toHaveBeenCalledWith({
      provider: CONTAINER_PROVIDER_MOCK,
    });
  });

  test('listInfos without option', async () => {
    vi.mocked(containerProviderRegistry.listInfos).mockResolvedValue([]);
    const api = createApi();

    expect(api).toBeDefined();

    const infos = await api.containerEngine.listInfos();
    expect(infos.length).toBe(0);
    expect(containerProviderRegistry.listInfos).toHaveBeenCalledWith(undefined);
  });

  test('listInfos with provider option', async () => {
    vi.mocked(containerProviderRegistry.listInfos).mockResolvedValue([]);
    const api = createApi();
    expect(api).toBeDefined();

    const infos = await api.containerEngine.listInfos({
      provider: CONTAINER_PROVIDER_MOCK,
    });
    expect(infos.length).toBe(0);
    expect(containerProviderRegistry.listInfos).toHaveBeenCalledWith({
      provider: CONTAINER_PROVIDER_MOCK,
    });
  });

  test('pullImage with minimal arguments', async () => {
    const CALLBACK_MOCK = vi.fn();
    const api = createApi();
    expect(api).toBeDefined();

    await api.containerEngine.pullImage(CONTAINER_PROVIDER_MOCK, 'dummy-image:tag', CALLBACK_MOCK);
    expect(containerProviderRegistry.pullImage).toHaveBeenCalledWith(
      CONTAINER_PROVIDER_MOCK,
      'dummy-image:tag',
      CALLBACK_MOCK,
      undefined, // platform
      undefined, // abort controller
    );
  });

  test('pullImage with a cancellation token', async () => {
    const CANCELLATION_TOKEN: containerDesktopAPI.CancellationToken = {
      onCancellationRequested: vi.fn(),
      isCancellationRequested: false,
    };
    const api = createApi();
    expect(api).toBeDefined();

    // pass out cancellation token to the containerEngine api
    await api.containerEngine.pullImage(
      CONTAINER_PROVIDER_MOCK,
      'dummy-image:tag',
      vi.fn(),
      undefined,
      CANCELLATION_TOKEN,
    );

    // ensure an abort controller has been passed to pull image
    expect(containerProviderRegistry.pullImage).toHaveBeenCalledWith(
      CONTAINER_PROVIDER_MOCK,
      'dummy-image:tag',
      expect.any(Function),
      undefined, // platform
      expect.any(AbortController), // abort controller
    );

    // get back the controller using vi.mocked
    const controller: AbortController | undefined = vi.mocked(containerProviderRegistry.pullImage).mock.calls[0]?.[4];
    expect(controller).toBeDefined();
    // ensure it is not aborted
    expect(controller?.signal.aborted).toBeFalsy();

    // expect one subscriber, and get it
    expect(CANCELLATION_TOKEN.onCancellationRequested).toHaveBeenCalledOnce();
    const callback = vi.mocked(CANCELLATION_TOKEN.onCancellationRequested).mock.calls[0]?.[0];
    callback?.(undefined);

    // the signal should be marked as aborted
    expect(controller?.signal.aborted).toBeTruthy();
  });

  test('inspectPod', async () => {
    const pod: PodInspectInfo = {
      Id: 'podId',
    } as PodInspectInfo;
    vi.mocked(containerProviderRegistry.getPodInspect).mockResolvedValue(pod);
    const api = createApi();

    expect(api).toBeDefined();

    const inspect = await api.containerEngine.inspectPod('engineId', 'podId');
    expect(inspect).toEqual(pod);

    expect(containerProviderRegistry.getPodInspect).toHaveBeenCalledWith('engineId', 'podId');
  });
});

describe('extensionContext', async () => {
  test('secrets', async () => {
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
    expect(telemetry.aggregateTrack).toBeCalledWith('activateExtensions', {
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
  expect(loadExtensionMock.mock.calls[0]?.[0]).toBe(analyzedExtension1);
  expect(loadExtensionMock.mock.calls[1]?.[0]).toBe(analyzedExtension2);
  expect(loadExtensionMock.mock.calls[2]?.[0]).toBe(analyzedExtension3);
});

test('when loading registry registerRegistry, do not push to disposables', async () => {
  const disposables: IDisposable[] = [];

  const api = createApi(disposables);
  expect(api).toBeDefined();

  const fakeRegistry = {
    source: 'fake',
    serverUrl: 'http://fake',
    username: 'foo',
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    password: 'bar',
    secret: 'baz',
  };

  api.registry.registerRegistry(fakeRegistry);

  expect(disposables.length).toBe(0);
});

test('when registering a navigation route, should be pushed to disposables', () => {
  const disposables: IDisposable[] = [];

  const api = createApi(disposables);
  expect(api).toBeDefined();

  expect(disposables.length).toBe(0);
  api.navigation.register('dummy-route-id', 'dummy-command-id');
  expect(disposables.length).toBe(1);
});

test('when registering a navigation route with searchEntry, the searchEntry should be passed through', () => {
  const api = createApi();

  const disposable = api.navigation.register('search-route', 'my-command', { label: 'My Label' });

  const routes = navigationManager.getSearchableRoutes();
  expect(routes).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        routeId: 'publisher.extension-name.search-route',
        label: 'My Label',
      }),
    ]),
  );

  disposable.dispose();
});

test('when registering a navigation route with searchEntry without icon and no extension icon, icon should be undefined', () => {
  const api = createApi();

  const disposable = api.navigation.register('icon-fallback-route', 'my-command', { label: 'My Label' });

  const routes = navigationManager.getSearchableRoutes();
  const route = routes.find(r => r.routeId === 'publisher.extension-name.icon-fallback-route');
  expect(route?.icon).toBeUndefined();

  disposable.dispose();
});

test('withProgress should add the extension id to the routeId', async () => {
  vi.mocked(progress.withProgress).mockResolvedValue(undefined);
  const api = createApi();

  expect(api).toBeDefined();

  await api.window.withProgress<void>(
    {
      location: ProgressLocation.TASK_WIDGET,
      title: 'Dummy title',
      details: {
        routeId: 'publisher.extension-name.publisher.extension-name.dummy-route-id',
        routeArgs: ['hello', 'world'],
      },
    },
    async () => {},
  );

  expect(progress.withProgress).toHaveBeenCalledWith(
    {
      location: ProgressLocation.TASK_WIDGET,
      title: 'Dummy title',
      details: {
        routeId: 'publisher.extension-name.publisher.extension-name.publisher.extension-name.dummy-route-id',
        routeArgs: ['hello', 'world'],
      },
    },
    expect.any(Function),
  );
});

test('reload extensions', async () => {
  const extension = {
    path: 'fakePath',
    manifest: {
      displayName: 'My Extension Display Name',
    },
    id: 'my.extensionId',
  } as unknown as AnalyzedExtension;

  // override deactivateExtension
  const deactivateSpy = vi.spyOn(extensionLoader, 'deactivateExtension');
  const analyzeExtensionSpy = vi.spyOn(extensionLoader, 'analyzeExtension');
  const loadExtensionSpy = vi.spyOn(extensionLoader, 'loadExtension');
  const analyzedExtension = {} as unknown as AnalyzedExtensionWithApi;
  analyzeExtensionSpy.mockResolvedValue(analyzedExtension);

  const fakeDisposableObject = {
    dispose: vi.fn(),
  } as unknown as Disposable;
  vi.mocked(notificationRegistry.addNotification).mockReturnValue(fakeDisposableObject);

  // reload the extension
  await extensionLoader.reloadExtension(extension, false);

  expect(deactivateSpy).toBeCalledWith(extension.id);
  expect(analyzeExtensionSpy).toBeCalledWith({
    extensionPath: extension.path,
    removable: false,
  });
  expect(loadExtensionSpy).toBeCalledWith(analyzedExtension, true);

  expect(vi.mocked(notificationRegistry.addNotification)).toBeCalledWith({
    extensionId: extension.id,
    title: 'Extension My Extension Display Name has been updated',
    type: 'info',
  });

  // restore the spy
  deactivateSpy.mockRestore();
  analyzeExtensionSpy.mockRestore();
  loadExtensionSpy.mockRestore();

  // wait the notification is disposed
  await vi.waitFor(() => expect(fakeDisposableObject.dispose).toBeCalled(), { timeout: 5_000 });
});

test('listExtensions should expose the bundled flag', async () => {
  const extensionId = 'my.bundled.extension';

  extensionLoader.setAnalyzedExtension(extensionId, {
    id: extensionId,
    path: 'fakePath',
    manifest: {
      name: 'bundled-extension',
    },
    removable: false,
    devMode: false,
    bundled: true,
  } as unknown as AnalyzedExtensionWithApi);

  const extensions = await extensionLoader.listExtensions();

  expect(extensions.length).toBe(1);
  expect(extensions[0]?.bundled).toBeTruthy();
  expect(extensions[0]?.removable).toBeFalsy();
});

describe.each([
  { name: 'the bundled flag', removable: false, bundled: true, overrides: undefined },
  {
    name: 'overrides',
    removable: true,
    bundled: false,
    overrides: { id: 'my.bundled.extension', version: '1.0.0' },
  },
])('should forward $name to analyzeExtension', ({ removable, bundled, overrides }) => {
  test('reloadExtension', async () => {
    const extension = {
      path: 'fakePath',
      manifest: {
        displayName: 'My Extension Display Name',
      },
      id: 'my.extensionId',
      devMode: false,
      bundled,
      overrides,
    } as unknown as AnalyzedExtension;

    vi.spyOn(extensionLoader, 'deactivateExtension').mockResolvedValue(undefined);
    const analyzeExtensionSpy = vi.spyOn(extensionLoader, 'analyzeExtension');
    analyzeExtensionSpy.mockResolvedValue({} as unknown as AnalyzedExtensionWithApi);
    vi.spyOn(extensionLoader, 'loadExtension').mockResolvedValue(undefined);
    vi.mocked(notificationRegistry.addNotification).mockReturnValue({ dispose: vi.fn() } as unknown as Disposable);

    await extensionLoader.reloadExtension(extension, removable);

    expect(analyzeExtensionSpy).toBeCalledWith({
      extensionPath: extension.path,
      removable,
      devMode: false,
      bundled,
      overrides,
    });
  });

  test('startExtension', async () => {
    const extensionId = 'my.extensionId';

    configurationRegistryGetConfigurationMock.mockReturnValue({
      get: (): string[] => [],
    });

    extensionLoader.setAnalyzedExtension(extensionId, {
      id: extensionId,
      path: 'fakePath',
      manifest: {
        name: 'my-extension',
      },
      removable,
      devMode: false,
      bundled,
      overrides,
    } as unknown as AnalyzedExtensionWithApi);

    const analyzeExtensionSpy = vi.spyOn(extensionLoader, 'analyzeExtension');
    analyzeExtensionSpy.mockResolvedValue({} as unknown as AnalyzedExtensionWithApi);
    vi.spyOn(extensionLoader, 'loadExtension').mockResolvedValue(undefined);

    await extensionLoader.startExtension(extensionId);

    expect(analyzeExtensionSpy).toBeCalledWith({
      extensionPath: 'fakePath',
      removable,
      devMode: false,
      bundled,
      overrides,
    });
  });
});

test('listExtensions should expose overrides', async () => {
  const extensionId = 'my.overrides.extension';

  extensionLoader.setAnalyzedExtension(extensionId, {
    id: extensionId,
    path: 'fakePath',
    manifest: {
      name: 'overriding-extension',
    },
    removable: true,
    devMode: false,
    bundled: false,
    overrides: { id: 'my.bundled.extension', version: '1.0.0' },
  } as unknown as AnalyzedExtensionWithApi);

  const extensions = await extensionLoader.listExtensions();

  expect(extensions.length).toBe(1);
  expect(extensions[0]?.overrides).toEqual({ id: 'my.bundled.extension', version: '1.0.0' });
  expect(extensions[0]?.bundled).toBeFalsy();
  expect(extensions[0]?.removable).toBeTruthy();
});

describe('init', () => {
  test('check configuration being registered', async () => {
    await extensionLoader.init();
    expect(configurationRegistry.registerConfigurations).toBeCalled();

    // get the object being called
    const call = vi.mocked(configurationRegistry.registerConfigurations).mock.calls[0];
    expect(call).toBeDefined();

    // check the developmentMode property is passed
    const configurations = call?.[0];
    expect(configurations).toBeDefined();
    expect(configurations?.length).toBeGreaterThanOrEqual(3);
    expect(configurations?.[2]?.id).toBe('preferences.extensions');
    const property =
      configurations?.[2]?.properties?.[
        `${ExtensionLoaderSettings.SectionName}.${ExtensionLoaderSettings.DevelopmentMode}`
      ];
    expect(property).toBeDefined();
    expect(property?.type).toBe('boolean');
    expect(property?.default).toBeTruthy();
  });
});

describe('loadDevelopmentFolderExtensions', () => {
  test('check loading', async () => {
    vi.mocked(extensionDevelopmentFolder).getDevelopmentFolders.mockReturnValue([
      { path: 'foo' },
      { path: 'bar' },
      { path: 'baz' },
    ]);

    // spy console.error
    const consoleErrorSpy = vi.spyOn(console, 'error');

    // 1st is non existing
    vi.mocked(fs.existsSync).mockReturnValueOnce(false);
    // 2nd exists
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);
    // 3rd exists
    vi.mocked(fs.existsSync).mockReturnValueOnce(true);

    const analyzeExtensionSpy = vi.spyOn(extensionLoader, 'analyzeExtension');
    // bar is working
    const barAnalyzedExtension = {} as AnalyzedExtensionWithApi;
    analyzeExtensionSpy.mockResolvedValueOnce(barAnalyzedExtension);
    // baz has error
    const bazAnalyzedExtension = { error: 'dummy error' } as AnalyzedExtensionWithApi;
    analyzeExtensionSpy.mockResolvedValueOnce(bazAnalyzedExtension);

    const analyzedExtensions: AnalyzedExtension[] = [];
    await extensionLoader.loadDevelopmentFolderExtensions(analyzedExtensions);

    // check only bar has been added
    expect(analyzedExtensions.length).toBe(1);
    expect(analyzedExtensions[0]).toBe(barAnalyzedExtension);

    // expect we got a console error for baz
    expect(consoleErrorSpy).toBeCalledWith('Error while analyzing extension baz', bazAnalyzedExtension.error);

    consoleErrorSpy.mockRestore();
  });
});

test('ExtensionLoader async dispose should stop all extensions', async () => {
  const activateMock = vi.fn().mockResolvedValue(undefined);
  const deactivateMock = vi.fn().mockResolvedValue(undefined);

  configurationRegistryGetConfigurationMock.mockReturnValue({ get: vi.fn().mockReturnValue(1) });

  const id = 'extension.id';
  await extensionLoader.activateExtension(
    {
      id: id,
      name: 'id',
      path: 'dummy',
      api: {} as typeof containerDesktopAPI,
      mainPath: '',
      removable: false,
      devMode: false,
      manifest: {} as unknown as ExtensionManifest,
      subscriptions: [],
      readme: '',
      dispose: vi.fn(),
      bundled: false,
    },
    {
      activate: activateMock,
      deactivate: deactivateMock,
    },
  );

  const extensions = extensionLoader.getActivatedExtensions();
  expect(extensions.size).toEqual(1);

  expect(activateMock).toHaveBeenCalledOnce();
  expect(deactivateMock).not.toHaveBeenCalled();

  await extensionLoader.asyncDispose();

  expect(deactivateMock).toHaveBeenCalledOnce();
  expect(fileSystemMonitoring.asyncDispose).toHaveBeenCalledOnce();
});

test('asyncDispose should call fileSystemMonitoring.asyncDispose', async () => {
  await extensionLoader.asyncDispose();

  expect(fileSystemMonitoring.asyncDispose).toHaveBeenCalledOnce();
});

describe('env API', () => {
  test('expect env.appName to be product name', () => {
    const api = createApi();
    expect(api.env.appName).toBe(product.name);
  });

  test('expect env.urlProtocol to be product urlProtocol', () => {
    const api = createApi();
    expect(api.env.urlProtocol).toBe(product.urlProtocol);
  });
});
