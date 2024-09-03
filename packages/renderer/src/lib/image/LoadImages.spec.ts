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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import type { ProviderStatus } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import LoadImages from './LoadImages.svelte';

const openDialogMock = vi.fn();
const loadImagesMock = vi.fn();

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

// fake the window.events object
beforeAll(() => {
  (window as any).openDialog = openDialogMock;
  (window as any).loadImages = loadImagesMock;
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Expect load button to be disabled', async () => {
  render(LoadImages);
  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeDisabled();
});

test('Expect loadImage button to be enabled when atleast one archive is selected', async () => {
  providerInfos.set([providerInfo]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  render(LoadImages);
  const btnAddArchive = screen.getByRole('button', { name: 'Add archive' });
  expect(btnAddArchive).toBeInTheDocument();
  await userEvent.click(btnAddArchive);

  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeEnabled();

  expect(openDialogMock).toBeCalledWith({
    selectors: ['multiSelections', 'openFile'],
    title: 'Select Tar Archive(s) containing Image(s) to load',
  });
});

test('Expect loadImage button to be disabled when atleast one archive is selected but there is no provider', async () => {
  providerInfos.set([]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  render(LoadImages);
  const btnAddArchive = screen.getByRole('button', { name: 'Add archive' });
  expect(btnAddArchive).toBeInTheDocument();
  await userEvent.click(btnAddArchive);

  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeDisabled();
});

test('Expect load button calls loadImages func', async () => {
  providerInfos.set([providerInfo]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  loadImagesMock.mockResolvedValue('');
  const goToMock = vi.spyOn(router, 'goto');
  render(LoadImages);
  const btnAddArchive = screen.getByRole('button', { name: 'Add archive' });
  expect(btnAddArchive).toBeInTheDocument();
  await userEvent.click(btnAddArchive);

  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeEnabled();
  await userEvent.click(btnLoadImages);

  expect(loadImagesMock).toBeCalledWith({
    provider: pInfo,
    archives: ['path/file.tar'],
  });
  expect(goToMock).toBeCalledWith('/images');
});

test('Expect error shown if loadImages function fails', async () => {
  providerInfos.set([providerInfo]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  loadImagesMock.mockRejectedValue('load failed');
  render(LoadImages);
  const btnAddArchive = screen.getByRole('button', { name: 'Add archive' });
  expect(btnAddArchive).toBeInTheDocument();
  await userEvent.click(btnAddArchive);

  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeEnabled();
  await userEvent.click(btnLoadImages);

  expect(loadImagesMock).toBeCalledWith({
    provider: pInfo,
    archives: ['path/file.tar'],
  });

  const errorDiv = screen.getByLabelText('Error Message Content');
  expect(errorDiv).toBeInTheDocument();
  expect((errorDiv as HTMLDivElement).innerHTML).toContain('load failed');
});
