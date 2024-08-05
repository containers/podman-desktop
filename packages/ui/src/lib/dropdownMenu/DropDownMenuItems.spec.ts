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
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

import DropDownMenuItems from './DropDownMenuItems.svelte';

class ResizeObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ResizeObserver = ResizeObserver;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).innerHeight = 500;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).innerWidth = 700;
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { value: 100 });
  Object.defineProperty(HTMLElement.prototype, 'clientWidth', { value: 100 });
});

afterEach(() => {
  vi.resetAllMocks();
});

test('Expect DropDownMenuItems to open on the above the button', async () => {
  render(DropDownMenuItems, {
    clientX: 200,
    clientY: 400,
  });
  const dropDownMenuItems = screen.getByTitle('Drop Down Menu Items', {});

  expect(dropDownMenuItems).toBeVisible();
  expect(dropDownMenuItems).toBeInTheDocument();
  expect(dropDownMenuItems).toHaveStyle('top: -100px');
});

test('Expect DropDownMenuItems to open on the under the button', async () => {
  render(DropDownMenuItems, {
    clientX: 200,
    clientY: 50,
  });
  const dropDownMenuItems = screen.getByTitle('Drop Down Menu Items', {});

  expect(dropDownMenuItems).toBeVisible();
  expect(dropDownMenuItems).toBeInTheDocument();
  expect(dropDownMenuItems).toHaveStyle('top: 20px');
});

test('Expect DropDownMenuItems to open on the right of the button', async () => {
  render(DropDownMenuItems, {
    clientX: 650,
    clientY: 200,
  });
  const dropDownMenuItems = screen.getByTitle('Drop Down Menu Items', {});

  expect(dropDownMenuItems).toBeVisible();
  expect(dropDownMenuItems).toBeInTheDocument();
  expect(dropDownMenuItems).not.toHaveClass('left-0');
  expect(dropDownMenuItems).not.toHaveClass('origin-top-left');
});

test('Expect DropDownMenuItems to open on the left of the button', async () => {
  render(DropDownMenuItems, {
    clientX: 50,
    clientY: 200,
  });
  const dropDownMenuItems = screen.getByTitle('Drop Down Menu Items', {});

  expect(dropDownMenuItems).toBeVisible();
  expect(dropDownMenuItems).toBeInTheDocument();
  expect(dropDownMenuItems).not.toHaveClass('right-0');
  expect(dropDownMenuItems).not.toHaveClass('origin-top-right');
});
