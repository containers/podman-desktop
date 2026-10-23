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

import { faCircleUp } from '@fortawesome/free-solid-svg-icons';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import StarIcon from '../icons/StarIcon.svelte';
import DropDownMenuItem from './DropDownMenuItem.svelte';

test('Expect custom font icon on the contributed action', async () => {
  render(DropDownMenuItem, {
    title: 'dummy-title',
    icon: 'fas fa-podman-desktop-icon-dummyIcon',
  });

  const iconItem = screen.getByRole('img', { hidden: true });
  expect(iconItem).toBeInTheDocument();
  // expect to have the podman desktop icon class
  expect(iconItem).toHaveClass('fas fa-podman-desktop-icon-dummyIcon');
});

test('Expect Font Awesome icon on the contributed action', async () => {
  render(DropDownMenuItem, {
    title: 'dummy-title',
    icon: faCircleUp,
  });

  // grab the svg element
  const svgElement = screen.getByRole('img', { hidden: true });
  expect(svgElement).toBeInTheDocument();

  // check it is a svelte-fa class
  expect(svgElement).toHaveClass('svelte-fa');
});

test('Expect tooltip is used if not empty', async () => {
  render(DropDownMenuItem, {
    title: 'dummy-title',
    tooltip: 'tooltip',
    icon: faCircleUp,
  });

  // grab the svg element
  const span = screen.getByTitle('tooltip');
  expect(span).toBeInTheDocument();
});

test('Expect font awesome icon to have class w-4 text-md', async () => {
  render(DropDownMenuItem, {
    title: 'dummy-title',
    icon: faCircleUp,
  });

  const icon = screen.getByRole('img', { hidden: true });
  expect(icon).toHaveClass('w-4 text-md');
});

test('Expect string icon to have class w-4 text-md', async () => {
  render(DropDownMenuItem, {
    title: 'dummy-title',
    icon: 'fas fa-circle-up',
  });

  const icon = screen.getByRole('img', { hidden: true });
  expect(icon).toHaveClass('w-4 text-md');
});

test('Expect component icon to have class w-4 text-md', async () => {
  render(DropDownMenuItem, {
    title: 'dummy-title',
    icon: StarIcon,
  });

  const img = screen.getByRole('img', { hidden: true });
  const imgComponent = img.firstChild;
  expect(imgComponent).toBeInTheDocument();
  expect(imgComponent).toHaveClass('w-4 text-md');
});

test('Expect the item to be a button named by its title that calls onClick', async () => {
  const onClick = vi.fn();
  render(DropDownMenuItem, { title: 'dummy-title', icon: faCircleUp, onClick });

  await userEvent.click(screen.getByRole('button', { name: 'dummy-title' }));

  expect(onClick).toHaveBeenCalledOnce();
});

test.each(['{Enter}', ' '])('Expect keyboard activation with %s to call onClick', async key => {
  const onClick = vi.fn();
  render(DropDownMenuItem, { title: 'dummy-title', icon: faCircleUp, onClick });

  await userEvent.tab();
  expect(screen.getByRole('button', { name: 'dummy-title' })).toHaveFocus();
  await userEvent.keyboard(key);

  expect(onClick).toHaveBeenCalledOnce();
});

test('Expect a disabled item to stay focusable but not call onClick', async () => {
  const onClick = vi.fn();
  render(DropDownMenuItem, { title: 'dummy-title', icon: faCircleUp, enabled: false, onClick });

  const button = screen.getByRole('button', { name: 'dummy-title' });
  expect(button).toHaveAttribute('aria-disabled', 'true');

  await userEvent.tab();
  expect(button).toHaveFocus();
  await userEvent.keyboard('{Enter}');
  await userEvent.click(button);

  expect(onClick).not.toHaveBeenCalled();
});

test('Expect a hidden item to render nothing', () => {
  render(DropDownMenuItem, { title: 'dummy-title', icon: faCircleUp, hidden: true });

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});
