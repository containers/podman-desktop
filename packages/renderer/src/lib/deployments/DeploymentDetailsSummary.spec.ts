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

import '@testing-library/jest-dom/vitest';

import type { V1Deployment } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import DeploymentDetailsSummary from './DeploymentDetailsSummary.svelte';
import type { DeploymentUI } from './DeploymentUI';

const deploymentUI: DeploymentUI = {
  name: 'my-deployment',
  status: 'RUNNING',
  namespace: 'default',
  replicas: 0,
  ready: 0,
  selected: false,
  conditions: [],
};

const deployment: V1Deployment = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'my-deployment',
    namespace: 'default',
  },
  spec: {
    replicas: 2,
    selector: {},
    template: {},
  },
};

const kubernetesGetCurrentNamespaceMock = vi.fn();
const kubernetesReadNamespacedDeploymentMock = vi.fn();

beforeAll(() => {
  (window as any).kubernetesGetCurrentNamespace = kubernetesGetCurrentNamespaceMock;
  (window as any).kubernetesReadNamespacedDeployment = kubernetesReadNamespacedDeploymentMock;
});

test('Expect basic rendering', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedDeploymentMock.mockResolvedValue(deployment);

  render(DeploymentDetailsSummary, { deployment: deployment });

  expect(screen.getByText(deploymentUI.name)).toBeInTheDocument();
});

test('Check more properties', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedDeploymentMock.mockResolvedValue(undefined);

  render(DeploymentDetailsSummary, { deployment: deployment });

  // Expect the name and namespace to show
  expect(screen.getByText(deploymentUI.name)).toBeInTheDocument();
  expect(screen.getByText(deploymentUI.namespace)).toBeInTheDocument();
});
