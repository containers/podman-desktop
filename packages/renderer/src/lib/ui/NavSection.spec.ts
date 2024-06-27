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

import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import NavSection from './NavSection.svelte';
import NavSectionTest from './NavSectionTest.svelte';

beforeAll(() => {
  // Mock the animate function
  HTMLElement.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  });
});

test('Expect correct button and tooltip', async () => {
  const tooltip = 'Desktop';
  render(NavSection, { tooltip: tooltip });

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass('inline-block');
  expect(button).toHaveClass('flex');
  expect(button).toHaveClass('flex-col');
  expect(button).toHaveClass('justify-center');
  expect(button).toHaveClass('items-center');
  expect(button).toHaveClass('text-[var(--pd-global-nav-icon)]');
  expect(button).toHaveClass('hover:text-[var(--pd-global-nav-icon-hover)]');
  const tip = button.children[0];
  expect(tip).toBeInTheDocument();
  expect(within(button).queryByText(tooltip)).toBeInTheDocument();
});

test('Expect section is open by default', async () => {
  render(NavSectionTest);

  const content = screen.queryByLabelText('Item1');
  expect(content).toBeInTheDocument();

  const icon = screen.queryByTestId('icon');
  expect(icon).not.toBeInTheDocument();
});

test('Expect button expands and contracts', async () => {
  render(NavSectionTest);

  const button = screen.getByRole('button');
  expect(button).toBeInTheDocument();

  const expand = screen.getByTestId('expand');
  expect(expand).toBeInTheDocument();
  expect(expand.textContent).toEqual('true');

  await userEvent.click(button);
  expect(expand.textContent).toEqual('false');

  await userEvent.click(button);
  expect(expand.textContent).toEqual('true');
});
