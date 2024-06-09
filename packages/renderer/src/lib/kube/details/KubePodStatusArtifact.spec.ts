/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import type { V1PodStatus } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubePodStatusArtifact from './KubePodStatusArtifact.svelte'; // Adjust the import path as necessary

const fakePodStatus: V1PodStatus = {
  phase: 'Running',
  podIP: '192.168.1.1',
  hostIP: '192.168.1.2',
};

test('Renders pod status correctly with hardcoded values', () => {
  render(KubePodStatusArtifact, { artifact: fakePodStatus });

  // Verify the status title and details are displayed with hardcoded expectations
  expect(screen.getByText('Status')).toBeInTheDocument();
  expect(screen.getByText('Phase')).toBeInTheDocument();
  expect(screen.getByText('Running')).toBeInTheDocument();

  expect(screen.getByText('Pod IP')).toBeInTheDocument();
  expect(screen.getByText('192.168.1.1')).toBeInTheDocument();

  expect(screen.getByText('Host IP')).toBeInTheDocument();
  expect(screen.getByText('192.168.1.2')).toBeInTheDocument();
});

test('show container statuses when present', () => {
  const fakePodStatusWithContainers: V1PodStatus = {
    phase: 'Running',
    containerStatuses: [
      {
        name: 'container1',
        state: {
          waiting: {
            reason: 'CrashLoopBackOff',
            message: 'Back-off restarting failed container',
          },
        },
      },
    ],
  } as V1PodStatus;

  render(KubePodStatusArtifact, { artifact: fakePodStatusWithContainers });

  expect(screen.getByText('Container Status')).toBeInTheDocument();
  expect(screen.getByText('container1')).toBeInTheDocument();
  expect(screen.getByText('CrashLoopBackOff')).toBeInTheDocument();
  expect(screen.getByText('Back-off restarting failed container')).toBeInTheDocument();
});
