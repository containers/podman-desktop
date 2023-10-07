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
import { BinaryRegistry } from './binary-registry.js';
import fs from 'node:fs';
import type { UpdateProviderRegistry } from '/@/plugin/binaries/update-provider-registry.js';

const getCandidateVersionsMock = vi.fn();
const performInstallMock = vi.fn();

const updateProviderMock = {
  getCandidateVersions: getCandidateVersionsMock,
  performInstall: performInstallMock,
};

const getProviderMock = vi.fn();

const updateProviderRegistry = {
  getProvider: getProviderMock,
};

beforeAll(() => {
  getCandidateVersionsMock.mockImplementation(() => Promise.resolve([]));
});

test('testing registerProvider', async () => {
  const { path, cleanup } = await dir({ unsafeCleanup: true });
  expect(fs.readdirSync(path)).lengthOf(0);

  const uri = 'dummy://host/path';
  getProviderMock.mockImplementation(() => updateProviderMock);

  try {
    const binary = new BinaryRegistry(path, updateProviderRegistry as unknown as UpdateProviderRegistry);
    binary.registerProvider({
      name: 'example',
      uri: uri,
    });

    const binariesProvider = await binary.getBinaryProviderInfos();
    expect(binariesProvider).toHaveLength(1);
    expect(binariesProvider[0].name).toBe('example');
    expect(binariesProvider[0].providerId).toBe(uri);
    expect(getProviderMock).toHaveBeenCalledWith('dummy:');
  } finally {
    await cleanup();
  }
});

test('testing using disposable after registerProvider', async () => {
  const { path, cleanup } = await dir({ unsafeCleanup: true });
  expect(fs.readdirSync(path)).lengthOf(0);

  const uri = 'dummy://host/path';
  getProviderMock.mockImplementation(() => updateProviderMock);

  try {
    const binary = new BinaryRegistry(path, updateProviderRegistry as unknown as UpdateProviderRegistry);
    const disposable = binary.registerProvider({
      name: 'example',
      uri: uri,
    });
    disposable.dispose();

    const binariesProvider = await binary.getBinaryProviderInfos();
    expect(binariesProvider).toHaveLength(0);
  } finally {
    await cleanup();
  }
});
