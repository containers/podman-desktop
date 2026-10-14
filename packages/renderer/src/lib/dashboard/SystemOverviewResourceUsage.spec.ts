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
import { beforeEach, expect, test, vi } from 'vitest';

import { configurationProperties } from '/@/stores/configurationProperties';

import SystemOverviewResourceUsage from './SystemOverviewResourceUsage.svelte';

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
  configurationProperties.set([]);
  vi.mocked(window.getConfigurationValue).mockResolvedValue(undefined);
});

test('should not render resource bars when no configuration keys', async () => {
  render(SystemOverviewResourceUsage, {
    provider: baseProvider,
    connection: containerConnection,
  });
  await vi.waitFor(() => expect(screen.queryByText('CPU')).not.toBeInTheDocument());
  await vi.waitFor(() => expect(screen.queryByText('Memory')).not.toBeInTheDocument());
  await vi.waitFor(() => expect(screen.queryByText('Disk')).not.toBeInTheDocument());
});

test('should not render resource bars when configuration has no ContainerConnection scope', async () => {
  configurationProperties.set([
    {
      id: 'some.other.property',
      scope: 'DEFAULT',
      type: 'number',
      title: 'Some other property',
      parentId: 'parent',
    },
  ]);
  render(SystemOverviewResourceUsage, {
    provider: baseProvider,
    connection: containerConnection,
  });

  await vi.waitFor(() => expect(screen.queryByText('CPU')).not.toBeInTheDocument());
});
