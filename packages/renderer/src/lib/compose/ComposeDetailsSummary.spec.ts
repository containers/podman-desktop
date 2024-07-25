/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from '../container/ContainerInfoUI';
import ComposeDetailsSummary from './ComposeDetailsSummary.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

const fakeContainer1: ContainerInfoUI = {
  id: 'fakeContainerID1',
  shortId: 'FC1',
  name: 'fakeContainer1',
  image: 'image1',
  shortImage: 'img1',
  engineId: 'Podman.podman',
  engineName: 'Podman',
  engineType: 'podman',
  state: 'RUNNING',
  uptime: '3 days',
  startedAt: '2024-06-18T17:39:46.000Z',
  ports: [],
  portsAsString: '',
  displayPort: '',
  hasPublicPort: false,
  groupInfo: {
    name: 'group1',
    type: ContainerGroupInfoTypeUI.STANDALONE,
  },
  selected: false,
  created: 1234,
  labels: {},
  imageBase64RepoTag: 'fakeRepoTag',
};

const fakeContainer2: ContainerInfoUI = {
  id: 'fakeContainerID2',
  shortId: 'FC2',
  name: 'fakeContainer2',
  image: 'image1',
  shortImage: 'img1',
  engineId: 'Podman.podman',
  engineName: 'Podman',
  engineType: 'podman',
  state: 'RUNNING',
  uptime: '3 days',
  startedAt: '2024-06-18T17:39:46.000Z',
  ports: [],
  portsAsString: '',
  displayPort: '',
  hasPublicPort: false,
  groupInfo: {
    name: 'group2',
    type: ContainerGroupInfoTypeUI.STANDALONE,
  },
  selected: false,
  created: 1234,
  labels: {},
  imageBase64RepoTag: 'fakeRepoTag',
};

const fakeCompose: ComposeInfoUI = {
  engineId: 'Podman.podman',
  engineType: 'podman',
  name: 'fakeCompose',
  status: 'Running',
  containers: [fakeContainer1, fakeContainer2],
};

test('ContainerDetailsSummary renders with ContainerInfoUI object with a pod group', async () => {
  render(ComposeDetailsSummary, { compose: fakeCompose });

  // Check that the rendered text is correct
  expect(screen.getByText('fakeCompose')).toBeInTheDocument();
  expect(screen.getByText('podman')).toBeInTheDocument();
  expect(screen.getByText('Podman.podman')).toBeInTheDocument();
  expect(screen.getByText('Running')).toBeInTheDocument();
  expect(screen.getByText('fakeContainer1')).toBeInTheDocument();
  expect(screen.getByText('fakeContainer2')).toBeInTheDocument();
  expect(screen.getByText('fakeContainerID1')).toBeInTheDocument();
  expect(screen.getByText('fakeContainerID2')).toBeInTheDocument();
});
