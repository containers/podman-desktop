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

import { tmpName } from 'tmp-promise';
import { beforeEach, expect, test, vi } from 'vitest';
import { MinikubeInstaller } from './minikube-installer';
import * as extensionApi from '@podman-desktop/api';
import { installBinaryToSystem } from './util';

let installer: MinikubeInstaller;

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      showInformationMessage: vi.fn().mockReturnValue(Promise.resolve('Yes')),
      showErrorMessage: vi.fn(),
      withProgress: vi.fn(),
      showNotification: vi.fn(),
    },
    ProgressLocation: {
      APP_ICON: 1,
    },
  };
});

vi.mock('@octokit/rest', () => {
  const repos = {
    getReleaseAsset: vi.fn().mockReturnValue({ name: 'minikube', data: [] }),
  };
  return {
    Octokit: vi.fn().mockReturnValue({ repos: repos }),
  };
});

const telemetryLogUsageMock = vi.fn();
const telemetryLogErrorMock = vi.fn();
const telemetryLoggerMock = {
  logUsage: telemetryLogUsageMock,
  logError: telemetryLogErrorMock,
} as unknown as extensionApi.TelemetryLogger;

vi.mock('runCliCommand', async () => {
  return vi.fn();
});

beforeEach(() => {
  installer = new MinikubeInstaller('.', telemetryLoggerMock);
  vi.clearAllMocks();
});

test.skip('expect installBinaryToSystem to succesfully pass with a binary', async () => {
  // Mock process.platform to be linux
  // to avoid the usage of sudo-prompt (we cannot test that in unit tests)
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  // Create a tmp file using tmp-promise
  const filename = await tmpName();

  // "Install" the binary, this should pass sucessfully
  try {
    await installBinaryToSystem(filename, 'tmpBinary');
  } catch (err) {
    expect(err).toBeUndefined();
  }
});

test('error: expect installBinaryToSystem to fail with a non existing binary', async () => {
  Object.defineProperty(process, 'platform', {
    value: 'linux',
  });

  // Run installBinaryToSystem with a non-binary file
  try {
    await installBinaryToSystem('test', 'tmpBinary');
    // Expect that showErrorMessage is called
    expect(extensionApi.window.showErrorMessage).toHaveBeenCalled();
  } catch (err) {
    expect(err).to.be.a('Error');
    expect(err).toBeDefined();
  }
});

test('expect showNotification to be called', async () => {
  const progress = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    report: () => {},
  };
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });
  vi.spyOn(installer, 'getAssetInfo').mockReturnValue(Promise.resolve({ id: 0, name: 'minikube' }));
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const spy = vi.spyOn(extensionApi.window, 'showNotification').mockImplementation(() => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      dispose: () => {},
    };
  });

  // Check that install passes
  const result = await installer.performInstall();
  expect(telemetryLogErrorMock).not.toBeCalled();
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(1, 'install-minikube-prompt');
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(2, 'install-minikube-prompt-yes');
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(3, 'install-minikube-downloaded');

  expect(result).toBeDefined();
  expect(result).toBeTruthy();

  // Check that showNotification is called
  expect(spy).toBeCalled();

  // Expect showInformationMessage to be shown and be asking for installing it system wide
  expect(extensionApi.window.showInformationMessage).toBeCalled();
});
