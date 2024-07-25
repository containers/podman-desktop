/**********************************************************************
 * Copyright (C) 2023,2024 Red Hat, Inc.
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

import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { expect, test, vi } from 'vitest';

import Link from './Link.svelte';

test('Check link styling', async () => {
  render(Link);

  // check for one element of the styling
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();
  expect(link).toHaveClass('text-[var(--pd-link)]');
  expect(link).toHaveClass('hover:bg-[var(--pd-link-hover-bg)]');
  expect(link).toHaveClass('cursor-pointer');
});

test('Check icon styling', async () => {
  render(Link, { icon: faRocket });

  // check for the fa SVG child
  const link = screen.getByRole('link', { hidden: true });
  expect(link).toBeInTheDocument();
  const img = within(link).getByRole('img', { hidden: true });
  expect(img).toBeInTheDocument();
  expect(img).toHaveClass('svelte-fa');
});

test('Check on:click action', async () => {
  const clickMock = vi.fn();
  render(Link, { onclick: clickMock });

  // check on:click
  const link = screen.getByRole('link');
  expect(link).toBeInTheDocument();
  expect(clickMock).not.toHaveBeenCalled();

  await fireEvent.click(link);

  expect(clickMock).toBeCalledTimes(1);
});
