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

import { NavigationPage } from '@desktop-framework/api';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import ImageActions from '/@/lib/image/ImageActions.svelte';
import type { ImageInfoUI } from '/@/lib/image/ImageInfoUI';
import { handleNavigation } from '/@/navigation';

import { ImageUtils } from './image-utils';

const getContributedMenusMock = vi.fn();

vi.mock(import('/@/navigation'));
vi.mock(import('./image-utils'));
vi.mock(import('/@/lib/dialogs/messagebox-utils'), () => ({
  withConfirmation: vi.fn(),
}));

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
beforeAll(() => {
  Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserver });

  Object.defineProperty(window, 'getContributedMenus', { value: getContributedMenusMock });
  Object.defineProperty(window, 'hasAuthconfigForImage', {
    value: vi.fn().mockResolvedValue(false),
  });
});

const fakedImage: ImageInfoUI = {
  id: 'dummy',
  name: 'dummy',
} as unknown as ImageInfoUI;

class Image {
  #status: string;
  constructor(
    public name: string,
    initialStatus: string,
  ) {
    this.#status = initialStatus;
  }

  set status(status: string) {
    this.#status = status;
  }

  get status(): string {
    return this.#status;
  }
}

beforeEach(() => {
  vi.resetAllMocks();

  vi.mocked(ImageUtils.prototype.deleteImage).mockRejectedValue(new Error('Cannot delete image in test'));
  vi.mocked(ImageUtils.prototype.updateImages).mockResolvedValue([
    { imageRef: 'dummy:latest', updated: true, status: 'updated', message: 'Image updated successfully' },
  ]);
});

test('Expect error dialog with correct message when image deletion fails', async () => {
  vi.mocked(withConfirmation).mockImplementation(f => f());
  vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Dismiss' });
  getContributedMenusMock.mockResolvedValue([]);

  const image: ImageInfoUI = new Image('dummy', 'UNUSED') as unknown as ImageInfoUI;

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image,
  });
  const button = screen.getByTitle('Delete Image');
  expect(button).toBeDefined();
  await fireEvent.click(button);

  await waitFor(() => {
    expect(window.showMessageBox).toHaveBeenCalledOnce();
  });

  expect(window.showMessageBox).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Delete Image Failed',
      message: 'Error while deleting image: Cannot delete image in test',
      type: 'error',
    }),
  );

  expect(image.status).toBe('DELETING');
});

test('Expect no dropdown when one contribution and dropdownMenu off', async () => {
  // Since we only have one contribution, we do not use a dropdown
  getContributedMenusMock.mockImplementation(_context =>
    Promise.resolve([{ command: 'valid-command', title: 'dummy-contrib' }]),
  );

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image: fakedImage,
    dropdownMenu: false,
    detailed: true,
    groupContributions: true,
  });

  expect(getContributedMenusMock).toHaveBeenCalled();

  await waitFor(() => {
    const div = screen.getByTitle('dummy-contrib').parentElement;
    expect(div).toBeDefined();
    expect(div?.classList).toHaveLength(0);
  });
});

test('Expect contribution in dropdown when several contributions and dropdownMenu off', async () => {
  // Since we have more than one contribution we group them in a dropdown
  getContributedMenusMock.mockImplementation(_context =>
    Promise.resolve([
      { command: 'valid-command', title: 'dummy-contrib' },
      { command: 'valid-command-2', title: 'dummy-contrib-2' },
    ]),
  );

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image: fakedImage,
    dropdownMenu: false,
    detailed: true,
    groupContributions: true,
  });

  expect(getContributedMenusMock).toHaveBeenCalled();

  await waitFor(() => {
    const button = screen.getByLabelText('kebab menu');
    expect(button).toBeDefined();
    expect(button.parentElement).toBeDefined();
    expect(button.parentElement?.classList?.length).toBeGreaterThan(0);
  });
});

test('Expect no dropdown when several contributions and dropdownMenu mode on', async () => {
  // Simulate with multiple contributions
  getContributedMenusMock.mockImplementation(_context =>
    Promise.resolve([
      { command: 'valid-command', title: 'dummy-contrib' },
      { command: 'valid-command-2', title: 'dummy-contrib-2' },
    ]),
  );

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image: fakedImage,
    dropdownMenu: true, // We are showing all actions in a Dropdown
    detailed: true,
    groupContributions: false, // we do not group them since we are in a dropdown
  });

  expect(getContributedMenusMock).toHaveBeenCalled();

  await fireEvent.click(screen.getByLabelText('kebab menu'));

  await waitFor(async () => {
    const button = screen.getByTitle('dummy-contrib');
    expect(button).toBeDefined();
    const img = within(button).getByRole('img', { hidden: true });
    expect(img).toBeDefined();
    expect(img.nodeName.toLowerCase()).toBe('svg');

    const button2 = screen.getByTitle('dummy-contrib-2');
    expect(button2).toBeDefined();
    const img2 = within(button2).getByRole('img', { hidden: true });
    expect(img2).toBeDefined();
    expect(img2.nodeName.toLowerCase()).toBe('svg');
  });
});

test('Expect Push image to be there', async () => {
  getContributedMenusMock.mockResolvedValue([]);

  const image: ImageInfoUI = {
    name: 'dummy',
    status: 'UNUSED',
  } as ImageInfoUI;

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image,
  });

  const button = screen.getByTitle('Push Image');
  expect(button).toBeDefined();
});

test('Expect Save image to be there', async () => {
  getContributedMenusMock.mockResolvedValue([]);
  const goToMock = vi.spyOn(router, 'goto');

  const image: ImageInfoUI = {
    name: 'dummy',
    status: 'UNUSED',
  } as ImageInfoUI;

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image,
  });

  const button = screen.getByTitle('Save Image');
  expect(button).toBeDefined();

  await userEvent.click(button);

  expect(goToMock).toBeCalledWith('/images/save');
});

test('Expect withConfirmation to indicate image name and tag', async () => {
  getContributedMenusMock.mockResolvedValue([]);

  const image: ImageInfoUI = {
    name: 'image-name',
    status: 'UNUSED',
    tag: '1.0',
  } as ImageInfoUI;

  render(ImageActions, {
    onPushImage: vi.fn(),
    onRenameImage: vi.fn(),
    image,
  });
  const button = screen.getByTitle('Delete Image');
  expect(button).toBeDefined();
  await fireEvent.click(button);

  await waitFor(() => {
    expect(withConfirmation).toHaveBeenNthCalledWith(1, expect.anything(), 'delete image image-name:1.0', {
      title: 'Delete Image?',
      variant: 'delete',
    });
  });
});

describe('run', () => {
  const image: ImageInfoUI = {
    id: 'sha256:foobar',
    name: 'localhost/foo',
    engineId: 'podman.Podman',
    tag: 'latest',
    status: 'UNUSED',
  } as ImageInfoUI;

  beforeEach(() => {
    getContributedMenusMock.mockResolvedValue([]);
  });

  test('Expect Run image to be there', async () => {
    const { getByTitle } = render(ImageActions, {
      onPushImage: vi.fn(),
      onRenameImage: vi.fn(),
      image,
    });

    const button = getByTitle('Run Image');
    expect(button).toBeDefined();
  });

  test('Expect Run image to navigate to appropriate page', async () => {
    const { getByTitle } = render(ImageActions, {
      onPushImage: vi.fn(),
      onRenameImage: vi.fn(),
      image,
    });

    const button = getByTitle('Run Image');
    expect(button).toBeDefined();

    await fireEvent.click(button);

    await vi.waitFor(() => {
      expect(handleNavigation).toHaveBeenCalledExactlyOnceWith({
        page: NavigationPage.IMAGE_RUN,
        parameters: {
          engineId: image.engineId,
          id: image.id,
          tag: `${image.name}:${image.tag}`,
        },
      });
    });
  });
});

describe('update', () => {
  let image: ImageInfoUI;

  beforeEach(async () => {
    const { withConfirmation: confirm } = await vi.importActual<{ withConfirmation: typeof withConfirmation }>(
      '/@/lib/dialogs/messagebox-utils',
    );
    vi.mocked(withConfirmation).mockImplementation(confirm);
    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Update' });
    image = {
      id: 'sha256:abc',
      shortId: 'abc',
      name: 'image-name',
      engineId: 'podman',
      engineName: 'Podman',
      tag: '1.0',
      createdAt: 1599888000,
      age: '1 day',
      arch: 'amd64',
      size: 1024,
      humanSize: '1.02 kB',
      base64RepoTag: 'aW1hZ2UtbmFtZToxLjA=',
      selected: true,
      status: 'UNUSED',
      badges: [],
      digest: 'sha256:abc',
    };
  });

  test.each([
    { name: '<none>', status: 'UNUSED' as const, tag: '', expectEnabled: false },
    { name: '', status: 'UNUSED' as const, tag: '', expectEnabled: false },
    { name: 'image-name', status: 'USED' as const, tag: '1.0', expectEnabled: false },
    { name: 'image-name', status: 'DELETING' as const, tag: '1.0', expectEnabled: false },
    { name: 'image-name', status: 'UPDATING' as const, tag: '1.0', expectEnabled: false },
    { name: 'image-name', status: 'UNUSED' as const, tag: '1.0', expectEnabled: true },
  ])(
    'Expect Update Image button enabled=$expectEnabled for name=$name status=$status',
    async ({ name, status, tag, expectEnabled }) => {
      getContributedMenusMock.mockResolvedValue([]);

      render(ImageActions, {
        onPushImage: vi.fn(),
        onRenameImage: vi.fn(),
        image: { ...image, name, status, tag },
      });

      const button = screen.getByTitle('Update Image');
      if (expectEnabled) {
        expect(button).toBeEnabled();
      } else {
        expect(button).toBeDisabled();
        await fireEvent.click(button);
        expect(window.showMessageBox).not.toHaveBeenCalled();
        expect(ImageUtils.prototype.updateImages).not.toHaveBeenCalled();
      }
    },
  );

  test.each([
    ['USED', 'image-name', 'Cannot update an image used by a container'],
    ['DELETING', 'image-name', 'Cannot update an image being deleted'],
    ['UPDATING', 'image-name', 'Updating image'],
    ['UNUSED', '<none>', 'Cannot update an image without tags'],
    ['UNUSED', 'image-name', 'Update all tags of this image'],
  ] as const)('shows the update explanation for %s image %s', async (status, name, tooltip) => {
    getContributedMenusMock.mockResolvedValue([]);
    const { rerender } = render(ImageActions, {
      onPushImage: vi.fn(),
      onRenameImage: vi.fn(),
      image: { ...image, status, name },
    });

    const button = screen.getByRole('button', { name: 'Update Image' });
    expect(button).toHaveAttribute('title', 'Update Image');
    await fireEvent.mouseEnter(screen.getByTestId('tooltip-trigger'));
    expect(screen.getByRole('tooltip')).toHaveTextContent(tooltip);

    await rerender({ dropdownMenu: true });
    await fireEvent.click(screen.getByLabelText('kebab menu'));
    expect(screen.getByTitle(tooltip)).toHaveTextContent('Update Image');
  });

  test('Expect Update Image action to bail out when image status changes before confirmation', async () => {
    getContributedMenusMock.mockResolvedValue([]);

    vi.mocked(window.showMessageBox).mockImplementation(async () => {
      image.status = 'DELETING';
      return { response: 'Update' };
    });

    render(ImageActions, {
      onPushImage: vi.fn(),
      onRenameImage: vi.fn(),
      image,
    });

    await fireEvent.click(screen.getByTitle('Update Image'));

    expect(ImageUtils.prototype.updateImages).not.toHaveBeenCalled();
    expect(image.status).toBe('DELETING');
  });

  test('Expect Update Image confirmation and successful update', async () => {
    getContributedMenusMock.mockResolvedValue([]);

    render(ImageActions, {
      onPushImage: vi.fn(),
      onRenameImage: vi.fn(),
      image,
    });

    await fireEvent.click(screen.getByTitle('Update Image'));

    expect(withConfirmation).toHaveBeenCalledExactlyOnceWith(
      expect.any(Function),
      'update all tags of image image-name:1.0 to latest build',
      { title: 'Update Image?', buttonLabel: 'Update' },
    );
    expect(window.showMessageBox).toHaveBeenCalledExactlyOnceWith({
      title: 'Update Image?',
      message: 'Are you sure you want to update all tags of image image-name:1.0 to latest build?',
      buttons: ['Update', 'Cancel'],
      type: 'question',
    });
    await waitFor(() => expect(ImageUtils.prototype.updateImages).toHaveBeenCalledExactlyOnceWith([image]));
    expect(image.status).toBe('UNUSED');
    expect(image.selected).toBe(false);
  });

  test('does not update an image when confirmation is canceled', async () => {
    getContributedMenusMock.mockResolvedValue([]);
    vi.mocked(window.showMessageBox).mockResolvedValue({ response: 'Cancel' });

    render(ImageActions, { onPushImage: vi.fn(), onRenameImage: vi.fn(), image });
    await fireEvent.click(screen.getByTitle('Update Image'));

    expect(window.showMessageBox).toHaveBeenCalledOnce();
    expect(ImageUtils.prototype.updateImages).not.toHaveBeenCalled();
    expect(image.status).toBe('UNUSED');
    expect(image.selected).toBe(true);
  });

  test.each([new Error('Dialog unavailable'), undefined])(
    'does not update when confirmation rejects with %s',
    async error => {
      getContributedMenusMock.mockResolvedValue([]);
      vi.mocked(window.showMessageBox).mockRejectedValue(error);
      const consoleErrorSpy = vi.spyOn(console, 'error').mockReturnValue(undefined);

      render(ImageActions, { onPushImage: vi.fn(), onRenameImage: vi.fn(), image });
      await fireEvent.click(screen.getByTitle('Update Image'));

      await waitFor(() => expect(consoleErrorSpy).toHaveBeenCalledWith('Image update confirmation failed', error));
      expect(ImageUtils.prototype.updateImages).not.toHaveBeenCalled();
      expect(image.status).toBe('UNUSED');
      expect(image.selected).toBe(true);
    },
  );

  test('Expect unsuccessful Update Image result to be reported and state restored', async () => {
    getContributedMenusMock.mockResolvedValue([]);
    vi.mocked(ImageUtils.prototype.updateImages).mockResolvedValue([
      { imageRef: 'image-name:1.0', updated: false, status: 'normal', message: 'Already up to date' },
    ]);
    const consoleInfoSpy = vi.spyOn(console, 'info').mockReturnValue(undefined);

    render(ImageActions, {
      onPushImage: vi.fn(),
      onRenameImage: vi.fn(),
      image,
    });

    await fireEvent.click(screen.getByTitle('Update Image'));

    await waitFor(() => expect(consoleInfoSpy).toHaveBeenCalledWith('image-name:1.0: Already up to date'));
    expect(image.status).toBe('UNUSED');
    expect(image.selected).toBe(false);
  });

  test('handles results for every tag sharing the selected image ID', async () => {
    getContributedMenusMock.mockResolvedValue([]);
    vi.mocked(ImageUtils.prototype.updateImages).mockResolvedValue([
      { imageRef: 'image-name:1.0', updated: true, status: 'updated', message: 'Updated' },
      { imageRef: 'image-name:latest', updated: false, status: 'normal', message: 'Already up to date' },
      { imageRef: 'other-name:stable', updated: false, status: 'error', message: 'Registry unavailable' },
    ]);
    const consoleInfoSpy = vi.spyOn(console, 'info').mockReturnValue(undefined);

    render(ImageActions, { onPushImage: vi.fn(), onRenameImage: vi.fn(), image });
    await fireEvent.click(screen.getByTitle('Update Image'));

    await waitFor(() => expect(consoleInfoSpy).toHaveBeenCalledWith('image-name:latest: Already up to date'));
    expect(consoleInfoSpy).toHaveBeenCalledWith('other-name:stable: Registry unavailable');
    expect(consoleInfoSpy).toHaveBeenCalledTimes(2);
    expect(image.status).toBe('UNUSED');
    expect(image.selected).toBe(false);
  });

  test('lets the backend inspect digests when a tagged image has no UI digest', async () => {
    image.digest = undefined;
    getContributedMenusMock.mockResolvedValue([]);

    render(ImageActions, { onPushImage: vi.fn(), onRenameImage: vi.fn(), image });
    await fireEvent.click(screen.getByTitle('Update Image'));

    await waitFor(() => expect(ImageUtils.prototype.updateImages).toHaveBeenCalledExactlyOnceWith([image]));
    expect(image.status).toBe('UNUSED');
    expect(image.selected).toBe(false);
  });

  test('Expect Update Image error dialog and state restoration when update throws', async () => {
    getContributedMenusMock.mockResolvedValue([]);
    vi.mocked(ImageUtils.prototype.updateImages).mockRejectedValue(new Error('Registry unavailable'));
    vi.mocked(window.showMessageBox)
      .mockResolvedValueOnce({ response: 'Update' })
      .mockResolvedValue({ response: 'Dismiss' });

    render(ImageActions, {
      onPushImage: vi.fn(),
      onRenameImage: vi.fn(),
      image,
    });

    await fireEvent.click(screen.getByTitle('Update Image'));

    await waitFor(() =>
      expect(window.showMessageBox).toHaveBeenCalledWith({
        title: 'Image Operation Failed',
        message: 'Error while updating image: Error: Registry unavailable',
        type: 'error',
        buttons: ['Dismiss'],
      }),
    );
    expect(image.status).toBe('UNUSED');
    expect(image.selected).toBe(false);
  });
});
