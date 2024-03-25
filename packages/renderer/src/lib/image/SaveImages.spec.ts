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

import type { Uri } from '@podman-desktop/api';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { router } from 'tinro';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import { saveImagesInfo } from '/@/stores/save-images-store';

import type { ImageInfoUI } from './ImageInfoUI';
import SaveImages from './SaveImages.svelte';

const imageInfo: ImageInfoUI = {
  id: 'id',
  shortId: 'id',
  name: 'image 1',
  engineId: 'engine',
} as ImageInfoUI;

const imageInfo2: ImageInfoUI = {
  id: 'id2',
  shortId: 'id2',
  name: 'image 2',
  engineId: 'engine',
} as ImageInfoUI;

const saveDialogMock = vi.fn();
const saveImagesMock = vi.fn();

// fake the window.events object
beforeAll(() => {
  (window as any).saveDialog = saveDialogMock;
  (window as any).saveImages = saveImagesMock;
});

beforeEach(() => {
  vi.clearAllMocks();
});

async function waitRender(): Promise<void> {
  const result = render(SaveImages);
  // wait that result.component.$$.ctx[0] is set
  while (result.component.$$.ctx[0] === undefined) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
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

  const itemBeforeDelete = screen.getAllByLabelText('container image path');
  expect(itemBeforeDelete.length).equal(2);

  const deleteButtons = screen.getAllByLabelText('Delete image');

  await userEvent.click(deleteButtons[0]);

  const itemAfterDelete = screen.getAllByLabelText('container image path');
  expect(itemAfterDelete.length).equal(1);
  expect(itemAfterDelete.length).toBeLessThan(itemBeforeDelete.length);
});

test('Expect save button to be enabled if output target is selected and saveImages function called', async () => {
  saveDialogMock.mockResolvedValue({ scheme: 'file', path: '/tmp/my/path' } as Uri);
  saveImagesMock.mockResolvedValue('');
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

  expect(saveImagesMock).toBeCalledWith({
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

test('Expect error message dispayed if saveImages fails', async () => {
  saveDialogMock.mockResolvedValue({ scheme: 'file', path: '/tmp/my/path' } as Uri);
  saveImagesMock.mockRejectedValue('error while saving');
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

  expect(saveImagesMock).toBeCalledWith({
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
