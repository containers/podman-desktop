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
import { beforeAll, describe, expect, test, vi } from 'vitest';

import MyIcon from './IconTest.svelte';
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

test('Expect tooltip title attribute on truncated labels', async () => {
  const title = 'Very long settings section label';
  renderIt(title, '/test');

  const element = screen.getByLabelText(title);
  expect(element).toHaveAttribute('title', title);
  expect(screen.getByText(title)).not.toHaveAttribute('title');
});

test('Forwards keyboard shortcut metadata and handler to the anchor', async () => {
  const onKeyDown = vi.fn();
  render(SettingsNavItem, {
    title: 'Resources',
    href: '/test',
    ariaKeyShortcuts: 'Control+ArrowLeft Meta+ArrowLeft',
    onKeyDown,
  });

  const element = screen.getByRole('link', { name: 'Resources' });
  expect(element).toHaveAttribute('aria-keyshortcuts', 'Control+ArrowLeft Meta+ArrowLeft');
  expect(element).toHaveAttribute('title', 'Resources');
  await fireEvent.keyDown(element, { key: 'ArrowLeft', ctrlKey: true });
  expect(onKeyDown).toHaveBeenCalled();
});

test('Sanitizes invalid keyboard shortcuts', async () => {
  render(SettingsNavItem, {
    title: 'Resources',
    href: '/test',
    ariaKeyShortcuts: 'Control+ArrowLeft Invalid+Key Cmd+A',
  });

  const element = screen.getByRole('link', { name: 'Resources' });
  // Only the valid shortcut should remain
  expect(element).toHaveAttribute('aria-keyshortcuts', 'Control+ArrowLeft');
});

test('Omits aria-keyshortcuts when value is entirely invalid', async () => {
  render(SettingsNavItem, {
    title: 'Resources',
    href: '/test',
    ariaKeyShortcuts: 'Invalid+Key',
  });

  const element = screen.getByRole('link', { name: 'Resources' });
  expect(element).not.toHaveAttribute('aria-keyshortcuts');
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
  const chevronContainer = element.firstChild?.childNodes[2] as HTMLElement;
  expect(chevronContainer).toBeInTheDocument();
  expect(chevronContainer.querySelector('svg')).toBeInTheDocument();
});

test('Expect sections expand', async () => {
  const title = 'Extensions';
  const href = '/test';
  renderIt(title, href, true, true, false);

  const element = screen.getByLabelText(title);
  expect(element).toBeInTheDocument();

  const chevronContainer = element.firstChild?.childNodes[2] as HTMLElement;
  expect(chevronContainer).toBeInTheDocument();

  const chevronIcon = chevronContainer.querySelector('svg') as SVGElement;
  expect(chevronIcon).toBeInTheDocument();
  expect(chevronIcon).toHaveClass('rotate-0');

  // expand section
  await fireEvent.click(element);
  expect(chevronIcon).toHaveClass('rotate-90');
});

test('fa icon should be visible', () => {
  render(SettingsNavItem, {
    title: 'DummyTitle',
    href: '/dummy/path',
    selected: false,
    icon: faBookOpen,
  });
  const svg = screen.getByRole('img', { hidden: true });
  expect(svg).toBeInTheDocument();
});

test('svg icon should be visible', () => {
  render(SettingsNavItem, {
    title: 'DummyTitle',
    href: '/dummy/path',
    selected: false,
    icon: MyIcon,
  });
  const svg = screen.getByRole('img', { hidden: true });
  expect(svg).toBeInTheDocument();
});

describe('icon', () => {
  test('icon should be displayed on the left', () => {
    const { getByRole } = render(SettingsNavItem, {
      title: 'DummyTitle',
      href: '/dummy/path',
      selected: false,
      icon: MyIcon,
    });
    const svg = getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
    expect(svg.parentElement).toHaveClass('w-4');
  });
});

describe('iconRight', () => {
  test('iconRight with align end should be at far right', () => {
    const { getAllByRole } = render(SettingsNavItem, {
      title: 'DummyTitle',
      href: '/dummy/path',
      selected: false,
      icon: MyIcon,
      iconRight: MyIcon,
      iconRightAlign: 'end',
    });
    const svgs = getAllByRole('img', { hidden: true });
    expect(svgs).toHaveLength(2);
    // First icon (left) should be in the fixed-width left icon gutter.
    expect(svgs[0].parentElement).toHaveClass('w-4');
    // Second icon (right) should be in the fixed-width end gutter container.
    expect(svgs[1].parentElement).toHaveClass('w-3');
  });

  test('iconRight with align inline should be next to title', () => {
    const { getAllByRole } = render(SettingsNavItem, {
      title: 'DummyTitle',
      href: '/dummy/path',
      selected: false,
      icon: MyIcon,
      iconRight: MyIcon,
      iconRightAlign: 'inline',
    });
    const svgs = getAllByRole('img', { hidden: true });
    expect(svgs).toHaveLength(2);
    // Left icon should be in the fixed-width icon gutter.
    expect(svgs[0].parentElement).toHaveClass('w-4');
    // Inline right icon should stay in the title row container.
    expect(svgs[1].parentElement).toHaveClass('flex-row');
  });

  test('iconRight defaults to end alignment', () => {
    const { getAllByRole } = render(SettingsNavItem, {
      title: 'DummyTitle',
      href: '/dummy/path',
      selected: false,
      iconRight: MyIcon,
    });
    const svgs = getAllByRole('img', { hidden: true });
    expect(svgs).toHaveLength(1);
    // Icon should be in the fixed-width end gutter container.
    expect(svgs[0].parentElement).toHaveClass('w-3');
  });
});
