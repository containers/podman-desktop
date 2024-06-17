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

import type { PodInfoUI } from './PodInfoUI';
import PodmanPodDetailsSummary from './PodmanPodDetailsSummary.svelte';

const fakePod: PodInfoUI = {
  id: 'fakePodId',
  shortId: 'FPI',
  name: 'pod1',
  engineId: 'fakeEngineId',
  engineName: 'fakeEngineName',
  status: 'RUNNING',
  age: '3 days',
  created: '2021-01-01T00:00:00Z',
  selected: false,
  containers: [
    {
      Id: 'fakeCId1',
      Names: 'fakeContainer1',
      Status: 'running',
    },
    {
      Id: 'fakeCId2',
      Names: 'fakeContainer2',
      Status: 'running',
    },
  ],
  kind: 'podman',
};

// Test render PodmanPodDetailsSummary with the PodInfoUI object
test('PodmanPodDetailsSummary renders with PodInfoUI object', async () => {
  // Render
  render(PodmanPodDetailsSummary, { pod: fakePod });

  // Check that the rendered text is correct
  expect(screen.getByText('pod1')).toBeInTheDocument();
  expect(screen.getByText('3 days')).toBeInTheDocument();
  expect(screen.getByText('fakeContainer1')).toBeInTheDocument();
  expect(screen.getByText('fakeContainer2')).toBeInTheDocument();
  expect(screen.getAllByText('running')[0]).toBeInTheDocument();
});
