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
import * as fs from 'node:fs';
import * as os from 'node:os';

import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import * as util from './util.js';

let originalProvider: string | undefined;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mock('node:fs');
  vi.mock('node:os');
  originalProvider = process.env.CONTAINERS_MACHINE_PROVIDER;
});

afterEach(() => {
  process.env.CONTAINERS_MACHINE_PROVIDER = originalProvider;
});

test('getBase64Image - return undefined if path do not exists', () => {
  vi.spyOn(fs, 'existsSync').mockReturnValue(false);
  const result = util.getBase64Image('unknown');
  expect(result).toBe(undefined);
});

test('getBase64Image - return undefined if erroring durin execution', () => {
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.spyOn(fs, 'readFileSync').mockImplementation(() => {
    throw new Error('error');
  });
  const result = util.getBase64Image('path');
  expect(result).toBe(undefined);
});

test('getBase64Image - return base64 image', () => {
  const buffer: Buffer = {} as Buffer;
  vi.spyOn(fs, 'existsSync').mockReturnValue(true);
  vi.spyOn(fs, 'readFileSync').mockReturnValue('file');
  vi.spyOn(Buffer, 'from').mockReturnValue(buffer);
  vi.spyOn(buffer, 'toString').mockReturnValue('image');

  const result = util.getBase64Image('path');
  expect(result).toBe('data:image/png;base64,image');
});

test('isWSL - return true is if os is Windows and it is not HyperV', async () => {
  vi.mocked(os.platform).mockReturnValue('win32');
  vi.mocked(os.homedir).mockReturnValue('home');
  process.env.CONTAINERS_MACHINE_PROVIDER = 'wsl';
  vi.mocked(fs.promises.readFile).mockResolvedValue('');

  const wsl = await util.isWSL();
  expect(wsl).toBeTruthy();
});

test('isWSL - return false is if os is NOT Windows', async () => {
  vi.spyOn(os, 'platform').mockReturnValue('linux');

  const wsl = await util.isWSL();
  expect(wsl).toBeFalsy();
});

test('isWSL - return true is if os is Windows and it is HyperV', async () => {
  vi.spyOn(os, 'platform').mockReturnValue('win32');
  process.env.CONTAINERS_MACHINE_PROVIDER = 'hyperv';

  const wsl = await util.isWSL();
  expect(wsl).toBeFalsy();
});

test('isHyperV - return true is if os is Windows and it has env variable set', async () => {
  vi.mocked(os.platform).mockReturnValue('win32');
  process.env.CONTAINERS_MACHINE_PROVIDER = 'hyperv';

  const hyperv = await util.isHyperV();
  expect(hyperv).toBeTruthy();
});

test('isHyperV - return false if os is NOT windows', async () => {
  vi.mocked(os.platform).mockReturnValue('linux');

  const hyperv = await util.isHyperV();
  expect(hyperv).toBeFalsy();
});

test('isHyperV - return false if os is windows but env variable is not hyperv and the containersConfig file does not set the provider to hyperv', async () => {
  vi.mocked(os.platform).mockReturnValue('win32');
  vi.mocked(os.homedir).mockReturnValue('home');
  process.env.CONTAINERS_MACHINE_PROVIDER = '';
  vi.mocked(fs.promises.readFile).mockResolvedValue('');

  const hyperv = await util.isHyperV();
  expect(hyperv).toBeFalsy();
});

test('isHyperV - return true if os is windows but env variable is not hyperv but the containersConfig file set the provider to hyperv', async () => {
  vi.mocked(os.platform).mockReturnValue('win32');
  vi.mocked(os.homedir).mockReturnValue('home');
  process.env.CONTAINERS_MACHINE_PROVIDER = '';
  vi.mocked(fs.promises.readFile).mockResolvedValue(`
[machine]

provider = "hyperv"
memory = 4096
    `);

  const hyperv = await util.isHyperV();
  expect(hyperv).toBeTruthy();
});
