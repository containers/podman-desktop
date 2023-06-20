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

import { WinInstaller } from './podman-install';
import { beforeEach, expect, type Mock, test, vi, afterEach } from 'vitest';
import * as extensionApi from '@podman-desktop/api';
import * as fs from 'node:fs';
import { runCliCommand } from './util';

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

vi.mock('@podman-desktop/api', async () => {
  return {
    window: {
      withProgress: vi.fn(),
      showNotification: vi.fn(),
      showErrorMessage: vi.fn(),
    },
    ProgressLocation: {},
  };
});

vi.mock('./util', async () => {
  return {
    getAssetsFolder: vi.fn().mockReturnValue(''),
    runCliCommand: vi.fn(),
  };
});

const progress = {
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  report: () => {},
};

beforeEach(() => {
  vi.clearAllMocks();
  console.error = consoleErrorMock;
});

afterEach(() => {
  console.error = originalConsoleError;
});

test('expect update on windows to show notification in case of 0 exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  (runCliCommand as Mock).mockResolvedValue({ exitCode: 0 });

  const installer = new WinInstaller();
  const result = await installer.update();
  expect(result).toBeTruthy();
  expect(extensionApi.window.showNotification).toHaveBeenCalled();
});

test('expect update on windows not to show notification in case of 1602 exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  (runCliCommand as Mock).mockResolvedValue({ exitCode: 1602 });

  const installer = new WinInstaller();
  const result = await installer.update();
  expect(result).toBeTruthy();
  expect(extensionApi.window.showNotification).not.toHaveBeenCalled();
});

test('expect update on windows to throw error if non zero exit code', async () => {
  vi.spyOn(extensionApi.window, 'withProgress').mockImplementation((options, task) => {
    return task(progress, undefined);
  });

  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  (runCliCommand as Mock).mockResolvedValue({ exitCode: -1, stdErr: 'CustomError' });

  const installer = new WinInstaller();
  const result = await installer.update();
  expect(result).toBeFalsy();
  expect(extensionApi.window.showErrorMessage).toHaveBeenCalled();
});
