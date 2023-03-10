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
import { resolve } from 'node:path';
import { afterEach, beforeEach, test, expect, vi, describe } from 'vitest';
import { ComposeExtension } from './compose-extension';
import type { Detect } from './detect';
import type { ComposeGitHubReleases } from './compose-github-releases';
import * as extensionApi from '@podman-desktop/api';
import { promises } from 'node:fs';
import type { PodmanComposeGenerator } from './podman-compose-generator';

const extensionContext: extensionApi.ExtensionContext = {
  storagePath: '/fake/path',
  subscriptions: [],
} as unknown as extensionApi.ExtensionContext;
let composeExtension: TestComposeExtension;

const osMock = {
  isLinux: vi.fn(),
  isMac: vi.fn(),
  isWindows: vi.fn(),
};

const detectMock = {
  checkForPythonPodmanCompose: vi.fn(),
  checkForDockerCompose: vi.fn(),
  checkStoragePath: vi.fn(),
};

const composeGitHubReleasesMock = {
  grabLatestsReleasesMetadata: vi.fn(),
  getReleaseAssetId: vi.fn(),
  downloadReleaseAsset: vi.fn(),
};

const podmanComposeGeneratorMock = {
  generate: vi.fn(),
} as unknown as PodmanComposeGenerator;

const statusBarItemMock = {
  tooltip: '',
  iconClass: '',
  command: '',
  show: vi.fn(),
};

vi.mock('@podman-desktop/api', () => {
  return {
    StatusBarAlignLeft: 1,
    commands: {
      registerCommand: vi.fn().mockImplementation(() => {
        return {
          dispose: () => {
            // do nothing
          },
        };
      }),
    },
    window: {
      showQuickPick: vi.fn(),
      createStatusBarItem: vi.fn(),
      showInformationMessage: vi.fn(),
    },
  };
});

// allows to call protected methods
class TestComposeExtension extends ComposeExtension {
  public publicNotifyOnChecks(firstCheck: boolean) {
    return super.notifyOnChecks(firstCheck);
  }

  setCurrentInformation(value: string) {
    this.currentInformation = value;
  }
}

beforeEach(() => {
  composeExtension = new TestComposeExtension(
    extensionContext,
    detectMock as unknown as Detect,
    composeGitHubReleasesMock as unknown as ComposeGitHubReleases,
    osMock,
    podmanComposeGeneratorMock,
  );

  const createStatusBarItem = vi.spyOn(extensionApi.window, 'createStatusBarItem');
  createStatusBarItem.mockImplementation(() => statusBarItemMock as unknown as extensionApi.StatusBarItem);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('should report error if podman-compose is installed', async () => {
  detectMock.checkForPythonPodmanCompose.mockResolvedValueOnce(true);

  // activate the extension
  await composeExtension.activate();

  // now, check that if podman-compose is installed, we report the error as expected
  expect(statusBarItemMock.tooltip).toContain('This extension does not work with Python Podman Compose');
  expect(statusBarItemMock.iconClass).toBe(ComposeExtension.ICON_WARNING);
  expect(statusBarItemMock.command).toBe('compose.checks');
  expect(statusBarItemMock.show).toHaveBeenCalled();
});

test('should prompt the user to download docker-desktop if podman-compose is not installed and docker-compose is not installed', async () => {
  detectMock.checkForPythonPodmanCompose.mockResolvedValueOnce(false);
  detectMock.checkForDockerCompose.mockResolvedValueOnce(false);

  // activate the extension
  await composeExtension.activate();

  // now, check that if podman-compose is installed, we report the error as expected
  expect(statusBarItemMock.tooltip).toContain('Install Docker Compose');
  expect(statusBarItemMock.iconClass).toBe(ComposeExtension.ICON_DOWNLOAD);

  // command should be the install command
  expect(statusBarItemMock.command).toBe('compose.install');

  expect(statusBarItemMock.show).toHaveBeenCalled();
});

test('should report to the user that docker-compose is installed if podman-compose is not installed and docker-compose is installed', async () => {
  detectMock.checkForPythonPodmanCompose.mockResolvedValueOnce(false);
  detectMock.checkForDockerCompose.mockResolvedValueOnce(true);
  detectMock.checkStoragePath.mockResolvedValueOnce(true);

  // activate the extension
  await composeExtension.activate();

  // now, check that if podman-compose is installed, we report the error as expected
  expect(statusBarItemMock.tooltip).toContain('Docker Compose is installed');
  expect(statusBarItemMock.iconClass).toBe(ComposeExtension.ICON_CHECK);

  // command should be the checks command
  expect(statusBarItemMock.command).toBe('compose.checks');

  expect(statusBarItemMock.show).toHaveBeenCalled();
});

test('should report to the user that path is not setup if podman-compose is not in the PATH', async () => {
  detectMock.checkForPythonPodmanCompose.mockResolvedValueOnce(false);
  detectMock.checkForDockerCompose.mockResolvedValueOnce(true);
  detectMock.checkStoragePath.mockResolvedValueOnce(false);

  // activate the extension
  await composeExtension.activate();

  expect(statusBarItemMock.tooltip).toContain('Path problem for Podman Compose');
  expect(statusBarItemMock.iconClass).toBe(ComposeExtension.ICON_WARNING);

  // command should be the checks command
  expect(statusBarItemMock.command).toBe('compose.checks');

  expect(statusBarItemMock.show).toHaveBeenCalled();
});

test('Check that we have registered commands', async () => {
  const registerCommandMock = vi.spyOn(extensionApi.commands, 'registerCommand');
  const commands = new Map<string, (...args: any[]) => any>();

  registerCommandMock.mockImplementation((command: string, callback: (...args: any[]) => any) => {
    commands.set(command, callback);
    return vi.fn() as unknown as extensionApi.Disposable;
  });

  await composeExtension.activate();

  // 2 commands should have been registered
  expect(extensionApi.commands.registerCommand).toHaveBeenCalledTimes(2);

  // check that check command is registered
  const checkCommand = commands.get(ComposeExtension.COMPOSE_CHECKS_COMMAND);
  const spyRunCheck = vi.spyOn(composeExtension, 'runChecks');
  spyRunCheck.mockImplementation(() => {
    return Promise.resolve();
  });
  expect(checkCommand).toBeDefined();
  // call the callback
  checkCommand();
  expect(spyRunCheck).toHaveBeenCalled();

  const installCommand = commands.get(ComposeExtension.COMPOSE_INSTALL_COMMAND);
  const spyInstallCompose = vi.spyOn(composeExtension, 'installDockerCompose');
  spyInstallCompose.mockImplementation(() => {
    return Promise.resolve();
  });
  expect(installCommand).toBeDefined();
  // call the callback
  installCommand();
  expect(spyInstallCompose).toHaveBeenCalled();
});

describe.each([
  { existDir: false, os: 'Windows' },
  { existDir: true, os: 'Linux' },
])('Check install docker compose command', ({ existDir, os }) => {
  test(`Check install docker compose command dir exists ${existDir}`, async () => {
    let dockerComposeFileExtension = '';
    let podmanComposeFileExtension = '';

    // mock the fs module
    vi.mock('node:fs');

    const showQuickPickMock = vi.spyOn(extensionApi.window, 'showQuickPick');
    showQuickPickMock.mockResolvedValue({ label: 'latest', id: 'LATEST' } as any);

    // mock the existSync and mkdir methods
    const existSyncSpy = vi.spyOn(fs, 'existsSync');
    existSyncSpy.mockImplementation(() => existDir);

    const mkdirSpy = vi.spyOn(promises, 'mkdir');
    mkdirSpy.mockImplementation(() => Promise.resolve(''));

    if (os === 'Windows') {
      osMock.isWindows.mockReturnValue(true);
      dockerComposeFileExtension = '.exe';
      podmanComposeFileExtension = '.bat';
    } else if (os === 'Linux') {
      osMock.isLinux.mockReturnValue(true);
    }
    // fake chmod
    const chmodMock = vi.spyOn(promises, 'chmod');
    chmodMock.mockImplementation(() => Promise.resolve());

    const items = [{ label: 'latest' }];
    const fakeAssetId = 123;
    composeGitHubReleasesMock.grabLatestsReleasesMetadata.mockResolvedValue(items);
    composeGitHubReleasesMock.getReleaseAssetId.mockResolvedValue(fakeAssetId);
    composeGitHubReleasesMock.downloadReleaseAsset.mockResolvedValue(undefined);

    // mock internal call
    const runChecksSpy = vi.spyOn(composeExtension, 'runChecks');
    runChecksSpy.mockResolvedValue(undefined);

    await composeExtension.installDockerCompose();

    expect(showQuickPickMock).toHaveBeenCalledWith(items, { placeHolder: 'Select docker compose version to install' });
    // should have fetched latest releases
    expect(composeGitHubReleasesMock.grabLatestsReleasesMetadata).toHaveBeenCalled();
    // should have downloaded the release asset
    expect(composeGitHubReleasesMock.downloadReleaseAsset).toHaveBeenCalledWith(
      fakeAssetId,
      resolve(extensionContext.storagePath, `bin/docker-compose${dockerComposeFileExtension}`),
    );

    // should have called run checks
    expect(runChecksSpy).toHaveBeenCalled();

    // should have created the directory if non-existent
    if (!existDir) {
      expect(mkdirSpy).toHaveBeenCalledWith(resolve(extensionContext.storagePath, 'bin'), { recursive: true });
    }

    // should have call the podman generator
    expect(podmanComposeGeneratorMock.generate).toHaveBeenCalledWith(
      `/fake/path/bin/podman-compose${podmanComposeFileExtension}`,
    );
  });
});

describe('notifyOnChecks', async () => {
  test('first check true', async () => {
    // no current information
    composeExtension.setCurrentInformation(undefined);

    const showCurrentInformationMock = vi.spyOn(composeExtension, 'showCurrentInformation');
    const showInformationMessageMock = vi.spyOn(extensionApi.window, 'showInformationMessage');
    await composeExtension.publicNotifyOnChecks(true);
    expect(showInformationMessageMock).not.toHaveBeenCalled();
    expect(showCurrentInformationMock).not.toHaveBeenCalled();
  });

  test('first check false and information', async () => {
    const info = 'this is a current information';
    composeExtension.setCurrentInformation(info);

    const showCurrentInformationMock = vi.spyOn(composeExtension, 'showCurrentInformation');
    const showInformationMessageMock = vi.spyOn(extensionApi.window, 'showInformationMessage');
    await composeExtension.publicNotifyOnChecks(false);
    expect(showInformationMessageMock).toHaveBeenCalled();
    expect(showCurrentInformationMock).toHaveBeenCalled();
    expect(showInformationMessageMock).toHaveBeenCalledWith(info);
  });
});

test('deactivate', async () => {
  await composeExtension.deactivate();
});

describe('makeExecutable', async () => {
  const fakePath = '/fake/path';
  test('mac', async () => {
    osMock.isMac.mockReturnValue(true);

    // fake chmod
    const chmodMock = vi.spyOn(promises, 'chmod');
    chmodMock.mockImplementation(() => Promise.resolve());
    await composeExtension.makeExecutable(fakePath);
    // check it has been called
    expect(chmodMock).toHaveBeenCalledWith(fakePath, 0o755);
  });

  test('linux', async () => {
    osMock.isLinux.mockReturnValue(true);

    // fake chmod
    const chmodMock = vi.spyOn(promises, 'chmod');
    chmodMock.mockImplementation(() => Promise.resolve());
    await composeExtension.makeExecutable(fakePath);
    // check it has been called
    expect(chmodMock).toHaveBeenCalledWith(fakePath, 0o755);
  });

  test('windows', async () => {
    osMock.isWindows.mockReturnValue(true);

    // fake chmod
    const chmodMock = vi.spyOn(promises, 'chmod');
    chmodMock.mockImplementation(() => Promise.resolve());
    await composeExtension.makeExecutable(fakePath);
    // check it has not been called on Windows
    expect(chmodMock).not.toHaveBeenCalled();
  });
});
