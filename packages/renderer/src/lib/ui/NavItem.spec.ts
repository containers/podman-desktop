/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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

import { fireEvent, render, screen } from '@testing-library/svelte';
import type { HTMLAnchorAttributes, MouseEventHandler } from 'svelte/elements';
import type { TinroRouteMeta } from 'tinro';
import { describe, expect, test } from 'vitest';

import NavItem from './NavItem.svelte';
import NavItemTest from './NavItemTest.svelte';

interface RenderOptions extends Omit<HTMLAnchorAttributes, 'href' | 'onclick'> {
  tooltip: string;
  href: string;
  meta: Pick<TinroRouteMeta, 'url'>;
  ariaLabel?: string;
  expanded?: boolean;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

function renderIt(options: RenderOptions): void {
  render(NavItem, { ...options, meta: options.meta as TinroRouteMeta });
}

test('Expect correct role and href', async () => {
  const tooltip = 'Dashboard';
  const href = '/test';
  renderIt({ tooltip, href, meta: { url: href } });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('href', href);
  expect(element).toHaveClass('focus-visible:outline-2');
  expect(element).toHaveClass('focus-visible:-outline-offset-2');
  expect(element).toHaveClass('focus-visible:outline-[var(--pd-global-nav-icon-selected-highlight)]');
});

test('Expect class to be appended to the default classes', () => {
  const tooltip = 'Dashboard';
  renderIt({ tooltip, href: '/test', meta: { url: '/test' }, class: 'custom-nav-item' });

  const element = screen.getByLabelText(tooltip);
  expect(element).toHaveClass('custom-nav-item');
  expect(element).toHaveClass('focus-visible:outline-2');
});

test('Expect no undefined class when class is not provided', () => {
  const tooltip = 'Dashboard';
  renderIt({ tooltip, href: '/test', meta: { url: '/test' } });

  const element = screen.getByLabelText(tooltip);
  expect(element.className).not.toContain('undefined');
});

test('forwards aria-keyshortcuts to the link', () => {
  const href = '/test';
  renderIt({
    tooltip: 'Dashboard',
    href,
    meta: { url: href } as TinroRouteMeta,
    'aria-keyshortcuts': 'Control+ArrowUp',
  });

  const link = screen.getByRole('link', { name: 'Dashboard' });
  expect(link).toHaveAttribute('aria-keyshortcuts', 'Control+ArrowUp');
});

test('does not add aria-keyshortcuts when it is not provided', () => {
  renderIt({ tooltip: 'Dashboard', href: '/test', meta: { url: '/test' } as TinroRouteMeta });

  expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-keyshortcuts');
});

test('prefers ariaLabel prop over a spread aria-label attribute', () => {
  renderIt({
    tooltip: 'Dashboard',
    href: '/test',
    meta: { url: '/test' } as TinroRouteMeta,
    ariaLabel: 'Navigation dashboard',
    'aria-label': 'Spread label',
  });

  expect(screen.getByRole('link', { name: 'Navigation dashboard' })).toHaveAttribute(
    'aria-label',
    'Navigation dashboard',
  );
});

describe('title', () => {
  test('forwards title to the link when expanded', () => {
    renderIt({ tooltip: 'Dashboard', href: '/test', meta: { url: '/test' }, expanded: true, title: 'Hold to reorder' });

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('title', 'Hold to reorder');
  });

  test('does not add title to the link when it is not provided', () => {
    renderIt({ tooltip: 'Dashboard', href: '/test', meta: { url: '/test' }, expanded: true });

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('title');
  });

  test('does not add title to the link when collapsed', () => {
    renderIt({
      tooltip: 'Dashboard',
      href: '/test',
      meta: { url: '/test' },
      expanded: false,
      title: 'Hold to reorder',
    });

    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('title');
  });
});

test('Expect selection styling', async () => {
  const tooltip = 'Dashboard';
  const href = '/test';
  renderIt({ tooltip, href, meta: { url: href } });

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
  renderIt({ tooltip, href, meta: { url: '/test%20page' } });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
});

test('Expect selection styling for sub-pages', async () => {
  const tooltip = 'Settings';
  const href = '/prefs/resources';
  renderIt({ tooltip, href, meta: { url: '/prefs/resources' } });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
});

test('Expect not to have selection styling', async () => {
  const tooltip = 'Dashboard';
  renderIt({ tooltip, href: '/test', meta: { url: '/elsewhere' } });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('border-l-[var(--pd-global-nav-bg)]');
  expect(element.firstChild).toHaveClass('hover:bg-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).toHaveClass('hover:border-l-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
});

test('Expect in-section styling', async () => {
  const tooltip = 'Dashboard';
  render(NavItemTest);

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element.firstChild).toBeInTheDocument();
  expect(element.firstChild).toHaveClass('px-2.5');
  expect(element.firstChild).toHaveClass('hover:bg-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).not.toHaveClass('border-[var(--pd-global-nav-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-icon-selected-highlight)]');
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
  expect(element.firstChild).toHaveClass('px-2.5');
  expect(element.firstChild).toHaveClass('hover:text-[color:var(--pd-global-nav-icon-hover)]');
  expect(element.firstChild).toHaveClass('hover:bg-[var(--pd-global-nav-icon-hover-bg)]');
  expect(element.firstChild).not.toHaveClass('border-l-[var(--pd-global-nav-bg)]');
});

test('Expect that having an onClick handler overrides href and works', async () => {
  const tooltip = 'Settings';
  let clicked = false;
  const onClick = (): void => {
    clicked = true;
  };
  renderIt({ tooltip, href: '/test', meta: { url: '/test' }, onClick });

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

  const result = render(NavItem, { counter, tooltip, href, meta: { url: '/test' } as TinroRouteMeta });

  const element = screen.getByLabelText(tooltip);
  expect(element).toBeInTheDocument();
  expect(element).toHaveAttribute('href', '/href');

  // unmount
  result.unmount();

  // ok now update the counter
  counter = 4;

  // check tooltip is working if counter is updated
  render(NavItem, { counter, tooltip, href, meta: { url: '/test' } as TinroRouteMeta });

  // get div with label tooltip
  const element2 = screen.getByLabelText('Foo');
  expect(element2).toBeInTheDocument();

  const tooltipTrigger = screen.getByTestId('tooltip-trigger');
  await fireEvent.mouseEnter(tooltipTrigger);

  const tooltipContent = await screen.findByText(/Foo \(4\)/);
  expect(tooltipContent).toBeInTheDocument();
});
