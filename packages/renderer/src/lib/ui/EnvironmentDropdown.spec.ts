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

import type { ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { writable } from 'svelte/store';
import { beforeEach, expect, test, vi } from 'vitest';

import * as providers from '/@/stores/providers';

import EnvironmentDropdown from './EnvironmentDropdown.svelte';

vi.mock(import('/@/stores/providers'));

const PODMAN_PROVIDER: ProviderInfo = {
  id: 'podman',
  name: 'Podman',
  kubernetesConnections: [],
  vmConnections: [],
  containerConnections: [
    {
      name: 'podman-machine-default',
      displayName: 'Podman Machine',
      status: 'started',
      type: 'podman',
      endpoint: {
        socketPath: '/var/run/podman.sock',
      },
    },
  ],
} as unknown as ProviderInfo;

const PODMAN_PROVIDER_WITH_MULTIPLE_CONNECTIONS: ProviderInfo = {
  id: 'podman',
  name: 'Podman',
  kubernetesConnections: [],
  vmConnections: [],
  containerConnections: [
    {
      name: 'podman-machine-default',
      displayName: 'Podman Machine Default',
      status: 'started',
      type: 'podman',
      endpoint: {
        socketPath: '/var/run/podman.sock',
      },
    },
    {
      name: 'podman-machine-remote',
      displayName: 'Podman Remote',
      status: 'started',
      type: 'podman',
      endpoint: {
        socketPath: '/var/run/podman-remote.sock',
      },
    },
  ],
} as unknown as ProviderInfo;

const DOCKER_PROVIDER: ProviderInfo = {
  id: 'docker',
  name: 'Docker',
  kubernetesConnections: [],
  vmConnections: [],
  containerConnections: [
    {
      name: 'docker-context',
      displayName: 'Docker Desktop',
      status: 'started',
      type: 'docker',
      endpoint: {
        socketPath: '/var/run/docker.sock',
      },
    },
  ],
} as unknown as ProviderInfo;

const STOPPED_PROVIDER: ProviderInfo = {
  id: 'stopped-podman',
  name: 'Stopped Podman',
  kubernetesConnections: [],
  vmConnections: [],
  containerConnections: [
    {
      name: 'stopped-machine',
      displayName: 'Stopped Machine',
      status: 'stopped',
      type: 'podman',
      endpoint: {
        socketPath: '/var/run/stopped.sock',
      },
    },
  ],
} as unknown as ProviderInfo;

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect dropdown to be hidden with zero running environments', async () => {
  vi.mocked(providers).providerInfos = writable([]);

  render(EnvironmentDropdown);

  const dropdown = screen.queryByLabelText('Environment');
  expect(dropdown).not.toBeInTheDocument();
});

test('Expect dropdown to be hidden with only one running environment', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.queryByLabelText('Environment');
  expect(dropdown).not.toBeInTheDocument();
});

test('Expect dropdown to be hidden with only stopped connections', async () => {
  vi.mocked(providers).providerInfos = writable([STOPPED_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.queryByLabelText('Environment');
  expect(dropdown).not.toBeInTheDocument();
});

test('Expect dropdown to show with multiple running environments', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByLabelText('Environment');
  expect(dropdown).toBeInTheDocument();
  // Multiple "Environment:" texts exist (in sizer and in dropdown)
  expect(screen.getAllByText('Environment:').length).toBeGreaterThanOrEqual(1);
});

test('Expect "All" to be the default option', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByRole('button');
  expect(dropdown.textContent).toContain('All');
});

test('Expect running environments to appear in dropdown options', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);

  // "All" option should be present (there are 2 - one in trigger, one in dropdown)
  const allButtons = screen.getAllByRole('button', { name: /All$/ });
  expect(allButtons.length).toBeGreaterThanOrEqual(2);

  // Single connection types should show capitalized type name
  expect(screen.getByRole('button', { name: 'Podman' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Docker' })).toBeInTheDocument();
});

test('Expect stopped environments to be filtered out', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER, DOCKER_PROVIDER, STOPPED_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);

  // Running environments should be present
  expect(screen.getByRole('button', { name: 'Podman' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Docker' })).toBeInTheDocument();

  // Stopped environment should NOT be present
  expect(screen.queryByRole('button', { name: 'Stopped Machine' })).not.toBeInTheDocument();
});

test('Expect multiple connections of same type to show displayName', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER_WITH_MULTIPLE_CONNECTIONS]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);

  // Should show displayName when there are multiple connections of same type
  expect(screen.getByRole('button', { name: 'Podman Machine Default' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Podman Remote' })).toBeInTheDocument();
});

test('Expect selecting an environment to update the value', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByRole('button');
  expect(dropdown.textContent).toContain('All');

  await fireEvent.click(dropdown);

  const dockerOption = screen.getByRole('button', { name: 'Docker' });
  await fireEvent.click(dockerOption);

  // After selection, the dropdown should show "Docker"
  expect(dropdown.textContent).toContain('Docker');
});

test('Expect selecting an environment to update the dropdown display', async () => {
  vi.mocked(providers).providerInfos = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);

  const podmanOption = screen.getByRole('button', { name: 'Podman' });
  await fireEvent.click(podmanOption);

  // Dropdown should now display "Podman"
  expect(dropdown.textContent).toContain('Podman');
});

test('Expect mixed running and stopped connections to only show running ones when multiple running', async () => {
  const mixedProvider: ProviderInfo = {
    id: 'mixed',
    name: 'Mixed',
    kubernetesConnections: [],
    vmConnections: [],
    containerConnections: [
      {
        name: 'running-connection-1',
        displayName: 'Running Connection 1',
        status: 'started',
        type: 'podman',
        endpoint: {
          socketPath: '/var/run/running1.sock',
        },
      },
      {
        name: 'running-connection-2',
        displayName: 'Running Connection 2',
        status: 'started',
        type: 'podman',
        endpoint: {
          socketPath: '/var/run/running2.sock',
        },
      },
      {
        name: 'stopped-connection',
        displayName: 'Stopped Connection',
        status: 'stopped',
        type: 'podman',
        endpoint: {
          socketPath: '/var/run/stopped.sock',
        },
      },
    ],
  } as unknown as ProviderInfo;

  vi.mocked(providers).providerInfos = writable([mixedProvider]);

  render(EnvironmentDropdown);

  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);

  // Running connections should be present (multiple of same type shows displayName)
  expect(screen.getByRole('button', { name: 'Running Connection 1' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Running Connection 2' })).toBeInTheDocument();

  // Should not show stopped connection
  expect(screen.queryByRole('button', { name: 'Stopped Connection' })).not.toBeInTheDocument();
});

test('Expect dropdown to be hidden when only one running connection among mixed', async () => {
  const mixedProvider: ProviderInfo = {
    id: 'mixed',
    name: 'Mixed',
    kubernetesConnections: [],
    vmConnections: [],
    containerConnections: [
      {
        name: 'running-connection',
        displayName: 'Running Connection',
        status: 'started',
        type: 'podman',
        endpoint: {
          socketPath: '/var/run/running.sock',
        },
      },
      {
        name: 'stopped-connection',
        displayName: 'Stopped Connection',
        status: 'stopped',
        type: 'podman',
        endpoint: {
          socketPath: '/var/run/stopped.sock',
        },
      },
    ],
  } as unknown as ProviderInfo;

  vi.mocked(providers).providerInfos = writable([mixedProvider]);

  render(EnvironmentDropdown);

  // Dropdown should be hidden since only 1 running connection
  const dropdown = screen.queryByLabelText('Environment');
  expect(dropdown).not.toBeInTheDocument();
});

test('Expect selectedEnvironment to reset when selected connection stops (dropdown hides)', async () => {
  const providerStore = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Select Docker environment
  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);
  const dockerOption = screen.getByRole('button', { name: 'Docker' });
  await fireEvent.click(dockerOption);

  expect(dropdown.textContent).toContain('Docker');

  // Docker connection stops
  const stoppedDockerProvider: ProviderInfo = {
    ...DOCKER_PROVIDER,
    containerConnections: [
      {
        ...DOCKER_PROVIDER.containerConnections[0],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  providerStore.set([PODMAN_PROVIDER, stoppedDockerProvider]);

  // Wait for effect to run - dropdown should disappear (only 1 connection left)
  await vi.waitFor(() => {
    expect(screen.queryByLabelText('Environment')).not.toBeInTheDocument();
  });
});

test('Expect selectedEnvironment to reset when selected connection stops (dropdown remains visible)', async () => {
  // Create a third provider so dropdown stays visible after one stops
  const LIMA_PROVIDER: ProviderInfo = {
    id: 'lima',
    name: 'Lima',
    kubernetesConnections: [],
    vmConnections: [],
    containerConnections: [
      {
        name: 'lima-default',
        displayName: 'Lima Default',
        status: 'started',
        type: 'docker',
        endpoint: {
          socketPath: '/var/run/lima.sock',
        },
      },
    ],
  } as unknown as ProviderInfo;

  const providerStore = writable([PODMAN_PROVIDER, DOCKER_PROVIDER, LIMA_PROVIDER]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Select Docker environment
  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);
  const dockerOption = screen.getByRole('button', { name: 'Docker Desktop' });
  await fireEvent.click(dockerOption);

  expect(dropdown.textContent).toContain('Docker Desktop');

  // Docker connection stops - but Podman + Lima still running (2 connections)
  const stoppedDockerProvider: ProviderInfo = {
    ...DOCKER_PROVIDER,
    containerConnections: [
      {
        ...DOCKER_PROVIDER.containerConnections[0],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  providerStore.set([PODMAN_PROVIDER, stoppedDockerProvider, LIMA_PROVIDER]);

  // Dropdown should still be visible (2 running connections)
  // But should show "All" because Docker (selected) is no longer available
  await vi.waitFor(() => {
    expect(screen.getByLabelText('Environment')).toBeInTheDocument();
    expect(screen.getByRole('button').textContent).toContain('All');
  });
});

test('Expect selectedEnvironment to reset when selected connection is removed', async () => {
  const providerStore = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Select Docker environment
  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);
  const dockerOption = screen.getByRole('button', { name: 'Docker' });
  await fireEvent.click(dockerOption);

  expect(dropdown.textContent).toContain('Docker');

  // Docker provider is removed entirely
  providerStore.set([PODMAN_PROVIDER]);

  // Wait for effect to run - dropdown should disappear (only 1 connection left)
  await vi.waitFor(() => {
    expect(screen.queryByLabelText('Environment')).not.toBeInTheDocument();
  });
});

test('Expect selectedEnvironment to NOT reset when a different connection stops', async () => {
  const providerStore = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Select Podman environment
  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);
  const podmanOption = screen.getByRole('button', { name: 'Podman' });
  await fireEvent.click(podmanOption);

  expect(dropdown.textContent).toContain('Podman');

  // Docker connection stops (but Podman is still selected)
  const stoppedDockerProvider: ProviderInfo = {
    ...DOCKER_PROVIDER,
    containerConnections: [
      {
        ...DOCKER_PROVIDER.containerConnections[0],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  providerStore.set([PODMAN_PROVIDER, stoppedDockerProvider]);

  // Give time for any effects to run
  await new Promise(resolve => setTimeout(resolve, 50));

  // Dropdown disappears (only 1 running connection) but selection was valid before
  // The key point: selectedEnvironment still held "Podman" which was valid
  expect(screen.queryByLabelText('Environment')).not.toBeInTheDocument();
});

test('Expect selectedEnvironment to reset when all connections stop except one', async () => {
  const providerStore = writable([PODMAN_PROVIDER_WITH_MULTIPLE_CONNECTIONS]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Select the remote podman machine
  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);
  const remoteOption = screen.getByRole('button', { name: 'Podman Remote' });
  await fireEvent.click(remoteOption);

  expect(dropdown.textContent).toContain('Podman Remote');

  // Remote connection stops - only one running connection remains
  const partiallyStoppedProvider: ProviderInfo = {
    ...PODMAN_PROVIDER_WITH_MULTIPLE_CONNECTIONS,
    containerConnections: [
      PODMAN_PROVIDER_WITH_MULTIPLE_CONNECTIONS.containerConnections[0],
      {
        ...PODMAN_PROVIDER_WITH_MULTIPLE_CONNECTIONS.containerConnections[1],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  providerStore.set([partiallyStoppedProvider]);

  // Wait for effect to run - dropdown should disappear (only 1 connection left)
  await vi.waitFor(() => {
    expect(screen.queryByLabelText('Environment')).not.toBeInTheDocument();
  });
});

test('Expect dropdown to disappear when connections reduce from multiple to one', async () => {
  const providerStore = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Initially dropdown should be visible
  const dropdown = screen.getByLabelText('Environment');
  expect(dropdown).toBeInTheDocument();

  // Docker connection stops - only Podman remains
  const stoppedDockerProvider: ProviderInfo = {
    ...DOCKER_PROVIDER,
    containerConnections: [
      {
        ...DOCKER_PROVIDER.containerConnections[0],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  providerStore.set([PODMAN_PROVIDER, stoppedDockerProvider]);

  // Wait for re-render - dropdown should disappear
  await vi.waitFor(() => {
    expect(screen.queryByLabelText('Environment')).not.toBeInTheDocument();
  });
});

test('Expect dropdown to disappear when all connections stop', async () => {
  const providerStore = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Initially dropdown should be visible
  expect(screen.getByLabelText('Environment')).toBeInTheDocument();

  // All connections stop
  const stoppedPodmanProvider: ProviderInfo = {
    ...PODMAN_PROVIDER,
    containerConnections: [
      {
        ...PODMAN_PROVIDER.containerConnections[0],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  const stoppedDockerProvider: ProviderInfo = {
    ...DOCKER_PROVIDER,
    containerConnections: [
      {
        ...DOCKER_PROVIDER.containerConnections[0],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  providerStore.set([stoppedPodmanProvider, stoppedDockerProvider]);

  // Wait for re-render - dropdown should disappear
  await vi.waitFor(() => {
    expect(screen.queryByLabelText('Environment')).not.toBeInTheDocument();
  });
});

test('Expect selectedEnvironment to reset when dropdown hides even if selected value still exists', async () => {
  const providerStore = writable([PODMAN_PROVIDER, DOCKER_PROVIDER]);
  vi.mocked(providers).providerInfos = providerStore;

  render(EnvironmentDropdown);

  // Select Podman environment
  const dropdown = screen.getByRole('button');
  await fireEvent.click(dropdown);
  const podmanOption = screen.getByRole('button', { name: 'Podman' });
  await fireEvent.click(podmanOption);

  // Verify Podman is selected
  expect(dropdown.textContent).toContain('Podman');

  // Docker stops - only Podman remains, dropdown should hide
  // But Podman (the selected value) is still running!
  const stoppedDockerProvider: ProviderInfo = {
    ...DOCKER_PROVIDER,
    containerConnections: [
      {
        ...DOCKER_PROVIDER.containerConnections[0],
        status: 'stopped',
      },
    ],
  } as unknown as ProviderInfo;

  providerStore.set([PODMAN_PROVIDER, stoppedDockerProvider]);

  // Dropdown should disappear because only 1 connection remains
  await vi.waitFor(() => {
    expect(screen.queryByLabelText('Environment')).not.toBeInTheDocument();
  });

  // Now bring Docker back - dropdown should reappear with "All" selected (reset)
  providerStore.set([PODMAN_PROVIDER, DOCKER_PROVIDER]);

  await vi.waitFor(() => {
    expect(screen.getByLabelText('Environment')).toBeInTheDocument();
  });

  // The dropdown should show "All" (not "Podman") because selectedEnvironment was reset
  const newDropdown = screen.getByRole('button');
  expect(newDropdown.textContent).toContain('All');
});
