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

import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import PreferencesContainerConnectionDetailsSummary from './PreferencesContainerConnectionDetailsSummary.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

const podmanContainerConnection: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'connection',
  displayName: 'connection',
  endpoint: {
    socketPath: 'socket',
  },
  status: 'started',
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
  type: 'podman',
};

const dockerContainerConnection: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'connection',
  displayName: 'connection',
  endpoint: {
    socketPath: 'socket',
  },
  status: 'started',
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
  type: 'docker',
};

test('Expect that name, socket and type are displayed for Podman', async () => {
  render(PreferencesContainerConnectionDetailsSummary, {
    containerConnectionInfo: podmanContainerConnection,
  });
  const spanConnection = screen.getByLabelText('connection');
  expect(spanConnection).toBeInTheDocument();
  const spanSocket = screen.getByLabelText('socket');
  expect(spanSocket).toBeInTheDocument();
  const spanType = screen.getByLabelText('podman');
  expect(spanType).toBeInTheDocument();
  expect(spanType.textContent).toBe('Podman');
});

test('Expect that name, socket and type are displayed for Docker', async () => {
  render(PreferencesContainerConnectionDetailsSummary, {
    containerConnectionInfo: dockerContainerConnection,
  });
  const spanConnection = screen.getByLabelText('connection');
  expect(spanConnection).toBeInTheDocument();
  const spanSocket = screen.getByLabelText('socket');
  expect(spanSocket).toBeInTheDocument();
  const spanType = screen.getByLabelText('docker');
  expect(spanType).toBeInTheDocument();
  expect(spanType.textContent).toBe('Docker');
});

test('Expect error is displayed when connection has error', async () => {
  render(PreferencesContainerConnectionDetailsSummary, {
    containerConnectionInfo: { ...podmanContainerConnection, error: 'Machine failed to start' },
  });
  const errorAlert = screen.getByRole('alert');
  expect(errorAlert).toBeInTheDocument();
  expect(errorAlert).toHaveTextContent('Machine failed to start');
});

test('Expect error is not displayed when connection has no error', async () => {
  render(PreferencesContainerConnectionDetailsSummary, {
    containerConnectionInfo: podmanContainerConnection,
  });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

describe('resource metrics display', () => {
  const resourceProperties: IConfigurationPropertyRecordedSchema[] = [
    {
      parentId: 'preferences.podman',
      title: 'CPUs',
      id: 'podman.machine.cpus',
      type: 'number',
      scope: 'ContainerConnection',
      format: 'cpu',
      description: 'CPUs',
    },
    {
      parentId: 'preferences.podman',
      title: 'CPU Usage',
      id: 'podman.machine.cpusUsage',
      type: 'number',
      scope: 'ContainerConnection',
      format: 'cpuUsage',
      description: 'CPU Usage',
      hidden: true,
    },
    {
      parentId: 'preferences.podman',
      title: 'Memory',
      id: 'podman.machine.memory',
      type: 'number',
      scope: 'ContainerConnection',
      format: 'memory',
      description: 'Memory',
    },
    {
      parentId: 'preferences.podman',
      title: 'Memory Usage',
      id: 'podman.machine.memoryUsage',
      type: 'number',
      scope: 'ContainerConnection',
      format: 'memoryUsage',
      description: 'Memory Usage',
      hidden: true,
    },
  ];

  test('renders Donut charts for resource metrics', async () => {
    vi.mocked(window.getConfigurationValue)
      .mockResolvedValueOnce(4)
      .mockResolvedValueOnce(50)
      .mockResolvedValueOnce(8_000_000_000)
      .mockResolvedValueOnce(25);

    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: podmanContainerConnection,
      providerInternalId: '0',
      properties: resourceProperties,
    });

    await vi.waitFor(() => {
      expect(screen.getAllByTestId('arc')).toHaveLength(2);
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('8 GB')).toBeInTheDocument();
    });
  });

  test('renders non-resource configs as plain values', async () => {
    const nonResourceProperty: IConfigurationPropertyRecordedSchema = {
      parentId: 'preferences.podman',
      title: 'User mode networking',
      id: 'podman.machine.userModeNetworking',
      type: 'boolean',
      scope: 'ContainerConnection',
      format: 'boolean',
      description: 'User mode networking',
    };
    vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: podmanContainerConnection,
      providerInternalId: '0',
      properties: [...resourceProperties, nonResourceProperty],
    });

    await vi.waitFor(() => {
      expect(screen.getByText('User mode networking')).toBeInTheDocument();
    });
  });

  test('does not render resource-format configs as plain rows', async () => {
    vi.mocked(window.getConfigurationValue).mockResolvedValue(4);

    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: podmanContainerConnection,
      providerInternalId: '0',
      properties: resourceProperties,
    });

    await vi.waitFor(() => {
      expect(screen.getAllByTestId('arc')).toHaveLength(2);
    });
    expect(screen.queryByText('CPU Usage')).not.toBeInTheDocument();
    expect(screen.queryByText('Memory Usage')).not.toBeInTheDocument();
  });

  test('renders no metrics when properties is empty', async () => {
    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: podmanContainerConnection,
      providerInternalId: '0',
      properties: [],
    });

    expect(screen.queryAllByTestId('arc')).toHaveLength(0);
  });

  test('passes structuredClone-safe arguments to getConfigurationValue IPC', async () => {
    let capturedConnection: unknown;
    vi.mocked(window.getConfigurationValue).mockImplementation((_id, connection) => {
      capturedConnection = connection;
      return Promise.resolve(4);
    });

    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: podmanContainerConnection,
      providerInternalId: '0',
      properties: resourceProperties,
    });

    await vi.waitFor(() => {
      expect(window.getConfigurationValue).toHaveBeenCalled();
    });

    expect(capturedConnection).toBeDefined();
    expect(() => structuredClone(capturedConnection)).not.toThrow();
  });

  test('renders Uptime and Started at when containerConnectionInfo is started with started timestamp', async () => {
    const startedTimestamp = Date.now() - 10 * 60 * 1000;
    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: {
        ...podmanContainerConnection,
        status: 'started',
        started: startedTimestamp,
      },
    });

    const uptime = screen.getByLabelText('Uptime');
    expect(uptime).toBeInTheDocument();
    expect(uptime).toHaveTextContent('10 minutes');

    const startedAt = screen.getByLabelText('Started at');
    expect(startedAt).toBeInTheDocument();
    expect(startedAt).toHaveTextContent(new Date(startedTimestamp).toLocaleString());
  });

  test('does not render Uptime and Started at when containerConnectionInfo is stopped', async () => {
    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: {
        ...podmanContainerConnection,
        status: 'stopped',
      },
    });

    expect(screen.queryByLabelText('Uptime')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Started at')).not.toBeInTheDocument();
  });

  test('does not display invalid uptime or started dates', async () => {
    render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: {
        ...podmanContainerConnection,
        status: 'started',
        started: Number.POSITIVE_INFINITY,
      },
    });

    await vi.waitFor(() => {
      expect(screen.getByLabelText('Uptime').textContent).toBe('');
      expect(screen.getByLabelText('Started at').textContent).toBe('');
    });
  });

  test('retries the uptime when the started timestamp is in the future', async () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-01T00:00:00.000Z');
    vi.setSystemTime(now);

    const { container } = render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: {
        ...podmanContainerConnection,
        status: 'started',
        started: now.getTime() + 1000,
      },
    });
    expect(container.querySelector('[aria-label="Uptime"]')?.textContent).toBe('');

    await vi.advanceTimersByTimeAsync(1000);

    expect(container.querySelector('[aria-label="Uptime"]')?.textContent).not.toBe('');
  });

  test('refreshes uptime at the next displayed-unit boundary', async () => {
    vi.useFakeTimers();
    const now = new Date('2025-01-01T00:00:00.000Z');
    vi.setSystemTime(now);

    const { container } = render(PreferencesContainerConnectionDetailsSummary, {
      containerConnectionInfo: {
        ...podmanContainerConnection,
        status: 'started',
        started: now.getTime() - 90_000,
      },
    });
    expect(container.querySelector('[aria-label="Uptime"]')).toHaveTextContent('1 minute');

    await vi.advanceTimersByTimeAsync(30_000);

    expect(container.querySelector('[aria-label="Uptime"]')).toHaveTextContent('2 minutes');
  });
});
