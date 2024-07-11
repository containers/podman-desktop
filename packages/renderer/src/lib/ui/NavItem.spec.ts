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

import { fireEvent, render, screen } from '@testing-library/svelte';
import { expect, test } from 'vitest';

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
  expect(element.firstChild).toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
  expect(element.firstChild).not.toHaveClass('hover:bg-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).not.toHaveClass('hover:border-[var(--pd-global-nav-icon-hover-bg)]');
});

test('Expect selection styling for encoded URLs', async () => {
  const tooltip = 'Extensions';
  const href = '/test page';
  renderIt(tooltip, href, { url: '/test%20page' });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
});

test('Expect selection styling for sub-pages', async () => {
  const tooltip = 'Settings';
  const href = '/prefs/resources';
  renderIt(tooltip, href, { url: '/prefs/resources' });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
});

test('Expect not to have selection styling', async () => {
  const tooltip = 'Dashboard';
  renderIt(tooltip, '/test', { url: '/elsewhere' });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-[var(--pd-global-nav-bg)]');
  expect(element.firstChild).toHaveClass('hover:bg-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).toHaveClass('hover:border-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
  expect(element.firstChild).not.toHaveClass('px-2');
});

test('Expect in-section styling', async () => {
  const tooltip = 'Dashboard';
  render(NavItemTest);

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('px-2');
  expect(element.firstChild).toHaveClass('hover:bg-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).not.toHaveClass('border-[var(--pd-global-nav-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
  expect(element.firstChild).not.toHaveClass('hover:border-[var(--pd-global-nav-icon-hover-bg)]');
});

// class:hover:text-[color:var(--pd-global-nav-icon-hover)]="{!selected || inSection}"
// class:hover:bg-[var(--pd-global-nav-icon-hover-bg)]="{!selected || inSection}"
// class:hover:border-[var(--pd-global-nav-icon-hover-bg)]="{!selected && !inSection}">
test('Expect in-section selection styling', async () => {
  const tooltip = 'Dashboard';
  render(NavItemTest);

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('text-[color:var(--pd-global-nav-icon-selected)]');
  expect(element.firstChild).toHaveClass('px-2');
  expect(element.firstChild).toHaveClass('hover:text-[color:var(--pd-global-nav-icon-hover)]');
  expect(element.firstChild).toHaveClass('hover:bg-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-bg)]');
  expect(element.firstChild).not.toHaveClass('hover:border-[var(--pd-global-nav-icon-hover-bg)]');
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

test('Expect that counter is rendered', async () => {
  const tooltip = 'Foo';
  const href = '/href';
  let counter = 0;

  const result = render(NavItem, { counter, tooltip, href, meta: { url: '/test' } });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('href', '/href');

  // unmount
  result.unmount();

  // ok now update the counter
  counter = 4;

  // check tooltip is working if counter is updated
  render(NavItem, { counter, tooltip, href, meta: { url: '/test' } });

  // get div with label tooltip
  const element2 = screen.getByLabelText('Foo');
  expect(element2).toBeInTheDocument();

  // get text of the element
  expect(element2.textContent).toContain('Foo (4)');
});
