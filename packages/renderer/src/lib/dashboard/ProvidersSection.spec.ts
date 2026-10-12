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

import type { ProviderInfo } from '@desktop-framework/api';
import type { ProviderStatus } from '@desktop-framework/extension-api';
import { render, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { DoNothingMode, type InitializationContext, InitializeAndStartMode } from '/@/lib/dashboard/ProviderInitUtils';
import { providerInfos } from '/@/stores/providers';

import ProviderConfigured from './ProviderConfigured.svelte';
import ProviderConfiguring from './ProviderConfiguring.svelte';
import ProviderInstalled from './ProviderInstalled.svelte';
import ProviderNotInstalled from './ProviderNotInstalled.svelte';
import ProviderReady from './ProviderReady.svelte';
import ProvidersSection from './ProvidersSection.svelte';
import ProviderStarting from './ProviderStarting.svelte';
import ProviderStopped from './ProviderStopped.svelte';

vi.mock(import('./ProviderConfigured.svelte'));
vi.mock(import('./ProviderConfiguring.svelte'));
vi.mock(import('./ProviderInstalled.svelte'));
vi.mock(import('./ProviderNotInstalled.svelte'));
vi.mock(import('./ProviderReady.svelte'));
vi.mock(import('./ProviderStarting.svelte'));
vi.mock(import('./ProviderStopped.svelte'));

const providerCardComponents = [
  ProviderReady,
  ProviderStarting,
  ProviderInstalled,
  ProviderConfiguring,
  ProviderConfigured,
  ProviderNotInstalled,
  ProviderStopped,
];

interface InitializationProps {
  provider: ProviderInfo;
  initializationContext: InitializationContext;
}

let nextProviderId = 0;

function createProvider(status: ProviderStatus = 'ready', overrides: Partial<ProviderInfo> = {}): ProviderInfo {
  const id = `provider-${nextProviderId++}`;

  return {
    containerConnections: [],
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: false,
    detectionChecks: [],
    id,
    images: {},
    installationSupport: false,
    internalId: id,
    kubernetesConnections: [],
    kubernetesProviderConnectionCreation: false,
    kubernetesProviderConnectionInitialization: false,
    vmConnections: [],
    vmProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    name: `provider ${status}`,
    status,
    warnings: [],
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
    ...overrides,
  };
}

const providerStatusCases: {
  status: ProviderStatus;
  component?: (typeof providerCardComponents)[number];
  receivesInitializationContext?: boolean;
}[] = [
  { status: 'ready', component: ProviderReady },
  { status: 'started', component: ProviderReady },
  { status: 'starting', component: ProviderStarting },
  { status: 'installed', component: ProviderInstalled, receivesInitializationContext: true },
  { status: 'configuring', component: ProviderConfiguring, receivesInitializationContext: true },
  { status: 'configured', component: ProviderConfigured, receivesInitializationContext: true },
  { status: 'not-installed', component: ProviderNotInstalled },
  { status: 'stopped', component: ProviderStopped },
  { status: 'stopping' },
  { status: 'error' },
  { status: 'unknown' },
];

function isInitializationProps(value: unknown): value is InitializationProps {
  return typeof value === 'object' && value !== null && 'provider' in value && 'initializationContext' in value;
}

function getInitializationContext(calls: readonly unknown[], callIndex: number): InitializationContext {
  const call = calls[callIndex];
  if (!Array.isArray(call) || !isInitializationProps(call[1])) {
    throw new Error('Expected an initialization card call with provider props');
  }
  return call[1].initializationContext;
}

beforeEach(() => {
  vi.resetAllMocks();
  providerInfos.set([]);
  nextProviderId = 0;
});

describe('provider status routing', () => {
  test.each(providerStatusCases)(
    '$status providers are routed to the matching card',
    ({ status, component: expectedComponent, receivesInitializationContext }) => {
      const provider = createProvider(status);
      providerInfos.set([provider]);

      render(ProvidersSection);

      if (expectedComponent) {
        expect(expectedComponent).toHaveBeenCalledOnce();
        const expectedProps = receivesInitializationContext
          ? { provider, initializationContext: expect.objectContaining({ mode: DoNothingMode }) }
          : { provider };
        expect(expectedComponent).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(expectedProps));
      }

      for (const component of providerCardComponents) {
        if (component !== expectedComponent) {
          expect(component).not.toHaveBeenCalled();
        }
      }
    },
  );

  test('renders no cards when there are no providers', () => {
    render(ProvidersSection);

    for (const component of providerCardComponents) {
      expect(component).not.toHaveBeenCalled();
    }
  });

  test('renders every provider in a mixed list in its matching card', () => {
    const readyProvider = createProvider('ready');
    const configuredProvider = createProvider('configured');
    const startingProvider = createProvider('starting');
    const notInstalledProvider = createProvider('not-installed');
    const startedProvider = createProvider('started');
    const stoppedProvider = createProvider('stopped');
    const installedProvider = createProvider('installed');
    const configuringProvider = createProvider('configuring');
    providerInfos.set([
      readyProvider,
      configuredProvider,
      startingProvider,
      notInstalledProvider,
      startedProvider,
      stoppedProvider,
      installedProvider,
      configuringProvider,
    ]);

    render(ProvidersSection);

    expect(ProviderReady).toHaveBeenNthCalledWith(1, expect.anything(), { provider: readyProvider });
    expect(ProviderReady).toHaveBeenNthCalledWith(2, expect.anything(), { provider: startedProvider });
    expect(ProviderStarting).toHaveBeenCalledWith(expect.anything(), { provider: startingProvider });
    expect(ProviderInstalled).toHaveBeenCalledWith(expect.anything(), {
      provider: installedProvider,
      initializationContext: expect.objectContaining({ mode: DoNothingMode }),
    });
    expect(ProviderConfiguring).toHaveBeenCalledWith(expect.anything(), {
      provider: configuringProvider,
      initializationContext: expect.objectContaining({ mode: DoNothingMode }),
    });
    expect(ProviderConfigured).toHaveBeenCalledWith(expect.anything(), {
      provider: configuredProvider,
      initializationContext: expect.objectContaining({ mode: DoNothingMode }),
    });
    expect(ProviderNotInstalled).toHaveBeenCalledWith(expect.anything(), { provider: notInstalledProvider });
    expect(ProviderStopped).toHaveBeenCalledWith(expect.anything(), { provider: stoppedProvider });
  });
});

describe('provider store updates', () => {
  test('renders providers added after the section mounts and routes status changes', async () => {
    render(ProvidersSection);

    const startingProvider = createProvider('starting');
    providerInfos.set([startingProvider]);
    await waitFor(() =>
      expect(ProviderStarting).toHaveBeenCalledWith(expect.anything(), { provider: startingProvider }),
    );

    const readyProvider: ProviderInfo = { ...startingProvider, status: 'ready' };
    providerInfos.set([readyProvider]);
    await waitFor(() => expect(ProviderReady).toHaveBeenCalledWith(expect.anything(), { provider: readyProvider }));
  });
});

describe('initialization contexts', () => {
  test('preserves one provider context as it moves through initialization statuses', async () => {
    const installedProvider = createProvider('installed');
    providerInfos.set([installedProvider]);
    render(ProvidersSection);

    const initializationContext = getInitializationContext(vi.mocked(ProviderInstalled).mock.calls, 0);
    expect(initializationContext).toEqual({ mode: DoNothingMode });

    initializationContext.mode = InitializeAndStartMode;
    initializationContext.error = 'initialization failed';

    const configuringProvider: ProviderInfo = { ...installedProvider, status: 'configuring' };
    providerInfos.set([configuringProvider]);
    await waitFor(() =>
      expect(ProviderConfiguring).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          provider: configuringProvider,
          initializationContext,
        }),
      ),
    );

    const configuredProvider: ProviderInfo = { ...installedProvider, status: 'configured' };
    providerInfos.set([configuredProvider]);
    await waitFor(() =>
      expect(ProviderConfigured).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          provider: configuredProvider,
          initializationContext,
        }),
      ),
    );

    expect(initializationContext).toEqual({ mode: InitializeAndStartMode, error: 'initialization failed' });
  });

  test('keeps separate contexts for providers with different internal ids', () => {
    const firstProvider = createProvider('installed', { id: 'same-provider-id' });
    const secondProvider = createProvider('installed', { id: 'same-provider-id' });
    providerInfos.set([firstProvider, secondProvider]);

    render(ProvidersSection);

    expect(ProviderInstalled).toHaveBeenCalledTimes(2);
    const installedCalls = vi.mocked(ProviderInstalled).mock.calls;
    const firstContext = getInitializationContext(installedCalls, 0);
    const secondContext = getInitializationContext(installedCalls, 1);

    expect(firstContext).not.toBe(secondContext);
    expect(firstContext).toEqual({ mode: DoNothingMode });
    expect(secondContext).toEqual({ mode: DoNothingMode });
  });
});
