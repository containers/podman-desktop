/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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

import type { NetworkInspectInfo, ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import type { NetworkContainer } from 'dockerode';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { networksListInfo, searchPattern } from '/@/stores/networks';
import { providerInfos } from '/@/stores/providers';

import NetworksList from './NetworksList.svelte';

const network1: NetworkInspectInfo = {
  engineId: 'podman1',
  engineName: 'Podman 1',
  engineType: 'docker',
  Name: 'Network 1',
  Id: '123456789012345',
  Created: '',
  Scope: '',
  Driver: '',
  EnableIPv6: false,
  Internal: false,
  Attachable: false,
  Ingress: false,
  ConfigOnly: false,
};

const network2: NetworkInspectInfo = {
  engineId: 'podman2',
  engineName: 'Podman 2',
  engineType: 'podman',
  Name: 'Network 2',
  Id: '123456789123456',
  Created: '',
  Scope: '',
  Driver: '',
  EnableIPv6: false,
  Internal: false,
  Attachable: false,
  Ingress: false,
  ConfigOnly: false,
  Containers: { container1: {} as unknown as NetworkContainer },
};

const providerInfoMock = {
  name: 'podman',
  status: 'started',
  internalId: 'podman-internal-id',
  containerConnections: [
    {
      name: 'podman-machine-default',
      status: 'started',
    } as unknown as ProviderContainerConnectionInfo,
  ],
} as unknown as ProviderInfo;

async function init(searchTerm?: string): Promise<void> {
  vi.mocked(window.getProviderInfos).mockResolvedValue([providerInfoMock]);

  vi.mocked(window.listNetworks).mockResolvedValue([network1, network2]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // wait for stores to be populated
  await waitFor(
    () => {
      expect(get(providerInfos)).not.toHaveLength(0);
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(NetworksList, { searchTerm: searchTerm });
  await tick();
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.listNetworks).mockResolvedValue([]);
  vi.mocked(window.getProviderInfos).mockResolvedValue([]);
  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
  providerInfos.set([]);
  networksListInfo.set([]);
  searchPattern.set('');
});

test('Expect no container engines being displayed', async () => {
  vi.mocked(window.listNetworks).mockResolvedValue([network1, network2]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // wait for stores to be populated
  await waitFor(
    () => {
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(NetworksList);

  const table = screen.queryByRole('table');
  expect(table).toBeNull();

  const noEngine = screen.getByText('No Container Engine');
  expect(noEngine).toBeInTheDocument();
});

test('Expect filter empty screen when there are no matches for search term', async () => {
  await init('No match');

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect empty page when there are no networks', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([providerInfoMock]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // wait for stores to be populated
  await waitFor(
    () => {
      expect(get(providerInfos)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(NetworksList);
  await tick();

  expect(screen.getByText('No networks')).toBeInTheDocument();

  const copyButton = screen.getByRole('button', { name: 'Copy To Clipboard' });
  expect(copyButton).toBeInTheDocument();
});

test('Expect networks to be order by name by default', async () => {
  await init();

  const network1Name = screen.getByRole('cell', { name: 'Network 1' });
  const network2Name = screen.getByRole('cell', { name: 'Network 2' });
  expect(network1Name).toBeInTheDocument();
  expect(network2Name).toBeInTheDocument();

  expect(network1Name.compareDocumentPosition(network2Name)).toBe(4);
});

test('Expect network name before ID and match resource table width', async () => {
  await init();

  const headers = screen.getAllByRole('columnheader');
  expect(headers.map(({ textContent }) => textContent?.trim() ?? '').filter(header => !!header)).toStrictEqual([
    'Name',
    'Id',
    'Environment',
    'Driver',
    'Actions',
  ]);

  expect(screen.getByRole('table', { name: 'network' })).toHaveStyle({
    '--table-grid-table-columns': '20px 32px 2fr 100px 1fr 1fr 1fr 32px',
  });
});

test('Expect to have edit action for Podman networks', async () => {
  await init();

  const editButtons = screen.getAllByRole('button', { name: 'Update Network' });
  expect(editButtons.length).toBe(2);

  const podmanNetworkRow = screen.getByRole('row', { name: 'Network 2' });
  expect(podmanNetworkRow).toBeInTheDocument();
  expect(podmanNetworkRow).toContain(editButtons[1]);

  expect(editButtons[0]).toBeDisabled();
});

test('Expect to have delete action for unused networks', async () => {
  await init();

  const deleteButtons = screen.getAllByRole('button', { name: 'Delete Network' });
  expect(deleteButtons.length).toBe(2);

  const unusedNetworkRow = screen.getByRole('row', { name: 'Network 1' });
  expect(unusedNetworkRow).toBeInTheDocument();
  expect(unusedNetworkRow).toContain(deleteButtons[0]);

  expect(deleteButtons[1]).toBeDisabled();
});

test('Expect user confirmation for bulk delete when required', async () => {
  await init();

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle network' });
  expect(checkboxes).toHaveLength(2);
  // unused network
  expect(checkboxes[0]).not.toBeDisabled();
  // used network
  expect(checkboxes[1]).toBeDisabled();
  await fireEvent.click(checkboxes[0]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(window.removeNetwork).toHaveBeenCalled());
});

test('Expect environment column sorted by engineId', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([providerInfoMock]);

  const network1Modified = { ...network1, engineId: 'engine-zzz', engineName: 'name-aaa' };
  const network2Modified = { ...network2, engineId: 'engine-aaa', engineName: 'name-zzz' };

  vi.mocked(window.listNetworks).mockResolvedValue([network1Modified, network2Modified]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(
    () => {
      expect(get(providerInfos)).not.toHaveLength(0);
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(NetworksList);
  await tick();

  const environment = screen.getByRole('columnheader', { name: 'Environment' });
  await fireEvent.click(environment);

  const cells = screen.getAllByRole('cell', { name: /Network/ });
  expect(cells[0]).toHaveTextContent('Network 2');
  expect(cells[1]).toHaveTextContent('Network 1');
});

test('Expect environment dropdown to appear with multiple running connections', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      id: 'podman',
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
    {
      id: 'docker',
      name: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  const podmanNetwork: NetworkInspectInfo = {
    ...network1,
    Name: 'podman-network',
    engineId: 'podman.podman-machine-default',
    engineName: 'Podman Machine',
  };
  const dockerNetwork: NetworkInspectInfo = {
    ...network2,
    Name: 'docker-network',
    engineId: 'docker.docker-context',
    engineName: 'Docker Desktop',
  };

  vi.mocked(window.listNetworks).mockResolvedValue([podmanNetwork, dockerNetwork]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(
    () => {
      expect(get(providerInfos)).toHaveLength(2);
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(NetworksList);
  await tick();

  // Environment dropdown should be visible
  const environmentDropdown = screen.getByLabelText('Environment');
  expect(environmentDropdown).toBeInTheDocument();
});

test('Expect environment dropdown to filter networks by selected environment', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      id: 'podman',
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          displayName: 'Podman Machine',
          status: 'started',
          type: 'podman',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
    {
      id: 'docker',
      name: 'docker',
      status: 'started',
      internalId: 'docker-internal-id',
      containerConnections: [
        {
          name: 'docker-context',
          displayName: 'Docker Desktop',
          status: 'started',
          type: 'docker',
        } as unknown as ProviderContainerConnectionInfo,
      ],
    } as unknown as ProviderInfo,
  ]);

  const podmanNetwork: NetworkInspectInfo = {
    ...network1,
    Name: 'podman-network',
    engineId: 'podman.podman-machine-default',
    engineName: 'Podman Machine',
  };
  const dockerNetwork: NetworkInspectInfo = {
    ...network2,
    Name: 'docker-network',
    engineId: 'docker.docker-context',
    engineName: 'Docker Desktop',
  };

  vi.mocked(window.listNetworks).mockResolvedValue([podmanNetwork, dockerNetwork]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(
    () => {
      expect(get(providerInfos)).toHaveLength(2);
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(NetworksList);
  await tick();

  // Both networks should be visible initially
  expect(screen.getByText('podman-network')).toBeInTheDocument();
  expect(screen.getByText('docker-network')).toBeInTheDocument();

  // Select Podman environment from dropdown
  const dropdownContainer = screen.getByLabelText('Environment');
  const dropdownButton = within(dropdownContainer).getByRole('button');
  await fireEvent.click(dropdownButton);

  const podmanOption = await waitFor(async () => {
    await tick();
    return screen.getByRole('button', { name: 'Podman' });
  });
  await fireEvent.click(podmanOption);

  // Only podman network should be visible
  await waitFor(() => {
    expect(screen.getByText('podman-network')).toBeInTheDocument();
    expect(screen.queryByText('docker-network')).not.toBeInTheDocument();
  });
});

test('Expect a network to remain findable when searching by a label value or a subnet', async () => {
  const networkWithLabelsAndSubnet: NetworkInspectInfo = {
    ...network1,
    Labels: { app: 'search-label-value' },
    IPAM: { Config: [{ Subnet: '10.99.0.0/16' }] },
  };

  vi.mocked(window.getProviderInfos).mockResolvedValue([providerInfoMock]);
  vi.mocked(window.listNetworks).mockResolvedValue([networkWithLabelsAndSubnet, network2]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(
    () => {
      expect(get(providerInfos)).not.toHaveLength(0);
      expect(get(networksListInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(NetworksList);

  searchPattern.set('search-label-value');
  await waitFor(() => {
    expect(screen.getByText('Network 1')).toBeInTheDocument();
    expect(screen.queryByText('Network 2')).not.toBeInTheDocument();
  });

  searchPattern.set('10.99.0.0/16');
  await waitFor(() => {
    expect(screen.getByText('Network 1')).toBeInTheDocument();
    expect(screen.queryByText('Network 2')).not.toBeInTheDocument();
  });
});

test('Expect toggling a row selection to leave the object inside networksListInfo unchanged', async () => {
  await init();

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle network' });
  await fireEvent.click(checkboxes[0]);
  expect(checkboxes[0]).toBeChecked();

  // force filtered.subscribe to run again, exercising the carry-forward path that
  // would write the row's selected state onto a shared (uncloned) store object
  networksListInfo.set(get(networksListInfo).map(network => ({ ...network })));

  await waitFor(() => {
    const storedNetwork1 = get(networksListInfo).find(network => network.id === network1.Id);
    expect(storedNetwork1?.selected).toBe(false);
  });
});

test('Expect a bulk delete to mark the selected network DELETING in the store, and a failing delete to restore the previous status', async () => {
  await init();

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle network' });
  await fireEvent.click(checkboxes[0]);

  expect(screen.getByText('On 1 selected items.')).toBeInTheDocument();

  // skip the bulk confirmation dialog
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  let rejectRemoval: (reason?: unknown) => void = (): void => {};
  vi.mocked(window.removeNetwork).mockReturnValue(
    new Promise<void>((_resolve, reject) => {
      rejectRemoval = reject;
    }),
  );

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  await waitFor(() => expect(window.removeNetwork).toHaveBeenCalled());

  await waitFor(() => {
    const stored = get(networksListInfo).find(
      network => network.id === network1.Id && network.engineId === network1.engineId,
    );
    expect(stored?.status).toBe('DELETING');
  });

  rejectRemoval(new Error('network removal failed'));

  await waitFor(() => {
    const stored = get(networksListInfo).find(
      network => network.id === network1.Id && network.engineId === network1.engineId,
    );
    expect(stored?.status).toBe('UNUSED');
  });
});

test('Expect a per-row delete through the Actions column to disable the row while in progress, and restore it on failure', async () => {
  await init();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  let reject: (reason?: unknown) => void = (): void => {};
  vi.mocked(window.removeNetwork).mockReturnValue(
    new Promise<void>((_resolve, rejectFn) => {
      reject = rejectFn;
    }),
  );

  const deleteButtons = screen.getAllByRole('button', { name: 'Delete Network' });
  // network1 (unused) is the enabled delete button
  await fireEvent.click(deleteButtons[0]);

  await waitFor(() => expect(window.removeNetwork).toHaveBeenCalled());

  // the intermediate DELETING status is now live: the row becomes disabled while the
  // delete is in progress ('DELETING' !== 'UNUSED')
  await waitFor(() => {
    const deleteButtonsInProgress = screen.getAllByRole('button', { name: 'Delete Network' });
    expect(deleteButtonsInProgress[0]).toBeDisabled();
  });

  reject(new Error('boom'));

  // on failure the previous status is restored, re-enabling the row
  await waitFor(() => {
    const deleteButtonsAfterFailure = screen.getAllByRole('button', { name: 'Delete Network' });
    expect(deleteButtonsAfterFailure[0]).not.toBeDisabled();
  });

  const stored = get(networksListInfo).find(
    network => network.id === network1.Id && network.engineId === network1.engineId,
  );
  expect(stored?.status).toBe('UNUSED');
});
