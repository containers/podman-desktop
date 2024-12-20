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

import type { ProviderStatus } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { providerInfos } from '/@/stores/providers';
import { recommendedRegistries } from '/@/stores/recommendedRegistries';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import PullImage from './PullImage.svelte';

const pullImageMock = vi.fn();
const resolveShortnameImageMock = vi.fn();
const listImageTagsInRegistryMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window.events as unknown) = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    receive: (_channel: string, func: any) => {
      func();
    },
  };
  (window as any).telemetryPage = vi.fn().mockResolvedValue(undefined);
  (window as any).getConfigurationValue = vi.fn().mockResolvedValue(undefined);
  (window as any).matchMedia = vi.fn().mockReturnValue({
    addListener: vi.fn(),
  });
  (window as any).pullImage = pullImageMock;
  (window as any).resolveShortnameImage = resolveShortnameImageMock.mockResolvedValue(['docker.io/test1']);
  (window as any).listImageTagsInRegistry = listImageTagsInRegistryMock;

  Object.defineProperty(window, 'matchMedia', {
    value: () => {
      return {
        matches: false,
        addListener: () => {},
        removeListener: () => {},
      };
    },
  });
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

const buttonText = 'Pull image';

// the pull image page expects to have a valid provider connection, so let's mock one
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

describe('PullImage', () => {
  test('Expect that textbox is available and button is displayed', async () => {
    setup();
    render(PullImage);

    const entry = screen.getByPlaceholderText('Image name');
    expect(entry).toBeInTheDocument();
    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('Expect that whitespace does not enable button', async () => {
    setup();
    render(PullImage, { imageToPull: '   ' });

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('Expect that valid entry enables button', async () => {
    setup();
    render(PullImage, { imageToPull: 'some-valid-image' });

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('Expect that valid entry enables button after user input', async () => {
    setup();
    render(PullImage);

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    const textbox = screen.getByRole('textbox', { name: 'Image to Pull' });
    await userEvent.click(textbox);
    await userEvent.paste('some-valid-image');

    expect(button).toBeEnabled();
  });

  test('Expect that action is displayed', async () => {
    setup();
    render(PullImage);

    const regButton = 'Manage registries';
    const button = screen.getByRole('button', { name: regButton });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('Expect that pull image is reporting an error', async () => {
    setup();
    render(PullImage, { imageToPull: 'image-does-not-exist' });

    // first call to pull image throw an error
    pullImageMock.mockRejectedValueOnce(new Error('Image does not exists'));

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    // expect that the error message is displayed
    const errorMesssage = screen.getByRole('alert', { name: 'Error Message Content' });
    expect(errorMesssage).toBeInTheDocument();
    expect(errorMesssage).toHaveTextContent('Image does not exists');
  });

  test('Expect that focus is in `Image to Pull` field after page is opened', async () => {
    setup();
    render(PullImage);

    const pullImageInput = screen.getByRole('textbox', { name: 'Image to Pull' });
    expect(pullImageInput.matches(':focus')).toBe(true);
  });

  test('Expect that you can type an image name and hit Enter', async () => {
    setup();
    render(PullImage);

    // first call to pull image throw an error
    pullImageMock.mockRejectedValueOnce(new Error('Image does not exists'));

    await userEvent.keyboard('image-does-not-exist[Enter]');

    // expect that the error message is displayed
    const errorMesssage = screen.getByRole('alert', { name: 'Error Message Content' });
    expect(errorMesssage).toBeInTheDocument();
    expect(errorMesssage).toHaveTextContent('Image does not exists');
  });

  // pull image with error and then pull image with success
  // error message should not be displayed anymore
  test('Expect that pull image is reporting an error only if invalid', async () => {
    setup();
    const renderResult = render(PullImage, { imageToPull: 'image-does-not-exist' });

    // first call to pull image throw an error
    pullImageMock.mockRejectedValueOnce(new Error('Image does not exists'));

    // next one are ok
    pullImageMock.mockResolvedValueOnce({});

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    // expect that the error message is displayed
    const errorMesssage = screen.getByRole('alert', { name: 'Error Message Content' });
    expect(errorMesssage).toBeInTheDocument();
    expect(errorMesssage).toHaveTextContent('Image does not exists');

    // ok, now choose a valid image name
    await renderResult.rerender({ imageToPull: 'some-valid-image' });

    // pull image again
    const pullImagebutton2 = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton2);

    // expect that the error message is not displayed
    expect(errorMesssage).not.toBeInTheDocument();
  });

  test('Expect that pull image is suggesting an extension in case of matching error', async () => {
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

    render(PullImage, { imageToPull: 'my.registry.com/image-to-pull' });

    // first call to pull image throw an error
    pullImageMock.mockRejectedValueOnce(new Error('Image does not exists'));

    // next one are ok
    pullImageMock.mockResolvedValueOnce({});

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    // check to see the proposal to install the extension
    const proposal = screen.getByRole('button', { name: 'Install myExtension.id Extension' });
    expect(proposal).toBeInTheDocument();
    expect(proposal).toBeEnabled();
  });
});

test('Expect if no docker.io shortname to use Podman FQN', async () => {
  resolveShortnameImageMock.mockResolvedValue(['someregistry/test1']);
  setup();
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to Pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1');

  expect(resolveShortnameImageMock).toBeCalled();
  await tick();
  const FQNButton = screen.getByRole('checkbox', { name: 'Use Podman FQN' });

  await userEvent.click(FQNButton);
  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);

  const imageName = pullImageMock.mock.calls[0][1];
  expect(imageName).toBe('someregistry/test1');
});

test('Expect if no docker.io shortname but checkbox not checked to use docker hub', async () => {
  resolveShortnameImageMock.mockResolvedValue(['someregistry/test1']);
  setup();
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to Pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1');

  expect(resolveShortnameImageMock).toBeCalled();
  await tick();

  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);

  const imageName = pullImageMock.mock.calls[0][1];
  expect(imageName).toBe('docker.io/test1');
});

test('Expect if docker.io shortname exists to not use Podman FQN', async () => {
  resolveShortnameImageMock.mockResolvedValue(['someregistry/test1', 'docker.io/test1']);
  setup();
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to Pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1');

  expect(resolveShortnameImageMock).toBeCalled();
  await tick();
  expect(screen.queryByRole('checkbox', { name: 'Use Podman FQN' })).not.toBeInTheDocument();

  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);

  const imageName = pullImageMock.mock.calls[0][1];
  expect(imageName).toBe('test1');
});

test('Expect not to check not shortname images', async () => {
  setup();
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to Pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1/');

  expect(resolveShortnameImageMock).not.toBeCalled();
});

test('Expect latest tag warning is displayed when the image does not have latest tag', async () => {
  setup();
  render(PullImage);

  listImageTagsInRegistryMock.mockResolvedValue(['other']);
  await userEvent.keyboard('my-registry/image-without-latest[Enter]');

  // expect that the warning message is displayed
  const errorMesssage = screen.getByRole('alert', { name: 'Warning Message Content' });
  expect(errorMesssage).toBeInTheDocument();
  expect(errorMesssage).toHaveTextContent('"latest" tag not found');
});

test('Expect latest tag warning is not displayed when the image has latest tag', async () => {
  setup();
  render(PullImage);

  listImageTagsInRegistryMock.mockResolvedValue(['latest', 'other']);
  await userEvent.keyboard('my-registry/image-without-latest[Enter]');

  // expect that the warning message is not displayed
  const errorMesssage = screen.queryByRole('alert', { name: 'Warning Message Content' });
  expect(errorMesssage).toBeNull();
});

test('input component should not raise an error when the input is valid', async () => {
  setup();
  const pullImage = render(PullImage);

  listImageTagsInRegistryMock.mockResolvedValue(['latest', 'other']);
  await userEvent.keyboard('my-registry/image');

  const cellOutsideInput = pullImage.getAllByRole('textbox');
  const parentInput = cellOutsideInput[0].parentElement;
  expect(parentInput).not.toHaveClass('border-b-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).not.toHaveClass('focus-within:border-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).toHaveClass('hover:border-b-[var(--pd-input-field-hover-stroke)]');
});

test('input component should raise an error when the input is not valid', async () => {
  setup();
  const pullImage = render(PullImage);

  listImageTagsInRegistryMock.mockResolvedValue({});
  await userEvent.keyboard('my-registry/image');

  const cellOutsideInput = pullImage.getAllByRole('textbox');
  const parentInput = cellOutsideInput[0].parentElement;
  expect(parentInput).toHaveClass('border-b-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).toHaveClass('focus-within:border-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).not.toHaveClass('hover:border-b-[var(--pd-input-field-hover-stroke)]');
});

test('input component should raise an error when the input is not valid - error', async () => {
  setup();
  const pullImage = render(PullImage);

  listImageTagsInRegistryMock.mockImplementation(() => {
    throw Error('Error msg');
  });
  await userEvent.keyboard('my-registry/image');

  const cellOutsideInput = pullImage.getAllByRole('textbox');
  const parentInput = cellOutsideInput[0].parentElement;
  expect(parentInput).toHaveClass('border-b-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).toHaveClass('focus-within:border-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).not.toHaveClass('hover:border-b-[var(--pd-input-field-hover-stroke)]');
});
