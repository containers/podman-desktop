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

import { faBookOpen } from '@fortawesome/free-solid-svg-icons';
import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import SettingsNavItem from './SettingsNavItem.svelte';

function renderIt(title: string, href: string, selected?: boolean, section?: boolean, child?: boolean): void {
  render(SettingsNavItem, { title: title, href: href, selected: selected, section: section, child: child });
}

beforeAll(() => {
  // Mock the animate function
  HTMLElement.prototype.animate = vi.fn().mockReturnValue({
    finished: Promise.resolve(),
    cancel: vi.fn(),
  });
});

test('Expect correct role and href', async () => {
  const title = 'Resources';
  const href = '/test';
  renderIt(title, href, true);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('href', href);
});

test('Expect selection styling', async () => {
  const title = 'Resources';
  const href = '/test';
  renderIt(title, href, true);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-[var(--pd-secondary-nav-selected-highlight)]');
});

test('Expect not to have selection styling', async () => {
  const title = 'Resources';
  renderIt(title, '/test', false);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).not.toHaveClass('border-[var(--pd-secondary-nav-selected-highlight)]');
  expect(element.firstChild).toHaveClass('border-[var(--pd-secondary-nav-bg)]');
});

test('Expect child styling', async () => {
  const title = 'Resources';
  const href = '/test';
  renderIt(title, href, true, false, true);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('leading-none');
});

test('Expect section styling', async () => {
  const title = 'Extensions';
  const href = '/test';
  renderIt(title, href, true, true, false);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild?.childNodes[2]).toBeInTheDocument();
  expect(element.firstChild?.childNodes[2].firstChild).toBeInTheDocument();
  expect(element.firstChild?.childNodes[2].firstChild).toHaveClass('fas');
});

test('Expect sections expand', async () => {
  const title = 'Extensions';
  const href = '/test';
  renderIt(title, href, true, true, false);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild?.childNodes[2]).toBeInTheDocument();
  expect(element.firstChild?.childNodes[2]).toContainHTML('fa-angle-right');
  expect(element.firstChild?.childNodes[2]).not.toContainHTML('fa-angle-down');

  await fireEvent.click(element);

  // since it is animated, we'll test that the down angle has appeared (and
  // not wait for right angle to disappear)
  expect(element.firstChild?.childNodes[2]).toContainHTML('fa-angle-down');
});

test('icon should be visible', () => {
  render(SettingsNavItem, {
    title: 'DummyTitle',
    href: '/dummy/path',
    selected: false,
    icon: faBookOpen,
  });
  const svg = screen.getByRole('img', { hidden: true });
  expect(svg).toBeInTheDocument();
});
