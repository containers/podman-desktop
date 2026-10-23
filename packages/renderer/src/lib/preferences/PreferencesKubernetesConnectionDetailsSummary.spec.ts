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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom/vitest';

import type { ProviderKubernetesConnectionInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { render, screen } from '@testing-library/svelte';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import PreferencesKubernetesConnectionDetailsSummary from './PreferencesKubernetesConnectionDetailsSummary.svelte';

const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

beforeEach(() => {
  vi.resetAllMocks();
  console.error = consoleErrorMock;
});

afterEach(() => {
  vi.useRealTimers();
  console.error = originalConsoleError;
});

const kubernetesConnection: ProviderKubernetesConnectionInfo = {
  connectionType: 'kubernetes',
  name: 'connection',
  endpoint: {
    apiURL: 'url',
  },
  status: 'started',
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
};

test('Expect that name, url and kubernetes are displayed', async () => {
  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: kubernetesConnection,
  });
  await vi.waitFor(() => {
    const spanConnection = screen.getByLabelText('connection');
    expect(spanConnection).toBeInTheDocument();
    const spanUrl = screen.getByLabelText('url');
    expect(spanUrl).toBeInTheDocument();
    const kubernetes = screen.getByLabelText('kubernetes');
    expect(kubernetes).toBeInTheDocument();
    expect(kubernetes.textContent).toBe('Kubernetes');
  });
});

test('Expect error is displayed when connection has error', async () => {
  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: { ...kubernetesConnection, error: 'Failed to start cluster' },
  });
  await vi.waitFor(() => {
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Failed to start cluster');
  });
});

test('Expect error is not displayed when connection has no error', async () => {
  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: kubernetesConnection,
  });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('logs an error when a Kubernetes configuration value cannot be retrieved', async () => {
  const error = new Error('Failed to retrieve configuration value');
  const properties: IConfigurationPropertyRecordedSchema[] = [
    {
      parentId: 'preferences.kubernetes',
      title: 'Context',
      id: 'kubernetes.context',
      type: 'string',
      scope: 'KubernetesConnection',
      description: 'Context',
    },
  ];
  vi.mocked(window.getConfigurationValue).mockRejectedValue(error);

  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: kubernetesConnection,
    properties,
  });

  await vi.waitFor(() => {
    expect(consoleErrorMock).toHaveBeenCalledWith('Error collecting providers', error);
  });
  expect(screen.getByLabelText('connection')).toBeInTheDocument();
  expect(screen.queryByText('Context')).not.toBeInTheDocument();
});

test('renders Uptime and Started at when kubernetesConnectionInfo is started with started timestamp', async () => {
  const startedTimestamp = Date.now() - 15 * 60 * 1000;
  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: {
      ...kubernetesConnection,
      status: 'started',
      started: startedTimestamp,
    },
  });

  await vi.waitFor(() => {
    const uptime = screen.getByLabelText('Uptime');
    expect(uptime).toBeInTheDocument();
    expect(uptime).toHaveTextContent('15 minutes');

    const startedAt = screen.getByLabelText('Started at');
    expect(startedAt).toBeInTheDocument();
    expect(startedAt).toHaveTextContent(new Date(startedTimestamp).toLocaleString());
  });
});

test('does not render Uptime and Started at when kubernetesConnectionInfo is stopped', async () => {
  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: {
      ...kubernetesConnection,
      status: 'stopped',
    },
  });

  expect(screen.queryByLabelText('Uptime')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Started at')).not.toBeInTheDocument();
});

test('does not display invalid uptime or started dates', async () => {
  render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: {
      ...kubernetesConnection,
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

  const { container } = render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: {
      ...kubernetesConnection,
      status: 'started',
      started: now.getTime() + 1000,
    },
  });
  await vi.waitFor(() => expect(container.querySelector('[aria-label="Uptime"]')).not.toBeNull());
  expect(container.querySelector('[aria-label="Uptime"]')?.textContent).toBe('');

  await vi.advanceTimersByTimeAsync(1000);

  expect(container.querySelector('[aria-label="Uptime"]')?.textContent).not.toBe('');
});

test('refreshes uptime at the next displayed-unit boundary', async () => {
  vi.useFakeTimers();
  const now = new Date('2025-01-01T00:00:00.000Z');
  vi.setSystemTime(now);

  const { container } = render(PreferencesKubernetesConnectionDetailsSummary, {
    kubernetesConnectionInfo: {
      ...kubernetesConnection,
      status: 'started',
      started: now.getTime() - 90_000,
    },
  });
  await vi.waitFor(() => expect(container.querySelector('[aria-label="Uptime"]')).not.toBeNull());
  expect(container.querySelector('[aria-label="Uptime"]')).toHaveTextContent('1 minute');

  await vi.advanceTimersByTimeAsync(30_000);

  expect(container.querySelector('[aria-label="Uptime"]')).toHaveTextContent('2 minutes');
});
