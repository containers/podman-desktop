/**********************************************************************
 * Copyright (C) 2023-2024 Red Hat, Inc.
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
import { test, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import NavItem from './NavItem.svelte';
import NavItemTest from './NavItemTest.svelte';

function renderIt(tooltip: string, href: string, meta: any, onClick?: any): void {
  render(NavItem, { tooltip: tooltip, href: href, meta: meta, onClick: onClick });
}

test('Expect correct role and href', async () => {
  const tooltip = 'Dashboard';
  const href = '/test';
  renderIt(tooltip, href, { url: href });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('href', href);
});

test('Expect selection styling', async () => {
  const tooltip = 'Dashboard';
  const href = '/test';
  renderIt(tooltip, href, { url: href });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-purple-500');
  expect(element.firstChild).not.toHaveClass('hover:bg-charcoal-700');
  expect(element.firstChild).not.toHaveClass('hover:border-charcoal-700');
});

test('Expect selection styling for encoded URLs', async () => {
  const tooltip = 'Extensions';
  const href = '/test page';
  renderIt(tooltip, href, { url: '/test%20page' });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-purple-500');
});

test('Expect selection styling for sub-pages', async () => {
  const tooltip = 'Settings';
  const href = '/prefs/resources';
  renderIt(tooltip, href, { url: '/prefs/resources' });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-purple-500');
});

test('Expect not to have selection styling', async () => {
  const tooltip = 'Dashboard';
  renderIt(tooltip, '/test', { url: '/elsewhere' });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-charcoal-800');
  expect(element.firstChild).toHaveClass('hover:bg-charcoal-700');
  expect(element.firstChild).toHaveClass('hover:border-charcoal-700');
  expect(element.firstChild).not.toHaveClass('border-l-purple-500');
  expect(element.firstChild).not.toHaveClass('px-2');
});

test('Expect in-section styling', async () => {
  const tooltip = 'Dashboard';
  render(NavItemTest);

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('px-2');
  expect(element.firstChild).toHaveClass('hover:bg-charcoal-700');
  expect(element.firstChild).not.toHaveClass('border-charcoal-600');
  expect(element.firstChild).not.toHaveClass('border-l-purple-500');
  expect(element.firstChild).not.toHaveClass('border-l-charcoal-800');
  expect(element.firstChild).not.toHaveClass('hover:border-charcoal-700');
});
// class:hover:bg-charcoal-700="{!selected || inSection}"
// class:hover:border-charcoal-700="{!selected && !inSection}"
test('Expect in-section selection styling', async () => {
  const tooltip = 'Dashboard';
  render(NavItemTest);

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('text-purple-500');
  expect(element.firstChild).toHaveClass('px-2');
  expect(element.firstChild).toHaveClass('hover:bg-charcoal-700');
  expect(element.firstChild).not.toHaveClass('border-l-purple-500');
  expect(element.firstChild).not.toHaveClass('hover:border-charcoal-700');
});

test('Expect that having an onClick handler overrides href and works', async () => {
  const tooltip = 'Settings';
  let clicked = false;
  const onClick = () => {
    clicked = true;
  };
  renderIt(tooltip, '/test', { url: '/test' }, onClick);

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('href', '#top');

  await fireEvent.click(element);

  expect(clicked).toBe(true);
});
