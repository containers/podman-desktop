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

import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import SystemOverviewProviderCardBase from './SystemOverviewProviderCardBase.svelte';

vi.mock(import('/@/lib/dashboard/SystemOverviewProviderCardCompact.svelte'));

const baseProvider: ProviderInfo = {
  internalId: 'podman-internal',
  id: 'podman',
  extensionId: 'podman',
  name: 'Podman',
  version: '5.4.0',
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

describe('name display', () => {
  test('should render provider name by default', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
    });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
  });

  test('should render custom name when provided', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
      name: 'Custom Engine',
    });

    await vi.waitFor(() => expect(screen.getByText('Custom Engine')).toBeInTheDocument());
    expect(screen.queryByText('Podman')).not.toBeInTheDocument();
  });
});

describe('version label', () => {
  test('should render provider version when no version prop is given', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
    });

    await vi.waitFor(() => expect(screen.getByText('v5.4.0')).toBeInTheDocument());
  });

  test('should render custom version when provided', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
      version: '1.2.3',
    });

    await vi.waitFor(() => expect(screen.getByText('v1.2.3')).toBeInTheDocument());
    expect(screen.queryByText('v5.4.0')).not.toBeInTheDocument();
  });

  test('should not render version label when neither version prop nor provider version exists', async () => {
    const providerWithoutVersion: ProviderInfo = { ...baseProvider, version: undefined };
    render(SystemOverviewProviderCardBase, {
      provider: providerWithoutVersion,
      connection: containerConnection,
    });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
    expect(screen.queryByText(/^v/)).not.toBeInTheDocument();
  });
});

describe('vmType label', () => {
  test('should render vmType together with version', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
      vmType: 'Apple HV',
    });

    await vi.waitFor(() => expect(screen.getByText('Apple HV - v5.4.0')).toBeInTheDocument());
  });

  test('should render vmType alone when no version exists', async () => {
    const providerWithoutVersion: ProviderInfo = { ...baseProvider, version: undefined };
    render(SystemOverviewProviderCardBase, {
      provider: providerWithoutVersion,
      connection: containerConnection,
      vmType: 'QEMU',
    });

    await vi.waitFor(() => expect(screen.getByText('QEMU')).toBeInTheDocument());
  });
});

describe('aria labels', () => {
  test('should have Connection name aria label with provider name', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
    });

    const nameEl = await vi.waitFor(() => screen.getByLabelText('Connection name'));
    expect(nameEl).toHaveTextContent('Podman');
  });

  test('should have Connection name aria label with custom name', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
      name: 'Custom Engine',
    });

    const nameEl = await vi.waitFor(() => screen.getByLabelText('Connection name'));
    expect(nameEl).toHaveTextContent('Custom Engine');
  });

  test('should have Connection version aria label when version is present', async () => {
    render(SystemOverviewProviderCardBase, {
      provider: baseProvider,
      connection: containerConnection,
    });

    const versionEl = await vi.waitFor(() => screen.getByLabelText('Connection version'));
    expect(versionEl).toBeInTheDocument();
  });

  test('should not have Connection version aria label when no version exists', async () => {
    const providerWithoutVersion: ProviderInfo = { ...baseProvider, version: undefined };
    render(SystemOverviewProviderCardBase, {
      provider: providerWithoutVersion,
      connection: containerConnection,
    });

    await vi.waitFor(() => screen.getByLabelText('Connection name'));
    expect(screen.queryByLabelText('Connection version')).not.toBeInTheDocument();
  });
});

describe('label text edge cases', () => {
  test('should not render label when neither vmType nor version exists', async () => {
    const providerWithoutVersion: ProviderInfo = { ...baseProvider, version: undefined };
    const { container } = render(SystemOverviewProviderCardBase, {
      provider: providerWithoutVersion,
      connection: containerConnection,
    });

    await vi.waitFor(() => expect(screen.getByText('Podman')).toBeInTheDocument());
    expect(container.querySelector('.overflow-x-hidden')).toBeNull();
  });
});
