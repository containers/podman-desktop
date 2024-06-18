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

import type { V1PersistentVolumeClaimSpec } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubePVCArtifact from './KubePVCArtifact.svelte';

const fakePVC: V1PersistentVolumeClaimSpec = {
  accessModes: ['ReadWriteOnce', 'ReadOnlyMany'],
  storageClassName: 'standard',
  volumeMode: 'Filesystem',
  resources: {
    requests: {
      storage: '10Gi',
    },
    limits: {
      storage: '15Gi',
    },
  },
  selector: {
    matchLabels: {
      env: 'production',
    },
    matchExpressions: [
      {
        key: 'region',
        operator: 'In',
        values: ['us-west', 'us-east'],
      },
    ],
  },
};

test('Renders complete PVC spec correctly', () => {
  render(KubePVCArtifact, { artifact: fakePVC });
  expect(screen.getByText('Access Modes')).toBeInTheDocument();
  expect(screen.getByText('ReadWriteOnce')).toBeInTheDocument();
  expect(screen.getByText('ReadOnlyMany')).toBeInTheDocument();
  expect(screen.getByText('Storage Class Name')).toBeInTheDocument();
  expect(screen.getByText('standard')).toBeInTheDocument();
  expect(screen.getByText('Volume Mode')).toBeInTheDocument();
  expect(screen.getByText('Filesystem')).toBeInTheDocument();
  expect(screen.getByText('Requests')).toBeInTheDocument();
  expect(screen.getByText('storage: 10Gi')).toBeInTheDocument();
  expect(screen.getByText('Limits')).toBeInTheDocument();
  expect(screen.getByText('storage: 15Gi')).toBeInTheDocument();
  expect(screen.getByText('Selector')).toBeInTheDocument();
  expect(screen.getByText('us-west, us-east')).toBeInTheDocument();
});

test('Handles undefined artifact', () => {
  render(KubePVCArtifact, { artifact: undefined });
  expect(screen.queryByText('Access Modes')).not.toBeInTheDocument();
  expect(screen.queryByText('Storage Class Name')).not.toBeInTheDocument();
  expect(screen.queryByText('Volume Mode')).not.toBeInTheDocument();
  expect(screen.queryByText('Requests')).not.toBeInTheDocument();
  expect(screen.queryByText('Limits')).not.toBeInTheDocument();
  expect(screen.queryByText('Selector')).not.toBeInTheDocument();
});
