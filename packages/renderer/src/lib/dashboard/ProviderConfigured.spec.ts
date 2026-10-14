/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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
import { render, screen } from '@testing-library/svelte';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import ProviderConfigured from '/@/lib/dashboard/ProviderConfigured.svelte';
import { InitializeOnlyMode } from '/@/lib/dashboard/ProviderInitUtils';
import { providerInfos } from '/@/stores/providers';

import { verifyStatus } from './ProviderStatusTestHelper.spec';

beforeAll(() => {
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);
  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });
});

beforeEach(() => {
  providerInfos.set([]);
});

test('Expect configured provider shows update button', async () => {
  await verifyStatus(ProviderConfigured, 'configured', false);
});

test('Expect configured provider does not show update button if version same', async () => {
  await verifyStatus(ProviderConfigured, 'configured', true);
});

test('Expect configured provider shows multiple installation warnings', async () => {
  const provider: ProviderInfo = {
    containerConnections: [],
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    detectionChecks: [],
    id: 'podman',
    images: {},
    installationSupport: false,
    internalId: 'podman-internal',
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    vmConnections: [],
    vmProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    name: 'Podman',
    status: 'configured',
    warnings: [
      {
        name: 'Multiple Podman installations detected',
        details: 'You have multiple Podman instances in your PATH.',
      },
    ],
    version: '5.0.0',
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
  };

  providerInfos.set([provider]);
  render(ProviderConfigured, {
    provider,
    initializationContext: { mode: InitializeOnlyMode },
  });

  expect(screen.getByRole('list', { name: 'Provider Warnings' })).toBeInTheDocument();
  expect(screen.getByRole('listitem', { name: 'Multiple Podman installations detected' })).toBeInTheDocument();
});
