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

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';

import BuildImageFromContainerfileCard from '/@/lib/image/BuildImageFromContainerfileCard.svelte';

test('check click', async () => {
  const component = render(BuildImageFromContainerfileCard, {
    title: 'ARM64',
    badge: 'arm64',
    isDefault: false,
    checked: false,
    value: 'arm64',
    icon: undefined,
  });

  const events: { mode: string; value: string }[] = [];

  component.component.$on('card', (e: any) => {
    events.push(e.detail);
  });

  // expect checkbox is unchecked
  expect(screen.getByRole('checkbox')).not.toBeChecked();

  expect(events).toEqual([]);

  // click on the card and expect to be checked
  await userEvent.click(screen.getByRole('button'));

  expect(events).toEqual([{ mode: 'add', value: 'arm64' }]);
});

test('Expect checked', async () => {
  render(BuildImageFromContainerfileCard, {
    title: 'ARM64',
    badge: 'arm64',
    isDefault: false,
    checked: true,
    value: 'arm64',
    icon: undefined,
  });

  // expect checkbox is unchecked
  expect(screen.getByRole('checkbox')).toBeChecked();
});

test('Expect default tooltip', async () => {
  render(BuildImageFromContainerfileCard, {
    title: 'ARM64',
    badge: 'arm64',
    isDefault: true,
    checked: true,
    value: 'arm64',
    icon: undefined,
  });

  // check we have a div tooltip with aria-label tooltip
  const tooltip = screen.getByText('Default platform of your computer');
  expect(tooltip).toBeInTheDocument();
});

test('check we can add a new card', async () => {
  const component = render(BuildImageFromContainerfileCard, {
    title: '',
    badge: '',
    isDefault: false,
    checked: false,
    value: '',
    icon: undefined,
    additionalItem: true,
  });

  const addCards: { value: string }[] = [];

  component.component.$on('addcard', (e: any) => {
    addCards.push(e.detail);
  });

  expect(addCards).toEqual([]);

  // click on the card and expect to be checked
  await userEvent.click(screen.getByRole('button'));

  // add new name on the input field
  await userEvent.type(screen.getByRole('textbox'), 'my/platform{enter}');

  expect(addCards).toEqual([{ value: 'my/platform' }]);
});
