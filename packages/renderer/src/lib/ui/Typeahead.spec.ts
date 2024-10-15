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

import { render, screen, within } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { expect, test } from 'vitest';

import Typeahead from './Typeahead.svelte';

window.HTMLElement.prototype.scrollIntoView = function () {};

function assertIsListVisible(visible: boolean): void {
  // eslint-disable-next-line sonarjs/no-selector-parameter
  if (visible) {
    const list = screen.getByRole('row');
    expect(list).toBeDefined();
  } else {
    const list = screen.queryByRole('row');
    expect(list).toBeNull();
  }
}

function assertItemSelected(items: HTMLElement[], r: number): void {
  for (let i = 0; i < items.length; i++) {
    if (i === r) {
      expect(items[i]).toHaveClass('bg-[var(--pd-content-card-hover-bg)]');
    } else {
      expect(items[i]).not.toHaveClass('bg-[var(--pd-content-card-hover-bg)]');
    }
  }
}

test('a textbox is created', async () => {
  render(Typeahead);

  const input = screen.getByRole('textbox');
  expect(input).toBeDefined();
});

test('placeholder is set', async () => {
  render(Typeahead, {
    placeholder: 'a placeholder',
  });

  const input = screen.getByPlaceholderText('a placeholder');
  expect(input).toBeDefined();
});

test('initial focus is not set by default', async () => {
  render(Typeahead);

  const input = screen.getByRole('textbox');
  expect(input).not.toHaveFocus();
});

test('initial focus is set with option', async () => {
  render(Typeahead, {
    initialFocus: true,
  });

  const input = screen.getByRole('textbox');
  expect(input).toHaveFocus();
});

test('should list the result after the delay, and display spinner during loading', async () => {
  const searchFunction = async (s: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return [s + '01', s + '02', s + '03'];
  };
  render(Typeahead, {
    initialFocus: true,
    searchFunction,
    delay: 10,
  });

  const input = screen.getByRole('textbox');
  assertIsListVisible(false);

  await userEvent.type(input, 'aze');

  await new Promise(resolve => setTimeout(resolve, 5));
  assertIsListVisible(false);
  await new Promise(resolve => setTimeout(resolve, 10));
  tick();
  screen.getByRole('progressbar');

  await new Promise(resolve => setTimeout(resolve, 100));
  expect(screen.queryByRole('progressbar')).toBeNull();
  assertIsListVisible(true);

  const list = screen.getByRole('row');
  const items = within(list).getAllByRole('button');
  expect(items.length).toBe(3);
  within(list).getByText('aze01');
  within(list).getByText('aze02');
  within(list).getByText('aze03');
});

test('should navigate in list with keys', async () => {
  const searchFunction = async (s: string) => {
    const result: string[] = [];
    for (let i = 1; i <= 15; i++) {
      result.push(s + `${i}`.padStart(2, '0'));
    }
    return result;
  };
  render(Typeahead, {
    initialFocus: true,
    searchFunction,
    delay: 10,
  });
  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'term');

  await new Promise(resolve => setTimeout(resolve, 11));

  let list = screen.getByRole('row');
  let items = within(list).getAllByRole('button');
  expect(items.length).toBe(15);

  // No item is selected first
  assertItemSelected(items, -1);
  screen.getByDisplayValue('term');

  await userEvent.keyboard('[ArrowDown]');
  assertItemSelected(items, 0);
  screen.getByDisplayValue('term01');

  await userEvent.keyboard('[ArrowDown]');
  assertItemSelected(items, 1);
  screen.getByDisplayValue('term02');

  await userEvent.keyboard('[PageDown]');
  assertItemSelected(items, 11);
  screen.getByDisplayValue('term12');

  await userEvent.keyboard('[PageDown]');
  assertItemSelected(items, 14);
  screen.getByDisplayValue('term15');

  await userEvent.keyboard('[ArrowUp]');
  await userEvent.keyboard('[ArrowUp]');
  await userEvent.keyboard('[ArrowUp]');
  await userEvent.keyboard('[ArrowUp]');
  await userEvent.keyboard('[ArrowUp]');
  assertItemSelected(items, 9);
  screen.getByDisplayValue('term10');

  await userEvent.keyboard('[PageUp]');
  assertItemSelected(items, 0);
  screen.getByDisplayValue('term01');

  // Close the list when pressing Up at top of the list
  await userEvent.keyboard('[ArrowUp]');
  assertIsListVisible(false);
  screen.getByDisplayValue('term');

  // Down opens the list again, no item selected
  await userEvent.keyboard('[ArrowDown]');
  assertIsListVisible(true);

  list = screen.getByRole('row');
  items = within(list).getAllByRole('button');
  assertItemSelected(items, -1);
  screen.getByDisplayValue('term');

  await userEvent.keyboard('[ArrowDown]');
  assertItemSelected(items, 0);
  screen.getByDisplayValue('term01');

  await userEvent.keyboard('[ArrowDown]');
  await userEvent.keyboard('[ArrowDown]');
  assertItemSelected(items, 2);
  screen.getByDisplayValue('term03');
  // Select an item by pressing Enter
  await userEvent.keyboard('[Enter]');
  // closes the list
  assertIsListVisible(false);
  // copies the item in the input
  screen.getByDisplayValue('term03');
});
