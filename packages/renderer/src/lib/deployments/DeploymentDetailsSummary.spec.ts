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

import type { CoreV1Event, V1Deployment } from '@kubernetes/client-node';
import { render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import * as eventsTable from '../kube/details/EventsTable.svelte';
import DeploymentDetailsSummary from './DeploymentDetailsSummary.svelte';
import type { DeploymentUI } from './DeploymentUI';

const deploymentUI: DeploymentUI = {
  uid: '123',
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
  Object.defineProperty(window, 'kubernetesGetCurrentNamespace', { value: kubernetesGetCurrentNamespaceMock });
  Object.defineProperty(window, 'kubernetesReadNamespacedDeployment', {
    value: kubernetesReadNamespacedDeploymentMock,
  });
});

test('Expect basic rendering', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedDeploymentMock.mockResolvedValue(deployment);
  const eventsTableSpy = vi.spyOn(eventsTable, 'default');

  render(DeploymentDetailsSummary, { props: { deployment: deployment, events: [] } });

  expect(screen.getByText(deploymentUI.name)).toBeInTheDocument();
  expect(screen.getByText('No events')).toBeInTheDocument();
  expect(eventsTableSpy).not.toHaveBeenCalled();
});

test('Check more properties', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedDeploymentMock.mockResolvedValue(undefined);

  render(DeploymentDetailsSummary, { props: { deployment: deployment, events: [] } });

  // Expect the name and namespace to show
  expect(screen.getByText(deploymentUI.name)).toBeInTheDocument();
  expect(screen.getByText(deploymentUI.namespace)).toBeInTheDocument();
});

test('expect EventsTable is called with events', async () => {
  kubernetesGetCurrentNamespaceMock.mockResolvedValue('default');
  kubernetesReadNamespacedDeploymentMock.mockResolvedValue(deployment);

  const eventsTableSpy = vi.spyOn(eventsTable, 'default');

  const events: CoreV1Event[] = [
    {
      metadata: {
        name: 'event1',
      },
      involvedObject: { uid: '12345678' },
    },
    {
      metadata: {
        name: 'event2',
      },
      involvedObject: { uid: '12345678' },
    },
  ];
  render(DeploymentDetailsSummary, { props: { deployment: deployment, events: events } });
  expect(eventsTableSpy).toHaveBeenCalledWith(expect.anything(), { events: events });
});
