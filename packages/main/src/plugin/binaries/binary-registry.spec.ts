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

import { test, vi, expect, beforeAll } from 'vitest';
import { dir } from 'tmp-promise';
import { BINARIES_INFO_FILE, BinaryRegistry } from './binary-registry.js';
import fs from 'node:fs';
import * as sys_path from 'path';

const getCandidateVersionsMock = vi.fn();
const performInstallMock = vi.fn();

const updateProviderMock = {
  getCandidateVersions: getCandidateVersionsMock,
  performInstall: performInstallMock,
};

beforeAll(() => {
  getCandidateVersionsMock.mockImplementation(() => Promise.resolve([]));
});

test('testing registerProvider', async () => {
  const { path, cleanup } = await dir({ unsafeCleanup: true });
  expect(fs.readdirSync(path)).lengthOf(0);
  try {
    const binary = new BinaryRegistry(path);
    const binaryDisposable = binary.registerProvider({
      name: 'example',
      updater: updateProviderMock,
    });

    const binariesProvider = await binary.getBinaryProviderInfos();
    expect(binariesProvider).toHaveLength(1);
    expect(binariesProvider[0].name).toBe('example');
    expect(binariesProvider[0].providerId).toBe(binaryDisposable.providerId);
  } finally {
    await cleanup();
  }
});

test('testing using disposable after registerProvider', async () => {
  const { path, cleanup } = await dir({ unsafeCleanup: true });
  expect(fs.readdirSync(path)).lengthOf(0);
  try {
    const binary = new BinaryRegistry(path);
    const binaryDisposable = binary.registerProvider({
      name: 'example',
      updater: updateProviderMock,
    });

    binaryDisposable.dispose();
    const binariesProvider = await binary.getBinaryProviderInfos();
    expect(binariesProvider).toHaveLength(0);
  } finally {
    await cleanup();
  }
});

test('getBinariesInstalled should return empty array on empty storagePath folder', async () => {
  const { path, cleanup } = await dir({ unsafeCleanup: true });
  expect(fs.readdirSync(path)).lengthOf(0);
  try {
    const binary = new BinaryRegistry(path);
    const binaries = await binary.getBinariesInstalled();
    expect(binaries).toHaveLength(0);
  } finally {
    await cleanup();
  }
});

test('testing installing file.', async () => {
  const { path, cleanup } = await dir({ unsafeCleanup: true });
  expect(fs.readdirSync(path)).lengthOf(0);

  performInstallMock.mockImplementation(() => Promise.resolve());

  try {
    const binary = new BinaryRegistry(path);
    const binaryDisposable = binary.registerProvider({
      name: 'example',
      updater: updateProviderMock,
    });

    await binary.performInstall(binaryDisposable.providerId, { name: 'dummy', id: 5 });
    expect(fs.existsSync(sys_path.join(path, BINARIES_INFO_FILE))).toBeTruthy();
  } finally {
    await cleanup();
  }
});
