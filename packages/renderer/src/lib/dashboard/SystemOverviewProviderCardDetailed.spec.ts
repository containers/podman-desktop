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

import type {
  ProviderConnectionInfo,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
  ProviderVmConnectionInfo,
} from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SystemOverviewProviderCardDetailed from './SystemOverviewProviderCardDetailed.svelte';

vi.mock(import('/@/lib/dashboard/SystemOverviewResourceUsage.svelte'));
vi.mock(import('tinro'));

const baseProvider: ProviderInfo = {
  internalId: 'podman-internal',
  id: 'podman',
  extensionId: 'podman',
  name: 'Podman',
  containerConnections: [],
  kubernetesConnections: [],
  vmConnections: [],
  status: 'configured',
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  vmProviderConnectionCreation: false,
  vmProviderConnectionInitialization: false,
  links: [],
  detectionChecks: [],
  warnings: [],
  images: {},
  installationSupport: false,
  cleanupSupport: false,
  canStart: false,
  canStop: false,
};

const containerConnection: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'podman-machine',
  displayName: 'Podman Machine',
  status: 'started',
  endpoint: { socketPath: '/run/podman/podman.sock' },
  type: 'podman',
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
};

beforeEach(() => {
  vi.resetAllMocks();
});

test('should render connection display name', async () => {
  const provider = { ...baseProvider, containerConnections: [containerConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: containerConnection,
    provider,
    childConnections: [],
  });

  await vi.waitFor(() => expect(screen.getByText('Podman Machine')).toBeInTheDocument());
});

test('should render Start button when connection is stopped and supports start', async () => {
  const stoppedConnection = {
    ...containerConnection,
    status: 'stopped' as const,
  };
  const provider = { ...baseProvider, canStart: true, containerConnections: [stoppedConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: stoppedConnection,
    provider,
    childConnections: [],
  });

  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Start Podman' })).toBeInTheDocument());
});

test('should render View button when connection is stopped but does not support start', async () => {
  const stoppedConnection = { ...containerConnection, status: 'stopped' as const };
  const provider = { ...baseProvider, canStart: false, containerConnections: [stoppedConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: stoppedConnection,
    provider,
    childConnections: [],
  });

  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument());
  expect(screen.queryByRole('button', { name: 'Start Podman' })).not.toBeInTheDocument();
});

test.each(['starting', 'stopping'] as const)(
  'should not render action button when connection status is %s',
  async status => {
    const connection = { ...containerConnection, status };
    const provider = { ...baseProvider, containerConnections: [connection] };
    render(SystemOverviewProviderCardDetailed, {
      connection,
      provider,
      childConnections: [],
    });

    await vi.waitFor(() => expect(screen.getByText('Podman Machine')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: /Start|View|See Details/ })).not.toBeInTheDocument();
  },
);

describe('stable subtitle text by connection type', () => {
  test.each([
    { type: 'container', pattern: /Required to run containers and pods/ },
    { type: 'kubernetes', pattern: /Start to deploy Kubernetes workloads locally/ },
    { type: 'vm', pattern: /Not running/ },
  ])('should show helper text for $type connection when stopped', async ({ type, pattern }) => {
    const connections: Record<string, ProviderConnectionInfo> = {
      container: { ...containerConnection, status: 'stopped' as const },
      kubernetes: {
        connectionType: 'kubernetes',
        name: 'minikube',
        status: 'stopped',
        endpoint: { apiURL: 'https://127.0.0.1:8443' },
      } as ProviderKubernetesConnectionInfo,
      vm: {
        connectionType: 'vm',
        name: 'my-vm',
        status: 'stopped',
      } as ProviderVmConnectionInfo,
    };
    const connection = connections[type]!;
    render(SystemOverviewProviderCardDetailed, {
      connection,
      provider: baseProvider,
      childConnections: [],
    });

    await vi.waitFor(() => expect(screen.getByText(pattern)).toBeInTheDocument());
  });
});

describe('warnings', () => {
  test('should render warning details when present', async () => {
    const provider: ProviderInfo = {
      ...baseProvider,
      containerConnections: [containerConnection],
      warnings: [{ name: 'Low disk', details: 'Disk is almost full' }],
    };
    render(SystemOverviewProviderCardDetailed, {
      connection: containerConnection,
      provider,
      childConnections: [],
    });

    await vi.waitFor(() => expect(screen.getByText('Disk is almost full')).toBeInTheDocument());
  });

  test('should fall back to warning name when details is undefined', async () => {
    const provider: ProviderInfo = {
      ...baseProvider,
      containerConnections: [containerConnection],
      warnings: [{ name: 'Low disk' }],
    };
    render(SystemOverviewProviderCardDetailed, {
      connection: containerConnection,
      provider,
      childConnections: [],
    });

    await vi.waitFor(() => expect(screen.getByText('Low disk')).toBeInTheDocument());
  });
});

test('should render Retry button when connection has error and supports start lifecycle', async () => {
  const errorConnection = {
    ...containerConnection,
    status: 'starting' as const,
    error: 'Connection refused',
  };
  const provider = { ...baseProvider, canStart: true, containerConnections: [errorConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: errorConnection,
    provider,
    childConnections: [],
  });

  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Retry Podman' })).toBeInTheDocument());
});

test('should render error message from connection when present', async () => {
  const errorConnection = {
    ...containerConnection,
    status: 'starting' as const,
    error: 'Connection refused',
  };
  const provider = { ...baseProvider, canStart: true, containerConnections: [errorConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: errorConnection,
    provider,
    childConnections: [],
  });

  await vi.waitFor(() => expect(screen.getByText('Connection refused')).toBeInTheDocument());
});

test('should render action button even during transitional state when error is present', async () => {
  const errorConnection = {
    ...containerConnection,
    status: 'starting' as const,
    error: 'Timeout while starting',
  };
  const provider = { ...baseProvider, canStart: true, containerConnections: [errorConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: errorConnection,
    provider,
    childConnections: [],
  });

  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Retry Podman' })).toBeInTheDocument());
});

test('should render resource usage instead of button when container connection is started', async () => {
  const provider = { ...baseProvider, containerConnections: [containerConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: containerConnection,
    provider,
    childConnections: [],
  });

  await vi.waitFor(() => expect(screen.queryByRole('button', { name: 'View' })).not.toBeInTheDocument());
});

test('should navigate to container connection on View button click', async () => {
  const stoppedConnection = { ...containerConnection, status: 'stopped' as const, lifecycleMethods: [] };
  const provider = { ...baseProvider, containerConnections: [stoppedConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: stoppedConnection,
    provider,
    childConnections: [],
  });

  const button = await vi.waitFor(() => screen.getByRole('button', { name: 'View' }));
  await fireEvent.click(button);

  await vi.waitFor(() =>
    expect(vi.mocked(router.goto)).toHaveBeenCalledWith(
      expect.stringContaining('/preferences/container-connection/view/podman-internal/'),
    ),
  );
});

describe('aria labels', () => {
  test('should have Connection status aria label with status text', async () => {
    const provider = { ...baseProvider, containerConnections: [containerConnection] };
    render(SystemOverviewProviderCardDetailed, {
      connection: containerConnection,
      provider,
      childConnections: [],
    });

    const statusEl = await vi.waitFor(() => screen.getByLabelText('Connection status'));
    expect(statusEl).toBeInTheDocument();
  });

  test('should have Connection error aria label when connection has error', async () => {
    const errorConnection = {
      ...containerConnection,
      status: 'starting' as const,
      error: 'Connection refused',
    };
    const provider = { ...baseProvider, canStart: true, containerConnections: [errorConnection] };
    render(SystemOverviewProviderCardDetailed, {
      connection: errorConnection,
      provider,
      childConnections: [],
    });

    const errorEl = await vi.waitFor(() => screen.getByLabelText('Connection error'));
    expect(errorEl).toHaveTextContent('Connection refused');
  });

  test('should have Connection error aria label when provider has warnings', async () => {
    const provider: ProviderInfo = {
      ...baseProvider,
      containerConnections: [containerConnection],
      warnings: [{ name: 'Low disk', details: 'Disk is almost full' }],
    };
    render(SystemOverviewProviderCardDetailed, {
      connection: containerConnection,
      provider,
      childConnections: [],
    });

    const errorEl = await vi.waitFor(() => screen.getByLabelText('Connection error'));
    expect(errorEl).toHaveTextContent('Disk is almost full');
  });

  test('should not have Connection error aria label when no errors or warnings', async () => {
    const provider = { ...baseProvider, containerConnections: [containerConnection] };
    render(SystemOverviewProviderCardDetailed, {
      connection: containerConnection,
      provider,
      childConnections: [],
    });

    await vi.waitFor(() => screen.getByLabelText('Connection status'));
    expect(screen.queryByLabelText('Connection error')).not.toBeInTheDocument();
  });
});

test('should track dashboard.healthCard.provider.started telemetry when starting a connection', async () => {
  vi.mocked(window.startProviderConnectionLifecycle).mockResolvedValue(undefined);
  const stoppedConnection = { ...containerConnection, status: 'stopped' as const };
  const provider = { ...baseProvider, canStart: true, containerConnections: [stoppedConnection] };
  render(SystemOverviewProviderCardDetailed, {
    connection: stoppedConnection,
    provider,
    childConnections: [],
  });

  const button = await vi.waitFor(() => screen.getByRole('button', { name: 'Start Podman' }));
  await fireEvent.click(button);

  await vi.waitFor(() =>
    expect(window.telemetryTrack).toHaveBeenCalledWith('dashboard.healthCard.provider.started', {
      providerName: 'Podman',
    }),
  );
});
