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

import { KubectlGitHubReleases } from './kubectl-github-releases';

vi.mock(import('node:fs'));

const mockOctokit = {
  repos: {
    listReleases: vi.fn(),
  },
};

const mockOctokitFactory = vi.fn();

let kubectlGitHubReleases: KubectlGitHubReleases;

beforeEach(() => {
  vi.resetAllMocks();
  mockOctokitFactory.mockResolvedValue(mockOctokit);
  kubectlGitHubReleases = new KubectlGitHubReleases(mockOctokitFactory);
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

test('Auth token is passed to Octokit factory', async () => {
  mockOctokit.repos.listReleases.mockResolvedValue({ data: [] });

  await kubectlGitHubReleases.grabLatestsReleasesMetadata();

  expect(mockOctokitFactory).toHaveBeenCalled();
});

test('expect grab 5 releases', async () => {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

  // mock the result of listReleases REST API
  const resultREST = JSON.parse(
    fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kubectl-github-release-all.json'), 'utf8'),
  );
  mockOctokit.repos.listReleases.mockResolvedValue({ data: resultREST });

  const result = await kubectlGitHubReleases.grabLatestsReleasesMetadata();
  expect(result).toBeDefined();
  expect(result.length).toBe(5);
});

describe('Grab asset id for a given release id', async () => {
  test.each([
    {
      platform: 'darwin',
      arch: 'x64',
      expectedURL: 'https://dl.k8s.io/release/v1.2.1/bin/darwin/amd64/kubectl',
      name: 'macOS x86_64',
    },
    {
      platform: 'darwin',
      arch: 'arm64',
      expectedURL: 'https://dl.k8s.io/release/v1.2.1/bin/darwin/arm64/kubectl',
      name: 'macOS arm64',
    },
    {
      platform: 'win32',
      arch: 'x64',
      expectedURL: 'https://dl.k8s.io/release/v1.2.1/bin/windows/amd64/kubectl.exe',
      name: 'windows x86_64',
    },
    {
      platform: 'win32',
      arch: 'arm64',
      expectedURL: 'https://dl.k8s.io/release/v1.2.1/bin/windows/arm64/kubectl.exe',
      name: 'windows arm64',
    },
    {
      platform: 'linux',
      arch: 'x64',
      expectedURL: 'https://dl.k8s.io/release/v1.2.1/bin/linux/amd64/kubectl',
      name: 'linux x86_64',
    },
    {
      platform: 'linux',
      arch: 'arm64',
      expectedURL: 'https://dl.k8s.io/release/v1.2.1/bin/linux/arm64/kubectl',
      name: 'linux arm64',
    },
  ])('$name', async ({ platform, arch, expectedURL }) => {
    const result = await kubectlGitHubReleases.getReleaseAssetURL('v1.2.1', platform, arch);
    expect(result).toBeDefined();
    expect(result).toBe(expectedURL);
  });
});

test('should download the file if parent folder does exist', async () => {
  // mock fs
  const existSyncSpy = vi.mocked(fs.existsSync).mockReturnValue(true);

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
  // mock fs
  const existSyncSpy = vi.mocked(fs.existsSync).mockReturnValue(false);
  const mkdirSpy = vi.spyOn(fs.promises, 'mkdir').mockResolvedValue('');

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
