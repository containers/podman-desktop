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
import * as path from 'node:path';

import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ComposeGitHubReleases } from './compose-github-releases';

vi.mock(import('node:fs'));

const mockOctokit = {
  repos: {
    listReleases: vi.fn(),
    getReleaseAsset: vi.fn(),
  },
  paginate: vi.fn(),
};

const mockOctokitFactory = vi.fn();

let composeGitHubReleases: ComposeGitHubReleases;

beforeEach(() => {
  vi.resetAllMocks();
  mockOctokitFactory.mockResolvedValue(mockOctokit);
  composeGitHubReleases = new ComposeGitHubReleases(mockOctokitFactory);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('Auth token is passed to Octokit factory', async () => {
  mockOctokit.repos.listReleases.mockResolvedValue({ data: [] });

  await composeGitHubReleases.grabLatestsReleasesMetadata();

  expect(mockOctokitFactory).toHaveBeenCalled();
});

test('expect grab 5 releases', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

  // mock the result of listReleases REST API
  const resultREST = JSON.parse(
    fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/compose-github-release-all.json'), 'utf8'),
  );

  mockOctokit.repos.listReleases.mockResolvedValue({ data: resultREST });

  const result = await composeGitHubReleases.grabLatestsReleasesMetadata();
  expect(result).toBeDefined();
  expect(result.length).toBe(5);

  // expect v2.24.0-birthday.10 is not fetched as it's a pre-release
  expect(result.filter(release => release.label.includes('birthday')).length).toBe(0);
});

describe.each([
  {
    resource: '../tests/resources/compose-github-release-assets.json',
    id: 91727807,
    macOS_x86: 94785284,
    macOS_arm: 94785273,
    win_x86: 94785408,
    win_arm: 94785398,
    linux_x86: 94785376,
    linux_arm: 94785298,
  },
  {
    resource: '../tests/resources/compose-github-release-many-assets.json',
    id: 91727807,
    macOS_x86: 228416566,
    macOS_arm: 228416557,
    win_x86: 228416687,
    win_arm: 228416679,
    linux_x86: 228416660,
    linux_arm: 228416575,
  },
])(
  'Grab asset id for a given release id',
  async ({ resource, id, macOS_x86, macOS_arm, win_x86, win_arm, linux_x86, linux_arm }) => {
    beforeEach(async () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

      // mock the result of listReleaseAssetsMock REST API
      const resultREST = JSON.parse(fsActual.readFileSync(path.resolve(__dirname, resource), 'utf8'));

      mockOctokit.paginate.mockResolvedValue(resultREST);
    });

    test('macOS x86_64', async () => {
      const result = await composeGitHubReleases.getReleaseAssetId(id, 'darwin', 'x64');
      expect(result).toBeDefined();
      expect(result).toBe(macOS_x86);
    });

    test('macOS arm64', async () => {
      const result = await composeGitHubReleases.getReleaseAssetId(id, 'darwin', 'arm64');
      expect(result).toBeDefined();
      expect(result).toBe(macOS_arm);
    });

    test('windows x86_64', async () => {
      const result = await composeGitHubReleases.getReleaseAssetId(id, 'win32', 'x64');
      expect(result).toBeDefined();
      expect(result).toBe(win_x86);
    });

    test('windows arm64', async () => {
      const result = await composeGitHubReleases.getReleaseAssetId(id, 'win32', 'arm64');
      expect(result).toBeDefined();
      expect(result).toBe(win_arm);
    });

    test('linux x86_64', async () => {
      const result = await composeGitHubReleases.getReleaseAssetId(id, 'linux', 'x64');
      expect(result).toBeDefined();
      expect(result).toBe(linux_x86);
    });

    test('linux arm64', async () => {
      const result = await composeGitHubReleases.getReleaseAssetId(id, 'linux', 'arm64');
      expect(result).toBeDefined();
      expect(result).toBe(linux_arm);
    });

    test('invalid', async () => {
      await expect(composeGitHubReleases.getReleaseAssetId(id, 'invalid', 'invalid')).rejects.toThrow(
        'No asset found for',
      );
    });
  },
);

test('should download the file if parent folder does exist', async () => {
  mockOctokit.repos.getReleaseAsset.mockResolvedValue({ data: 'foo' });

  // mock fs
  const existSyncSpy = vi.mocked(fs.existsSync).mockReturnValue(true);

  const writeFileSpy = vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();

  // generate a temporary file
  const destFile = '/fake/path/to/file';
  await composeGitHubReleases.downloadReleaseAsset(123, destFile);
  // check that parent director has been checked
  expect(existSyncSpy).toBeCalledWith('/fake/path/to');

  // check that we've written the file
  expect(writeFileSpy).toBeCalledWith(destFile, Buffer.from('foo'));
});

test('should download the file if parent folder does not exist', async () => {
  mockOctokit.repos.getReleaseAsset.mockResolvedValue({ data: 'foo' });

  // mock fs
  const existSyncSpy = vi.mocked(fs.existsSync).mockReturnValue(false);
  const mkdirSpy = vi.spyOn(fs.promises, 'mkdir').mockResolvedValue('');

  const writeFileSpy = vi.spyOn(fs.promises, 'writeFile').mockResolvedValue();

  // generate a temporary file
  const destFile = '/fake/path/to/file';
  await composeGitHubReleases.downloadReleaseAsset(123, destFile);
  // check that parent director has been checked
  expect(existSyncSpy).toBeCalledWith('/fake/path/to');

  // check that we've created the parent folder
  expect(mkdirSpy).toBeCalledWith('/fake/path/to', { recursive: true });

  // check that we've written the file
  expect(writeFileSpy).toBeCalledWith(destFile, Buffer.from('foo'));
});
