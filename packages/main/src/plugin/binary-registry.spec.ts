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
import type { AssetInfo } from '/@/plugin/binary-registry.js';
import { BinaryRegistry } from '/@/plugin/binary-registry.js';
import type { Octokit } from '@octokit/rest';
import fs from 'node:fs';

const listReleasesMock = vi.fn();
const getReleaseAssetMock = vi.fn();

const octokitMock = {
  repos: {
    listReleases: listReleasesMock,
    getReleaseAsset: getReleaseAssetMock,
  },
};

beforeAll(() => {
  listReleasesMock.mockImplementation(() => Promise.resolve({ data: [] }));
});

test('Expecting provider findAsset function to be called.', async () => {
  const findAssetMock = vi.fn();
  findAssetMock.mockImplementation(() => Promise.resolve());

  const binaryRegistry = new BinaryRegistry(octokitMock as unknown as Octokit, '');
  binaryRegistry.registerProvider({
    name: 'hello-world',
    githubRepo: 'dummy',
    githubOrganization: 'does-not-exist',
    findAsset: findAssetMock,
  });
  await binaryRegistry.checkUpdates();
  expect(findAssetMock).toHaveBeenCalled();
});

test('Provider rejecting update.', async () => {
  const binaryRegistry = new BinaryRegistry(octokitMock as unknown as Octokit, '');
  binaryRegistry.registerProvider({
    name: 'hello-world',
    githubRepo: 'dummy',
    githubOrganization: 'does-not-exist',
    findAsset: () => Promise.resolve(undefined),
  });
  const result = await binaryRegistry.checkUpdates();
  expect(result).lengthOf(0);
});

test('Provider resolving update.', async () => {
  const binaryRegistry = new BinaryRegistry(octokitMock as unknown as Octokit, '');
  binaryRegistry.registerProvider({
    name: 'hello-world',
    githubRepo: 'dummy',
    githubOrganization: 'does-not-exist',
    findAsset: () => Promise.resolve<AssetInfo>({ id: -1, name: 'dummy' }),
  });

  const result = await binaryRegistry.checkUpdates();
  expect(result).lengthOf(1);
  expect(result[0][1]).toStrictEqual({ id: -1, name: 'dummy' });
});

test('Installing file using validateUpdate to storagePath.', async () => {
  const { path, cleanup } = await dir({ unsafeCleanup: true });
  expect(fs.readdirSync(path)).lengthOf(0);

  getReleaseAssetMock.mockImplementation(() => ({
    data: new Uint8Array([1, 2, 3, 4, 5, 6]),
  }));

  try {
    const binaryRegistry = new BinaryRegistry(octokitMock as unknown as Octokit, path);
    binaryRegistry.registerProvider({
      name: 'hello-world',
      githubRepo: 'dummy',
      githubOrganization: 'does-not-exist',
      findAsset: () => Promise.resolve<AssetInfo>({ id: -1, name: 'dummy' }),
    });
    await binaryRegistry.validateUpdate('0', { id: -1, name: 'dummy' });

    const dir = fs.readdirSync(path);
    expect(dir).lengthOf(1);
    expect(dir[0]).toContain('dummy'); // because can be dummy.exe or simply dummy
  } finally {
    await cleanup();
  }
});
