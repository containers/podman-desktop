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
import '@testing-library/jest-dom/vitest';

import type { ProviderStatus } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import { tick } from 'svelte';
import { router } from 'tinro';
import { expect, test } from 'vitest';

import { notificationQueue } from '/@/stores/notifications';
import { providerInfos } from '/@/stores/providers';
import type { NotificationCard } from '/@api/notification';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import NewContentOnDashboardBadge from './NewContentOnDashboardBadge.svelte';

async function waitRender(): Promise<void> {
  render(NewContentOnDashboardBadge);
  await tick();
}

const notification1: NotificationCard = {
  id: 1,
  extensionId: 'extension',
  title: '1',
  body: '1',
  type: 'info',
  highlight: true,
};

const pStatus: ProviderStatus = 'started';
const pInfo: ProviderContainerConnectionInfo = {
  name: 'test',
  status: 'started',
  endpoint: {
    socketPath: '',
  },
  type: 'podman',
};
const providerInfo = {
  id: 'test',
  internalId: 'id',
  name: '',
  containerConnections: [pInfo],
  kubernetesConnections: undefined,
  status: pStatus,
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
  links: undefined,
  detectionChecks: undefined,
  warnings: undefined,
  images: undefined,
  installationSupport: undefined,
} as unknown as ProviderInfo;

test('Expect to do not display any dot if active page is Dashboard', async () => {
  notificationQueue.set([]);
  providerInfos.set([]);
  await waitRender();

  notificationQueue.set([notification1]);
  providerInfos.set([providerInfo]);

  await new Promise(resolve => setTimeout(resolve, 200));

  const dot = screen.queryByLabelText('New content available');
  expect(dot).not.toBeInTheDocument();
});

test('Expect to do not display any dot if active page is not Dashboard but there are no updates', async () => {
  notificationQueue.set([]);
  providerInfos.set([]);
  router.goto('/pods');

  await waitRender();

  const dot = screen.queryByLabelText('New content available');
  expect(dot).not.toBeInTheDocument();
});

test('Expect to display the dot if active page is not Dashboard and there is a new notification', async () => {
  notificationQueue.set([]);
  providerInfos.set([]);
  router.goto('/pods');
  await waitRender();

  notificationQueue.set([notification1]);

  await new Promise(resolve => setTimeout(resolve, 200));

  const dot = screen.getByLabelText('New content available');
  expect(dot).toBeInTheDocument();
});

test('Expect to display the dot if active page is not Dashboard and there is a new provider', async () => {
  notificationQueue.set([]);
  providerInfos.set([]);
  router.goto('/pods');
  await waitRender();

  providerInfos.set([providerInfo]);

  await new Promise(resolve => setTimeout(resolve, 200));

  const dot = screen.getByLabelText('New content available');
  expect(dot).toBeInTheDocument();
});
