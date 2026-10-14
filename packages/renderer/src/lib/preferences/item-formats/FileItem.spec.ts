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

import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import FileItem from './FileItem.svelte';

const openDialogMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
  Object.defineProperty(window, 'openDialog', { value: openDialogMock });
});

test('Ensure HTMLInputElement', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLInputElement).toBe(true);
});

test('Ensure clicking on browse invokes openDialog with default selector', async () => {
  openDialogMock.mockResolvedValue([]);
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByRole('button', { name: 'browse' });
  expect(input).toBeInTheDocument();
  await userEvent.click(input);

  expect(openDialogMock).toBeCalledWith({
    title: 'Select record-description',
    selectors: ['openFile'],
  });
});

test('Ensure clicking on browse invokes openDialog with corresponding directory selector', async () => {
  openDialogMock.mockResolvedValue([]);
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'folder',
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByRole('button', { name: 'browse' });
  expect(input).toBeInTheDocument();
  await userEvent.click(input);

  expect(openDialogMock).toBeCalledWith({
    title: 'Select record-description',
    selectors: ['openDirectory'],
  });
});

test('Ensure the onChange is called if the fileInput onChange is triggered', async () => {
  const filename = 'somefile';
  openDialogMock.mockResolvedValue([filename]);

  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };

  const onChangeMock = vi.fn().mockResolvedValue('');
  render(FileItem, { record, value: '', onChange: onChangeMock });
  const browseButton = screen.getByRole('button', { name: 'browse' });
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  expect(openDialogMock).toHaveBeenCalled();

  expect(onChangeMock).toHaveBeenCalled();
});

test('Ensure there is a clear button for the input', async () => {
  openDialogMock.mockResolvedValue([]);
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };

  render(FileItem, { record, value: '/abc/123' });
  let inputField = screen.getByLabelText('record-description');
  expect(inputField).toBeInTheDocument();
  expect((inputField as HTMLInputElement).value).toBe('/abc/123');

  const clear = screen.getByRole('button', { name: 'clear' });
  expect(clear).toBeInTheDocument();
  await userEvent.click(clear);

  inputField = screen.getByLabelText('record-description');
  expect(inputField).toBeInTheDocument();
  expect((inputField as HTMLInputElement).value).toBe('');
});

test('By default when creating, expect FileItem to be editable / NOT have readonly', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect((input as HTMLInputElement).readOnly).toBe(false);
});

test('If FileItem has readonly = true, then expect readonly to show in the element', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
    readonly: true,
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect((input as HTMLInputElement).readOnly).toBe(true);
});

test('If FileItem has locked = true, then expect readonly to show in the element', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
    locked: true,
  };

  render(FileItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect((input as HTMLInputElement).readOnly).toBe(true);
});
