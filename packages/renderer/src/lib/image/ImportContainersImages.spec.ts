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

import ImportContainersImages from './ImportContainersImages.svelte';

const openDialogMock = vi.fn();
const importContainerMock = vi.fn();

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
  (window as any).importContainer = importContainerMock;
});

beforeEach(() => {
  vi.clearAllMocks();
});

test('Expect import button to be disabled', async () => {
  render(ImportContainersImages);
  const btnImportContainer = screen.getByRole('button', { name: 'Import containers' });
  expect(btnImportContainer).toBeInTheDocument();
  expect(btnImportContainer).toBeDisabled();
});

test('Expect import button to be enabled when atleast one container image is selected', async () => {
  providerInfos.set([providerInfo]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  render(ImportContainersImages);
  const btnAddImages = screen.getByRole('button', { name: 'Add images to import' });
  expect(btnAddImages).toBeInTheDocument();
  await userEvent.click(btnAddImages);

  const btnImportContainer = screen.getByRole('button', { name: 'Import containers' });
  expect(btnImportContainer).toBeInTheDocument();
  expect(btnImportContainer).toBeEnabled();

  expect(openDialogMock).toBeCalledWith({
    selectors: ['multiSelections', 'openFile'],
    title: 'Select Containers Images to import',
  });
});

test('Expect import button to be enabled when atleast one container image is selected but there is no provider', async () => {
  providerInfos.set([]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  render(ImportContainersImages);
  const btnAddImages = screen.getByRole('button', { name: 'Add images to import' });
  expect(btnAddImages).toBeInTheDocument();
  await userEvent.click(btnAddImages);

  const btnImportContainer = screen.getByRole('button', { name: 'Import containers' });
  expect(btnImportContainer).toBeInTheDocument();
  expect(btnImportContainer).toBeDisabled();
});

test('Expect import call importContainer func', async () => {
  providerInfos.set([providerInfo]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  importContainerMock.mockResolvedValue('');
  const goToMock = vi.spyOn(router, 'goto');
  render(ImportContainersImages);
  const btnAddImages = screen.getByRole('button', { name: 'Add images to import' });
  expect(btnAddImages).toBeInTheDocument();
  await userEvent.click(btnAddImages);

  const btnImportContainer = screen.getByRole('button', { name: 'Import containers' });
  expect(btnImportContainer).toBeInTheDocument();
  expect(btnImportContainer).toBeEnabled();
  await userEvent.click(btnImportContainer);

  expect(importContainerMock).toBeCalledWith({
    provider: pInfo,
    archivePath: 'path/file.tar',
    imageTag: 'file',
  });
  expect(goToMock).toBeCalledWith('/images');
});

test('Expect error shown if import function fails', async () => {
  providerInfos.set([providerInfo]);
  openDialogMock.mockResolvedValue(['path/file.tar']);
  importContainerMock.mockRejectedValue('import failed');
  render(ImportContainersImages);
  const btnAddImages = screen.getByRole('button', { name: 'Add images to import' });
  expect(btnAddImages).toBeInTheDocument();
  await userEvent.click(btnAddImages);

  const btnImportContainer = screen.getByRole('button', { name: 'Import containers' });
  expect(btnImportContainer).toBeInTheDocument();
  expect(btnImportContainer).toBeEnabled();
  await userEvent.click(btnImportContainer);

  expect(importContainerMock).toBeCalledWith({
    provider: pInfo,
    archivePath: 'path/file.tar',
    imageTag: 'file',
  });

  const errorDiv = screen.getByLabelText('Error Message Content');
  expect(errorDiv).toBeInTheDocument();
  expect((errorDiv as HTMLDivElement).innerHTML).toContain('import failed');
});
