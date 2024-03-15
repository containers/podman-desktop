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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { router } from 'tinro';
import { expect, test, vi } from 'vitest';

import CloseButton from '/@/lib/ui/CloseButton.svelte';

// mock the router
vi.mock('tinro', () => {
  return {
    router: {
      goto: vi.fn(),
    },
  };
});

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

  expect(button.firstChild).toBeInTheDocument();
  expect(button.firstChild).toHaveClass('svelte-fa');
});

test('Check local href action', async () => {
  const urlMock = vi.fn();
  (window as any).openExternal = urlMock;
  render(CloseButton, { href: '/Pods' });

  // check href link
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();

  fireEvent.click(button);

  expect(router.goto).toBeCalledTimes(1);
  expect(urlMock).not.toHaveBeenCalled();
});

test('Check on:click action', async () => {
  const comp = render(CloseButton);

  const clickMock = vi.fn();
  comp.component.$on('click', clickMock);

  // check on:click
  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(clickMock).not.toHaveBeenCalled();

  fireEvent.click(button);

  expect(clickMock).toBeCalledTimes(1);
});
