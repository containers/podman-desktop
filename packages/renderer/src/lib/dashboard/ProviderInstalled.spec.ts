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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import { type InitializationContext, InitializeAndStartMode } from '/@/lib/dashboard/ProviderInitUtils';
import ProviderInstalled from '/@/lib/dashboard/ProviderInstalled.svelte';

import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { verifyStatus } from './ProviderStatusTestHelper.spec';

vi.mock('xterm', () => {
  return {
    Terminal: vi.fn().mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: vi.fn(), clear: vi.fn() }),
  };
});

// fake the window.events object
beforeAll(() => {
  (window as any).ResizeObserver = vi.fn().mockReturnValue({ observe: vi.fn(), unobserve: vi.fn() });
  (window as any).getConfigurationValue = vi.fn().mockReturnValue(12);
  (window as any).telemetryPage = vi.fn().mockResolvedValue(undefined);
  (window as any).initializeProvider = vi.fn().mockResolvedValue([]);
  (window.events as unknown) = {
    receive: (_channel: string, func: any) => {
      func();
    },
  };
});

test('Expect installed provider shows button', async () => {
  const provider: ProviderInfo = {
    containerConnections: [],
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    detectionChecks: [],
    id: 'myproviderid',
    images: {},
    installationSupport: false,
    internalId: 'myproviderid',
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    links: [],
    name: 'MyProvider',
    status: 'installed',
    warnings: [],
    extensionId: '',
    cleanupSupport: false,
  };

  const initializationContext: InitializationContext = { mode: InitializeAndStartMode };
  render(ProviderInstalled, { provider: provider, initializationContext: initializationContext });

  const providerText = screen.getByText(content => content === 'MyProvider');
  expect(providerText).toBeInTheDocument();

  const installedText = screen.getByText(content => content.toLowerCase().includes('installed but not ready'));
  expect(installedText).toBeInTheDocument();

  const button = screen.getByRole('button', { name: 'Initialize and start' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  expect((initializationContext as any).promise).toBeDefined();
  expect(window.initializeProvider).toHaveBeenCalled();
});

test('Expect installed provider shows update button', async () => {
  verifyStatus(ProviderInstalled, 'installed', false);
});

test('Expect installed provider does not show update button if version same', async () => {
  verifyStatus(ProviderInstalled, 'installed', true);
});

test('Expect to see the initialize context error if provider installation fails', async () => {
  vi.spyOn(window, 'initializeProvider').mockRejectedValue('error');
  const provider: ProviderInfo = {
    containerConnections: [],
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    detectionChecks: [],
    id: 'myproviderid',
    images: {},
    installationSupport: false,
    internalId: 'myproviderid',
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    links: [],
    name: 'MyProvider',
    status: 'installed',
    warnings: [],
    extensionId: '',
    cleanupSupport: false,
  };

  const initializationContext: InitializationContext = { mode: InitializeAndStartMode };
  render(ProviderInstalled, { provider: provider, initializationContext: initializationContext });

  const providerText = screen.getByText(content => content === 'MyProvider');
  expect(providerText).toBeInTheDocument();

  const installedText = screen.getByText(content => content.toLowerCase().includes('installed but not ready'));
  expect(installedText).toBeInTheDocument();

  const button = screen.getByRole('button', { name: 'Initialize and start' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  while ((initializationContext as any).error !== 'error') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  expect((initializationContext as any).promise).toBeDefined();
  expect((initializationContext as any).error).toBeDefined();
});
