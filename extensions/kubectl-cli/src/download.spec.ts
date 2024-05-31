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
import { beforeEach } from 'node:test';

import * as extensionApi from '@podman-desktop/api';
import { afterEach, expect, test, vi } from 'vitest';

import { KubectlDownload } from './download';
import type { KubectlGithubReleaseArtifactMetadata, KubectlGitHubReleases } from './kubectl-github-releases';
import { OS } from './os';
import * as utils from './utils';

// Create the OS class as well as fake extensionContext
const os = new OS();
const extensionContext: extensionApi.ExtensionContext = {
  storagePath: '/fake/path',
  subscriptions: [],
} as unknown as extensionApi.ExtensionContext;

// Mock the "github release"
const grabLatestsReleasesMetadataMock = vi.fn();
const getLatestVersionAssetMock = vi.fn();
const downloadReleaseAssetMock = vi.fn();
const getReleaseAssetURLMock = vi.fn();
const kubectlGitHubReleasesMock = {
  grabLatestsReleasesMetadata: grabLatestsReleasesMetadataMock,
  getLatestVersionAsset: getLatestVersionAssetMock,
  downloadReleaseAsset: downloadReleaseAssetMock,
  getReleaseAssetURL: getReleaseAssetURLMock,
} as unknown as KubectlGitHubReleases;

// We are also testing fs, but we need fs for reading the JSON file, so we will use "vi.importActual"
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const fsActual = await vi.importActual<typeof import('node:fs')>('node:fs');

// Create a mock KubectlGithubReleaseArtifactMetadata[] with 5 release from the test json file
// this file we'll use for all the tests
const resultREST = JSON.parse(
  fsActual.readFileSync(path.resolve(__dirname, '../tests/resources/kubectl-github-release-all.json'), 'utf8'),
);
const releases: KubectlGithubReleaseArtifactMetadata[] = resultREST.map(
  (release: { name: string; tag_name: string; id: number }) => {
    return {
      label: release.name || release.tag_name,
      tag: release.tag_name,
      id: release.id,
    };
  },
);

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

vi.mock('@podman-desktop/api', () => {
  return {
    window: {
      showQuickPick: vi.fn(),
      createStatusBarItem: vi.fn(),
      showInformationMessage: vi.fn(),
    },
  };
});

test('expect getLatestVersionAsset to return the first release from a list of releases', async () => {
  grabLatestsReleasesMetadataMock.mockImplementation(() => {
    return releases;
  });

  // Expect the test to return the first release from the list (as the function simply returns the first one)
  const kubectlDownload = new KubectlDownload(extensionContext, kubectlGitHubReleasesMock, os);
  const result = await kubectlDownload.getLatestVersionAsset();
  expect(result).toBeDefined();
  expect(result).toEqual(releases[0]);
});

test('pick the 4th option option in the quickpickmenu and expect it to return the github release information', async () => {
  grabLatestsReleasesMetadataMock.mockImplementation(() => {
    return releases;
  });
  const showQuickPickMock = vi.spyOn(extensionApi.window, 'showQuickPick');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  showQuickPickMock.mockResolvedValue({ id: 129616500, label: 'Kubernetes v1.27.8', tag: 'v1.27.8' } as any);

  // Expect the test to return the first release from the list (as the function simply returns the first one)
  const kubectlDownload = new KubectlDownload(extensionContext, kubectlGitHubReleasesMock, os);
  const result = await kubectlDownload.promptUserForVersion();
  expect(result).toBeDefined();
  expect(result).toEqual(releases[3]); // "4th" option was picked
});

test('test download of kubectl passes and that mkdir and executable mocks are called', async () => {
  const makeExecutableMock = vi.spyOn(utils, 'makeExecutable');
  const mkdirMock = vi.spyOn(fs.promises, 'mkdir');
  const downloadReleaseAssetMock = vi.spyOn(kubectlGitHubReleasesMock, 'downloadReleaseAsset');

  // Mock that the storage path does not exist
  vi.mock('node:fs');
  vi.spyOn(fs, 'existsSync').mockImplementation(() => {
    return false;
  });

  // Mock the mkdir to return "success"
  mkdirMock.mockResolvedValue(undefined);

  // Mock the getting and downloading the release
  downloadReleaseAssetMock.mockResolvedValue(undefined);

  // Simply download the first release from the example json list
  const kubectlDownload = new KubectlDownload(extensionContext, kubectlGitHubReleasesMock, os);
  await kubectlDownload.download(releases[0]);

  // Expect the mkdir and executables to have been called
  expect(mkdirMock).toHaveBeenCalled();
  expect(makeExecutableMock).toHaveBeenCalled();
});
