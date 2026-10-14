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

import type { ProviderInfo } from '@desktop-framework/api';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SystemOverviewProviderSetup from './SystemOverviewProviderSetup.svelte';

vi.mock(import('tinro'));
vi.mock(import('/@/lib/dashboard/SystemOverviewProviderCardCompact.svelte'));

const baseProvider: ProviderInfo = {
  internalId: 'podman-internal',
  id: 'podman',
  extensionId: 'podman-desktop.podman',
  name: 'Podman',
  containerConnections: [],
  kubernetesConnections: [],
  vmConnections: [],
  status: 'not-installed',
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

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.startProvider).mockResolvedValue([]);
});

describe('not-installed provider', () => {
  test('should render provider name and not-installed message', async () => {
    render(SystemOverviewProviderSetup, { provider: baseProvider });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
    await vi.waitFor(() =>
      expect(
        screen.getByText('Podman needs to be set up. Some features might not function optimally.'),
      ).toBeInTheDocument(),
    );
  });

  test('should navigate to onboarding on Set up click', async () => {
    render(SystemOverviewProviderSetup, { provider: baseProvider });

    const button = screen.getByRole('button', { name: 'Set up Podman' });
    await fireEvent.click(button);
    await vi.waitFor(() =>
      expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/onboarding/podman-desktop.podman'),
    );
  });
});

describe('installed provider', () => {
  const installedProvider: ProviderInfo = {
    ...baseProvider,
    status: 'installed',
    extensionId: 'podman',
    containerProviderConnectionCreation: true,
  };

  test('should render provider name and installed message', async () => {
    render(SystemOverviewProviderSetup, { provider: installedProvider });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
    await vi.waitFor(() =>
      expect(
        screen.getByText('No container engine (machine) created yet. Create one to run containers and pods.'),
      ).toBeInTheDocument(),
    );
  });

  test('should navigate to onboarding on Set up click', async () => {
    render(SystemOverviewProviderSetup, { provider: installedProvider });

    const button = screen.getByRole('button', { name: 'Set up Podman' });
    await fireEvent.click(button);
    await vi.waitFor(() => expect(vi.mocked(router.goto)).toHaveBeenCalledWith('/preferences/onboarding/podman'));
  });
});

describe('configured provider', () => {
  const configuredProvider: ProviderInfo = {
    ...baseProvider,
    status: 'configured',
    extensionId: 'podman',
    canStart: true,
  };

  test('should render provider name and message', async () => {
    render(SystemOverviewProviderSetup, { provider: configuredProvider });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
    await vi.waitFor(() =>
      expect(
        screen.getByText('No container engine (machine) created yet. Create one to run containers and pods.'),
      ).toBeInTheDocument(),
    );
  });

  test('should render Start Podman button for local machine with start lifecycle', async () => {
    render(SystemOverviewProviderSetup, { provider: configuredProvider });

    const button = screen.getByRole('button', { name: 'Start Podman' });
    await vi.waitFor(() => expect(button).toBeInTheDocument());
    await fireEvent.click(button);
    await vi.waitFor(() => expect(window.startProvider).toHaveBeenCalledWith('podman-internal'));
  });

  test('should track dashboard.healthCard.provider.started telemetry when starting a provider', async () => {
    render(SystemOverviewProviderSetup, { provider: configuredProvider });

    const button = screen.getByRole('button', { name: 'Start Podman' });
    await fireEvent.click(button);

    await vi.waitFor(() =>
      expect(window.telemetryTrack).toHaveBeenCalledWith('dashboard.healthCard.provider.started', {
        providerName: 'Podman',
      }),
    );
  });

  test('should render View button instead of Start for remote machine without lifecycle methods', async () => {
    const remoteProvider: ProviderInfo = {
      ...baseProvider,
      status: 'configured',
      extensionId: 'podman',
    };
    render(SystemOverviewProviderSetup, { provider: remoteProvider });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Start Podman' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'View' })).toBeInTheDocument();
  });

  test('should not render Start button when lifecycle does not include start', async () => {
    const noStartProvider: ProviderInfo = {
      ...baseProvider,
      status: 'configured',
      extensionId: 'podman',
      canStart: false,
    };
    render(SystemOverviewProviderSetup, { provider: noStartProvider });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
    expect(screen.queryByRole('button', { name: 'Start Podman' })).not.toBeInTheDocument();
  });
});
