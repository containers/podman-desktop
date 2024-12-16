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
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import ImageEmptyScreen from './ImageEmptyScreen.svelte';

const pullImageMock = vi.fn();
const showMessageBoxMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'pullImage', { value: pullImageMock });
  Object.defineProperty(window, 'showMessageBox', { value: showMessageBoxMock });
});

beforeEach(() => {
  vi.resetAllMocks();
});

// set up a valid provider connection for pull image
function setup() {
  const pStatus: ProviderStatus = 'started';
  const pInfo: ProviderContainerConnectionInfo = {
    name: 'test',
    displayName: 'test',
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
  providerInfos.set([providerInfo]);
}

test('expect page to have pull image button', async () => {
  render(ImageEmptyScreen);

  const pullButton = screen.getByRole('button', { name: 'Pull your first image' });

  expect(pullButton).toBeInTheDocument();

  await userEvent.click(pullButton);
});

test('expect error to show up in message box when pull has an error', async () => {
  setup();
  render(ImageEmptyScreen);

  pullImageMock.mockRejectedValueOnce(new Error('Cannot pull image'));

  const pullButton = screen.getByRole('button', { name: 'Pull your first image' });
  expect(pullButton).toBeInTheDocument();

  await userEvent.click(pullButton);

  expect(showMessageBoxMock).toBeCalledWith({
    title: `Error while pulling image`,
    message: `Error while pulling image from test: Cannot pull image`,
  });
});

test('expect error to show up in message box with no providers', async () => {
  providerInfos.set([]);
  render(ImageEmptyScreen);

  const pullButton = screen.getByRole('button', { name: 'Pull your first image' });

  await userEvent.click(pullButton);

  expect(showMessageBoxMock).toBeCalledWith({
    title: `Error while pulling image`,
    message: `No provider connections found`,
  });
});

test('expect image to be pulled successfully', async () => {
  setup();
  render(ImageEmptyScreen);

  const pullButton = screen.getByRole('button', { name: 'Pull your first image' });

  await userEvent.click(pullButton);

  expect(pullImageMock).toBeCalled();
  expect(showMessageBoxMock).not.toBeCalled();
});
