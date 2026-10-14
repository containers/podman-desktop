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
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
  ProviderVmConnectionInfo,
} from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SystemOverviewProviderCardCompact from './SystemOverviewProviderCardCompact.svelte';

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

describe('expanded mode', () => {
  test('should render button with connection display name', async () => {
    render(SystemOverviewProviderCardCompact, {
      connection: containerConnection,
      provider: baseProvider,
      expanded: true,
    });

    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: 'Navigate to Podman Machine' })).toBeInTheDocument(),
    );
    expect(screen.getByText('Podman Machine')).toBeInTheDocument();
  });
});

describe('collapsed mode', () => {
  test('should render icon-only button without connection name text', async () => {
    render(SystemOverviewProviderCardCompact, {
      connection: containerConnection,
      provider: baseProvider,
      expanded: false,
    });

    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: 'Navigate to Podman Machine' })).toBeInTheDocument(),
    );
  });
});

test('should use provider name when no connection is provided', async () => {
  render(SystemOverviewProviderCardCompact, {
    provider: baseProvider,
    expanded: true,
  });

  await vi.waitFor(() => expect(screen.getByRole('button', { name: 'Navigate to Podman' })).toBeInTheDocument());
});

describe('navigation', () => {
  test.each([
    {
      type: 'container',
      connection: containerConnection,
      expectedPath: '/preferences/container-connection/view/podman-internal/',
    },
    {
      type: 'kubernetes',
      connection: {
        connectionType: 'kubernetes',
        name: 'minikube',
        status: 'started',
        endpoint: { apiURL: 'https://127.0.0.1:8443' },
      } as ProviderKubernetesConnectionInfo,
      expectedPath: '/preferences/kubernetes-connection/podman-internal/',
    },
    {
      type: 'vm',
      connection: {
        connectionType: 'vm',
        name: 'my-vm',
        status: 'started',
      } as ProviderVmConnectionInfo,
      expectedPath: '/preferences/vm-connection/podman-internal/my-vm/',
    },
  ])('should navigate to $type connection page on click', async ({ connection, expectedPath }) => {
    render(SystemOverviewProviderCardCompact, {
      connection,
      provider: baseProvider,
      expanded: true,
    });

    const button = await vi.waitFor(() => screen.getByRole('button', { name: /Navigate to/ }));
    await fireEvent.click(button);

    await vi.waitFor(() => expect(vi.mocked(router.goto)).toHaveBeenCalledWith(expect.stringContaining(expectedPath)));
  });

  test('should navigate to Resources when no connection is provided', async () => {
    render(SystemOverviewProviderCardCompact, {
      provider: baseProvider,
      expanded: true,
    });

    const button = await vi.waitFor(() => screen.getByRole('button', { name: 'Navigate to Podman' }));
    await fireEvent.click(button);

    await vi.waitFor(() => expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/resources'));
  });
});
