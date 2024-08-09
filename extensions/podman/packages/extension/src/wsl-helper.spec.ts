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

import * as extensionApi from '@podman-desktop/api';
import type { Mock } from 'vitest';
import { beforeEach, expect, test, vi } from 'vitest';

import { WslHelper } from './wsl-helper';

let wslHelper: WslHelper;

// mock the API
vi.mock('@podman-desktop/api', async () => {
  return {
    process: {
      exec: vi.fn(),
    },
  };
});

beforeEach(() => {
  wslHelper = new WslHelper();
  vi.resetAllMocks();
});

test('should grab correct versions', async () => {
  const wslOutput = `WSL version: 1.2.5.0
Kernel version: 5.15.90.1
WSLg version: 1.0.51
MSRDC version: 1.2.3770
Direct3D version: 1.608.2-61064218
DXCore version: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp
Windows version: 10.0.22621.2134
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: wslOutput,
  } as extensionApi.RunResult);

  const { wslVersion, kernelVersion, windowsVersion } = await wslHelper.getWSLVersionData();

  expect(wslVersion).toBe('1.2.5.0');
  expect(kernelVersion).toBe('5.15.90.1');
  expect(windowsVersion).toBe('10.0.22621.2134');

  // expect called with wsl --version
  expect(extensionApi.process.exec).toHaveBeenCalledWith('wsl', ['--version'], { encoding: 'utf16le' });
});

test('should grab correct versions even with an output with a language different from english', async () => {
  const wslOutput = `Versione WSL: 1.2.5.0
  Versione kernel: 5.15.90.1
  Versione WSLg: 1.0.51
  Versione MSRDC: 1.2.3770
  Versione Direct3D: 1.608.2-61064218
  Versione DXCore: 10.0.25131.1002-220531-1700.rs-onecore-base2-hyp
  Versione di Windows: 10.0.22621.2283
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: wslOutput,
  } as extensionApi.RunResult);

  const { wslVersion, kernelVersion, windowsVersion } = await wslHelper.getWSLVersionData();

  expect(wslVersion).toBe('1.2.5.0');
  expect(kernelVersion).toBe('5.15.90.1');
  expect(windowsVersion).toBe('10.0.22621.2283');

  // expect called with wsl --version
  expect(extensionApi.process.exec).toHaveBeenCalledWith('wsl', ['--version'], { encoding: 'utf16le' });
});

test('should grab correct versions even with an output in chinese and fullwidth colon symbol', async () => {
  const wslOutput = `WSL 版本： 2.0.4.0
  内核版本： 5.15.123.1-1
  WSLg 版本： 1.0.58
  MSRDC 版本： 1.2.4485
  Direct3D 版本： 1.608.2-61064218
  DXCore 版本： 10.0.25880.1000-230602-1350.main
  Windows 版本： 10.0.22621.2715
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: wslOutput,
  } as extensionApi.RunResult);

  const wslVersionInfo = await wslHelper.getWSLVersionData();

  expect(wslVersionInfo.wslVersion).toBe('2.0.4.0');
  expect(wslVersionInfo.windowsVersion).toBe('10.0.22621.2715');

  // expect called with wsl --version
  expect(extensionApi.process.exec).toHaveBeenCalledWith('wsl', ['--version'], { encoding: 'utf16le' });
});

test('should grab correct versions when output contains small colon symbol', async () => {
  const wslOutput = `WSL version﹕1.2.5.0
Kernel version﹕5.15.90.1
WSLg version﹕1.0.51
MSRDC version﹕1.2.3770
Direct3D version﹕1.608.2-61064218
DXCore version﹕10.0.25131.1002-220531-1700.rs-onecore-base2-hyp
Windows version﹕10.0.22621.2134
`;

  (extensionApi.process.exec as Mock).mockReturnValue({
    stdout: wslOutput,
  } as extensionApi.RunResult);

  const { wslVersion, kernelVersion, windowsVersion } = await wslHelper.getWSLVersionData();

  expect(wslVersion).toBe('1.2.5.0');
  expect(kernelVersion).toBe('5.15.90.1');
  expect(windowsVersion).toBe('10.0.22621.2134');

  // expect called with wsl --version
  expect(extensionApi.process.exec).toHaveBeenCalledWith('wsl', ['--version'], { encoding: 'utf16le' });
});
