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

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, beforeEach, expect, test, vi } from 'vitest';

import FileInput from './FileInput.svelte';

const openDialogMock = vi.fn();

beforeAll(() => {
  Object.defineProperty(window, 'openDialog', { value: openDialogMock });
});

beforeEach(() => {
  vi.resetAllMocks();
});

test('Expect clicking the button opens file dialog', async () => {
  openDialogMock.mockResolvedValue({ canceled: true });

  render(FileInput, {});

  const browseButton = screen.getByRole('button');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  expect(openDialogMock).toHaveBeenCalled();
});

test('Expect onChange function called with new value when selecting via file dialog', async () => {
  const filename = 'somefile';
  openDialogMock.mockResolvedValue([filename]);

  const onChangeMock = vi.fn();
  render(FileInput, { options: { title: 'title' }, onChange: onChangeMock });

  const browseButton = screen.getByRole('button');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  expect(openDialogMock).toHaveBeenCalled();

  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();
  expect(input).toHaveValue(filename);

  expect(onChangeMock).toHaveBeenCalledWith(filename);
});

test('Expect onChange function called if user types', async () => {
  const filename = 'somefile';
  const onChangeMock = vi.fn();
  render(FileInput, { options: { title: 'title' }, onChange: onChangeMock });

  const browseButton = screen.getByRole('button');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  expect(openDialogMock).toHaveBeenCalled();

  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();

  await userEvent.type(input, filename);

  expect(onChangeMock).toHaveBeenCalledWith(filename);
});

test('Expect onChange function called if user paste content', async () => {
  const filename = 'somefile';
  const onChangeMock = vi.fn();
  render(FileInput, { options: { title: 'title' }, onChange: onChangeMock });

  const browseButton = screen.getByRole('button');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  expect(openDialogMock).toHaveBeenCalled();

  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();

  await userEvent.click(input);
  await userEvent.paste(filename);

  expect(onChangeMock).toHaveBeenCalledWith(filename);
});

test('Expect input and button enabled by default', async () => {
  render(FileInput, { options: { title: 'title' } });

  expect(screen.getByRole('textbox')).not.toBeDisabled();
  expect(screen.getByRole('button')).not.toHaveAttribute('aria-disabled', 'true');
  expect(screen.queryByLabelText('error')).not.toBeInTheDocument();
});

test('Expect clicking browse does not open file dialog when disabled', async () => {
  render(FileInput, { options: { title: 'title' }, disabled: true });

  const input = screen.getByRole('textbox');
  expect(input).toBeDisabled();

  const browseButton = screen.getByRole('button');
  expect(browseButton).toHaveAttribute('aria-disabled', 'true');

  await userEvent.click(browseButton);

  expect(openDialogMock).not.toHaveBeenCalled();
});

test('Expect error message displayed when error prop is provided', async () => {
  const error = 'invalid file';
  render(FileInput, { options: { title: 'title' }, error });

  expect(screen.getByText(error)).toBeInTheDocument();
  expect(screen.getByLabelText('error')).toBeInTheDocument();
});
