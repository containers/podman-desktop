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
import { test, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import { providerInfos } from '../../stores/providers';
import type { ProviderStatus } from '@podman-desktop/api';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import userEvent from '@testing-library/user-event';
import BuildImageFromContainerfile from '/@/lib/image/BuildImageFromContainerfile.svelte';
import { buildImagesInfo } from '/@/stores/build-images';

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).getConfigurationValue = vi.fn();
  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
  });
  (window as any).openDialog = vi.fn().mockResolvedValue(['Containerfile']);
  (window as any).telemetryPage = vi.fn().mockResolvedValue(undefined);
  (window as any).getOsArch = vi.fn();
});

// the build image page expects to have a valid provider connection, so let's mock one
function setup() {
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
  providerInfos.set([providerInfo]);
  buildImagesInfo.set({
    buildImageKey: Symbol(),
    buildRunning: false,
  });
}

test('Expect Build button is disabled', async () => {
  setup();
  render(BuildImageFromContainerfile, {});

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeDisabled();
});

test('Expect Build button is enabled', async () => {
  setup();
  render(BuildImageFromContainerfile, {});

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile Path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildFolder = screen.getByRole('textbox', { name: 'Build Context Directory' });
  expect(buildFolder).toBeInTheDocument();
  await userEvent.type(buildFolder, '/somepath');

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();
});

test('Expect Done button is enabled once build is done', async () => {
  setup();
  render(BuildImageFromContainerfile, {});

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile Path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildFolder = screen.getByRole('textbox', { name: 'Build Context Directory' });
  expect(buildFolder).toBeInTheDocument();
  await userEvent.type(buildFolder, '/somepath');

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();
  await userEvent.click(buildButton);

  const doneButton = screen.getByRole('button', { name: 'Done' });
  expect(doneButton).toBeInTheDocument();
  expect(doneButton).toBeEnabled();
});

test('Expect Abort button to hidden when image build is not in progress', async () => {
  setup();
  render(BuildImageFromContainerfile);

  const abortButton = screen.queryByRole('button', { name: 'Cancel' });
  expect(abortButton).not.toBeInTheDocument();
});

test('Expect Abort button to being visible when image build is in progress', async () => {
  setup();
  buildImagesInfo.set({
    buildImageKey: Symbol(),
    buildRunning: true,
  });
  render(BuildImageFromContainerfile);

  const abortButton = screen.getByRole('button', { name: 'Cancel' });
  expect(abortButton).toBeInTheDocument();
  expect(abortButton).toBeEnabled();
});
