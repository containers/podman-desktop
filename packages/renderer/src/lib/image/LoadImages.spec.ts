/**********************************************************************
 * Copyright (C) 2024-2025 Red Hat, Inc.
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
import type { ProviderStatus } from '@desktop-framework/extension-api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { providerInfos } from '/@/stores/providers';

import LoadImages from './LoadImages.svelte';

const pStatus: ProviderStatus = 'started';
const pInfo: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'test',
  displayName: 'test',
  status: 'started',
  endpoint: {
    socketPath: '',
  },
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
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
  vi.mocked(window.openDialog).mockResolvedValue(['path/file.tar']);
  render(LoadImages);
  const btnAddArchive = screen.getByRole('button', { name: 'Add archive' });
  expect(btnAddArchive).toBeInTheDocument();
  await userEvent.click(btnAddArchive);

  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeEnabled();

  expect(vi.mocked(window.openDialog)).toBeCalledWith({
    selectors: ['multiSelections', 'openFile'],
    title: 'Select Tar Archive(s) containing Image(s) to load',
  });
});

test('Expect loadImage button to be disabled when atleast one archive is selected but there is no provider', async () => {
  providerInfos.set([]);
  vi.mocked(window.openDialog).mockResolvedValue(['path/file.tar']);
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
  vi.mocked(window.openDialog).mockResolvedValue(['path/file.tar']);
  vi.mocked(window.loadImages).mockResolvedValue();
  const goToMock = vi.spyOn(router, 'goto');
  render(LoadImages);
  const btnAddArchive = screen.getByRole('button', { name: 'Add archive' });
  expect(btnAddArchive).toBeInTheDocument();
  await userEvent.click(btnAddArchive);

  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeEnabled();
  await userEvent.click(btnLoadImages);

  expect(vi.mocked(window.loadImages)).toBeCalledWith({
    provider: pInfo,
    archives: ['path/file.tar'],
  });
  expect(goToMock).toBeCalledWith('/images');
});

test('Expect error shown if loadImages function fails', async () => {
  providerInfos.set([providerInfo]);
  vi.mocked(window.openDialog).mockResolvedValue(['path/file.tar']);
  vi.mocked(window.loadImages).mockRejectedValue('load failed');
  render(LoadImages);
  const btnAddArchive = screen.getByRole('button', { name: 'Add archive' });
  expect(btnAddArchive).toBeInTheDocument();
  await userEvent.click(btnAddArchive);

  const btnLoadImages = screen.getByRole('button', { name: 'Load images' });
  expect(btnLoadImages).toBeInTheDocument();
  expect(btnLoadImages).toBeEnabled();
  await userEvent.click(btnLoadImages);

  expect(vi.mocked(window.loadImages)).toBeCalledWith({
    provider: pInfo,
    archives: ['path/file.tar'],
  });

  const errorDiv = screen.getByLabelText('Error Message Content');
  expect(errorDiv).toBeInTheDocument();
  expect((errorDiv as HTMLDivElement).innerHTML).toContain('load failed');
});

test('Expect Cancel button to navigate to last page when clicked', async () => {
  providerInfos.set([providerInfo]);
  lastPage.set({ name: 'Images', path: '/images' });
  const goToMock = vi.spyOn(router, 'goto');
  render(LoadImages);

  const cancelButton = screen.getByRole('button', { name: 'Cancel' });
  expect(cancelButton).toBeInTheDocument();
  await userEvent.click(cancelButton);

  expect(goToMock).toHaveBeenCalledWith('/images');
});
