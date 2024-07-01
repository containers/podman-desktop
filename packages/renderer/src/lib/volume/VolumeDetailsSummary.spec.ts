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

import VolumeDetailsSummary from './VolumeDetailsSummary.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

const fakeVolume: VolumeInfoUI = {
  name: 'fakeVolume1',
  shortName: 'fv1',
  mountPoint: 'some-path',
  scope: 'local1',
  driver: 'local2',
  created: '2024-06-18T15:17:03.000Z',
  age: '3 days',
  size: 5,
  humanSize: '5 MB',
  engineId: 'fakeEngineId',
  engineName: 'fakeEngineName',
  selected: false,
  status: 'USED',
  containersUsage: [
    {
      id: 'container1',
      names: ['/name1', '/name2', 'name3'],
    },
    {
      id: 'container2',
      names: ['/name11', 'name12', '/name13'],
    },
  ],
};

// Test render VolumeDetailsSummary with VolumeInfoUI object
test('VolumeDetailsSummary renders with VolumeInfoUI object', async () => {
  // Render
  render(VolumeDetailsSummary, { volume: fakeVolume });

  // Check that the rendered text is correct
  expect(screen.getByText('fakeVolume1')).toBeInTheDocument();
  expect(screen.getByText('5 MB')).toBeInTheDocument();
  expect(screen.getByText('some-path')).toBeInTheDocument();
  expect(screen.getByText('local1')).toBeInTheDocument();
  expect(screen.getByText('local2')).toBeInTheDocument();
  expect(screen.getByText('used')).toBeInTheDocument();
  expect(screen.getByText(new Date(fakeVolume.created).toString())).toBeInTheDocument();
  expect(screen.getByText('name1 name2 name3')).toBeInTheDocument();
  expect(screen.getByText('name11 name12 name13')).toBeInTheDocument();
  expect(screen.getByText('container1')).toBeInTheDocument();
  expect(screen.getByText('container2')).toBeInTheDocument();
  expect(screen.getByText('fakeEngineId')).toBeInTheDocument();
  expect(screen.getByText('fakeEngineName')).toBeInTheDocument();
});
