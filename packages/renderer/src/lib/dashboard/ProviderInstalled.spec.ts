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
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { type InitializationContext, InitializeAndStartMode } from '/@/lib/dashboard/ProviderInitUtils';
import ProviderInstalled from '/@/lib/dashboard/ProviderInstalled.svelte';
import { providerInfos } from '/@/stores/providers';

import { verifyStatus } from './ProviderStatusTestHelper.spec';

vi.mock(import('@xterm/xterm'));

class InitializationContextImpl {
  #promise: unknown;
  #error: unknown;

  constructor(public mode: string) {}

  set promise(promise: unknown) {
    this.#promise = promise;
  }

  get promise(): unknown {
    return this.#promise;
  }

  set error(error: unknown) {
    this.#error = error;
  }

  get error(): unknown {
    return this.#error;
  }
}

beforeAll(() => {
  vi.mocked(window.initializeProvider).mockResolvedValue([]);
  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });
});

beforeEach(() => {
  providerInfos.set([]);
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
    vmConnections: [],
    vmProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    name: 'MyProvider',
    status: 'installed',
    warnings: [],
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
  };

  const initializationContext: InitializationContext = new InitializationContextImpl(
    InitializeAndStartMode,
  ) as unknown as InitializationContext;
  const { findByText, findByRole } = render(ProviderInstalled, {
    provider: provider,
    initializationContext: initializationContext,
  });

  const providerText = await findByText(content => content === 'MyProvider');
  expect(providerText).toBeInTheDocument();

  const installedText = await findByText(content => content.toLowerCase().includes('installed but not ready'));
  expect(installedText).toBeInTheDocument();

  const button = await findByRole('button', { name: 'Initialize and start' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  expect((initializationContext as InitializationContextImpl).promise).toBeDefined();
  expect(window.initializeProvider).toHaveBeenCalled();
});

test('Expect installed provider shows update button', async () => {
  await verifyStatus(ProviderInstalled, 'installed', false);
});

test('Expect installed provider does not show update button if version same', async () => {
  await verifyStatus(ProviderInstalled, 'installed', true);
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
    vmConnections: [],
    vmProviderConnectionCreation: false,
    vmProviderConnectionInitialization: false,
    links: [],
    name: 'MyProvider',
    status: 'installed',
    warnings: [],
    extensionId: '',
    cleanupSupport: false,
    canStart: false,
    canStop: false,
  };

  const initializationContext: InitializationContext = new InitializationContextImpl(
    InitializeAndStartMode,
  ) as unknown as InitializationContext;
  const { findByText, findByRole } = render(ProviderInstalled, {
    provider: provider,
    initializationContext: initializationContext,
  });

  const providerText = await findByText('MyProvider');
  expect(providerText).toBeInTheDocument();

  const installedText = await findByText('INSTALLED BUT NOT READY');
  expect(installedText).toBeInTheDocument();

  const button = await findByRole('button', { name: 'Initialize and start' });
  expect(button).toBeInTheDocument();

  await userEvent.click(button);

  while ((initializationContext as InitializationContextImpl).error !== 'error') {
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  expect((initializationContext as InitializationContextImpl).promise).toBeDefined();
  expect((initializationContext as InitializationContextImpl).error).toBeDefined();
});

test('Expect installed provider shows multiple installation warnings', async () => {
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
    status: 'installed',
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
  render(ProviderInstalled, {
    provider,
    initializationContext: { mode: InitializeAndStartMode },
  });

  expect(screen.getByRole('list', { name: 'Provider Warnings' })).toBeInTheDocument();
  expect(screen.getByRole('listitem', { name: 'Multiple Podman installations detected' })).toBeInTheDocument();
});

test('Expect installed provider shows initialize button section when provider needs initialization', async () => {
  const provider: ProviderInfo = {
    containerConnections: [],
    containerProviderConnectionCreation: false,
    containerProviderConnectionInitialization: true,
    detectionChecks: [],
    id: 'podman',
    images: {},
    installationSupport: false,
    kubernetesProviderConnectionInitialization: false,
    links: [],
    name: 'Podman',
    status: 'installed',
  } as unknown as ProviderInfo;

  const initializationContext: InitializationContext = new InitializationContextImpl(
    InitializeAndStartMode,
  ) as unknown as InitializationContext;
  render(ProviderInstalled, {
    provider: provider,
    initializationContext: initializationContext,
  });

  // The button's visibility is controlled by its parent wrapper's `hidden` class
  // (see class:hidden={!initializationButtonVisible} in ProviderInstalled.svelte).
  const button = screen.getByRole('button', { name: 'Initialize and start' });
  const buttonWrapper = button.parentElement?.parentElement?.parentElement;
  if (!buttonWrapper) {
    throw new Error('Expected to find the initialize button wrapper element');
  }

  expect(buttonWrapper).not.toHaveClass('hidden');
});

test.each([
  {
    name: 'initialization succeeds',
    setupMock: (): void => {
      vi.mocked(window.initializeProvider).mockResolvedValue([]);
    },
    // userToggle stays false (set on click, nothing resets it on success), so the
    // button remains hidden regardless of the provider's own initialization flags.
    expectButtonHiddenAfterSettle: true,
  },
  {
    name: 'initialization fails',
    setupMock: (): void => {
      vi.mocked(window.initializeProvider).mockRejectedValue('error');
    },
    // userToggle is forced back to true on failure, overriding the provider's
    // initialization flags (both false here), so the button reappears.
    expectButtonHiddenAfterSettle: false,
  },
])(
  'Expect userToggle to control button visibility after click when $name',
  async ({ setupMock, expectButtonHiddenAfterSettle }) => {
    setupMock();

    const provider: ProviderInfo = {
      containerConnections: [],
      containerProviderConnectionCreation: false,
      // userToggle starts undefined, so this flag drives the initial visibility.
      containerProviderConnectionInitialization: true,
      detectionChecks: [],
      id: 'podman',
      images: {},
      installationSupport: false,
      kubernetesProviderConnectionInitialization: false,
      links: [],
      name: 'Podman',
      status: 'installed',
    } as unknown as ProviderInfo;

    const initializationContext: InitializationContext = new InitializationContextImpl(
      InitializeAndStartMode,
    ) as unknown as InitializationContext;
    const { rerender } = render(ProviderInstalled, {
      provider: provider,
      initializationContext: initializationContext,
    });

    const button = screen.getByRole('button', { name: 'Initialize and start' });
    const buttonWrapper = button.parentElement?.parentElement?.parentElement;

    await userEvent.click(button);

    // Flip the provider's own initialization flags off to prove visibility is now
    // driven entirely by userToggle, not by the provider's initialization flags.
    await rerender({
      provider: {
        ...provider,
        containerProviderConnectionInitialization: false,
      },
      initializationContext,
    });

    await waitFor(() => {
      expect(buttonWrapper?.classList.contains('hidden')).toBe(expectButtonHiddenAfterSettle);
    });
  },
);
