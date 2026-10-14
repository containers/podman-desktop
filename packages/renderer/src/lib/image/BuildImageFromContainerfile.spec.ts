/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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
import { render, type RenderResult, screen, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { type Component, tick } from 'svelte';
import { get } from 'svelte/store';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import BuildImageFromContainerfile from '/@/lib/image/BuildImageFromContainerfile.svelte';
import { buildImagesInfo, getNextTaskId } from '/@/stores/build-images';
import { providerInfos } from '/@/stores/providers';
import { recommendedRegistries } from '/@/stores/recommendedRegistries';

// xterm is used in the UI, but not tested, added in order to avoid the multiple warnings being shown during the test.
vi.mock(import('@xterm/xterm'));

beforeAll(() => {
  vi.mocked(window.openDialog).mockResolvedValue(['Containerfile']);
  vi.mocked(window.getCancellableTokenSource).mockResolvedValue(1234);
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function waitRender(): Promise<RenderResult<Component>> {
  const res = render(BuildImageFromContainerfile);

  // Wait 200ms for "cards" for platform render correctly
  await new Promise(resolve => setTimeout(resolve, 200));

  return res;
}

// the build image page expects to have a valid provider connection, so let's mock one
function setup(): void {
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
  providerInfos.set([providerInfo]);
  buildImagesInfo.set(new Map());
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
  vi.mocked(window.pathRelative).mockResolvedValue('containerfile');
  setup();
  await waitRender();

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  await tick();

  // Type in the image name a test value 'foobar'
  const containerImageName = screen.getByRole('textbox', { name: 'Image name' });
  expect(containerImageName).toBeInTheDocument();
  await userEvent.type(containerImageName, 'foobar');

  // Wait until 'linux/arm64' checkboxes exist and are enabled
  await waitFor(() => {
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
    undefined,
    'linux/amd64',
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    undefined,
    true,
  );

  expect(window.buildImage).toHaveBeenCalledWith(
    '/somepath',
    'containerfile',
    undefined,
    'linux/arm64',
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    undefined,
    true,
  );
});

test('Select multiple platforms without image name should disable Build button', async () => {
  // Auto select amd64
  vi.mocked(window.getOsArch).mockResolvedValue('amd64');
  setup();
  await waitRender();

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  // Wait until 'linux/arm64' checkboxes exist and are enabled
  await waitFor(() => {
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

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeDisabled();
});

test('Selecting no platforms should disable Build button', async () => {
  // Auto select amd64
  vi.mocked(window.getOsArch).mockResolvedValue('amd64');
  setup();
  await waitRender();

  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  // Wait until 'linux/arm64' checkboxes exist and are enabled
  await waitFor(() => {
    const linuxAmd64Button = screen.getByRole('checkbox', { name: 'Intel and AMD x86_64 systems' });
    expect(linuxAmd64Button).toBeInTheDocument();
    expect(linuxAmd64Button).toBeChecked();
  });

  // disable the platform
  const linuxAmd64Button = screen.getByRole('button', { name: 'linux/amd64' });
  expect(linuxAmd64Button).toBeInTheDocument();
  await userEvent.click(linuxAmd64Button);

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeDisabled();
});

test('Selecting one platform only calls buildImage once with the selected platform, make sure that it has a name', async () => {
  // Auto select amd64
  vi.mocked(window.getOsArch).mockResolvedValue('amd64');
  setup();
  await waitRender();

  vi.mocked(window.pathRelative).mockResolvedValue('containerfile');
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
    expect.anything(),
    undefined,
    true,
  );
});

test('Expect Abort button to hidden when image build is not in progress', async () => {
  setup();
  render(BuildImageFromContainerfile);

  const abortButton = screen.queryByRole('button', { name: 'Cancel' });
  expect(abortButton).not.toBeInTheDocument();
});

test('Expect Abort button to being visible when image build is in progress', async () => {
  // Auto select amd64
  vi.mocked(window.getOsArch).mockResolvedValue('amd64');
  let resolveCallback: (value?: unknown) => void = () => {};
  vi.mocked(window.buildImage).mockResolvedValue(new Promise(resolve => (resolveCallback = resolve)));
  setup();
  await waitRender();

  vi.mocked(window.pathRelative).mockResolvedValue('containerfile');
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

  await waitFor(() => {
    const abortButton = screen.getByRole('button', { name: 'Cancel' });
    expect(abortButton).toBeInTheDocument();
    expect(abortButton).toBeEnabled();
  });
  resolveCallback();
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

test('Expect build page to load a state for a build requested by taskId', async () => {
  let onDataCallbacksBuildImageId = 0;
  const onDataCallbacksBuildImage = new Map<
    number,
    (key: symbol, eventName: 'finish' | 'stream' | 'error', data: string) => void
  >();
  const onDataCallbacksBuildImageKeys = new Map<number, symbol>();
  const buildImagePromiseCallbacks = new Map<
    number,
    { resolve: (value: unknown) => void; reject: (value: unknown) => void }
  >();
  setup();

  // mock window.buildImage to simulate multiple builds are running
  vi.mocked(window.buildImage).mockImplementation(
    async (
      _containerBuildContextDirectory: string,
      _relativeContainerfilePath: string,
      _imageName: string | undefined,
      _platform: string,
      _selectedProvider: ProviderContainerConnectionInfo,
      key: symbol,
      eventCollect: (key: symbol, eventName: 'finish' | 'stream' | 'error', data: string) => void,
      _cancellableTokenId?: number,
      _buildargs?: { [key: string]: string },
      _taskId?: number,
    ) => {
      onDataCallbacksBuildImageId++;
      onDataCallbacksBuildImage.set(onDataCallbacksBuildImageId, eventCollect);
      onDataCallbacksBuildImageKeys.set(onDataCallbacksBuildImageId, key);
      return new Promise((resolve, reject) => {
        buildImagePromiseCallbacks.set(onDataCallbacksBuildImageId, { resolve, reject });
      });
    },
  );

  let rendering = render(BuildImageFromContainerfile);
  let containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  let buildFolder = screen.getByRole('textbox', { name: 'Build context directory' });

  let containerImageName = screen.getByRole('textbox', { name: 'Image name' });
  await userEvent.type(containerImageName, 'foobar');

  // Expect to be able to build fine with the build arguments / no errors.
  let buildButton = screen.getByRole('button', { name: 'Build' });
  await userEvent.click(buildButton);
  await tick();
  await waitFor(() => {
    expect(containerFilePath).not.toBeVisible();
  });

  // unmount the page
  rendering.unmount();

  // render the page again like it was requested from Images page
  rendering = render(BuildImageFromContainerfile);

  containerFilePath = rendering.getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeVisible();
  await userEvent.type(containerFilePath, '/somepath1/containerfile1');

  buildFolder = rendering.getByRole('textbox', { name: 'Build context directory' });
  expect(buildFolder).toBeVisible();

  containerImageName = rendering.getByRole('textbox', { name: 'Image name' });
  expect(containerImageName).toBeVisible();
  await userEvent.type(containerImageName, 'foobar1');

  // Expect to be able to build fine with the build arguments / no errors.
  buildButton = rendering.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeVisible();
  expect(buildButton).toBeEnabled();

  await userEvent.click(buildButton);

  expect(onDataCallbacksBuildImageId).equals(2);
  expect(onDataCallbacksBuildImage).toHaveLength(2);
  expect(onDataCallbacksBuildImageKeys).toHaveLength(2);

  await waitFor(() => expect(get(buildImagesInfo).size).equals(2));

  let cancelButton = rendering.getByRole('button', { name: 'Cancel' });

  expect(containerFilePath).not.toBeVisible();
  expect(buildFolder).not.toBeVisible();
  expect(containerImageName).not.toBeVisible();
  expect(buildButton).not.toBeVisible();
  expect(cancelButton).toBeVisible();

  await userEvent.click(cancelButton);

  buildButton = rendering.getByRole('button', { name: 'Build' });

  expect(containerFilePath).toBeVisible();
  expect(buildFolder).toBeVisible();
  expect(containerImageName).toBeVisible();
  expect(buildButton).toBeVisible();
  expect(cancelButton).not.toBeVisible();

  //
  await rendering.rerender({ taskId: getNextTaskId() - 2 });

  await waitFor(() => {
    expect(containerFilePath).not.toBeVisible();
    expect(buildFolder).not.toBeVisible();
    expect(containerImageName).not.toBeVisible();
    expect(buildButton).not.toBeVisible();
  });

  cancelButton = rendering.getByRole('button', { name: 'Cancel' });

  expect(cancelButton).toBeVisible();

  buildImagePromiseCallbacks.get(1)?.resolve(undefined);

  await waitFor(() => {
    buildButton = rendering.getByRole('button', { name: 'Build' });
    expect(buildButton).toBeVisible();
  });

  expect(containerFilePath).toBeVisible();
  expect(buildFolder).toBeVisible();
  expect(containerImageName).toBeVisible();

  buildButton = rendering.getByRole('button', { name: 'Build' });

  expect(buildButton).toBeVisible();
  expect(cancelButton).not.toBeVisible();

  expect(containerFilePath).toHaveValue('/somepath/containerfile');
  expect(buildFolder).toHaveValue('/somepath');
  expect(containerImageName).toHaveValue('foobar');
});

test('Expect error to be displayed if uppercase character in image name', async () => {
  setup();
  const { getByRole, getByLabelText, getByText } = render(BuildImageFromContainerfile, {});

  const containerFilePath = getByRole('textbox', { name: 'Containerfile path' });
  expect(containerFilePath).toBeInTheDocument();
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildFolder = getByRole('textbox', { name: 'Build context directory' });
  expect(buildFolder).toBeInTheDocument();
  await userEvent.type(buildFolder, '/somepath');

  // Get the input field by its associated label text
  const imageNameInput = getByLabelText('Image name');

  // Simulate user typing an image name with an uppercase character
  await userEvent.type(imageNameInput, 'gpuTest');

  // Check that the specific error message is now visible
  const errorMessage = getByText('Image name should be lowercase');
  expect(errorMessage).toBeInTheDocument();

  // Verify the build button is still disabled
  const buildButton = getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeDisabled();
});

describe('Build image that has an intermediate target', () => {
  test.each([
    { target: 'custom-target', expected: 'custom-target' },
    { target: 'default (no target)', expected: undefined },
  ])('should build with target $target', async ({ target, expected }) => {
    vi.mocked(window.containerfileGetInfo).mockResolvedValue({
      targets: ['custom-target'],
    });
    vi.mocked(window.getOsArch).mockResolvedValue('amd64');
    setup();

    const { getByRole } = await waitRender();

    vi.mocked(window.pathRelative).mockResolvedValue('containerfile');
    const containerFilePath = getByRole('textbox', { name: 'Containerfile path' });
    await userEvent.type(containerFilePath, '/somepath/containerfile');

    const imageName = getByRole('textbox', { name: 'Image name' });
    await userEvent.type(imageName, 'foobar');

    const targetDropdown = getByRole('button', { name: 'Target' });
    await userEvent.click(targetDropdown);

    await userEvent.click(getByRole('button', { name: target }));

    const buildButton = getByRole('button', { name: 'Build' });
    expect(buildButton).toBeEnabled();
    await userEvent.click(buildButton);

    expect(window.buildImage).toHaveBeenCalledTimes(1);
    expect(window.buildImage).toHaveBeenCalledWith(
      '/somepath',
      'containerfile',
      'foobar',
      'linux/amd64',
      expect.anything(),
      expect.anything(),
      expect.anything(),
      expect.anything(),
      {},
      expect.anything(),
      expected,
      true,
    );
  });
});

test('Expect to have a checkbox on by default to validate registries before building an images', async () => {
  setup();
  render(BuildImageFromContainerfile, {});

  const validateRegistriesCheckbox = screen.getByRole('checkbox', { name: 'validate registries' });

  expect(validateRegistriesCheckbox).toBeChecked();

  await userEvent.click(validateRegistriesCheckbox);

  expect(validateRegistriesCheckbox).not.toBeChecked();

  vi.mocked(window.pathRelative).mockResolvedValue('containerfile');
  const containerFilePath = screen.getByRole('textbox', { name: 'Containerfile path' });
  await userEvent.type(containerFilePath, '/somepath/containerfile');

  const buildButton = screen.getByRole('button', { name: 'Build' });
  expect(buildButton).toBeInTheDocument();
  expect(buildButton).toBeEnabled();

  await userEvent.click(buildButton);

  expect(window.buildImage).toHaveBeenCalledTimes(1);
  expect(window.buildImage).toHaveBeenCalledWith(
    '/somepath',
    'containerfile',
    expect.anything(),
    'linux/amd64',
    expect.anything(),
    expect.anything(),
    expect.anything(),
    expect.anything(),
    {},
    expect.anything(),
    undefined,
    false,
  );
});
