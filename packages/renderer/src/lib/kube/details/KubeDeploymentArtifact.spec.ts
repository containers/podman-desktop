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

import type { V1DeploymentSpec } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import KubeDeploymentArtifact from './KubeDeploymentArtifact.svelte'; // Adjust the import path as necessary

const fakeDeploymentSpec: V1DeploymentSpec = {
  replicas: 3,
  selector: {
    matchLabels: {
      foo: 'bar',
    },
  },
  strategy: {
    type: 'RollingUpdate',
  },
  template: {},
};

test('DeploymentSpec artifact renders with correct values', async () => {
  render(KubeDeploymentArtifact, { artifact: fakeDeploymentSpec });

  // Check if replicas are displayed correctly
  expect(screen.getByText('Replicas')).toBeInTheDocument();
  expect(screen.getByText('3')).toBeInTheDocument();

  // Check if selector is displayed correctly
  expect(screen.getByText('Selector')).toBeInTheDocument();
  expect(screen.getByText('foo: bar')).toBeInTheDocument();

  // Check if strategy type is displayed correctly
  expect(screen.getByText('Strategy')).toBeInTheDocument();
  expect(screen.getByText('RollingUpdate')).toBeInTheDocument();
});
