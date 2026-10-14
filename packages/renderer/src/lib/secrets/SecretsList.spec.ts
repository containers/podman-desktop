/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
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

import type { ProviderContainerConnectionInfo, ProviderInfo, SecretInfo } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import { searchPattern, secretsInfo } from '/@/stores/secrets';

import SecretsList from './SecretsList.svelte';

const secret1: SecretInfo = {
  engineId: 'podman1',
  engineName: 'Podman 1',
  engineType: 'podman',
  Id: 'secret-id-1',
  Name: 'my-secret-1',
  CreatedAt: '2026-01-01T00:00:00Z',
};

const secret2: SecretInfo = {
  engineId: 'podman2',
  engineName: 'Podman 2',
  engineType: 'podman',
  Id: 'secret-id-2',
  Name: 'my-secret-2',
  CreatedAt: '2026-06-01T00:00:00Z',
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
  vi.mocked(window.listSecrets).mockResolvedValue([secret1, secret2]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(
    () => {
      expect(get(providerInfos)).not.toHaveLength(0);
      expect(get(secretsInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  if (searchTerm) {
    searchPattern.set(searchTerm);
  }

  render(SecretsList);
}

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.listSecrets).mockResolvedValue([]);
  vi.mocked(window.getProviderInfos).mockResolvedValue([]);
  vi.mocked(window.getContributedMenus).mockResolvedValue([]);
  providerInfos.set([]);
  secretsInfo.set([]);
  searchPattern.set('');
});

test('Expect no container engines being displayed', async () => {
  vi.mocked(window.listSecrets).mockResolvedValue([secret1, secret2]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(
    () => {
      expect(get(secretsInfo)).not.toHaveLength(0);
    },
    { timeout: 2000 },
  );

  render(SecretsList);

  const table = screen.queryByRole('table');
  expect(table).toBeNull();

  const noEngine = screen.getByText('No Container Engine');
  expect(noEngine).toBeInTheDocument();
});

test('Expect filter empty screen when there are no matches for search term', async () => {
  await init('No match');

  const filterButton = await vi.waitFor(() => {
    return screen.getByRole('button', { name: 'Clear filter' });
  });
  expect(filterButton).toBeInTheDocument();
});

test('Expect empty page when there are no secrets', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([providerInfoMock]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(() => {
    expect(get(providerInfos)).not.toHaveLength(0);
  });

  render(SecretsList);
  await vi.waitFor(() => {
    expect(screen.getByText('No secrets')).toBeInTheDocument();
  });

  const copyButton = screen.getByRole('button', { name: 'Copy To Clipboard' });
  expect(copyButton).toBeInTheDocument();
});

test('Expect secrets table to be rendered with data', async () => {
  await init();

  const table = screen.getByRole('table');
  expect(table).toBeInTheDocument();

  expect(screen.getByRole('row', { name: 'my-secret-1' })).toBeInTheDocument();
  expect(screen.getByRole('row', { name: 'my-secret-2' })).toBeInTheDocument();
});

test('Expect create button to be displayed when engine is available', async () => {
  await init();

  const createButton = screen.getByRole('button', { name: 'Create' });
  expect(createButton).toBeInTheDocument();
});

test('Expect delete action on each secret row', async () => {
  await init();

  const deleteButtons = screen.getAllByRole('button', { name: 'Delete Secret' });
  expect(deleteButtons).toHaveLength(2);
});

test('Expect user confirmation for bulk delete', async () => {
  await init();

  const checkboxes = screen.getAllByRole('checkbox', { name: 'Toggle secrets' });
  expect(checkboxes).toHaveLength(2);
  await fireEvent.click(checkboxes[0]);

  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

  const deleteButton = screen.getByRole('button', { name: 'Delete 1 selected items' });
  await fireEvent.click(deleteButton);

  expect(window.showMessageBox).toHaveBeenCalledOnce();

  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Delete' });
  await fireEvent.click(deleteButton);
  expect(window.showMessageBox).toHaveBeenCalledTimes(2);
  await waitFor(() => expect(window.removeSecret).toHaveBeenCalled());
});

test('Expect search to filter secrets by name', async () => {
  await init('my-secret-1');

  expect(screen.getByText('my-secret-1')).toBeInTheDocument();
  expect(screen.queryByText('my-secret-2')).not.toBeInTheDocument();
});

test('Expect environment column sorted by engineName', async () => {
  vi.mocked(window.getProviderInfos).mockResolvedValue([providerInfoMock]);

  const secret1Modified = { ...secret1, engineId: 'engine-zzz', engineName: 'name-aaa' };
  const secret2Modified = { ...secret2, engineId: 'engine-aaa', engineName: 'name-zzz' };

  vi.mocked(window.listSecrets).mockResolvedValue([secret1Modified, secret2Modified]);

  window.dispatchEvent(new CustomEvent('extensions-already-started'));
  window.dispatchEvent(new CustomEvent('provider-lifecycle-change'));

  await waitFor(() => {
    expect(get(providerInfos)).not.toHaveLength(0);
    expect(get(secretsInfo)).not.toHaveLength(0);
  });

  render(SecretsList);

  const environment = await vi.waitFor(() => {
    return screen.getByRole('columnheader', { name: 'Environment' });
  });
  await fireEvent.click(environment);

  const cells = screen.getAllByRole('cell', { name: /my-secret/ });
  expect(cells[0]).toHaveTextContent('my-secret-1');
  expect(cells[1]).toHaveTextContent('my-secret-2');
});
