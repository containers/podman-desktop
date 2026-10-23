/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import DropdownMenu from './DropdownMenu.svelte';
import DropdownMenuTest from './DropdownMenuTest.svelte';

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ResizeObserver = ResizeObserver;
});

afterEach(() => {
  vi.resetAllMocks();
});

test('Expect the onBeforeToggle function to be called when the menu is clicked', async () => {
  const onBeforeToggleMock = vi.fn();
  render(DropdownMenu, {
    onBeforeToggle: onBeforeToggleMock,
  });

  const toggleMenuButton = screen.getByRole('button', { name: 'kebab menu' });
  expect(toggleMenuButton).not.toHaveClass('mr-2');
  expect(toggleMenuButton).toBeInTheDocument();
  await fireEvent.click(toggleMenuButton);

  expect(onBeforeToggleMock).toHaveBeenCalled();
});

test('Expect the detailed background style when shown as a menu action item', () => {
  render(DropdownMenu, { shownAsMenuActionItem: true });

  const toggleMenuButton = screen.getByRole('button', { name: 'kebab menu' });
  expect(toggleMenuButton).toHaveClass('bg-[var(--pd-button-detailed-bg)]');
  expect(toggleMenuButton).toHaveClass('px-3');
});

test.each(['{Enter}', ' '])('Expect keyboard selection of an item with %s to run it and close the menu', async key => {
  const onClick = vi.fn();
  render(DropdownMenuTest, { onClick });

  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'kebab menu' })).toHaveFocus();
  await userEvent.keyboard('{Enter}');

  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'Item 1' })).toHaveFocus();
  await userEvent.keyboard(key);

  expect(onClick).toHaveBeenCalledOnce();
  expect(screen.queryByRole('button', { name: 'Item 1' })).not.toBeInTheDocument();
});
