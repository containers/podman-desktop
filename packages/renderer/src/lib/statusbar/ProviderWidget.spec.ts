/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import type { ProviderStatus } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import ProviderWidget from './ProviderWidget.svelte';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

const providerMock = {
  name: 'provider1',
  containerConnections: [],
  kubernetesConnections: [],
  status: 'ready' as ProviderStatus,
  images: {},
} as unknown as ProviderInfo;

beforeEach(() => {
  vi.resetAllMocks();
});

test('Provider widget takes user to /preferences/resources on click by default', async () => {
  render(ProviderWidget, { entry: providerMock });

  const widget = screen.getByRole('button', { name: 'provider1' });
  expect(widget).toBeInTheDocument();

  await userEvent.click(widget);
  expect(router.goto).toBeCalledWith('/preferences/resources');
});

test('Expect the prop command to be used when it is passed with the entry', async () => {
  render(ProviderWidget, {
    entry: providerMock,
    command: () => {
      router.goto('/some/page');
    },
  });

  const widget = screen.getByRole('button', { name: 'provider1' });
  expect(widget).toBeInTheDocument();

  await userEvent.click(widget);
  expect(router.goto).toBeCalledWith('/some/page');
});

test('Expect title to include container provider connections', () => {
  providerMock.containerConnections = [
    { name: 'connection 1' } as unknown as ProviderContainerConnectionInfo,
    { name: 'connection 2' } as unknown as ProviderContainerConnectionInfo,
  ];
  render(ProviderWidget, { entry: providerMock });

  expect(screen.getByTitle('connection 1, connection 2')).toBeInTheDocument();
});

test('Expect title to include Kubernetes provider connections', () => {
  providerMock.kubernetesConnections = [
    { name: 'connection 1' } as unknown as ProviderKubernetesConnectionInfo,
    { name: 'connection 2' } as unknown as ProviderKubernetesConnectionInfo,
  ];
  render(ProviderWidget, { entry: providerMock });

  expect(screen.getByTitle('connection 1, connection 2')).toBeInTheDocument();
});
