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

import ContainerDetailsSummary from './ContainerDetailsSummary.svelte';
import { ContainerGroupInfoTypeUI, type ContainerInfoUI } from './ContainerInfoUI';

const fakePodContainer: ContainerInfoUI = {
  id: 'fakeId1',
  shortId: 'FID1',
  name: 'fakePodContainer',
  image: 'image1',
  shortImage: 'img1',
  engineId: 'Podman.podman',
  engineName: 'Podman',
  engineType: 'podman',
  state: 'RUNNING',
  uptime: '3 days',
  startedAt: '2024-06-18T15:17:03.000Z',
  ports: [],
  portsAsString: '',
  displayPort: '',
  hasPublicPort: false,
  groupInfo: {
    name: 'group1',
    type: ContainerGroupInfoTypeUI.POD,
    id: 'pod1',
    engineId: 'Podman.podman',
    engineName: 'Podman',
    engineType: 'podman',
    status: 'RUNNING',
    created: '2024-06-18T17:39:46.000Z',
  },
  selected: false,
  created: 1234,
  labels: { label1: 'label1' },
  imageBase64RepoTag: 'fakeRepoTag',
};

const fakeStandaloneContainer: ContainerInfoUI = {
  id: 'fakeId2',
  shortId: 'FID2',
  name: 'fakeStandaloneContainer',
  image: 'image2',
  shortImage: 'img2',
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

// Test render ContainerDetailsSummary with ContainerInfoUI object with a pod group
test('ContainerDetailsSummary renders with ContainerInfoUI object with a pod group', async () => {
  // Render
  render(ContainerDetailsSummary, { container: fakePodContainer });

  // Check that the rendered text is correct
  expect(screen.getByText('fakePodContainer')).toBeInTheDocument();
  expect(screen.getByText('image1')).toBeInTheDocument();
  expect(screen.getAllByText(new Date(fakePodContainer.startedAt).toString())[0]).toBeInTheDocument();
  expect(screen.getByText('N/A')).toBeInTheDocument();
  expect(screen.getByText('pod')).toBeInTheDocument();
  expect(screen.getAllByText('running')[0]).toBeInTheDocument();
  expect(screen.getByText('group1')).toBeInTheDocument();
  expect(screen.getByText('pod1')).toBeInTheDocument();
});

// Test render ContainerDetailsSummary with standalone ContainerInfoUI object
test('ContainerDetailsSummary renders with standalone ContainerInfoUI object', async () => {
  // Render
  render(ContainerDetailsSummary, { container: fakeStandaloneContainer });

  // Check that the rendered text is correct
  expect(screen.getByText('fakeStandaloneContainer')).toBeInTheDocument();
  expect(screen.getByText('image2')).toBeInTheDocument();
  expect(screen.getByText(new Date(fakeStandaloneContainer.startedAt).toString())).toBeInTheDocument();
  expect(screen.getByText('N/A')).toBeInTheDocument();
  expect(screen.getByText('standalone')).toBeInTheDocument();
  expect(screen.getByText('running')).toBeInTheDocument();
  expect(screen.getByText('group2')).toBeInTheDocument();
});
