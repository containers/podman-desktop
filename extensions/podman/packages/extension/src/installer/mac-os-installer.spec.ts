/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import fs from 'node:fs';

import type { CancellationToken, ExtensionContext } from '@podman-desktop/api';
import { process as processAPI, window } from '@podman-desktop/api';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getAssetsFolder } from '/@/utils/util';

import { MacOSInstaller } from './mac-os-installer';

vi.mock(import('node:fs'));

const extensionContext = {
  subscriptions: [],
} as unknown as ExtensionContext;

const progress = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  report: (): void => {},
};

vi.mock(import('./../utils/util'), () => ({
  getAssetsFolder: vi.fn(),
}));

beforeEach(() => {
  vi.resetAllMocks();
  // reset array of subscriptions
  extensionContext.subscriptions.length = 0;

  vi.mocked(getAssetsFolder).mockReturnValue('');

  vi.mocked(window.withProgress).mockImplementation((options, task) => {
    return task(progress, {} as unknown as CancellationToken);
  });
});

describe('MacOSInstaller', () => {
  // call the parameter
  const progress = {
    report: vi.fn(),
  };

  beforeEach(() => {
    vi.mocked(window.withProgress).mockImplementation((options, task) => {
      return task(progress, {} as unknown as CancellationToken);
    });
  });

  test('call arch-specific installer', async () => {
    // mock existSync being true for arch-specific installer
    vi.mocked(fs.existsSync).mockReturnValue(true);
    // create the installer
    const installer = new MacOSInstaller();

    // mock extensionApi.window.withProgress
    const withProgressMock = vi.mocked(window.withProgress);

    // call install
    const promiseResult = installer?.install();

    // wait our mock is called
    await vi.waitFor(() => expect(withProgressMock).toBeCalled());

    // get the call's argument to the method
    const methodArgs = withProgressMock.mock.calls[0];
    const promiseArg = methodArgs[1];
    expect(promiseArg).toBeDefined();

    // call the parameter
    const progress = {
      report: vi.fn(),
    };

    const token = {
      isCancellationRequested: false,
    } as unknown as CancellationToken;

    await promiseArg(progress, token);

    expect(progress.report).toHaveBeenCalledWith({ increment: -1 });

    await promiseResult;

    // check we've called the execution of the universal installer
    const pkgArch = process.arch === 'arm64' ? 'aarch64' : 'amd64';
    expect(vi.mocked(processAPI.exec)).toBeCalledWith(
      'open',
      expect.arrayContaining([expect.stringContaining(`podman-installer-macos-${pkgArch}`)]),
    );
  });

  test('check error if no installer is found', async () => {
    // create the installer
    const installer = new MacOSInstaller();

    // mock existSync being always false (we never find installers)
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // check we have an installer
    expect(installer).toBeDefined();

    // mock extensionApi.window.withProgress
    const withProgressMock = vi.mocked(window.withProgress);

    // call install
    const promiseResult = installer?.install();

    // wait our mock is called
    await vi.waitFor(() => expect(withProgressMock).toBeCalled());

    // get the call's argument to the method
    const methodArgs = withProgressMock.mock.calls[0];
    const promiseArg = methodArgs[1];
    expect(promiseArg).toBeDefined();

    // call the parameter
    const progress = {
      report: vi.fn(),
    };

    const token = {
      isCancellationRequested: false,
    } as unknown as CancellationToken;

    await expect(promiseArg(progress, token)).rejects.toThrow(`Can't find Podman package`);
    expect(progress.report).toHaveBeenCalledWith({ increment: -1 });
    expect(promiseResult).toBeDefined();
  });
});
