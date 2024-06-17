/**********************************************************************
 * Copyright (C) 2023, 2024 Red Hat, Inc.
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

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Checkbox from './Checkbox.svelte';

function getPeer(checkbox: HTMLElement): Element | undefined {
  return checkbox.parentElement?.children[0];
}

test('Basic check', async () => {
  render(Checkbox);

  // check element exists and is enabled
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();
  expect(checkbox).toBeEnabled();
  expect(checkbox).toHaveClass('top-0 left-0 w-px h-px');

  const parent = checkbox.parentElement;
  expect(parent).toBeInTheDocument();
  expect(parent).toHaveClass('relative p-2 self-start');

  const grandParent = parent?.parentElement;
  expect(grandParent).toBeInTheDocument();
  expect(grandParent).toHaveClass('flex flex-row items-center');

  const peer = getPeer(checkbox);
  expect(peer).toBeInTheDocument();
  expect(peer).toHaveClass('cursor-pointer');

  const icon = peer?.children[0];
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('text-[var(--pd-input-checkbox-unchecked)]');
  expect(icon).toHaveClass('hover:text-[var(--pd-input-checkbox-focused-unchecked)]');
});

test('Check checked state', async () => {
  render(Checkbox, { checked: true });

  // check element exists and is enabled
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();
  expect(checkbox).toBeEnabled();

  const peer = getPeer(checkbox);
  expect(peer).toBeInTheDocument();
  expect(peer).toHaveClass('cursor-pointer');

  const icon = peer?.children[0];
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('text-[var(--pd-input-checkbox-checked)]');
  expect(icon).toHaveClass('hover:text-[var(--pd-input-checkbox-focused-checked)]');
});

test('Check indeterminate state', async () => {
  render(Checkbox, { indeterminate: true });

  // check element exists and is enabled
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();
  expect(checkbox).toBeEnabled();

  const peer = getPeer(checkbox);
  expect(peer).toBeInTheDocument();
  expect(peer).toHaveClass('cursor-pointer');

  const icon = peer?.children[0];
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('text-[var(--pd-input-checkbox-indeterminate)]');
  expect(icon).toHaveClass('hover:text-[var(--pd-input-checkbox-focused-indeterminate)]');
});

test('Check disabled state', async () => {
  render(Checkbox, { disabled: true });

  // check element is disabled
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();
  expect(checkbox).toBeDisabled();

  // check the peer, since we do our own styling
  const peer = getPeer(checkbox);
  expect(peer).toBeInTheDocument();
  expect(peer).toHaveClass('cursor-not-allowed');

  const icon = peer?.children[0];
  expect(icon).toBeInTheDocument();
  expect(icon).toHaveClass('text-[var(--pd-input-checkbox-disabled)]');
});

test('Check tooltips', async () => {
  const title = 'My title';
  render(Checkbox, { title: title });

  // check for one element of the styling
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();

  // check the peer, since we do our own styling
  const peer = getPeer(checkbox);
  expect(peer).toBeInTheDocument();
  expect(peer).toHaveAttribute('title', title);
});

test('Check disabled tooltips', async () => {
  const title = 'My disabled tooltip';
  render(Checkbox, { disabled: true, disabledTooltip: title });

  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();

  // check the peer, since we do our own styling
  const peer = getPeer(checkbox);
  expect(peer).toBeInTheDocument();
  expect(peer).toHaveAttribute('title', title);
});
