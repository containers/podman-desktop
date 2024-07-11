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
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import BuildImageFromContainerfileCard from '/@/lib/image/BuildImageFromContainerfileCard.svelte';

test('check click', async () => {
  const onCardMock = vi.fn().mockImplementation((value: { mode: string; value: string }) => {
    events.push(value);
  });

  render(BuildImageFromContainerfileCard, {
    title: 'ARM64',
    badge: 'arm64',
    isDefault: false,
    checked: false,
    value: 'arm64',
    icon: undefined,
    onCard: onCardMock,
  });

  const events: { mode: string; value: string }[] = [];

  // expect checkbox is unchecked
  expect(screen.getByRole('checkbox')).not.toBeChecked();

  expect(events).toEqual([]);

  // click on the card and expect to be checked
  await fireEvent.click(screen.getByRole('button'));

  // wait 500ms
  await new Promise(r => setTimeout(r, 100));

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
  const onAddcardMock = vi.fn().mockImplementation((obj: { value: string }) => {
    addCards.push(obj);
  });

  render(BuildImageFromContainerfileCard, {
    title: '',
    badge: '',
    isDefault: false,
    checked: false,
    value: '',
    icon: undefined,
    additionalItem: true,
    onAddcard: onAddcardMock,
  });

  const addCards: { value: string }[] = [];

  expect(addCards).toEqual([]);

  // click on the card and expect to be checked
  await userEvent.click(screen.getByRole('button'));

  // add new name on the input field
  await userEvent.type(screen.getByRole('textbox'), 'my/platform{enter}');

  expect(addCards).toEqual([{ value: 'my/platform' }]);
});
