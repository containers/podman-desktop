/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import { STATUS_BAR_PIN_CONSTANTS } from '@desktop-framework/api/status-bar';
import { fireEvent, render } from '@testing-library/svelte';
import { beforeEach, expect, test, vi } from 'vitest';

import Providers from '/@/lib/statusbar/Providers.svelte';
import ProviderWidget from '/@/lib/statusbar/ProviderWidget.svelte';
import { providerInfos } from '/@/stores/providers';
import { statusBarPinned } from '/@/stores/statusbar-pinned';

// mock provider widget
vi.mock(import('./ProviderWidget.svelte'));

const EMPTY_PROVIDER_MOCK: ProviderInfo = {
  id: 'empty-provider',
  name: 'empty-provider',
  containerConnections: [],
  kubernetesConnections: [],
} as unknown as ProviderInfo;

const CONTAINER_CONNECTION_MOCK: ProviderContainerConnectionInfo = {
  name: 'container-connection',
} as unknown as ProviderContainerConnectionInfo;

const KUBERNETES_CONNECTION_MOCK: ProviderKubernetesConnectionInfo = {
  name: 'kubernetes-connection',
} as unknown as ProviderKubernetesConnectionInfo;

const CONTAINER_PROVIDER_MOCK: ProviderInfo = {
  ...EMPTY_PROVIDER_MOCK,
  id: 'provider1',
  containerConnections: [CONTAINER_CONNECTION_MOCK],
};

const KUBERNETES_PROVIDER_MOCK: ProviderInfo = {
  ...EMPTY_PROVIDER_MOCK,
  id: 'provider2',
  kubernetesConnections: [KUBERNETES_CONNECTION_MOCK],
};

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.executeCommand).mockResolvedValue(undefined);

  // reset the store
  providerInfos.set([]);
  statusBarPinned.set(
    [KUBERNETES_PROVIDER_MOCK, CONTAINER_PROVIDER_MOCK].map(provider => ({
      label: provider.name,
      value: provider.id,
      pinned: true,
    })),
  );
});

test('no provider should not render any provider widget', () => {
  render(Providers);

  expect(ProviderWidget).not.toHaveBeenCalled();
});

test('provider without any connections should not be displayed', () => {
  providerInfos.set([EMPTY_PROVIDER_MOCK]);

  render(Providers);

  expect(ProviderWidget).not.toHaveBeenCalled();
});

test('provider with container connection should be displayed', () => {
  // mock two provider: one empty, and one with container connection
  providerInfos.set([CONTAINER_PROVIDER_MOCK, EMPTY_PROVIDER_MOCK]);

  render(Providers);

  // should only render one
  expect(ProviderWidget).toHaveBeenCalledOnce();
  expect(ProviderWidget).toHaveBeenCalledWith(expect.anything(), {
    entry: CONTAINER_PROVIDER_MOCK,
    tooltipTopRight: true,
  });
});

test('provider with container but not pinned should not be displayed', () => {
  // mock no pinned item
  statusBarPinned.set([]);
  providerInfos.set([CONTAINER_PROVIDER_MOCK]);

  render(Providers);

  // should only render one
  expect(ProviderWidget).not.toHaveBeenCalled();
});

test('pin button should call window#executeCommand', async () => {
  const { getByRole } = render(Providers);

  const button = getByRole('button', { name: 'Pin' });
  expect(button).toBeInTheDocument();

  expect(window.executeCommand).not.toHaveBeenCalled();

  await fireEvent.click(button);

  expect(window.executeCommand).toHaveBeenCalledOnce();
  expect(window.executeCommand).toHaveBeenCalledWith(STATUS_BAR_PIN_CONSTANTS.TOGGLE_MENU_COMMAND);
});

test('provider with kubernetes connection should be displayed', () => {
  // mock two provider: one empty, and one with kubernetes connection
  providerInfos.set([KUBERNETES_PROVIDER_MOCK, EMPTY_PROVIDER_MOCK]);

  render(Providers);

  // should only render one
  expect(ProviderWidget).toHaveBeenCalledOnce();
  expect(ProviderWidget).toHaveBeenCalledWith(expect.anything(), {
    entry: KUBERNETES_PROVIDER_MOCK,
    tooltipTopRight: true,
  });
});

test('Expect first provider to have a top right tooltip', () => {
  providerInfos.set([CONTAINER_PROVIDER_MOCK, KUBERNETES_PROVIDER_MOCK]);

  render(Providers);

  expect(ProviderWidget).toHaveBeenNthCalledWith(1, expect.anything(), {
    entry: CONTAINER_PROVIDER_MOCK,
    tooltipTopRight: true,
  });
  expect(ProviderWidget).toHaveBeenNthCalledWith(2, expect.anything(), {
    entry: KUBERNETES_PROVIDER_MOCK,
    tooltipTopRight: false,
  });
});
