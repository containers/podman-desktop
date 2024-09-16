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

import * as fs from 'node:fs';

import type * as extensionApi from '@podman-desktop/api';
import * as podmanDesktopApi from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import * as extension from './extension';
import type { KindGithubReleaseArtifactMetadata } from './kind-installer';
import { KindInstaller } from './kind-installer';
import * as util from './util';

vi.mock('./image-handler', async () => {
  return {
    ImageHandler: vi.fn().mockImplementation(() => {
      return {
        moveImage: vi.fn(),
      };
    }),
  };
});

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      withProgress: vi.fn(),
      createStatusBarItem: vi.fn(),
    },
    cli: {
      createCliTool: vi.fn(),
    },
    ProgressLocation: {
      TASK_WIDGET: 'TASK_WIDGET',
    },
    provider: {
      onDidRegisterContainerConnection: vi.fn(),
      onDidUnregisterContainerConnection: vi.fn(),
      onDidUpdateProvider: vi.fn(),
      onDidUpdateContainerConnection: vi.fn(),
      createProvider: vi.fn(),
    },
    containerEngine: {
      listContainers: vi.fn(),
      onEvent: vi.fn(),
    },
    commands: {
      registerCommand: vi.fn(),
    },
    context: {
      setValue: vi.fn(),
    },
    env: {
      isWindows: false,
      isMac: false,
      isLinux: true,
      createTelemetryLogger: vi.fn().mockReturnValue({
        logUsage: vi.fn(),
      } as unknown as extensionApi.TelemetryLogger),
    },
    process: {
      exec: vi.fn(),
    },
  };
});

const kindInstallerMock = {
  getLatestVersionAsset: vi.fn(),
  getKindCliStoragePath: vi.fn(),
  download: vi.fn(),
  promptUserForVersion: vi.fn(),
} as unknown as KindInstaller;

vi.mock('./kind-installer', () => ({
  KindInstaller: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(podmanDesktopApi.cli.createCliTool).mockReturnValue({
    displayName: 'test',
    dispose: vi.fn(),
  } as unknown as extensionApi.CliTool);

  vi.mocked(podmanDesktopApi.provider.createProvider).mockResolvedValue({
    setKubernetesProviderConnectionFactory: vi.fn(),
  } as unknown as extensionApi.Provider);

  const createProviderMock = vi.fn();
  (podmanDesktopApi.provider as any).createProvider = createProviderMock;
  createProviderMock.mockImplementation(() => ({ setKubernetesProviderConnectionFactory: vi.fn() }));

  vi.mocked(podmanDesktopApi.containerEngine.listContainers).mockResolvedValue([]);
  vi.mocked(KindInstaller).mockReturnValue(kindInstallerMock);
});

test('check we received notifications ', async () => {
  const onDidUpdateContainerConnectionMock = vi.fn();
  (podmanDesktopApi.provider as any).onDidUpdateContainerConnection = onDidUpdateContainerConnectionMock;

  const listContainersMock = vi.fn();
  (podmanDesktopApi.containerEngine as any).listContainers = listContainersMock;
  listContainersMock.mockResolvedValue([]);

  let callbackCalled = false;
  onDidUpdateContainerConnectionMock.mockImplementation((callback: any) => {
    callback();
    callbackCalled = true;
  });

  const fakeProvider = {} as unknown as podmanDesktopApi.Provider;
  extension.refreshKindClustersOnProviderConnectionUpdate(fakeProvider);
  expect(callbackCalled).toBeTruthy();
  expect(listContainersMock).toBeCalledTimes(1);
});

describe('cli tool', () => {
  test('activation should register cli tool when available, installed by desktop', async () => {
    vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
      path: 'kind',
      version: '0.0.1',
    });
    vi.spyOn(util, 'getSystemBinaryPath').mockReturnValue('kind');
    vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue({
      registerUpdate: vi.fn(),
      registerInstaller: vi.fn(),
      updateVersion: vi.fn(),
    } as unknown as extensionApi.CliTool);

    await extension.activate(
      vi.mocked<extensionApi.ExtensionContext>({
        storagePath: 'test-storage-path',
        subscriptions: {
          push: vi.fn(),
        },
      } as unknown as extensionApi.ExtensionContext),
    );

    expect(podmanDesktopApi.cli.createCliTool).toHaveBeenCalledWith({
      displayName: 'Kind',
      path: 'kind',
      version: '0.0.1',
      name: 'kind',
      images: expect.anything(),
      markdownDescription: expect.any(String),
      installationSource: 'extension',
    });
  });

  test('activation should register cli tool when available, installed by user', async () => {
    vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
      path: 'kind',
      version: '0.0.1',
    });
    vi.spyOn(util, 'getSystemBinaryPath').mockReturnValue('user-kind');
    vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue({
      registerUpdate: vi.fn(),
      registerInstaller: vi.fn(),
      updateVersion: vi.fn(),
    } as unknown as extensionApi.CliTool);

    await extension.activate(
      vi.mocked<extensionApi.ExtensionContext>({
        storagePath: 'test-storage-path',
        subscriptions: {
          push: vi.fn(),
        },
      } as unknown as extensionApi.ExtensionContext),
    );

    expect(podmanDesktopApi.cli.createCliTool).toHaveBeenCalledWith({
      displayName: 'Kind',
      path: 'kind',
      version: '0.0.1',
      name: 'kind',
      images: expect.anything(),
      markdownDescription: expect.any(String),
      installationSource: 'external',
    });
  });

  test('activation should register cli tool when does not exist', async () => {
    vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValue(new Error('does not exist'));
    vi.spyOn(podmanDesktopApi.window, 'createStatusBarItem').mockReturnValue({
      show: vi.fn(),
    } as unknown as extensionApi.StatusBarItem);
    vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue({
      registerUpdate: vi.fn(),
      registerInstaller: vi.fn(),
      updateVersion: vi.fn(),
    } as unknown as extensionApi.CliTool);

    await extension.activate(
      vi.mocked<extensionApi.ExtensionContext>({
        storagePath: 'test-storage-path',
        subscriptions: {
          push: vi.fn(),
        },
      } as unknown as extensionApi.ExtensionContext),
    );

    expect(podmanDesktopApi.cli.createCliTool).toHaveBeenCalledWith({
      name: 'kind',
      images: {
        icon: './icon.png',
      },
      displayName: 'Kind',
      markdownDescription: expect.any(String),
    });
  });

  test('activation should register cli tool when available in storage path', async () => {
    vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValueOnce(new Error('does not exist')).mockResolvedValue({
      version: '0.0.1',
      path: 'test-storage-path/kind',
    });

    vi.spyOn(util, 'getSystemBinaryPath').mockReturnValue('test-storage-path/kind');
    vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue({
      registerUpdate: vi.fn(),
      registerInstaller: vi.fn(),
      updateVersion: vi.fn(),
    } as unknown as extensionApi.CliTool);

    await extension.activate(
      vi.mocked<extensionApi.ExtensionContext>({
        storagePath: 'test-storage-path',
        subscriptions: {
          push: vi.fn(),
        },
      } as unknown as extensionApi.ExtensionContext),
    );

    expect(util.getKindBinaryInfo).toHaveBeenCalledTimes(2);
    expect(podmanDesktopApi.cli.createCliTool).toHaveBeenCalledWith({
      displayName: 'Kind',
      path: 'test-storage-path/kind',
      version: '0.0.1',
      name: 'kind',
      images: expect.anything(),
      markdownDescription: expect.any(String),
      installationSource: 'extension',
    });
  });
});

test('Ensuring a progress task is created when calling kind.image.move command', async () => {
  const commandRegistry: { [id: string]: (image: { id: string; image: string; engineId: string }) => Promise<void> } =
    {};

  const registerCommandMock = vi.fn();
  (podmanDesktopApi.commands as any).registerCommand = registerCommandMock;

  registerCommandMock.mockImplementation((command: string, callback: (image: { image: string }) => Promise<void>) => {
    commandRegistry[command] = callback;
  });

  const createProviderMock = vi.fn();
  (podmanDesktopApi.provider as any).createProvider = createProviderMock;
  createProviderMock.mockImplementation(() => ({ setKubernetesProviderConnectionFactory: vi.fn() }));

  const listContainersMock = vi.fn();
  (podmanDesktopApi.containerEngine as any).listContainers = listContainersMock;
  listContainersMock.mockResolvedValue([]);

  const withProgressMock = vi
    .fn()
    .mockImplementation(() =>
      extension.moveImage({ report: vi.fn() }, { id: 'id', image: 'hello:world', engineId: '1' }),
    );
  (podmanDesktopApi.window as any).withProgress = withProgressMock;

  const contextSetValueMock = vi.fn();
  (podmanDesktopApi.context as any).setValue = contextSetValueMock;
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue({
    registerUpdate: vi.fn(),
    registerInstaller: vi.fn(),
    updateVersion: vi.fn(),
  } as unknown as extensionApi.CliTool);

  vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
    path: 'kind',
    version: '0.0.1',
  });

  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  // ensure the command has been registered
  expect(commandRegistry['kind.image.move']).toBeDefined();

  // simulate a call to the command
  await commandRegistry['kind.image.move']({ id: 'id', image: 'hello:world', engineId: '1' });

  expect(withProgressMock).toHaveBeenCalled();
  expect(contextSetValueMock).toBeCalledTimes(2);
  expect(contextSetValueMock).toHaveBeenNthCalledWith(1, 'imagesPushInProgressToKind', ['id']);
  expect(contextSetValueMock).toHaveBeenNthCalledWith(2, 'imagesPushInProgressToKind', []);
});

const cliToolMock = {
  registerUpdate: vi.fn(),
  registerInstaller: vi.fn(),
  updateVersion: vi.fn(),
} as unknown as extensionApi.CliTool;

async function getCliToolUpdate(): Promise<extensionApi.CliToolSelectUpdate> {
  vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValueOnce(new Error('does not exist')).mockResolvedValue({
    version: '0.0.1',
    path: 'test-storage-path/kind',
  });

  vi.spyOn(util, 'getSystemBinaryPath').mockReturnValue('test-storage-path/kind');
  vi.mocked(cliToolMock.registerUpdate).mockImplementation(mUpdate => {
    if ('selectVersion' in mUpdate) {
      update = mUpdate;
    }
    return { dispose: vi.fn() };
  });
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue(cliToolMock);
  let update: extensionApi.CliToolSelectUpdate | undefined;
  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  await vi.waitFor(() => {
    expect(update).toBeDefined();
  });

  if (!update) throw new Error('undefined update');
  return update;
}

test('try to update before selecting cli tool version should throw an error', async () => {
  const update: extensionApi.CliToolSelectUpdate = await getCliToolUpdate();
  await expect(() => update?.doUpdate({} as unknown as extensionApi.Logger)).rejects.toThrowError(
    'Cannot update test-storage-path/kind version 0.0.1. No release selected.',
  );
});

test('update updatable version should update version', async () => {
  const installBinaryToSystemMock = vi.spyOn(util, 'installBinaryToSystem').mockResolvedValue('path');
  vi.mocked(kindInstallerMock.getKindCliStoragePath).mockReturnValue('storage-path');
  vi.mocked(kindInstallerMock.promptUserForVersion).mockResolvedValue({
    tag: 'v1.0.0',
  } as unknown as KindGithubReleaseArtifactMetadata);
  const update: extensionApi.CliToolUpdate | extensionApi.CliToolSelectUpdate = await getCliToolUpdate();
  await update?.selectVersion();
  await update.doUpdate({} as unknown as extensionApi.Logger);

  expect(kindInstallerMock.download).toHaveBeenCalledWith({
    tag: 'v1.0.0',
  });
  expect(kindInstallerMock.getKindCliStoragePath).toHaveBeenCalled();

  expect(installBinaryToSystemMock).toHaveBeenCalledWith('storage-path', 'kind');
  expect(cliToolMock.updateVersion).toHaveBeenCalledWith({
    installationSource: 'extension',
    version: '1.0.0',
  });
});

test('try to install when there is already an existing version should throw an error', async () => {
  vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
    version: '0.0.1',
    path: 'test-storage-path/kind',
  });

  vi.spyOn(util, 'getSystemBinaryPath').mockReturnValue('test-storage-path/kind');

  let cliToolInstaller: extensionApi.CliToolInstaller | undefined;
  vi.mocked(cliToolMock.registerInstaller).mockImplementation(mInstall => {
    cliToolInstaller = mInstall;
    return { dispose: vi.fn() };
  });
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue(cliToolMock);

  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  await vi.waitFor(() => {
    expect(cliToolInstaller).toBeDefined();
  });

  if (!cliToolInstaller) throw new Error('undefined update');

  await expect(() => cliToolInstaller?.doInstall({} as unknown as extensionApi.Logger)).rejects.toThrowError(
    `Cannot install kind. Version 0.0.1 in test-storage-path/kind is already installed.`,
  );
});

test('try to install before selecting cli tool version should throw an error', async () => {
  vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValue('no kind');

  let cliToolInstaller: extensionApi.CliToolInstaller | undefined;
  vi.mocked(cliToolMock.registerInstaller).mockImplementation(mInstall => {
    cliToolInstaller = mInstall;
    return { dispose: vi.fn() };
  });
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue(cliToolMock);

  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  await vi.waitFor(() => {
    expect(cliToolInstaller).toBeDefined();
  });

  if (!cliToolInstaller) throw new Error('undefined update');

  await expect(() => cliToolInstaller?.doInstall({} as unknown as extensionApi.Logger)).rejects.toThrowError(
    `Cannot install kind. No release selected.`,
  );
});

test('after selecting the version to be installed it should download kind', async () => {
  const installBinaryToSystemMock = vi.spyOn(util, 'installBinaryToSystem').mockResolvedValue('path');
  vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValue('no kind');
  vi.mocked(kindInstallerMock.promptUserForVersion).mockResolvedValue({
    tag: 'v1.0.0',
  } as unknown as KindGithubReleaseArtifactMetadata);

  let installer: extensionApi.CliToolInstaller | undefined;
  vi.mocked(cliToolMock.registerInstaller).mockImplementation(mInstaller => {
    installer = mInstaller;
    return { dispose: vi.fn() };
  });
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue(cliToolMock);

  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  await vi.waitFor(() => {
    expect(installer).toBeDefined();
  });

  await installer?.selectVersion();

  await installer?.doInstall({} as unknown as extensionApi.Logger);
  expect(kindInstallerMock.download).toHaveBeenCalledWith({
    tag: 'v1.0.0',
  });
  expect(kindInstallerMock.getKindCliStoragePath).toHaveBeenCalled();
  expect(installBinaryToSystemMock).toHaveBeenCalledWith('storage-path', 'kind');
  expect(cliToolMock.updateVersion).toHaveBeenCalledWith({
    installationSource: 'extension',
    version: '1.0.0',
  });
});

test('if installing system wide fails, it should not throw', async () => {
  const installBinaryToSystemMock = vi.spyOn(util, 'installBinaryToSystem').mockRejectedValue('error');
  vi.spyOn(util, 'getKindBinaryInfo').mockRejectedValue('no kind');
  vi.mocked(kindInstallerMock.promptUserForVersion).mockResolvedValue({
    tag: 'v1.0.0',
  } as unknown as KindGithubReleaseArtifactMetadata);

  let installer: extensionApi.CliToolInstaller | undefined;
  vi.mocked(cliToolMock.registerInstaller).mockImplementation(mInstaller => {
    installer = mInstaller;
    return { dispose: vi.fn() };
  });
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue(cliToolMock);

  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  await vi.waitFor(() => {
    expect(installer).toBeDefined();
  });

  await installer?.selectVersion();

  await installer?.doInstall({} as unknown as extensionApi.Logger);
  expect(kindInstallerMock.download).toHaveBeenCalledWith({
    tag: 'v1.0.0',
  });
  expect(kindInstallerMock.getKindCliStoragePath).toHaveBeenCalled();
  expect(installBinaryToSystemMock).toHaveBeenCalledWith('storage-path', 'kind');
  expect(cliToolMock.updateVersion).toHaveBeenCalledWith({
    installationSource: 'extension',
    version: '1.0.0',
  });
});

test('by uninstalling it should delete all executables', async () => {
  vi.mock('node:fs');
  vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
    version: '0.0.1',
    path: 'test-storage-path/kind',
  });

  vi.spyOn(util, 'getSystemBinaryPath').mockReturnValue('test-storage-path/kind');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);

  let installer: extensionApi.CliToolInstaller | undefined;
  vi.mocked(cliToolMock.registerInstaller).mockImplementation(mInstaller => {
    installer = mInstaller;
    return { dispose: vi.fn() };
  });
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue(cliToolMock);

  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  await vi.waitFor(() => {
    expect(installer).toBeDefined();
  });

  await installer?.doUninstall({} as unknown as extensionApi.Logger);
  expect(fs.promises.unlink).toHaveBeenNthCalledWith(1, 'storage-path');
  expect(fs.promises.unlink).toHaveBeenNthCalledWith(2, 'test-storage-path/kind');
});

test('if unlink fails because of a permission issue, it should delete all binaries as admin', async () => {
  vi.mock('node:fs');
  vi.spyOn(util, 'getKindBinaryInfo').mockResolvedValue({
    version: '0.0.1',
    path: 'test-storage-path/kind',
  });

  vi.spyOn(util, 'getSystemBinaryPath').mockReturnValue('test-storage-path/kind');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.mocked(fs.promises.unlink).mockRejectedValue({
    code: 'EACCES',
  } as unknown as Error);
  const command = process.platform === 'win32' ? 'del' : 'rm';

  let installer: extensionApi.CliToolInstaller | undefined;
  vi.mocked(cliToolMock.registerInstaller).mockImplementation(mInstaller => {
    installer = mInstaller;
    return { dispose: vi.fn() };
  });
  vi.spyOn(podmanDesktopApi.cli, 'createCliTool').mockReturnValue(cliToolMock);

  await extension.activate(
    vi.mocked<extensionApi.ExtensionContext>({
      subscriptions: {
        push: vi.fn(),
      },
    } as unknown as extensionApi.ExtensionContext),
  );

  await vi.waitFor(() => {
    expect(installer).toBeDefined();
  });

  await installer?.doUninstall({} as unknown as extensionApi.Logger);
  expect(podmanDesktopApi.process.exec).toHaveBeenNthCalledWith(1, command, ['storage-path'], { isAdmin: true });
  expect(podmanDesktopApi.process.exec).toHaveBeenNthCalledWith(2, command, ['test-storage-path/kind'], {
    isAdmin: true,
  });
});
