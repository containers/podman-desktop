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

import { test, vi, expect } from 'vitest';
import type { Octokit } from '@octokit/rest';
import { GithubUpdateProvider } from './github-update-provider';

vi.mock('@podman-desktop/api', async () => {
  return {
    UpdateProvider: class UpdateProvider {
      constructor(protected protocol: string) {}
    },
  };
});

const listReleasesMock = vi.fn();
const getReleaseAssetMock = vi.fn();

const octokitMock = {
  repos: {
    listReleases: listReleasesMock,
    getReleaseAsset: getReleaseAssetMock,
  },
};

test('Expecting update provider to call listReleases on Octokit.', async () => {
  listReleasesMock.mockImplementation(() => Promise.resolve({ data: [] }));

  const gitHubUpdateProvider = new GithubUpdateProvider(octokitMock as unknown as Octokit);

  const candidates = await gitHubUpdateProvider.getCandidateVersions(
    new URL('github://dummyOrg/dummyRepo?assetName=dummy.exe'),
  );
  expect(candidates).toHaveLength(0);
  expect(listReleasesMock).toHaveBeenCalledOnce();
  expect(listReleasesMock).toHaveBeenCalledWith({
    owner: 'dummyOrg',
    repo: 'dummyRepo',
    per_page: undefined,
  });
});

test('Expecting update provider to filter assetInfo based on constructor argument.', async () => {
  listReleasesMock.mockImplementation(() =>
    Promise.resolve({
      data: [
        {
          assets: [{ name: 'dummyName', id: 10 }],
          name: '',
          tag_name: '',
        },
        {
          assets: [{ name: 'badName' }],
          name: '',
          tag_name: '',
        },
      ],
    }),
  );

  const gitHubUpdateProvider = new GithubUpdateProvider(octokitMock as unknown as Octokit);

  const candidates = await gitHubUpdateProvider.getCandidateVersions(
    new URL('github://dummyOrg/dummyRepo?assetName=dummyName'),
  );
  expect(candidates).toHaveLength(1);
  expect(candidates[0].name).toContain('dummyName');
  expect(candidates[0].id).toBe(10);
});
