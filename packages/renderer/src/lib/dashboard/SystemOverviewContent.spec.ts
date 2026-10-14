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
} from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';

import SystemOverviewContent from './SystemOverviewContent.svelte';

vi.mock(import('tinro'));
vi.mock(import('/@/lib/dashboard/SystemOverviewProviderCardDetailed.svelte'));
vi.mock(import('/@/lib/dashboard/SystemOverviewProviderSetup.svelte'));
vi.mock(import('/@/lib/dashboard/SystemOverviewProviderCardCompact.svelte'));

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

const kubernetesConnection: ProviderKubernetesConnectionInfo = {
  connectionType: 'kubernetes',
  name: 'minikube',
  status: 'started',
  endpoint: { apiURL: 'https://127.0.0.1:8443' },
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
};

beforeEach(() => {
  vi.resetAllMocks();
  providerInfos.set([]);
});

test('should render overall status button and show initial status', async () => {
  render(SystemOverviewContent);
  expect(screen.getByRole('button', { name: 'System Overview - Overall status' })).toBeInTheDocument();
  expect(screen.getByText('Initializing...')).toBeInTheDocument();
});

test('should render Container providers heading', async () => {
  render(SystemOverviewContent);
  await vi.waitFor(() => expect(screen.getByText('Container providers:')).toBeInTheDocument());
});

describe('provider rendering', () => {
  test('should not render Kubernetes/VM heading for not-installed provider needing setup', async () => {
    const provider: ProviderInfo = {
      ...baseProvider,
      status: 'not-installed',
      containerProviderConnectionCreation: true,
    };
    providerInfos.set([provider]);
    render(SystemOverviewContent);

    await vi.waitFor(() => expect(screen.getByText('Container providers:')).toBeInTheDocument());
    expect(screen.queryByText('Kubernetes/VM connections:')).not.toBeInTheDocument();
  });

  test('should not render Kubernetes/VM heading for provider with only container connections', async () => {
    const provider: ProviderInfo = {
      ...baseProvider,
      containerConnections: [containerConnection],
    };
    providerInfos.set([provider]);
    render(SystemOverviewContent);

    await vi.waitFor(() => expect(screen.getByText('Container providers:')).toBeInTheDocument());
    expect(screen.queryByText('Kubernetes/VM connections:')).not.toBeInTheDocument();
  });
});

describe('standalone connections section', () => {
  test('should render Kubernetes/VM heading when standalone connections exist', async () => {
    const provider: ProviderInfo = {
      ...baseProvider,
      kubernetesConnections: [kubernetesConnection],
    };
    providerInfos.set([provider]);
    render(SystemOverviewContent);

    await vi.waitFor(() => expect(screen.getByText('Kubernetes/VM connections:')).toBeInTheDocument());
  });

  test('should not render Kubernetes/VM heading when no non-container connections exist', async () => {
    providerInfos.set([baseProvider]);
    render(SystemOverviewContent);

    await vi.waitFor(() => expect(screen.getByText('Container providers:')).toBeInTheDocument());
    expect(screen.queryByText('Kubernetes/VM connections:')).not.toBeInTheDocument();
  });
});

test('should navigate to Resources on overall status button click', async () => {
  render(SystemOverviewContent);
  const button = screen.getByRole('button', { name: 'System Overview - Overall status' });
  await fireEvent.click(button);

  await vi.waitFor(() => expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/resources'));
});

describe('telemetry', () => {
  test('should track dashboard.healthCard.viewed on mount with no connections', async () => {
    providerInfos.set([baseProvider]);
    render(SystemOverviewContent);

    await vi.waitFor(() =>
      expect(window.telemetryTrack).toHaveBeenCalledWith('dashboard.healthCard.viewed', {
        itemCount: 0,
        healthyCount: 0,
        issueCount: 0,
      }),
    );
  });

  test('should track dashboard.healthCard.viewed with correct counts for mixed connections', async () => {
    const errorConnection: ProviderContainerConnectionInfo = {
      ...containerConnection,
      name: 'error-machine',
      displayName: 'Error Machine',
      status: 'stopped',
      error: 'Connection refused',
    };

    const provider: ProviderInfo = {
      ...baseProvider,
      containerConnections: [containerConnection, errorConnection],
      kubernetesConnections: [kubernetesConnection],
    };
    providerInfos.set([provider]);
    render(SystemOverviewContent);

    await vi.waitFor(() =>
      expect(window.telemetryTrack).toHaveBeenCalledWith('dashboard.healthCard.viewed', {
        itemCount: 3,
        healthyCount: 2,
        issueCount: 1,
      }),
    );
  });
});
