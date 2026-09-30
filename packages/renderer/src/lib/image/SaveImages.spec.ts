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

import type { Uri } from '@desktop-framework/extension-api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { router } from 'tinro';
import { beforeEach, expect, test, vi } from 'vitest';

import { lastPage } from '/@/stores/breadcrumb';
import { saveImagesInfo } from '/@/stores/save-images-store';

import type { ImageInfoUI } from './ImageInfoUI';
import SaveImages from './SaveImages.svelte';

const imageInfo: ImageInfoUI = {
  id: 'id',
  shortId: 'id',
  name: '<none>',
  tag: '',
  engineId: 'engine',
} as ImageInfoUI;

const imageInfo2: ImageInfoUI = {
  id: 'id2',
  shortId: 'id2',
  name: '<none>',
  tag: '',
  engineId: 'engine',
} as ImageInfoUI;

beforeEach(() => {
  vi.clearAllMocks();
});

async function waitRender(): Promise<void> {
  render(SaveImages);
  await tick();
}

test('Expect Save button is disabled if output path is not selected', async () => {
  saveImagesInfo.set([imageInfo]);
  await waitRender();

  const saveButton = screen.getByRole('button', { name: 'Save images' });
  expect(saveButton).toBeInTheDocument();
  expect(saveButton).toBeDisabled();
});

test('Expect deleteImage is not visible if page has been opened with one item', async () => {
  saveImagesInfo.set([imageInfo]);
  await waitRender();

  const deleteButton = screen.queryByRole('button', { name: 'Delete image' });
  expect(deleteButton).not.toBeInTheDocument();
});

test('Expect deleteImage is visible if page has been opened with multiple item', async () => {
  saveImagesInfo.set([imageInfo, imageInfo2]);
  await waitRender();
  const itemBeforeDelete1 = screen.getByRole('textbox', { name: 'image id' });
  expect(itemBeforeDelete1).toBeInTheDocument();
  const itemBeforeDelete2 = screen.getByRole('textbox', { name: 'image id2' });
  expect(itemBeforeDelete2).toBeInTheDocument();

  const deleteButtonImage1 = screen.getByRole('button', { name: 'Delete image id' });

  await userEvent.click(deleteButtonImage1);
  const afterDeletionImage1 = screen.queryByRole('textbox', { name: 'image id' });
  expect(afterDeletionImage1).not.toBeInTheDocument();
  const afterDeletionImage2 = screen.getByRole('textbox', { name: 'image id2' });
  expect(afterDeletionImage2).toBeInTheDocument();
});

test('Expect save button to be enabled if output target is selected and saveImages function called', async () => {
  vi.mocked(window.saveDialog).mockResolvedValue({ scheme: 'file', path: '/tmp/my/path' } as Uri);
  vi.mocked(window.saveImages).mockResolvedValue();
  const goToMock = vi.spyOn(router, 'goto');

  saveImagesInfo.set([imageInfo]);
  await waitRender();

  const saveButton = screen.getByRole('button', { name: 'Save images' });
  expect(saveButton).toBeInTheDocument();
  expect(saveButton).toBeDisabled();

  const selectOutputPathButton = screen.getByRole('button', { name: 'Select output folder' });
  expect(selectOutputPathButton).toBeInTheDocument();

  await userEvent.click(selectOutputPathButton);

  const saveButtonAfterSelection = screen.getByRole('button', { name: 'Save images' });
  expect(saveButtonAfterSelection).toBeInTheDocument();
  expect(saveButtonAfterSelection).toBeEnabled();

  await userEvent.click(saveButtonAfterSelection);

  expect(vi.mocked(window.saveImages)).toBeCalledWith({
    images: [
      {
        id: 'id',
        engineId: 'engine',
      },
    ],
    outputTarget: '/tmp/my/path',
  });
  expect(goToMock).toBeCalledWith('/images/');
});

test('Expect saveImages function called with tagged images', async () => {
  vi.mocked(window.saveDialog).mockResolvedValue({ scheme: 'file', path: '/tmp/my/path' } as Uri);
  vi.mocked(window.saveImages).mockResolvedValue();
  const goToMock = vi.spyOn(router, 'goto');

  // default tag (latest)
  const imageInfo1: ImageInfoUI = {
    id: 'id1',
    shortId: 'id1',
    tag: 'latest',
    name: 'quay.io/podman/hello',
    engineId: 'engine',
  } as ImageInfoUI;

  // no tag
  const imageInfo2: ImageInfoUI = {
    id: 'id2',
    shortId: 'id2',
    tag: 'latest',
    name: '<none>',
    engineId: 'engine',
  } as ImageInfoUI;
  // custom tag (not latest)
  const imageInfo3: ImageInfoUI = {
    id: 'id3',
    shortId: 'id3',
    tag: '123',
    name: 'quay.io/podman/hello',
    engineId: 'engine',
  } as ImageInfoUI;

  saveImagesInfo.set([imageInfo1, imageInfo2, imageInfo3]);
  await waitRender();

  const selectOutputPathButton = screen.getByRole('button', { name: 'Select output folder' });
  expect(selectOutputPathButton).toBeInTheDocument();

  await userEvent.click(selectOutputPathButton);

  const saveButton = screen.getByRole('button', { name: 'Save images' });
  expect(saveButton).toBeInTheDocument();
  expect(saveButton).toBeEnabled();

  await userEvent.click(saveButton);

  expect(vi.mocked(window.saveImages)).toBeCalledWith({
    images: [
      {
        id: 'quay.io/podman/hello:latest',
        engineId: 'engine',
      },
      {
        id: 'id2',
        engineId: 'engine',
      },
      {
        id: 'quay.io/podman/hello:123',
        engineId: 'engine',
      },
    ],
    outputTarget: '/tmp/my/path',
  });
  expect(goToMock).toBeCalledWith('/images/');
});

test('Expect error message dispayed if saveImages fails', async () => {
  vi.mocked(window.saveDialog).mockResolvedValue({ scheme: 'file', path: '/tmp/my/path' } as Uri);
  vi.mocked(window.saveImages).mockRejectedValue('error while saving');
  const goToMock = vi.spyOn(router, 'goto');

  saveImagesInfo.set([imageInfo]);
  await waitRender();

  const selectOutputPathButton = screen.getByRole('button', { name: 'Select output folder' });
  expect(selectOutputPathButton).toBeInTheDocument();

  await userEvent.click(selectOutputPathButton);

  const saveButtonAfterSelection = screen.getByRole('button', { name: 'Save images' });
  expect(saveButtonAfterSelection).toBeInTheDocument();
  expect(saveButtonAfterSelection).toBeEnabled();

  await userEvent.click(saveButtonAfterSelection);

  const errorDiv = screen.getByLabelText('Error Message Content');

  expect(vi.mocked(window.saveImages)).toBeCalledWith({
    images: [
      {
        id: 'id',
        engineId: 'engine',
      },
    ],
    outputTarget: '/tmp/my/path',
  });
  expect(goToMock).not.toBeCalled();
  expect(errorDiv).toBeInTheDocument();
  expect((errorDiv as HTMLDivElement).innerHTML).toContain('error while saving');
});

test('Expect display correctly images to save', async () => {
  saveImagesInfo.set([
    {
      id: 'id1',
      shortId: 'id1',
      name: '<none>',
      tag: '',
      engineId: 'engine',
    },
    {
      id: 'httpdid2',
      shortId: 'httpdid2',
      name: 'httpd',
      tag: 'latest',
      engineId: 'engine',
    },
    {
      id: 'httpdid3',
      shortId: 'httpdid3',
      name: 'httpd',
      tag: '1.2.3',
      engineId: 'engine',
    },
  ] as ImageInfoUI[]);
  await waitRender();

  // now expect to see the images with the correct names
  // grap all input fields
  const noImageName = screen.getByRole('textbox', { name: 'image id1' });
  expect(noImageName).toBeInTheDocument();
  const inputHttpdWithCustomTag = screen.getByRole('textbox', { name: 'image httpd:1.2.3' });
  expect(inputHttpdWithCustomTag).toBeInTheDocument();
  const inputHttpdWithDefaultTag = screen.getByRole('textbox', { name: 'image httpd:latest' });
  expect(inputHttpdWithDefaultTag).toBeInTheDocument();
});

test('Expect images with same ID but different tags to render without duplicate key error', async () => {
  // This tests the scenario where the same image has multiple tags (e.g., alpine:latest and alpine:2.6)
  // Both share the same image ID but have different tags
  const sharedImageId = 'sha256:e738dfbe7a10356ea998e8acc7493c0bfae5ed919ad7eb99550ab60d7f47e214';
  saveImagesInfo.set([
    {
      id: sharedImageId,
      shortId: 'e738dfbe7a10',
      name: 'docker.io/library/alpine',
      tag: 'latest',
      engineId: 'podman.podman-machine-default',
    },
    {
      id: sharedImageId,
      shortId: 'e738dfbe7a10',
      name: 'docker.io/library/alpine',
      tag: '2.6',
      engineId: 'podman.podman-machine-default',
    },
  ] as ImageInfoUI[]);
  await waitRender();

  // Both images should be displayed without errors
  const alpineLatest = screen.getByRole('textbox', { name: 'image docker.io/library/alpine:latest' });
  expect(alpineLatest).toBeInTheDocument();
  const alpine26 = screen.getByRole('textbox', { name: 'image docker.io/library/alpine:2.6' });
  expect(alpine26).toBeInTheDocument();
});

test('Expect images with same ID and tag but different engines to render without duplicate key error', async () => {
  // This tests the scenario where two different engines have the same image (same id+tag)
  // The composite key must include engineId to guarantee uniqueness
  const sharedImageId = 'sha256:e738dfbe7a10356ea998e8acc7493c0bfae5ed919ad7eb99550ab60d7f47e214';
  saveImagesInfo.set([
    {
      id: sharedImageId,
      shortId: 'e738dfbe7a10',
      name: 'docker.io/library/alpine',
      tag: 'latest',
      engineId: 'podman.podman-machine-default',
    },
    {
      id: sharedImageId,
      shortId: 'e738dfbe7a10',
      name: 'docker.io/library/alpine',
      tag: 'latest',
      engineId: 'docker.docker-desktop',
    },
  ] as ImageInfoUI[]);
  await waitRender();

  // Both images should be displayed without errors - query all with same name since they have identical display names
  const alpineImages = screen.getAllByRole('textbox', { name: 'image docker.io/library/alpine:latest' });
  expect(alpineImages).toHaveLength(2);
});

test('Expect Close button to navigate to last page when clicked', async () => {
  saveImagesInfo.set([imageInfo]);
  lastPage.set({ name: 'Images', path: '/images' });
  const goToMock = vi.spyOn(router, 'goto');
  await waitRender();

  const closeButtons = screen.getAllByRole('button', { name: 'Close' });
  expect(closeButtons.length).toBe(2);
  // Click the last Close button (the one in the ButtonRow)
  await userEvent.click(closeButtons[1]);

  expect(goToMock).toHaveBeenCalledWith('/images');
});
