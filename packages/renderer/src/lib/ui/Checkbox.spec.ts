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

/* eslint-disable @typescript-eslint/no-explicit-any */

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import Checkbox from './Checkbox.svelte';

function getPeer(checkbox: HTMLElement) {
  return checkbox.parentElement?.children[1];
}

test('Basic check', async () => {
  render(Checkbox);

  // check element exists and is enabled
  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeInTheDocument();
  expect(checkbox).toBeEnabled();
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
