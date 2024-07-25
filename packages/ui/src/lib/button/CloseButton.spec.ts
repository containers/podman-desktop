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

import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import CloseButton from './CloseButton.svelte';

test('Check button styling', async () => {
  render(CloseButton);

  // check for one element of the styling
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('text-gray-800');
  expect(button).toHaveClass('hover:bg-white');
  expect(button).toHaveClass('hover:bg-opacity-10');
  expect(button).toHaveClass('transition-all');
  expect(button).toHaveClass('rounded-[4px]');
  expect(button).toHaveClass('p-1');
  expect(button).toHaveClass('no-underline');
  expect(button).toHaveClass('cursor-pointer');

  const img = within(button).getByRole('img', { hidden: true });
  expect(img).toBeInTheDocument();
  expect(img).toHaveClass('svelte-fa');
});

test('Check on:click action', async () => {
  const clickMock = vi.fn();
  const comp = render(CloseButton);
  comp.container.onclick = clickMock;

  // check on:click
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(clickMock).not.toHaveBeenCalled();

  await fireEvent.click(button);

  expect(clickMock).toBeCalled();
});
