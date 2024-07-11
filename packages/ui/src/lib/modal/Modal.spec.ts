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
import { describe, expect, test, vi } from 'vitest';

import Modal from './Modal.svelte';

test('modal should be visible', async () => {
  render(Modal);

  const bg = screen.getByLabelText('close');
  expect(bg).toBeDefined();
  const dialog = screen.getByRole('dialog');
  expect(dialog).toBeDefined();
});

test('bg click should trigger close event', async () => {
  const closeMock = vi.fn();
  render(Modal, { onclose: closeMock });

  const bg = screen.getByLabelText('close');
  await fireEvent.click(bg);

  expect(closeMock).toHaveBeenCalled();
});

test('Escape key should trigger close', async () => {
  const closeMock = vi.fn();
  render(Modal, { onclose: closeMock });

  await userEvent.keyboard('{Escape}');
  expect(closeMock).toHaveBeenCalled();
});

describe('translation-y', () => {
  test('default modal should have translate-y', async () => {
    render(Modal);

    const dialog = screen.getByRole('dialog');
    expect(dialog.classList).toContain('translate-y-[-20%]');
    expect(dialog.classList).not.toContain('my-[32px]');
  });

  test('modal with top should not have translate-y', async () => {
    render(Modal, { top: true });

    const dialog = screen.getByRole('dialog');
    expect(dialog.classList).not.toContain('translate-y-[-20%]');
    // should contain margin of size status bar height
    expect(dialog.classList).toContain('my-[32px]');
  });
});
