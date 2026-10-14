/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import * as fs from 'node:fs';

import * as extensionApi from '@podman-desktop/api';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import * as extensionObj from '/@/extension';
import type { InstalledPodman, PodmanBinary } from '/@/utils/podman-binary';
import { getBundledPodmanVersion, getBundledReleaseNotesHref } from '/@/utils/podman-bundled';
import type { PodmanInfo } from '/@/utils/podman-info';
import * as utils from '/@/utils/util';

import type { Installer } from './installer';
import type { UpdateCheck } from './podman-install';
import { PodmanInstall } from './podman-install';

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

const extensionContext = {
  subscriptions: [],
} as unknown as extensionApi.ExtensionContext;

const provider: extensionApi.Provider = {
  setContainerProviderConnectionFactory: vi.fn(),
  setKubernetesProviderConnectionFactory: vi.fn(),
  setVmProviderConnectionFactory: vi.fn(),
  registerContainerProviderConnection: vi.fn(),
  registerKubernetesProviderConnection: vi.fn(),
  registerVmProviderConnection: vi.fn(),
  registerLifecycle: vi.fn(),
  registerInstallation: vi.fn(),
  registerUpdate: vi.fn(),
  registerAutostart: vi.fn(),
  registerCleanup: vi.fn(),
  dispose: vi.fn(),
  name: '',
  id: '',
  status: 'started',
  updateStatus: vi.fn(),
  onDidUpdateStatus: vi.fn(),
  version: '',
  updateVersion: vi.fn(),
  onDidUpdateVersion: vi.fn(),
  images: {},
  links: [],
  detectionChecks: [],
  updateDetectionChecks: vi.fn(),
  warnings: [],
  updateWarnings: vi.fn(),
  onDidUpdateDetectionChecks: vi.fn(),
};

const mockTelemetryLogger = {} as extensionApi.TelemetryLogger;
const INSTALLER_MOCK: Installer = {} as unknown as Installer;
const PROVIDER_CLEANUP_MOCK = {
  getActions: vi.fn(),
} as unknown as extensionApi.ProviderCleanup;
const PODMAN_BINARY_MOCK: PodmanBinary = {
  getBinaryInfo: vi.fn(),
} as unknown as PodmanBinary;

// mock filesystem
vi.mock(import('node:fs'));

// mock ps-list
vi.mock(import('ps-list'), async () => {
  return {
    default: vi.fn(),
  };
});

// mock release
vi.mock(import('node:os'), async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const actual = await vi.importActual<typeof import('node:os')>('node:os');
  return {
    ...actual,
    release: vi.fn(),
    totalmem: vi.fn(),
  };
});

vi.mock(import('../utils/util'), async () => {
  return {
    getAssetsFolder: vi.fn().mockReturnValue(''),
    runCliCommand: vi.fn(),
    appHomeDir: vi.fn().mockReturnValue(''),
    normalizeWSLOutput: vi.fn().mockImplementation((s: string) => s),
    isLinux: vi.fn(),
    isWindows: vi.fn(),
    isMac: vi.fn(),
    execPodman: vi.fn(),
  };
});

let podmanInstall: TestPodmanInstall;

beforeEach(() => {
  vi.resetAllMocks();

  podmanInstall = new TestPodmanInstall(
    extensionContext,
    mockTelemetryLogger,
    INSTALLER_MOCK,
    PROVIDER_CLEANUP_MOCK,
    PODMAN_BINARY_MOCK,
  );
  // reset array of subscriptions
  extensionContext.subscriptions.length = 0;
  console.error = consoleErrorMock;
  vi.mocked(extensionApi.configuration.getConfiguration).mockReturnValue({
    get: () => false,
    has: vi.fn(),
    update: vi.fn(),
  });
});

afterEach(() => {
  console.error = originalConsoleError;
});

class TestPodmanInstall extends PodmanInstall {
  async stopPodmanMachinesIfAnyBeforeUpdating(): Promise<boolean> {
    return super.stopPodmanMachinesIfAnyBeforeUpdating();
  }

  async wipeAllDataBeforeMajorUpdate(installed: InstalledPodman, updateCheck: UpdateCheck): Promise<boolean> {
    return super.wipeAllDataBeforeMajorUpdate(installed, updateCheck);
  }

  getInstaller(): Installer | undefined {
    return super.getInstaller();
  }
}

describe('update checks', () => {
  test('stopPodmanMachinesIfAnyBeforeUpdating with an error', async () => {
    // return empty machine list
    vi.mocked(extensionApi.process.exec).mockRejectedValue('invalid');

    await podmanInstall.stopPodmanMachinesIfAnyBeforeUpdating();

    // expect user is not prompted
    expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  });

  test('stopPodmanMachinesIfAnyBeforeUpdating with no machine running', async () => {
    // return empty machine list
    vi.mocked(extensionApi.process.exec).mockResolvedValueOnce({
      stdout: '[]',
    } as unknown as extensionApi.RunResult);

    await podmanInstall.stopPodmanMachinesIfAnyBeforeUpdating();

    // expect user is not prompted as it is not running
    expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();
  });

  test('stopPodmanMachinesIfAnyBeforeUpdating with one machine running', async () => {
    await extensionObj.initInversify(extensionContext, mockTelemetryLogger);

    // return empty machine list
    vi.spyOn(utils, 'execPodman').mockResolvedValueOnce({
      stdout: JSON.stringify([{ Name: 'test', Running: true, VMType: 'libkrun' }]),
    } as unknown as extensionApi.RunResult);

    // return podman version
    vi.spyOn(utils, 'execPodman').mockResolvedValueOnce({
      stdout: 'podman version 5.0.0',
    } as extensionApi.RunResult);

    // mock user response
    vi.spyOn(extensionApi.window, 'showInformationMessage').mockResolvedValue('Yes');

    await podmanInstall.stopPodmanMachinesIfAnyBeforeUpdating();

    // expect user is not prompted as it is not running
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalled();

    // check we called the stop command
    expect(utils.execPodman).toHaveBeenCalledWith(['machine', 'stop', 'test'], 'libkrun');
  });

  test('wipeAllDataBeforeMajorUpdate with podman 4.9 -> 5.0', async () => {
    // fake actions
    const action1Exectute = vi.fn();
    const action1 = {
      name: 'test',
      execute: action1Exectute,
    };

    vi.mocked(PROVIDER_CLEANUP_MOCK.getActions).mockResolvedValue([action1]);

    // mock user response
    vi.spyOn(extensionApi.window, 'showInformationMessage').mockResolvedValue('Yes');

    await podmanInstall.wipeAllDataBeforeMajorUpdate(
      {
        version: '4.9.3',
      } as unknown as InstalledPodman,
      {
        bundledVersion: '5.0.0',
      } as unknown as UpdateCheck,
    );

    // expect user is prompted
    expect(extensionApi.window.showInformationMessage).toHaveBeenCalled();

    // getActions should have been called
    expect(PROVIDER_CLEANUP_MOCK.getActions).toHaveBeenCalled();

    // action should have been called
    expect(action1Exectute).toHaveBeenCalled();
  });

  test('wipeAllDataBeforeMajorUpdate with podman 5.8 -> 6.0', async () => {
    const action1Execute = vi.fn();
    const action1 = {
      name: 'test',
      execute: action1Execute,
    };

    vi.mocked(PROVIDER_CLEANUP_MOCK.getActions).mockResolvedValue([action1]);

    vi.spyOn(extensionApi.window, 'showInformationMessage').mockResolvedValue('Yes');

    await podmanInstall.wipeAllDataBeforeMajorUpdate(
      {
        version: '5.8.5',
      } as unknown as InstalledPodman,
      {
        bundledVersion: '6.0.1',
      } as unknown as UpdateCheck,
    );

    expect(extensionApi.window.showInformationMessage).toHaveBeenCalled();
    expect(PROVIDER_CLEANUP_MOCK.getActions).toHaveBeenCalled();
    expect(action1Execute).toHaveBeenCalled();
  });

  test('wipeAllDataBeforeMajorUpdate with podman 4.9 -> 6.0', async () => {
    const action1Execute = vi.fn();
    const action1 = {
      name: 'test',
      execute: action1Execute,
    };

    vi.mocked(PROVIDER_CLEANUP_MOCK.getActions).mockResolvedValue([action1]);

    vi.spyOn(extensionApi.window, 'showInformationMessage').mockResolvedValue('Yes');

    await podmanInstall.wipeAllDataBeforeMajorUpdate(
      {
        version: '4.9.3',
      } as unknown as InstalledPodman,
      {
        bundledVersion: '6.0.1',
      } as unknown as UpdateCheck,
    );

    expect(extensionApi.window.showInformationMessage).toHaveBeenCalled();
    expect(PROVIDER_CLEANUP_MOCK.getActions).toHaveBeenCalled();
    expect(action1Execute).toHaveBeenCalled();
  });

  test('wipeAllDataBeforeMajorUpdate no action with podman 4.9.1 -> 4.9.2', async () => {
    await podmanInstall.wipeAllDataBeforeMajorUpdate(
      {
        version: '4.9.1',
      } as unknown as InstalledPodman,
      {
        bundledVersion: '4.9.2',
      } as unknown as UpdateCheck,
    );

    // expect user is not prompted
    expect(extensionApi.window.showInformationMessage).not.toHaveBeenCalled();

    // getActions should not have been called
    expect(PROVIDER_CLEANUP_MOCK.getActions).not.toHaveBeenCalled();
  });
});

test('checkForUpdate should return no installed version if there is no lastRunInfo', async () => {
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue(undefined);
  const result = await podmanInstall.checkForUpdate(undefined);
  expect(result).toStrictEqual({ installedVersion: undefined, hasUpdate: false, bundledVersion: undefined });
});

test('checkForUpdate should return no installed version if there is lastRunInfo but it has no version', async () => {
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue({
    lastUpdateCheck: 0,
  });
  const result = await podmanInstall.checkForUpdate(undefined);
  expect(result).toStrictEqual({ installedVersion: undefined, hasUpdate: false, bundledVersion: undefined });
});

test('checkForUpdate should return installed version and no update if the installed version is the latest', async () => {
  vi.spyOn(podmanInstall, 'getInstaller').mockReturnValue({
    requireUpdate: vi.fn().mockReturnValue(false),
  } as unknown as Installer);
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue({
    lastUpdateCheck: 0,
  });
  const result = await podmanInstall.checkForUpdate({
    version: '1.1',
  });
  expect(result).toStrictEqual({
    installedVersion: '1.1',
    hasUpdate: false,
    bundledVersion: getBundledPodmanVersion(),
  });
});

test('checkForUpdate should return installed version and update if the installed version is NOT the latest', async () => {
  vi.spyOn(podmanInstall, 'getInstaller').mockReturnValue({
    requireUpdate: vi.fn().mockReturnValue(true),
  } as unknown as Installer);
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue({
    lastUpdateCheck: 0,
  });
  const result = await podmanInstall.checkForUpdate({
    version: '1.1',
  });
  expect(result).toStrictEqual({
    installedVersion: '1.1',
    hasUpdate: true,
    bundledVersion: getBundledPodmanVersion(),
  });
});

const providerMock: extensionApi.Provider = {} as unknown as extensionApi.Provider;

describe('performUpdate', () => {
  test('should raise an error if no podmanInfo provided', async () => {
    await expect(() => {
      return podmanInstall.performUpdate(providerMock, undefined);
    }).rejects.toThrowError('The podman extension has not been successfully initialized');
  });

  test('should call showWarningMessage if stopPodmanMachinesIfAnyBeforeUpdating resolve false', async () => {
    // mock initialized
    podmanInstall['podmanInfo'] = {} as unknown as PodmanInfo;
    // mock checkForUpdate
    vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
      hasUpdate: true,
      installedVersion: '1.0.0',
      bundledVersion: '0.9.8',
    });
    // E.g. user cancel stop
    vi.spyOn(podmanInstall, 'stopPodmanMachinesIfAnyBeforeUpdating').mockResolvedValue(false);

    await podmanInstall.performUpdate(providerMock, undefined);

    expect(extensionApi.window.showWarningMessage).toHaveBeenCalledWith('Podman update has been canceled.', 'OK');
  });

  test('should call showInformationMessage ', async () => {
    vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue(undefined);

    // mock initialized
    podmanInstall['podmanInfo'] = {} as unknown as PodmanInfo;

    // all podman machine are stopped
    vi.spyOn(podmanInstall, 'stopPodmanMachinesIfAnyBeforeUpdating').mockResolvedValue(true);
    // return true if data have been cleaned or if user skip it
    vi.spyOn(podmanInstall, 'wipeAllDataBeforeMajorUpdate').mockResolvedValue(true);

    // mock checkForUpdate
    vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
      hasUpdate: true,
      installedVersion: '1.0.0',
      bundledVersion: '0.9.8',
    });

    await podmanInstall.performUpdate(providerMock, undefined);

    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      'You have Podman 1.0.0.\nDo you want to update to 0.9.8?',
      'Yes',
      'No',
      'Ignore',
      'Open release notes',
    );
  });

  test('user clicking on Open release note should open external link', async () => {
    vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue('Open release notes');

    // mock initialized
    podmanInstall['podmanInfo'] = {} as unknown as PodmanInfo;

    // all podman machine are stopped
    vi.spyOn(podmanInstall, 'stopPodmanMachinesIfAnyBeforeUpdating').mockResolvedValue(true);
    // return true if data have been cleaned or if user skip it
    vi.spyOn(podmanInstall, 'wipeAllDataBeforeMajorUpdate').mockResolvedValue(true);

    // mock checkForUpdate
    vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
      hasUpdate: true,
      installedVersion: '1.0.0',
      bundledVersion: '0.9.8',
    });

    await podmanInstall.performUpdate(providerMock, undefined);

    expect(extensionApi.Uri.parse).toHaveBeenCalledWith(getBundledReleaseNotesHref());
    expect(extensionApi.env.openExternal).toHaveBeenCalled();
  });

  test('should not start instalation when updating from Podman 5.3.1 to 5.4.X', async () => {
    vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue('Yes');
    (extensionApi.env.isWindows as boolean) = true;
    // all podman machine are stopped
    vi.spyOn(podmanInstall, 'stopPodmanMachinesIfAnyBeforeUpdating').mockResolvedValue(true);
    // return true if data have been cleaned or if user skip it
    vi.spyOn(podmanInstall, 'wipeAllDataBeforeMajorUpdate').mockResolvedValue(true);

    // mock initialized
    podmanInstall['podmanInfo'] = {} as unknown as PodmanInfo;
    // mock checkForUpdate
    vi.spyOn(podmanInstall, 'checkForUpdate').mockResolvedValue({
      hasUpdate: true,
      installedVersion: '5.3.1',
      bundledVersion: '5.4.1',
    });

    await podmanInstall.performUpdate(providerMock, undefined);

    expect(extensionApi.window.showInformationMessage).toHaveBeenCalledWith(
      'Updating the podman from 5.3.1 to 5.4.1 requires manual installation.\nDo you want to show instructions for this?',
      'Yes',
      'No',
    );

    expect(extensionApi.Uri.parse).toHaveBeenCalledWith(
      'https://github.com/podman-container-tools/podman/blob/main/docs/tutorials/podman-for-windows.md',
    );
    expect(extensionApi.env.openExternal).toHaveBeenCalled();
  });
});

test('check that podman installation refreshed machine settings', async () => {
  vi.mocked(PODMAN_BINARY_MOCK.getBinaryInfo).mockResolvedValue({
    version: '5.0.0',
  });
  vi.spyOn(podmanInstall, 'getLastRunInfo').mockResolvedValue({
    lastUpdateCheck: 0,
    podmanVersion: '5.0.0',
  });
  vi.spyOn(podmanInstall, 'getInstaller').mockReturnValue(undefined);

  // mock existSync being always false (we never find installers)
  vi.mocked(fs.existsSync).mockReturnValue(false);
  vi.mocked(extensionApi.window.showInformationMessage).mockResolvedValue('Yes');
  const mock = vi.spyOn(extensionObj, 'calcPodmanMachineSetting');

  await podmanInstall.checkForUpdate(undefined);
  await podmanInstall.doInstallPodman(provider);

  expect(mock).toHaveBeenCalled();
});
