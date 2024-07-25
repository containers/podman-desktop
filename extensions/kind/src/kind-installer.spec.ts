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

import { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';
import { tmpName } from 'tmp-promise';
import { beforeEach, expect, test, vi } from 'vitest';

import { KindInstaller } from './kind-installer';
import { installBinaryToSystem } from './util';

let installer: KindInstaller;

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      showInformationMessage: vi.fn(),
      showErrorMessage: vi.fn(),
      withProgress: vi.fn(),
      showNotification: vi.fn(),
    },
    ProgressLocation: {
      APP_ICON: 1,
    },
    env: {
      isLinux: false,
      isMac: false,
      isWindows: false,
    },
    process: {
      exec: vi.fn(),
    },
  };
});

vi.mock('sudo-prompt', () => {
  return {
    exec: vi
      .fn()
      .mockImplementation(
        (
          cmd: string,
          options?:
            | ((error?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void)
            | { name?: string; icns?: string; env?: { [key: string]: string } },
          callback?: (error?: Error, stdout?: string | Buffer, stderr?: string | Buffer) => void,
        ) => {
          callback?.(undefined);
        },
      ),
  };
});

vi.mock('@octokit/rest', () => {
  return {
    Octokit: vi.fn(),
  };
});

const telemetryLogUsageMock = vi.fn();
const telemetryLogErrorMock = vi.fn();
const telemetryLoggerMock = {
  logUsage: telemetryLogUsageMock,
  logError: telemetryLogErrorMock,
} as unknown as extensionApi.TelemetryLogger;

beforeEach(() => {
  installer = new KindInstaller('.', telemetryLoggerMock);
  vi.resetAllMocks();

  vi.mocked(extensionApi.window.showInformationMessage).mockReturnValue(Promise.resolve('Yes'));
  (extensionApi.env.isLinux as unknown as boolean) = false;
  (extensionApi.env.isWindows as unknown as boolean) = false;
  (extensionApi.env.isMac as unknown as boolean) = false;
});

test.skip('expect installBinaryToSystem to succesfully pass with a binary', async () => {
  (extensionApi.env.isLinux as unknown as boolean) = true;

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
  (extensionApi.env.isLinux as unknown as boolean) = false;

  vi.spyOn(extensionApi.process, 'exec').mockRejectedValue(new Error('test error'));

  await expect(() => installBinaryToSystem('test', 'tmpBinary')).rejects.toThrowError('test error');
});

test('expect showNotification to be called', async () => {
  (extensionApi.env.isLinux as unknown as boolean) = true;

  vi.mocked(Octokit).mockReturnValue({
    repos: {
      getReleaseAsset: vi.fn().mockReturnValue({ name: 'kind', data: [] }),
    },
  } as unknown as Octokit);

  const progress = {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    report: (): void => {},
  };
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, {} as extensionApi.CancellationToken);
  });
  vi.spyOn(installer, 'getAssetInfo').mockReturnValue(Promise.resolve({ id: 0, name: 'kind' }));
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const spy = vi.spyOn(extensionApi.window, 'showNotification').mockImplementation(() => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      dispose: (): void => {},
    };
  });

  // Check that install passes
  const result = await installer.performInstall();
  expect(telemetryLogErrorMock).not.toBeCalled();
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(1, 'install-kind-prompt');
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(2, 'install-kind-prompt-yes');
  expect(telemetryLogUsageMock).toHaveBeenNthCalledWith(3, 'install-kind-downloaded');

  expect(result).toBeDefined();
  expect(result).toBeTruthy();

  // Check that showNotification is called
  expect(spy).toBeCalled();

  // Expect showInformationMessage to be shown and be asking for installing it system wide
  expect(extensionApi.window.showInformationMessage).toBeCalled();
});
