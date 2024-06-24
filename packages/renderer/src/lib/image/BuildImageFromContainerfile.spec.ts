/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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

import { beforeEach } from 'node:test';

import type { ProviderStatus } from '@podman-desktop/api';
import { render, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import BuildImageFromContainerfile from '/@/lib/image/BuildImageFromContainerfile.svelte';
import { buildImagesInfo } from '/@/stores/build-images';
import { providerInfos } from '/@/stores/providers';
import { recommendedRegistries } from '/@/stores/recommendedRegistries';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

// xterm is used in the UI, but not tested, added in order to avoid the multiple warnings being shown during the test.
vi.mock('xterm', () => {
  return {
    Terminal: vi.fn().mockReturnValue({ loadAddon: vi.fn(), open: vi.fn(), write: vi.fn(), clear: vi.fn() }),
  };
});

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).dispatchEvent = vi.fn();
  (window as any).getConfigurationValue = vi.fn();
  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
  });
  (window as any).openDialog = vi.fn().mockResolvedValue(['Containerfile']);
  (window as any).telemetryPage = vi.fn().mockResolvedValue(undefined);
  // Mock the getOsArch function to return 'linux/amd64' by default for the form
  (window as any).getOsArch = vi.fn();
  (window as any).buildImage = vi.fn();
  (window as any).createManifest = vi.fn();
  (window as any).getImageCheckerProviders = vi.fn();
  (window as any).getCancellableTokenSource = vi.fn().mockReturnValue({
    cancel: vi.fn(),
  });
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function waitRender(): Promise<void> {
  render(BuildImageFromContainerfile);

  // Wait 200ms for "cards" for platform render correctly
  await new Promise(resolve => setTimeout(resolve, 200));
}

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

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildFolder = screen.getByRole('textbox', { name: 'Build context directory' });
  expect(buildFolder).toBeInTheDocument();
  await userEvent.type(buildFolder, '/somepath');

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();
});

test('Expect Done button is enabled once build is done', async () => {
  setup();
  render(BuildImageFromContainerfile, {});

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildFolder = screen.getByRole('textbox', { name: 'Build context directory' });
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

test('Select multiple platforms and expect pressing Build will do two buildImage builds', async () => {
  // Auto select amd64
  vi.mocked(window.getOsArch).mockResolvedValue('amd64');
  setup();
  await waitRender();

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  // Type in the image name a test value 'foobar'
  const containerImageName = screen.getByRole('textbox', { name: 'Image name' });
  expect(containerImageName).toBeInTheDocument();
  await userEvent.type(containerImageName, 'foobar');

  // Wait until 'linux/arm64' checkboxes exist and are enabled
  waitFor(() => {
    const platform1 = screen.getByRole('checkbox', { name: 'Intel and AMD x86_64 systems' });
    expect(platform1).toBeInTheDocument();
    expect(platform1).toBeChecked();
  });

  // Click on the 'linux/arm64' button
  const platform2button = screen.getByRole('button', { name: 'linux/arm64' });
  expect(platform2button).toBeInTheDocument();
  await userEvent.click(platform2button);

  const platform2 = screen.getByRole('checkbox', { name: 'ARM® aarch64 systems' });
  expect(platform2).toBeInTheDocument();
  expect(platform2).toBeChecked();

  // Mock first buildImage to return sha256:1234
  // Mock second buildImage to return sha256:5678
  vi.mocked(window.buildImage)
    .mockResolvedValueOnce([
      { stream: 'test123' },
      {
        aux: { ID: 'sha256:1234' },
      },
    ])
    .mockResolvedValueOnce([
      { stream: 'test123' },
      {
        aux: { ID: 'sha256:5678' },
      },
    ]);

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();
  await userEvent.click(buildButton);

  // Expect buildImage to be called twice, once with the platform 'linux/arm64' and once with 'linux/amd64',
  // Make SURE that the 3rd parameter is undefined as that is the 'blank' image name
  expect(window.buildImage).toHaveBeenCalledWith(
    '/somepath',
    'containerfile',
    '',
    'linux/amd64',
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
  );

  expect(window.buildImage).toHaveBeenCalledWith(
    '/somepath',
    'containerfile',
    '',
    'linux/arm64',
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
  );
});

test('Selecting one platform only calls buildImage once with the selected platform, make sure that it has a name', async () => {
  // Auto select amd64
  vi.mocked(window.getOsArch).mockResolvedValue('amd64');
  setup();
  await waitRender();

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const imageName = screen.getByRole('textbox', { name: 'Image name' });
  expect(imageName).toBeInTheDocument();
  await userEvent.type(imageName, 'foobar');

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();

  await userEvent.click(buildButton);

  // Expect buildImage to be called once, with the platform 'linux/amd64',
  // make sure it has a name 'foobar' that was added.
  expect(window.buildImage).toHaveBeenCalledWith(
    '/somepath',
    'containerfile',
    'foobar',
    'linux/amd64',
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
  );
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

test('Expect no value for containerImageName input field (no my-custom-image value), just show the placeholder.', async () => {
  setup();
  render(BuildImageFromContainerfile);

  const containerImageName = screen.getByRole('textbox', { name: 'Image name' });
  expect(containerImageName).toBeInTheDocument();
  expect(containerImageName).toHaveValue('');
  expect(containerImageName).toHaveAttribute('placeholder', 'Image name (e.g. quay.io/namespace/my-custom-image)');
});

test('Expect recommended extension in case of build error', async () => {
  setup();

  // add registries as recommended
  recommendedRegistries.set([
    {
      id: 'my.registry.com',
      name: 'Hello',
      errors: ['Image does not exists'],
      extensionId: 'myExtension.id',
      isInstalled: false,
      extensionDetails: {
        id: 'myExtension.id',
        fetchable: true,
        displayName: 'My Custom Extension',
        fetchLink: 'myCustomLinkToDownloadExtension',
        fetchVersion: '1.0.0',
      },
    },
  ]);

  vi.mocked(window.buildImage).mockImplementation(
    async (_ignore1, _ignore2, _ignore3, _ignore4, _ignore5, key, collect) => {
      collect(key, 'error', 'initializing source docker://my.registry.com/foo-image:latest: Image does not exists');
    },
  );

  render(BuildImageFromContainerfile, {});

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildFolder = screen.getByRole('textbox', { name: 'Build context directory' });
  expect(buildFolder).toBeInTheDocument();
  await userEvent.type(buildFolder, '/somepath');

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();
  await userEvent.click(buildButton);

  // expect to find the widget to install extension
  const proposal = screen.getByRole('button', { name: 'Install myExtension.id Extension' });
  expect(proposal).toBeInTheDocument();
});

test('Expect build to include build arguments', async () => {
  setup();
  render(BuildImageFromContainerfile);

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildFolder = screen.getByRole('textbox', { name: 'Build context directory' });
  expect(buildFolder).toBeInTheDocument();
  await userEvent.type(buildFolder, '/somepath');

  const containerImageName = screen.getByRole('textbox', { name: 'Image name' });
  expect(containerImageName).toBeInTheDocument();
  await userEvent.type(containerImageName, 'foobar');

  const addArgButton = screen.getByRole('button', { name: 'Add build argument' });
  expect(addArgButton).toBeInTheDocument();
  await userEvent.click(addArgButton);

  // Expect "Key" input to exist
  const keyInputs = screen.getAllByPlaceholderText('Key');
  await userEvent.type(keyInputs[1], 'ARG_KEY');

  // Expect "Value" input to exist
  const valueInputs = screen.getAllByPlaceholderText('Value');
  await userEvent.type(valueInputs[1], 'ARG_VALUE');

  // Expect to be able to build fine with the build arguments / no errors.
  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();
  await userEvent.click(buildButton);
});
