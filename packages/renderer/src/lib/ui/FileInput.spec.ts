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
import * as svelte from 'svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import FileInput from './FileInput.svelte';

const openDialogMock = vi.fn();
const dispatchMock = vi.fn();

beforeAll(() => {
  (window as any).openDialog = openDialogMock;
});

test('Expect clicking the button opens file dialog', async () => {
  openDialogMock.mockResolvedValue({ canceled: true });

  render(FileInput, {});

  const browseButton = screen.getByRole('button');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  expect(openDialogMock).toHaveBeenCalled();
});

test('Expect value to change when selecting via file dialog', async () => {
  vi.spyOn(svelte, 'createEventDispatcher').mockReturnValue(dispatchMock);
  const filename = 'somefile';
  openDialogMock.mockResolvedValue([filename]);

  render(FileInput, {});

  const browseButton = screen.getByRole('button');
  expect(browseButton).toBeInTheDocument();
  await userEvent.click(browseButton);

  expect(openDialogMock).toHaveBeenCalled();

  const input = screen.getByRole('textbox');
  expect(input).toBeInTheDocument();
  expect(input).toHaveValue(filename);

  expect(dispatchMock).toHaveBeenCalledWith('change', filename);
});
