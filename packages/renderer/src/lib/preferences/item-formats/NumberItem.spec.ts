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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { afterEach, expect, test, vi } from 'vitest';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import NumberItem from './NumberItem.svelte';

afterEach(() => {
  vi.useRealTimers();
});

test('Expect tooltip if value input is invalid', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 10,
    maximum: 34,
  };
  const value = 12;
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('5');

  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toContain('The value cannot be less than 10');
});

test('Expect decrement button disabled if value is less than minimum', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 0;
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('decrement');
  expect(input).toBeInTheDocument();
  expect(input).toBeDisabled();
});

test('Expect increment button disabled if value is less than minimum', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 35;
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('increment');
  expect(input).toBeInTheDocument();
  expect(input).toBeDisabled();
});

test('Expect increment button only works one if maximum value is reached after one click', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 33;
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('increment');
  expect(input).toBeInTheDocument();
  expect(input).toBeEnabled();
  await userEvent.click(input);

  expect(input).toBeDisabled();
});

test('Expect decrement button only works one if minimum value is reached after one click', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  const value = 2;
  render(NumberItem, { record, value });

  const input = screen.getByLabelText('decrement');
  expect(input).toBeInTheDocument();
  expect(input).toBeEnabled();
  await userEvent.click(input);

  expect(input).toBeDisabled();
});

test('Expect zero value set correctly', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: -1,
    maximum: 34,
  };
  const onChange = vi.fn();
  const value = 1;
  render(NumberItem, { record, value, onChange });

  const input = screen.getByLabelText('decrement');
  expect(input).toBeInTheDocument();
  await userEvent.click(input);
  vi.advanceTimersByTime(510);
  expect(onChange).toHaveBeenCalledWith('record', 0);
});

test('Expect onChange is not triggered in case of error on validation', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 20,
  };
  const onChange = vi.fn();
  const value = 1;
  render(NumberItem, { record, value, onChange });

  const input = screen.getByRole('textbox', { name: 'record-description' });
  expect(input).toBeInTheDocument();

  // enter the text 0
  await userEvent.type(input, '0');

  // 10 is a valid value, so the onChange should be called
  await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith('record', 10));

  // reset the number of calls
  onChange.mockClear();

  // enter again 0, it will be 100 and outside of the scope
  await userEvent.type(input, '0');
  // then we should not have any onChange call
  await vi.waitFor(() => expect(onChange).not.toHaveBeenCalled());

  // remove the 00 by sending delete 2 times backspace key
  await userEvent.keyboard('{backspace}{backspace}');

  // then we should have the onChange call to be 1
  await vi.waitFor(() => expect(onChange).toHaveBeenCalledWith('record', 1));
});
