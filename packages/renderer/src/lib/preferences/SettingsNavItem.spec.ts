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
import { expect, test } from 'vitest';

import SettingsNavItem from './SettingsNavItem.svelte';

function renderIt(title: string, href: string, meta: any, section?: boolean, child?: boolean): void {
  render(SettingsNavItem, { title: title, href: href, meta: meta, section: section, child: child });
}

test('Expect correct role and href', async () => {
  const title = 'Resources';
  const href = '/test';
  renderIt(title, href, { url: href });

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('href', href);
});

test('Expect selection styling', async () => {
  const title = 'Resources';
  const href = '/test';
  renderIt(title, href, { url: href });

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-[var(--pd-secondary-nav-selected-highlight)]');
});

test('Expect not to have selection styling', async () => {
  const title = 'Resources';
  renderIt(title, '/test', { url: '/elsewhere' });

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).not.toHaveClass('border-[var(--pd-secondary-nav-selected-highlight)]');
  expect(element.firstChild).toHaveClass('border-[var(--pd-secondary-nav-bg)]');
});

test('Expect child styling', async () => {
  const title = 'Resources';
  const href = '/test';
  renderIt(title, href, { url: href }, false, true);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('leading-none');
});

test('Expect section styling', async () => {
  const title = 'Extensions';
  const href = '/test';
  renderIt(title, href, { url: href }, true, false);

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
  renderIt(title, href, { url: href }, true, false);

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
