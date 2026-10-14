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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { type ProviderContainerConnectionInfo, type ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
/* eslint-disable import/no-duplicates */
import { tick } from 'svelte';
import { get } from 'svelte/store';
/* eslint-enable import/no-duplicates */
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import { volumeListInfos, volumesEventStore } from '/@/stores/volumes';

import VolumesList from './VolumesList.svelte';

beforeEach(async () => {
  vi.resetAllMocks();
  volumeListInfos.set([]);

  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });

  vi.mocked(window.onDidUpdateProviderStatus).mockResolvedValue(undefined);
  vi.mocked(window.getProviderInfos).mockResolvedValue([]);
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);
  vi.mocked(window.listVolumes).mockResolvedValue([]);
});

async function waitRender(customProperties: object): Promise<void> {
  render(VolumesList, { ...customProperties });
  await tick();
}

test('Expect No Container Engine being displayed', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);
  render(VolumesList);
  const noEngine = screen.getByRole('heading', { name: 'No Container Engine' });
  expect(noEngine).toBeInTheDocument();
});

test('Expect volumes being displayed once extensions are started (without size data)', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // ask to fetch the volumes
  const volumesEventStoreInfo = volumesEventStore.setup();

  await volumesEventStoreInfo.fetch();

  // first call is with listing without details
  expect(window.listVolumes).toHaveBeenNthCalledWith(1, false);

  await waitFor(() => {
    // wait store are populated
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  const volumeName = screen.getByRole('cell', { name: '0052074a2ade' });
  // expect size to be N/A
  const volumeSize = screen.getByRole('cell', { name: 'N/A' });
  expect(volumeName).toBeInTheDocument();
  expect(volumeSize).toBeInTheDocument();

  expect(volumeName.compareDocumentPosition(volumeSize)).toBe(4);
});

test('Expect volumes being displayed once extensions are started (with size data)', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 1, Size: 89 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // ask to fetch the volumes
  const volumesEventStoreInfo = volumesEventStore.setup();

  await volumesEventStoreInfo.fetch('fetchUsage');

  // first call is with listing with details
  expect(window.listVolumes).toHaveBeenNthCalledWith(1, true);

  await waitFor(() => {
    // wait store are populated
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  const volumeName = screen.getByRole('cell', { name: '0052074a2ade' });
  const volumeSize = screen.getByRole('cell', { name: '89 B' });
  expect(volumeName).toBeInTheDocument();
  expect(volumeSize).toBeInTheDocument();

  expect(volumeName.compareDocumentPosition(volumeSize)).toBe(4);
});

describe('Create volume', () => {
  const createVolumeButtonTitle = 'Create';
  test('no create volume button if no providers', async () => {
    providerInfos.set([]);
    await waitRender({});

    // now check if we have a create volume button, it should not be there
    const createVolumeButton = screen.queryByRole('button', { name: createVolumeButtonTitle });
    expect(createVolumeButton).not.toBeInTheDocument();
  });

  test('create volume button is there if there is one provider', async () => {
    providerInfos.set([
      {
        name: 'podman',
        status: 'started',
        internalId: 'podman-internal-id',
        containerConnections: [
          {
            name: 'podman-machine-default',
            status: 'started',
          },
        ],
      } as unknown as ProviderInfo,
    ]);

    await waitFor(() => {
      // wait store are populated
      expect(get(providerInfos)).not.toHaveLength(0);
    });

    await waitRender({});

    // now check if we have a create volume button, it should not be there
    const createVolumeButton = screen.getByRole('button', { name: createVolumeButtonTitle });
    expect(createVolumeButton).toBeInTheDocument();

    // click on the button
    await userEvent.click(createVolumeButton);

    // check we are redirected to the right page
    expect(window.location.pathname).toBe('/volumes/create');
  });
});

test('Expect filter empty screen', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // ask to fetch the volumes
  const volumesEventStoreInfo = volumesEventStore.setup();

  await volumesEventStoreInfo.fetch();

  // first call is with listing without details
  expect(window.listVolumes).toHaveBeenNthCalledWith(1, false);

  await waitFor(() => {
    // wait store are populated
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({ searchTerm: 'No match' });

  const filterButton = screen.getByRole('button', { name: 'Clear filter' });
  expect(filterButton).toBeInTheDocument();
});

test('Expect user confirmation to pop up when preferences require', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 0, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  // ask to fetch the volumes
  const volumesEventStoreInfo = volumesEventStore.setup();

  await volumesEventStoreInfo.fetch();

  // first call is with listing without details
  expect(window.listVolumes).toHaveBeenNthCalledWith(1, false);

  await waitFor(() => {
    // wait store are populated
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle volume' });
  await fireEvent.click(checkboxes[0]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  await vi.waitFor(() => expect(window.removeVolume).toHaveBeenCalled());
});

test('Expect to see empty page and no table when no container engine is running', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'stopped',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 0, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));
  window.dispatchEvent(new CustomEvent('extensions-already-started'));

  // wait imageInfo store is populated
  await vi.waitUntil(() => get(volumeListInfos).length > 0);

  await waitRender({});

  const table = screen.queryByRole('table');
  expect(table).toBeNull();

  const noContainerEngine = screen.getByText('No Container Engine');
  expect(noContainerEngine).toBeInTheDocument();
});

test('Expect environment column sorted by engineId', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/volume1/_data',
          Name: 'volume-aaa',
          Options: {},
          Scope: 'local',
          engineName: 'name-aaa',
          engineId: 'engine-zzz',
          engineType: 'podman',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/volume2/_data',
          Name: 'volume-bbb',
          Options: {},
          Scope: 'local',
          engineName: 'name-zzz',
          engineId: 'engine-aaa',
          engineType: 'docker',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  const volumesEventStoreInfo = volumesEventStore.setup();
  await volumesEventStoreInfo.fetch();

  await waitFor(() => {
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  const environment = screen.getByRole('columnheader', { name: 'Environment' });
  await fireEvent.click(environment);

  const cells = screen.getAllByRole('cell', { name: /volume-/ });
  expect(cells[0]).toHaveTextContent('volume-bbb');
  expect(cells[1]).toHaveTextContent('volume-aaa');
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
        },
      ],
    } as ProviderInfo,
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
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/volumes/podman-volume',
          Name: 'podman-volume',
          Options: {},
          Scope: 'local',
          engineName: 'Podman Machine',
          engineId: 'podman.podman-machine-default',
          engineType: 'docker',
          UsageData: { RefCount: 0, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: 'podman.podman-machine-default',
      engineName: 'Podman Machine',
    },
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/volumes/docker-volume',
          Name: 'docker-volume',
          Options: {},
          Scope: 'local',
          engineName: 'Docker Desktop',
          engineType: 'docker',
          engineId: 'docker.docker-context',
          UsageData: { RefCount: 0, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: 'docker.docker-context',
      engineName: 'Docker Desktop',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  const volumesEventStoreInfo = volumesEventStore.setup();
  await volumesEventStoreInfo.fetch();

  await waitFor(() => {
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).toHaveLength(2);
  });

  await waitRender({});

  // Environment dropdown should be visible
  const environmentDropdown = screen.getByLabelText('Environment');
  expect(environmentDropdown).toBeInTheDocument();
});

test('Expect a selection to survive a store refresh without being written into the store', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 0, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  const volumesEventStoreInfo = volumesEventStore.setup();
  await volumesEventStoreInfo.fetch();

  await waitFor(() => {
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle volume' });
  await fireEvent.click(checkboxes[0]);

  await vi.waitFor(() => expect(screen.getByText('On 1 selected items.')).toBeInTheDocument());

  for (let i = 0; i < 2; i++) {
    volumeListInfos.set(get(volumeListInfos).map(volume => ({ ...volume })));

    await vi.waitFor(() => expect(screen.getByText('On 1 selected items.')).toBeInTheDocument());
    expect(get(volumeListInfos).every(volume => volume.selected === false)).toBe(true);
  }
});

test('Expect a bulk delete to mark the selected volume DELETING in the store', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([
    {
      name: 'podman',
      status: 'started',
      internalId: 'podman-internal-id',
      containerConnections: [
        {
          name: 'podman-machine-default',
          status: 'started',
        },
      ],
    } as ProviderInfo,
  ]);

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/fedora/_data',
          Name: '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
          Options: {},
          Scope: 'local',
          engineName: 'Podman',
          engineId: 'podman.Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 0, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: '',
      engineName: '',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  const volumesEventStoreInfo = volumesEventStore.setup();
  await volumesEventStoreInfo.fetch();

  await waitFor(() => {
    expect(get(volumeListInfos)).not.toHaveLength(0);
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  await waitRender({});

  let resolveRemoveVolume: () => void;
  const pendingRemoveVolume = new Promise<void>(resolve => {
    resolveRemoveVolume = resolve;
  });
  vi.mocked(window.removeVolume).mockReturnValue(pendingRemoveVolume);

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle volume' });
  await fireEvent.click(checkboxes[0]);

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  await vi.waitFor(() => expect(window.removeVolume).toHaveBeenCalled());

  await vi.waitFor(() => {
    const volume = get(volumeListInfos).find(
      v => v.name === '0052074a2ade930338c00aea982a90e4243e6cf58ba920eb411c388630b8c967',
    );
    expect(volume?.status).toBe('DELETING');
  });

  resolveRemoveVolume!();
});

test('Expect environment dropdown to filter volumes by selected environment', async () => {
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

  vi.mocked(window.listVolumes).mockResolvedValue([
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/containers/storage/volumes/podman/_data',
          Name: 'podman-volume',
          Options: {},
          Scope: 'local',
          engineId: 'podman.podman-machine-default',
          engineName: 'Podman Machine',
          engineType: 'podman',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: 'podman.podman-machine-default',
      engineName: 'Podman Machine',
    },
    {
      Volumes: [
        {
          Driver: 'local',
          Labels: {},
          Mountpoint: '/var/lib/docker/volumes/docker/_data',
          Name: 'docker-volume',
          Options: {},
          Scope: 'local',
          engineId: 'docker.docker-context',
          engineName: 'Docker Desktop',
          engineType: 'docker',
          UsageData: { RefCount: 1, Size: -1 },
          containersUsage: [],
          CreatedAt: '',
        },
      ],
      Warnings: [],
      engineId: 'docker.docker-context',
      engineName: 'Docker Desktop',
    },
  ]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(() => {
    expect(get(providerInfos)).toHaveLength(2);
    expect(get(volumeListInfos)).not.toHaveLength(0);
  });

  render(VolumesList);
  await tick();

  // Both volumes should be visible initially
  expect(screen.getByText('podman-volume')).toBeInTheDocument();
  expect(screen.getByText('docker-volume')).toBeInTheDocument();

  // Select Podman environment from dropdown
  const dropdownContainer = screen.getByLabelText('Environment');
  const dropdownButton = within(dropdownContainer).getByRole('button');
  await fireEvent.click(dropdownButton);

  const podmanOption = await waitFor(async () => {
    await tick();
    return screen.getByRole('button', { name: 'Podman' });
  });
  await fireEvent.click(podmanOption);

  // Only podman volume should be visible
  await waitFor(() => {
    expect(screen.getByText('podman-volume')).toBeInTheDocument();
    expect(screen.queryByText('docker-volume')).not.toBeInTheDocument();
  });
});
