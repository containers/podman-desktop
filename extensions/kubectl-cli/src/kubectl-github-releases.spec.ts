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

import { KubectlGitHubReleases } from './kubectl-github-releases';

let kubectlGitHubReleases: KubectlGitHubReleases;

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
  kubectlGitHubReleases = new KubectlGitHubReleases(octokitMock);
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
    fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kubectl-github-release-all.json'), 'utf8'),
  );
  listReleasesMock.mockImplementation(() => {
    return { data: resultREST };
  });

  const result = await kubectlGitHubReleases.grabLatestsReleasesMetadata();
  expect(result).toBeDefined();
  expect(result.length).toBe(5);
});

describe('Grab asset id for a given release id', async () => {
  beforeEach(async () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

    // mock the result of listReleaseAssetsMock REST API
    const resultREST = JSON.parse(
      fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kubectl-github-release-all.json'), 'utf8'),
    );

    listReleaseAssetsMock.mockImplementation(() => {
      return { data: resultREST };
    });
  });

  test('macOS x86_64', async () => {
    const result = await kubectlGitHubReleases.getReleaseAssetURL('v1.2.1', 'darwin', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe('https://dl.k8s.io/release/v1.2.1/bin/darwin/amd64/kubectl');
  });

  test('macOS arm64', async () => {
    const result = await kubectlGitHubReleases.getReleaseAssetURL('v1.2.1', 'darwin', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe('https://dl.k8s.io/release/v1.2.1/bin/darwin/arm64/kubectl');
  });

  test('windows x86_64', async () => {
    const result = await kubectlGitHubReleases.getReleaseAssetURL('v1.2.1', 'win32', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe('https://dl.k8s.io/release/v1.2.1/bin/windows/amd64/kubectl.exe');
  });

  test('windows arm64', async () => {
    const result = await kubectlGitHubReleases.getReleaseAssetURL('v1.2.1', 'win32', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe('https://dl.k8s.io/release/v1.2.1/bin/windows/arm64/kubectl.exe');
  });

  test('linux x86_64', async () => {
    const result = await kubectlGitHubReleases.getReleaseAssetURL('v1.2.1', 'linux', 'x64');
    expect(result).toBeDefined();
    expect(result).toBe('https://dl.k8s.io/release/v1.2.1/bin/linux/amd64/kubectl');
  });

  test('linux arm64', async () => {
    const result = await kubectlGitHubReleases.getReleaseAssetURL('v1.2.1', 'linux', 'arm64');
    expect(result).toBeDefined();
    expect(result).toBe('https://dl.k8s.io/release/v1.2.1/bin/linux/arm64/kubectl');
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

  const writeFileSpy = vi.spyOn(fs.promises, 'writeFile');

  // generate a temporary file
  const destFile = '/fake/path/to/file';
  await kubectlGitHubReleases.downloadReleaseAsset('https://podman-desktop.io/', destFile);
  // check that parent director has been checked
  expect(existSyncSpy).toBeCalledWith('/fake/path/to');

  // check that we've written the file
  expect(writeFileSpy).toBeCalledWith(destFile, expect.anything());
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
  await kubectlGitHubReleases.downloadReleaseAsset('https://podman-desktop.io', destFile);
  // check that parent director has been checked
  expect(existSyncSpy).toBeCalledWith('/fake/path/to');

  // check that we've created the parent folder
  expect(mkdirSpy).toBeCalledWith('/fake/path/to', { recursive: true });

  // check that we've written the file
  expect(writeFileSpy).toBeCalledWith(destFile, expect.anything());
});
