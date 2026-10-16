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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import type { ImageInfoUI } from '/@/lib/image/ImageInfoUI';

import RenameImageModal from './RenameImageModal.svelte';

const imageInfo: ImageInfoUI = {
  id: 'sha256:5cdc39fa62556cfcf51e079654a95a6c45574905bce69f49ffc8ea72848612e9',
  shortId: '5cdc39fa6255',
  name: 'image-name',
  tag: 'image-tag',
  engineId: 'podman.Podman Machine',
  engineName: 'Podman',
  humanSize: '128kb',
  arch: 'amd64',
  age: '2 hours',
  selected: false,
  status: 'UNUSED',
  createdAt: 0,
  badges: [],
  base64RepoTag: 'base64RepoTag',
  size: 0,
  labels: {},
  icon: undefined,
};
const closeCallback = (): void => {};

beforeAll(() => {
  Object.defineProperty(window, 'tagImage', { value: vi.fn() });
  Object.defineProperty(window, 'deleteImage', { value: vi.fn() });
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('RenameImageModel', () => {
  test('Expect that modal has and save button displays', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const imageNameEntry = screen.getByLabelText('Image Name');
    expect(imageNameEntry).toBeInTheDocument();
    const imageTagEntry = screen.getByLabelText('Image Tag');
    expect(imageTagEntry).toBeInTheDocument();
    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
  });

  test('Expect that save button is disabled by default', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('Expect that empty image name disables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');

    const imageName = screen.getByLabelText('Image Name');
    await userEvent.click(imageName);
    await userEvent.paste('');

    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('Expect that empty image tag disables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');

    const imageTag = screen.getByLabelText('Image Tag');
    await userEvent.click(imageTag);
    await userEvent.paste('');

    expect(saveButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('Expect that valid image name enables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');

    const imageName = screen.getByLabelText('Image Name');
    await userEvent.click(imageName);
    await userEvent.paste('some-valid-name');

    expect(saveButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('Expect that valid image tag enables save button', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');

    const imageTag = screen.getByLabelText('Image Tag');
    await userEvent.click(imageTag);
    await userEvent.paste('some-valid-tag');

    expect(saveButton).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('basic images should have inputs prefill', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback: closeCallback,
    });

    const imageName: HTMLInputElement = screen.getByRole('textbox', {
      name: 'imageName',
    });
    expect(imageName.value).toBe(imageInfo.name);

    const imageTag: HTMLInputElement = screen.getByRole('textbox', {
      name: 'imageTag',
    });
    expect(imageTag.value).toBe(imageInfo.tag);
  });

  test('<none> image should not have inputs prefill', async () => {
    render(RenameImageModal, {
      imageInfoToRename: {
        ...imageInfo,
        name: '<none>',
      },
      closeCallback: closeCallback,
    });

    const imageName: HTMLInputElement = screen.getByRole('textbox', {
      name: 'imageName',
    });
    expect(imageName.value).toBe('');

    const imageTag: HTMLInputElement = screen.getByRole('textbox', {
      name: 'imageTag',
    });
    expect(imageTag.value).toBe('');
  });

  test('<none> images should not be deleted on rename', async () => {
    render(RenameImageModal, {
      imageInfoToRename: {
        ...imageInfo,
        name: '<none>',
      },
      closeCallback: closeCallback,
    });

    const saveButton = screen.getByRole('button', { name: 'Save' });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toHaveAttribute('aria-disabled', 'true');

    const imageName = screen.getByLabelText('Image Name');
    await userEvent.click(imageName);
    await userEvent.paste('random image');

    const imageTag = screen.getByLabelText('Image Tag');
    await userEvent.click(imageTag);
    await userEvent.paste('some-valid-tag');

    expect(saveButton).not.toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(saveButton);

    await vi.waitFor(() => {
      expect(window.tagImage).toHaveBeenCalledWith(imageInfo.engineId, imageInfo.id, 'random image', 'some-valid-tag');
      expect(window.deleteImage).not.toHaveBeenCalled();
    });
  });

  test('Expect error message if image name is cleared after it was initially prefilled', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback,
    });

    expect(screen.queryByText('Please enter a value')).not.toBeInTheDocument();

    const imageName = screen.getByLabelText('Image Name');
    expect((imageName as HTMLInputElement).value).toBe(imageInfo.name);

    await userEvent.clear(imageName);

    expect(await screen.findByText('Please enter a value')).toBeInTheDocument();
  });

  test('Expect error message if image tag is cleared after it was initially prefilled', async () => {
    render(RenameImageModal, {
      imageInfoToRename: imageInfo,
      closeCallback,
    });

    expect(screen.queryByText('Please enter a value')).not.toBeInTheDocument();

    const imageTag = screen.getByLabelText('Image Tag');
    expect((imageTag as HTMLInputElement).value).toBe(imageInfo.tag);

    await userEvent.clear(imageTag);

    expect(await screen.findByText('Please enter a value')).toBeInTheDocument();
  });
});
