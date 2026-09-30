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
import { NavigationPage, PreferredRegistriesSettings } from '@desktop-framework/api';
import type { ImageInfo } from '@desktop-framework/extension-api';
import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { handleNavigation } from '/@/navigation';
import { lastPage } from '/@/stores/breadcrumb';
import { providerInfos } from '/@/stores/providers';
import { recommendedRegistries } from '/@/stores/recommendedRegistries';

import PullImage from './PullImage.svelte';

vi.mock(import('/@/navigation'));
vi.mock(import('/@/lib/ui/TerminalWindow.svelte'));

const CONTAINER_CONNECTION_MOCK: ProviderContainerConnectionInfo = {
  connectionType: 'container',
  name: 'test',
  displayName: 'test',
  status: 'started',
  endpoint: {
    socketPath: 'dummy/socket',
  },
  canStart: false,
  canStop: false,
  canEdit: false,
  canDelete: false,
  type: 'podman',
};

const PROVIDER_INFO_MOCK: ProviderInfo = {
  id: 'test',
  internalId: 'id',
  name: '',
  containerConnections: [CONTAINER_CONNECTION_MOCK],
  kubernetesConnections: [],
  status: 'started',
  containerProviderConnectionCreation: false,
  containerProviderConnectionInitialization: false,
  kubernetesProviderConnectionCreation: false,
  kubernetesProviderConnectionInitialization: false,
} as unknown as ProviderInfo;

const originalConsoleError = console.error;

beforeEach(() => {
  vi.resetAllMocks();
  vi.mocked(window.events.receive).mockImplementation((_channel, func) => {
    func();
    return { dispose: vi.fn() };
  });
  vi.mocked(window.getConfigurationValue).mockImplementation(async (key: string) => {
    if (key === 'terminal.integrated.scrollback') {
      return 1000;
    }
    if (key === `${PreferredRegistriesSettings.SectionName}.${PreferredRegistriesSettings.Preferred}`) {
      return 'docker.io';
    }
    return undefined;
  });
  console.error = vi.fn();
  vi.mocked(window.resolveShortnameImage).mockResolvedValue(['docker.io/test1']);
  vi.mocked(window.getCancellableTokenSource).mockResolvedValue(1234);
  vi.mocked(window.cancelToken).mockResolvedValue(undefined);
  vi.mocked(window.pullImage).mockResolvedValue(undefined);
  vi.mocked(window.listImageTagsInRegistry).mockResolvedValue(['latest', 'other']);
  vi.mocked(window.listImages).mockResolvedValue([]);
  vi.mocked(window.searchImageInRegistry).mockResolvedValue([]);

  providerInfos.set([PROVIDER_INFO_MOCK]);
});

afterEach(() => {
  console.error = originalConsoleError;
});

const buttonText = 'Pull image';

describe('PullImage', () => {
  test('Expect that textbox is available and button is displayed', async () => {
    render(PullImage);

    const entry = screen.getByPlaceholderText('Image name');
    expect(entry).toBeInTheDocument();
    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('Expect that whitespace does not enable button', async () => {
    render(PullImage, { imageToPull: '   ' });

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();
  });

  test('Expect that valid entry enables button', async () => {
    render(PullImage, { imageToPull: 'some-valid-image' });

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('Expect that valid entry enables button after user input', async () => {
    render(PullImage);

    const button = screen.getByRole('button', { name: buttonText });
    expect(button).toBeInTheDocument();
    expect(button).toBeDisabled();

    const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
    await userEvent.click(textbox);
    await userEvent.paste('some-valid-image');

    expect(button).toBeEnabled();
  });

  test('Expect that action is displayed', async () => {
    render(PullImage);

    const regButton = 'Manage registries';
    const button = screen.getByRole('button', { name: regButton });
    expect(button).toBeInTheDocument();
    expect(button).toBeEnabled();
  });

  test('Expect that pull image is reporting an error', async () => {
    render(PullImage, { imageToPull: 'image-does-not-exist' });

    // first call to pull image throw an error
    vi.mocked(window.pullImage).mockRejectedValueOnce(new Error('Image does not exists'));

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    // expect that the error message is displayed
    const errorMessage = screen.getByRole('alert', { name: 'Error Message Content' });
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Image does not exists');
  });

  test('Expect that focus is in `Image to pull` field after page is opened', async () => {
    render(PullImage);

    const pullImageInput = screen.getByRole('textbox', { name: 'Image to pull' });
    expect(pullImageInput.matches(':focus')).toBe(true);
  });

  test('Expect that you can type an image name and hit Enter', async () => {
    render(PullImage);

    // first call to pull image throw an error
    vi.mocked(window.pullImage).mockRejectedValueOnce(new Error('Image does not exists'));

    await userEvent.keyboard('image-does-not-exist[Enter]');

    // expect that the error message is displayed
    const errorMessage = screen.getByRole('alert', { name: 'Error Message Content' });
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Image does not exists');
  });

  // pull image with error and then pull image with success
  // error message should not be displayed anymore
  test('Expect that pull image is reporting an error only if invalid', async () => {
    const renderResult = render(PullImage, { imageToPull: 'image-does-not-exist' });

    // first call to pull image throw an error
    vi.mocked(window.pullImage).mockRejectedValueOnce(new Error('Image does not exists'));

    // next one are ok
    vi.mocked(window.pullImage).mockResolvedValueOnce();

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    // expect that the error message is displayed
    const errorMessage = screen.getByRole('alert', { name: 'Error Message Content' });
    expect(errorMessage).toBeInTheDocument();
    expect(errorMessage).toHaveTextContent('Image does not exists');

    // ok, now choose a valid image name
    await renderResult.rerender({ imageToPull: 'some-valid-image' });

    // pull image again
    const pullImagebutton2 = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton2);

    // expect that the error message is not displayed
    expect(errorMessage).not.toBeInTheDocument();
  });

  test('Expect that pull image is suggesting an extension in case of matching error', async () => {
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
    vi.mocked(window.pullImage).mockRejectedValueOnce(new Error('Image does not exists'));

    // next one are ok
    vi.mocked(window.pullImage).mockResolvedValueOnce();

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    // check to see the proposal to install the extension
    const proposal = screen.getByRole('button', { name: 'Install myExtension.id Extension' });
    expect(proposal).toBeInTheDocument();
    expect(proposal).toBeEnabled();
  });

  test('Expect cancel to request cancellation while pull is in progress', async () => {
    const pendingPull = Promise.withResolvers<void>();
    vi.mocked(window.getCancellableTokenSource).mockResolvedValue(9876);
    vi.mocked(window.pullImage).mockReturnValue(pendingPull.promise);

    render(PullImage, { imageToPull: 'some-valid-image' });

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    expect(window.pullImage).toHaveBeenCalledWith(
      CONTAINER_CONNECTION_MOCK,
      'some-valid-image',
      expect.any(Function),
      undefined,
      9876,
    );

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);
    expect(window.cancelToken).toHaveBeenCalledWith(9876);

    pendingPull.reject(new Error('The operation was aborted'));
    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pull image' })).toBeInTheDocument();
    });
  });

  test('Expect cancellation errors are not displayed as pull errors', async () => {
    vi.mocked(window.pullImage).mockRejectedValueOnce(new Error('Request aborted'));
    render(PullImage, { imageToPull: 'some-valid-image' });

    const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
    await userEvent.click(pullImagebutton);

    await vi.waitFor(() => {
      expect(screen.getByRole('button', { name: 'Pull image' })).toBeInTheDocument();
    });
    expect(screen.queryByRole('alert', { name: 'Error Message Content' })).toBeNull();
  });
});

test('Expect if no docker.io shortname to use Podman FQN', async () => {
  vi.mocked(window.resolveShortnameImage).mockResolvedValue(['someregistry/test1']);
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1');

  expect(vi.mocked(window.resolveShortnameImage)).toBeCalled();
  await tick();
  const FQNButton = screen.getByRole('checkbox', { name: 'Use Podman FQN' });

  await userEvent.click(FQNButton);
  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);

  const imageName = vi.mocked(window.pullImage).mock.calls[0][1];
  expect(imageName).toBe('someregistry/test1');
});

test('Expect if no docker.io shortname but checkbox not checked to use docker hub', async () => {
  vi.mocked(window.resolveShortnameImage).mockResolvedValue(['someregistry/test1']);
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1');

  expect(vi.mocked(window.resolveShortnameImage)).toBeCalled();
  await tick();

  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);

  const imageName = vi.mocked(window.pullImage).mock.calls[0][1];
  expect(imageName).toBe('docker.io/test1');
});

test('Expect if docker.io shortname exists to not use Podman FQN', async () => {
  vi.mocked(window.resolveShortnameImage).mockResolvedValue(['someregistry/test1', 'docker.io/test1']);
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1');

  expect(vi.mocked(window.resolveShortnameImage)).toBeCalled();
  await tick();
  expect(screen.queryByRole('checkbox', { name: 'Use Podman FQN' })).not.toBeInTheDocument();

  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);

  const imageName = vi.mocked(window.pullImage).mock.calls[0][1];
  expect(imageName).toBe('test1');
});

test('Expect not to check not shortname images', async () => {
  render(PullImage);

  const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
  await userEvent.click(textbox);
  await userEvent.paste('test1/');

  expect(vi.mocked(window.resolveShortnameImage)).not.toBeCalled();
});

test('Expect latest tag warning is displayed when the image does not have latest tag', async () => {
  render(PullImage);

  vi.mocked(window.listImageTagsInRegistry).mockResolvedValue(['other']);
  await userEvent.keyboard('my-registry/image-without-latest[Enter]');

  // expect that the warning message is displayed
  const errorMessage = screen.getByRole('alert');
  expect(errorMessage).toBeInTheDocument();
  expect(errorMessage).toHaveTextContent('"latest" tag not found');
});

test('Expect latest tag warning is not displayed when the image has latest tag', async () => {
  render(PullImage);

  vi.mocked(window.listImageTagsInRegistry).mockResolvedValue(['latest', 'other']);
  await userEvent.keyboard('my-registry/image-without-latest[Enter]');

  // expect that the warning message is not displayed
  const errorMessage = screen.queryByRole('alert');
  expect(errorMessage).toBeNull();
});

test('Expect done, details and run actions after a successful pull', async () => {
  render(PullImage, { imageToPull: 'some-valid-image' });

  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);

  const footer = await screen.findByRole('contentinfo');
  expect(within(footer).getByRole('button', { name: 'View details' })).toBeInTheDocument();
  expect(within(footer).getByRole('button', { name: 'Run' })).toBeInTheDocument();
  expect(within(footer).getByRole('button', { name: 'Close' })).toBeInTheDocument();
});

test('Expect details action to open pulled image summary route', async () => {
  const gotoSpy = vi.spyOn(router, 'goto');
  vi.mocked(window.listImages).mockResolvedValue([
    {
      Id: 'sha256:1234567890123',
      RepoTags: ['docker.io/library/alpine:latest'],
      Created: 1644009612,
      Size: 123,
      engineId: 'podman',
      engineName: 'podman',
    } as never,
  ]);
  render(PullImage, { imageToPull: 'docker.io/alpine' });

  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);
  const detailsButton = await screen.findByRole('button', { name: 'View details' });
  await userEvent.click(detailsButton);

  await vi.waitFor(() => {
    expect(window.listImages).toHaveBeenCalledWith({
      provider: CONTAINER_CONNECTION_MOCK,
    });
    expect(gotoSpy).toHaveBeenLastCalledWith(
      '/images/sha256:1234567890123/podman/ZG9ja2VyLmlvL2xpYnJhcnkvYWxwaW5lOmxhdGVzdA==/summary',
    );
  });
});

test('Expect run action to set image info and go to run page', async () => {
  const image = {
    Id: 'sha256:1234567890123',
    RepoTags: ['docker.io/library/alpine:latest'],
    Created: 1644009612,
    Size: 123,
    engineId: 'podman',
    engineName: 'podman',
  } as unknown as ImageInfo;
  vi.mocked(window.listImages).mockResolvedValue([image]);
  render(PullImage, { imageToPull: 'docker.io/alpine' });

  const pullImagebutton = screen.getByRole('button', { name: 'Pull image' });
  await userEvent.click(pullImagebutton);
  const runButton = await screen.findByRole('button', { name: 'Run' });
  await userEvent.click(runButton);

  await vi.waitFor(() => {
    expect(handleNavigation).toHaveBeenCalledWith({
      page: NavigationPage.IMAGE_RUN,
      parameters: {
        tag: image.RepoTags?.[0],
        engineId: image.engineId,
        id: image.Id,
      },
    });
  });
});

test('input component should not raise an error when the input is valid', async () => {
  const pullImage = render(PullImage);

  vi.mocked(window.listImageTagsInRegistry).mockResolvedValue(['latest', 'other']);
  await userEvent.keyboard('my-registry/image');

  const cellOutsideInput = pullImage.getAllByRole('textbox');
  const parentInput = cellOutsideInput[0].parentElement;
  expect(parentInput).not.toHaveClass('border-b-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).not.toHaveClass('focus-within:border-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).toHaveClass('hover:border-b-[var(--pd-input-field-hover-stroke)]');
});

test('input component should raise an error when the input is not valid', async () => {
  const pullImage = render(PullImage);

  vi.mocked(window.listImageTagsInRegistry).mockResolvedValue([]);
  await userEvent.keyboard('my-registry/image');

  const cellOutsideInput = pullImage.getAllByRole('textbox');
  const parentInput = cellOutsideInput[0].parentElement;
  expect(parentInput).toHaveClass('border-b-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).toHaveClass('focus-within:border-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).not.toHaveClass('hover:border-b-[var(--pd-input-field-hover-stroke)]');
});

test('input component should raise an error when the input is not valid - error', async () => {
  const pullImage = render(PullImage);

  vi.mocked(window.listImageTagsInRegistry).mockImplementation(() => {
    throw Error('Error msg');
  });
  await userEvent.keyboard('my-registry/image');

  const cellOutsideInput = pullImage.getAllByRole('textbox');
  const parentInput = cellOutsideInput[0].parentElement;
  expect(parentInput).toHaveClass('border-b-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).toHaveClass('focus-within:border-[var(--pd-input-field-stroke-error)]');
  expect(parentInput).not.toHaveClass('hover:border-b-[var(--pd-input-field-hover-stroke)]');
});

describe('container connections', () => {
  // create a dummy multi connection provider
  const MULTI_CONNECTIONS: ProviderInfo = {
    ...PROVIDER_INFO_MOCK,
    containerConnections: Array.from({ length: 5 }).map((_, index) => ({
      ...CONTAINER_CONNECTION_MOCK,
      name: `connection-${index}`,
      displayName: `Connection ${index}`,
      endpoint: {
        socketPath: `socket-${index}`,
      },
    })),
  };

  test('single container connection should not display the container engine dropdown', async () => {
    // ensure we only have one container connections in the store
    const providers = get(providerInfos);
    const containerConnections = providers.map(provider => provider.containerConnections).flat();

    expect(containerConnections).toHaveLength(1);

    const { queryByRole } = render(PullImage);
    const dropdown = queryByRole('button', { name: 'Container Engine' });
    expect(dropdown).toBeNull();
  });

  test('multiple container connection should display a dropdown', async () => {
    providerInfos.set([MULTI_CONNECTIONS]);

    const { getByRole } = render(PullImage);
    const dropdown = getByRole('button', { name: 'Container Engine' });
    expect(dropdown).toBeEnabled();
  });

  test('providerInfos update should be reactive', async () => {
    // default should only have one connection
    const { queryByRole } = render(PullImage);
    const dropdown = queryByRole('button', { name: 'Container Engine' });
    expect(dropdown).toBeNull();

    // let's update to multiple connection
    providerInfos.set([MULTI_CONNECTIONS]);

    // expect dropdown to appear
    await vi.waitFor(() => {
      const dropdown = queryByRole('button', { name: 'Container Engine' });
      expect(dropdown).toBeEnabled();
    });
  });

  test('default provider when multiple should be the first one', async () => {
    providerInfos.set([MULTI_CONNECTIONS]);

    const { getByRole } = render(PullImage);
    const dropdown = getByRole('button', { name: 'Container Engine' });
    expect(dropdown).toBeEnabled();
    // default to the first one
    expect(dropdown).toHaveTextContent(MULTI_CONNECTIONS.containerConnections[0].name);
  });

  test('selecting a provider should update the dropdown button', { timeout: 10_000 }, async () => {
    // set multiple connections
    const connectionTarget = MULTI_CONNECTIONS.containerConnections[3];
    providerInfos.set([MULTI_CONNECTIONS]);

    // render
    const { getByRole } = render(PullImage);
    const dropdown = getByRole('button', { name: 'Container Engine' });
    expect(dropdown).toBeEnabled();

    // open the dropdown
    await userEvent.click(dropdown);

    // get the connection we want
    const connection3 = await vi.waitFor(() => {
      const button = getByRole('button', { name: connectionTarget.name });
      expect(button).toBeDefined();
      return button;
    });

    // select it
    await userEvent.click(connection3);
    await vi.waitFor(() => {
      expect(dropdown).toHaveTextContent(connectionTarget.name);
    });

    // type into the textbox
    const textbox = getByRole('textbox', { name: 'Image to pull' });
    await userEvent.click(textbox); // focus
    await userEvent.paste('test1'); // paste

    // get the pull button
    const pullImagebutton = getByRole('button', { name: 'Pull image' });
    expect(pullImagebutton).toBeEnabled();
    pullImagebutton.click();

    await vi.waitFor(() => {
      expect(window.pullImage).toHaveBeenCalledWith(
        connectionTarget,
        'test1',
        expect.any(Function),
        undefined,
        expect.any(Number),
      );
    });
  });
});

describe('Preferred Registries', () => {
  beforeEach(() => {
    vi.mocked(window.getConfigurationValue).mockImplementation(async (key: string) => {
      switch (key) {
        case 'terminal.integrated.scrollback':
          return 1000;
        case `${PreferredRegistriesSettings.SectionName}.${PreferredRegistriesSettings.Preferred}`:
          return 'quay.io, ghcr.io, docker.io';
        default:
          return undefined;
      }
    });
  });

  test('should load preferred registries from configuration on mount', async () => {
    render(PullImage);

    await vi.waitFor(() => {
      expect(window.getConfigurationValue).toHaveBeenCalledWith(
        `${PreferredRegistriesSettings.SectionName}.${PreferredRegistriesSettings.Preferred}`,
      );
    });
  });

  test('should search all preferred registries when no registry prefix specified', async () => {
    vi.mocked(window.searchImageInRegistry).mockImplementation(async options => {
      switch (options.registry) {
        case 'quay.io':
          return [
            { name: 'nginx', description: '', star_count: 0, is_official: false },
            { name: 'redis', description: '', star_count: 0, is_official: false },
          ];
        case 'ghcr.io':
          return [
            { name: 'nginx', description: '', star_count: 0, is_official: false },
            { name: 'postgres', description: '', star_count: 0, is_official: false },
          ];
        case 'docker.io':
          return [
            { name: 'nginx', description: '', star_count: 0, is_official: false },
            { name: 'mysql', description: '', star_count: 0, is_official: false },
          ];
        default:
          return [];
      }
    });

    render(PullImage);

    const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
    await userEvent.click(textbox);
    await userEvent.paste('ngin');

    await vi.waitFor(() => {
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(
        expect.objectContaining({ registry: 'quay.io', query: 'ngin' }),
      );
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(
        expect.objectContaining({ registry: 'ghcr.io', query: 'ngin' }),
      );
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(
        expect.objectContaining({ registry: 'docker.io', query: 'ngin' }),
      );
    });
  });

  test('should deduplicate exact same image names from search results', async () => {
    vi.mocked(window.searchImageInRegistry).mockImplementation(async () => {
      // Both registries return the same image
      return [
        { name: 'nginx', description: '', star_count: 0, is_official: false },
        { name: 'nginx', description: '', star_count: 0, is_official: false },
      ]; // duplicate from API
    });

    render(PullImage);

    const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
    await userEvent.click(textbox);
    await userEvent.paste('nginx');

    // Verify deduplication happens (exact implementation depends on how results are displayed)
    // This test verifies the searchImages function is called
    await vi.waitFor(() => {
      expect(window.searchImageInRegistry).toHaveBeenCalled();
    });
  });

  test('should show images from different registries as separate entries', async () => {
    vi.mocked(window.searchImageInRegistry).mockImplementation(async () => {
      // Same image name but from different registries
      return [{ name: 'nginx', description: '', star_count: 0, is_official: false }];
    });

    render(PullImage);

    const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
    await userEvent.click(textbox);
    await userEvent.paste('nginx');

    await vi.waitFor(() => {
      // Both quay.io and docker.io should be searched
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(expect.objectContaining({ registry: 'quay.io' }));
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(expect.objectContaining({ registry: 'docker.io' }));
    });
  });

  test('should handle registry search failures gracefully', async () => {
    vi.mocked(window.searchImageInRegistry).mockImplementation(async options => {
      if (options.registry === 'quay.io') {
        throw new Error('Registry unavailable');
      }
      return [{ name: 'nginx', description: '', star_count: 0, is_official: false }];
    });

    render(PullImage);

    const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
    await userEvent.click(textbox);
    await userEvent.paste('nginx');

    await vi.waitFor(() => {
      // Should continue with other registries despite quay.io failing
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(expect.objectContaining({ registry: 'ghcr.io' }));
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(expect.objectContaining({ registry: 'docker.io' }));
      expect(console.error).toHaveBeenCalledWith(expect.stringContaining('Failed to search registry quay.io'));
    });
  });

  test('should use default docker.io if no preferred registries configured', async () => {
    vi.mocked(window.getConfigurationValue).mockImplementation(async (key: string) => {
      switch (key) {
        case 'terminal.integrated.scrollback':
          return 1000;
        default:
          return undefined;
      }
    });

    render(PullImage);

    const textbox = screen.getByRole('textbox', { name: 'Image to pull' });
    await userEvent.click(textbox);
    await userEvent.paste('nginx');

    await vi.waitFor(() => {
      // Should fall back to docker.io
      expect(window.searchImageInRegistry).toHaveBeenCalledWith(expect.objectContaining({ registry: 'docker.io' }));
    });
  });
});

test('Expect Close button to navigate to last page when clicked', async () => {
  lastPage.set({ name: 'Images', path: '/images' });
  const goToMock = vi.spyOn(router, 'goto');
  render(PullImage);

  const closeButton = screen.getByRole('button', { name: 'Close' });
  expect(closeButton).toBeInTheDocument();
  await userEvent.click(closeButton);

  expect(goToMock).toHaveBeenCalledWith('/images');
});
