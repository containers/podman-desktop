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
import { expect, test, vi } from 'vitest';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import FloatNumberItem from './FloatNumberItem.svelte';

test('Expect tooltip if value input is NaN', async () => {
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
  render(FloatNumberItem, { record, value });

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('unknown');

  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toContain('Expecting a number');
});

test('Expect number with dot is valid but onChange is not called if dot is the last char as it is an incomplete value', async () => {
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
  const onChange = vi.fn();
  render(FloatNumberItem, { record, value, onChange });

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  await userEvent.click(input);
  await userEvent.keyboard('.');

  const tooltip = screen.queryByLabelText('tooltip');
  expect(tooltip).not.toBeInTheDocument();

  expect(onChange).not.toBeCalled();
});

test('Expect onChange to be called with float number', async () => {
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
  const onChange = vi.fn();
  render(FloatNumberItem, { record, value, onChange });

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  await userEvent.click(input);
  await userEvent.keyboard('.2');

  const tooltip = screen.queryByLabelText('tooltip');
  expect(tooltip).not.toBeInTheDocument();

  await new Promise(resolve => setTimeout(resolve, 600));

  expect(onChange).toBeCalledWith('record', 2.2);
});

test('Expect only one dot is added to input', async () => {
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
  const onChange = vi.fn();
  render(FloatNumberItem, { record, value, onChange });

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  await userEvent.click(input);
  await userEvent.keyboard('.');
  await userEvent.keyboard('.');
  await userEvent.keyboard('.');
  await userEvent.keyboard('.');
  await userEvent.keyboard('2');

  const tooltip = screen.queryByLabelText('tooltip');
  expect(tooltip).not.toBeInTheDocument();

  await new Promise(resolve => setTimeout(resolve, 600));

  expect(onChange).toBeCalledWith('record', 2.2);
});
