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
import { expect, test } from 'vitest';

import DropDownMenuItem from './DropDownMenuItem.svelte';

test('Expect custom font icon on the contributed action', async () => {
  render(DropDownMenuItem, {
    title: 'dummy-title',
    icon: 'podman-desktop-icon-dummyIcon',
  });

  const iconItem = screen.getByRole('img', { name: 'dummy-title' });
  expect(iconItem).toBeInTheDocument();
  // expect to have the podman desktop icon class
  expect(iconItem).toHaveClass('podman-desktop-icon-dummyIcon');
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
