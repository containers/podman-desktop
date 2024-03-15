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

import type { Octokit } from '@octokit/rest';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ComposeGitHubReleases } from './compose-github-releases';

let composeGitHubReleases: ComposeGitHubReleases;

const listReleaseAssetsMock = vi.fn();
const listReleasesMock = vi.fn();
const getReleaseAssetMock = vi.fn();
const octokitMock: Octokit = {
  repos: {
    listReleases: listReleasesMock,
    listReleaseAssets: listReleaseAssetsMock,
    getReleaseAsset: getReleaseAssetMock,
  },
} as unknown as Octokit;

beforeEach(() => {
  composeGitHubReleases = new ComposeGitHubReleases(octokitMock);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('expect grab 5 releases', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

  // mock the result of listReleases REST API
  const resultREST = JSON.parse(
    fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/compose-github-release-all.json'), 'utf8'),
  );
  listReleasesMock.mockImplementation(() => {
    return { data: resultREST };
  });

  const result = await composeGitHubReleases.grabLatestsReleasesMetadata();
  expect(result).toBeDefined();
  expect(result.length).toBe(5);

  // expect v2.24.0-birthday.10 is not fetched as it's a pre-release
  expect(result.filter(release => release.label.includes('birthday')).length).toBe(0);
});

describe('Grab asset id for a given release id', async () => {
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleaseAssetsMock REST API
    const resultREST = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/compose-github-release-assets.json'), 'utf8'),
    );

    listReleaseAssetsMock.mockImplementation(() => {
      return { data: resultREST };
    });
  });

  test('macOS x86_64', async () => {
    const result = await composeGitHubReleases.getReleaseAssetId(91727807, 'darwin', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe(94785284);
  });

  test('macOS arm64', async () => {
    const result = await composeGitHubReleases.getReleaseAssetId(91727807, 'darwin', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe(94785273);
  });

  test('windows x86_64', async () => {
    const result = await composeGitHubReleases.getReleaseAssetId(91727807, 'win32', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe(94785408);
  });

  test('windows arm64', async () => {
    const result = await composeGitHubReleases.getReleaseAssetId(91727807, 'win32', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe(94785398);
  });

  test('linux x86_64', async () => {
    const result = await composeGitHubReleases.getReleaseAssetId(91727807, 'linux', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe(94785376);
  });

  test('linux arm64', async () => {
    const result = await composeGitHubReleases.getReleaseAssetId(91727807, 'linux', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe(94785298);
  });

  test('invalid', async () => {
    await expect(composeGitHubReleases.getReleaseAssetId(91727807, 'invalid', 'invalid')).rejects.toThrow(
      'No asset found for',
    );
  });
});

test('should download the file if parent folder does exist', async () => {
  vi.mock('node:fs');

  getReleaseAssetMock.mockImplementation(() => {
    return { data: 'foo' };
  });

  // mock fs
  const existSyncSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return true;
  });

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
  vi.mock('node:fs');

  getReleaseAssetMock.mockImplementation(() => {
    return { data: 'foo' };
  });

  // mock fs
  const existSyncSpy = vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });
  const mkdirSpy = vi.spyOn(fs.promises, 'mkdir').mockImplementation(async () => {
    return '';
  });

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
