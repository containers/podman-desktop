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

import { type ForwardConfig, WorkloadKind } from '@desktop-framework/api';
import { fireEvent, render, within } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as kubeContextStore from '/@/stores/kubernetes-contexts-state';

import PortForwardList from './PortForwardingList.svelte';

vi.mock(import('/@/stores/kubernetes-contexts-state'), async () => ({}));

beforeEach(() => {
  vi.resetAllMocks();
});

test('empty kubernetesCurrentContextPortForwards store should display empty screen', async () => {
  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([]);
  const { getByText } = render(PortForwardList);

  expect(
    getByText('To forward ports, open the Summary tab on the relevant resource (Pod, Service, or Deployment)'),
  ).toBeInTheDocument();
  expect(getByText('No port forwarding configured')).toBeInTheDocument();
});

test('One port forwarded should display correct table content', async () => {
  const forwardConfig: ForwardConfig = {
    forward: {
      localPort: 5000,
      remotePort: 80,
    },
    id: '1',
    kind: WorkloadKind.POD,
    name: 'my-pod',
    namespace: 'ns1',
  };

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable([forwardConfig]);
  const { getByRole, getAllByRole } = render(PortForwardList);

  const table = getByRole('table');
  expect(table).toBeInTheDocument();

  const rowgroups = getAllByRole('rowgroup');
  expect(rowgroups).toBeDefined();
  expect(rowgroups.length).toBe(2);

  const tableBody = rowgroups[1];
  const row = within(tableBody).getByRole('row');
  expect(row).toBeInTheDocument();

  const cells = within(row).getAllByRole('cell');
  expect(cells).toHaveLength(7);

  expect(within(cells[1]).getAllByRole('img', { hidden: true })).toHaveLength(2);
  expect(cells[2]).toHaveTextContent('my-pod'); // Name
  expect(cells[3]).toHaveTextContent('pod'); // Type
  expect(cells[4]).toHaveTextContent('5000'); // Local Port
  expect(cells[5]).toHaveTextContent('80'); // Remote Port
  expect(within(cells[6]).getByRole('button', { name: 'Open forwarded port' })).toBeInTheDocument(); // Actions
  expect(within(cells[6]).getByRole('button', { name: 'Delete forwarded port' })).toBeInTheDocument(); // Actions
});

test('Multiple (10) port forwards should render all rows', async () => {
  // Setup: Create an array of 10 port forward configs
  const forwardConfigs: ForwardConfig[] = Array.from({ length: 10 }, (_, i) => ({
    forward: {
      localPort: 6000 + i,
      remotePort: 8000 + i,
    },
    id: String(i),
    kind: i % 2 === 0 ? WorkloadKind.SERVICE : WorkloadKind.DEPLOYMENT,
    name: `workload-${i}`,
    namespace: `ns-${i}`,
  }));

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable(forwardConfigs);
  const { getAllByRole } = render(PortForwardList);

  const rowgroups = getAllByRole('rowgroup');
  expect(rowgroups).toBeDefined();
  expect(rowgroups.length).toBe(2);

  const tableBody = rowgroups[1];
  const rows = within(tableBody).getAllByRole('row');
  expect(rows).toHaveLength(10);

  const firstRowCells = within(rows[0]).getAllByRole('cell');
  expect(firstRowCells[2]).toHaveTextContent('workload-0');
  expect(firstRowCells[3]).toHaveTextContent('service');
  expect(firstRowCells[4]).toHaveTextContent('6000');

  const lastRowCells = within(rows[9]).getAllByRole('cell');
  expect(lastRowCells[2]).toHaveTextContent('workload-9');
  expect(lastRowCells[3]).toHaveTextContent('deployment');
  expect(lastRowCells[4]).toHaveTextContent('6009');
});

test('Column sorting should reorder the table data', async () => {
  // Setup: Create an unsorted array of configs to test sorting
  const forwardConfigs: ForwardConfig[] = [
    {
      id: 'a',
      name: 'zebra-pod',
      kind: WorkloadKind.POD,
      forward: { localPort: 9000, remotePort: 300 },
      namespace: '',
    },
    {
      id: 'b',
      name: 'alpha-svc',
      kind: WorkloadKind.SERVICE,
      forward: { localPort: 5000, remotePort: 100 },
      namespace: '',
    },
    {
      id: 'c',
      name: 'middle-dep',
      kind: WorkloadKind.DEPLOYMENT,
      forward: { localPort: 7000, remotePort: 200 },
      namespace: '',
    },
  ];

  vi.mocked(kubeContextStore).kubernetesCurrentContextPortForwards = readable(forwardConfigs);
  const { getAllByRole, getByRole } = render(PortForwardList);

  const rowgroups = getAllByRole('rowgroup');
  expect(rowgroups).toBeDefined();
  expect(rowgroups.length).toBe(2);

  const tableBody = rowgroups[1];

  // Helper function to get text from a specific column in all rows
  const getColumnData = (colIndex: number): string[] => {
    const rows = within(tableBody).getAllByRole('row');
    return rows.map(row => {
      const cells = within(row).getAllByRole('cell');
      return cells[colIndex].textContent ?? '';
    });
  };

  // 1. Initial state: Should be sorted by Name (default)
  expect(getColumnData(2)).toEqual(['alpha-svc ', 'middle-dep ', 'zebra-pod ']);

  // 2. Sort by "Local Port" (ascending)
  const localPortHeader = getByRole('columnheader', { name: 'Local Port' });
  await fireEvent.click(localPortHeader);
  expect(getColumnData(4)).toEqual(['5000', '7000', '9000']); // Numeric sort ascending

  // 3. Sort by "Local Port" (descending)
  await fireEvent.click(localPortHeader);
  expect(getColumnData(4)).toEqual(['9000', '7000', '5000']); // Numeric sort descending

  // 4. Sort by "Type" (ascending)
  const typeHeader = getByRole('columnheader', { name: 'Type' });
  await fireEvent.click(typeHeader);
  expect(getColumnData(3)).toEqual(['deployment', 'pod', 'service']); // Alphabetical sort

  // 5. Sort by "Type" (descending)
  await fireEvent.click(typeHeader);
  expect(getColumnData(3)).toEqual(['service', 'pod', 'deployment']); // Alphabetical sort descending
});
