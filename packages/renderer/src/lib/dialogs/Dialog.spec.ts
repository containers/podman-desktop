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

import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import Dialog from './Dialog.svelte';

test('dialog should be visible and have basic styling', async () => {
  const title = 'A dialog';
  render(Dialog, { title: title });

  const close = screen.getByLabelText('close');
  expect(close).toBeDefined();
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeDefined();

  const titleElem = screen.getByText(title);
  expect(titleElem).toBeDefined();
  expect(titleElem).toHaveClass('grow');
  expect(titleElem).toHaveClass('text-lg ');
  expect(titleElem).toHaveClass('font-bold');
  expect(titleElem).toHaveClass('capitalize');
  expect(titleElem.parentElement).toHaveClass('text-[var(--pd-modal-header-text)]');
});

test('bg click should trigger close event', async () => {
  const closeMock = vi.fn();
  render(Dialog, { title: 'A dialog', onclose: closeMock });

  const bg = screen.getByLabelText('close');
  await fireEvent.click(bg);

  expect(closeMock).toHaveBeenCalled();
});

test('Escape key should trigger close', async () => {
  const closeMock = vi.fn();
  render(Dialog, { title: 'A dialog', onclose: closeMock });

  await userEvent.keyboard('{Escape}');
  expect(closeMock).toHaveBeenCalled();
});
