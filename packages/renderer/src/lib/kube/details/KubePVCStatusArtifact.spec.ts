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

import type { V1PersistentVolumeClaimStatus } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubePVCStatusArtifact from './KubePVCStatusArtifact.svelte';

const fakePVCStatus: V1PersistentVolumeClaimStatus = {
  phase: 'Bound',
  accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
  capacity: {
    storage: '10Gi',
  },
  conditions: [
    {
      type: 'Ready',
      status: 'True',
    },
  ],
};

test('Renders PVC status correctly with complete data', () => {
  render(KubePVCStatusArtifact, { artifact: fakePVCStatus });
  expect(screen.getByText('Phase')).toBeInTheDocument();
  expect(screen.getByText('Bound')).toBeInTheDocument();
  expect(screen.getByText('Access Modes')).toBeInTheDocument();
  expect(screen.getByText('ReadWriteOnce')).toBeInTheDocument();
  expect(screen.getByText('ReadOnlyMany')).toBeInTheDocument();
  expect(screen.getByText('Capacity')).toBeInTheDocument();
  expect(screen.getByText('storage: 10Gi')).toBeInTheDocument();
  expect(screen.getByText('Conditions')).toBeInTheDocument();
  expect(screen.getByText('Type: Ready')).toBeInTheDocument();
});

test('Handles undefined artifact gracefully', () => {
  render(KubePVCStatusArtifact, { artifact: undefined });

  // Expect not to find any status info if artifact is undefined
  expect(screen.queryByText('Phase')).not.toBeInTheDocument();
  expect(screen.queryByText('Access Modes')).not.toBeInTheDocument();
  expect(screen.queryByText('Capacity')).not.toBeInTheDocument();
  expect(screen.queryByText('Conditions')).not.toBeInTheDocument();
});
