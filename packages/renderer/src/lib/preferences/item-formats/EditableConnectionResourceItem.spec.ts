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

import { fireEvent } from '@testing-library/dom';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import EditableConnectionResourceItem from './EditableConnectionResourceItem.svelte';

const onSave = vi.fn();

test('Expect onSave is called with normalized value if record uses GB and input is updated', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    format: 'memory',
    minimum: 1000000000,
    maximum: 34000000000,
  };
  const value = 2000000000;
  render(EditableConnectionResourceItem, { record, value, onSave });

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  await userEvent.click(buttonEdit);

  const input = await screen.findByLabelText('record-description');
  expect(input).toBeInTheDocument();

  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('20');

  expect(onSave).toBeCalledWith('record', 20000000000);
});

test('Expect onSave NOT to be called when an invalid input is typed', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    format: 'memory',
    minimum: 1000000000,
    maximum: 34000000000,
  };
  const value = 2000000000;
  render(EditableConnectionResourceItem, { record, value, onSave });

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  await userEvent.click(buttonEdit);

  const input = await screen.findByLabelText('record-description');
  expect(input).toBeInTheDocument();

  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('35');

  expect(onSave).not.toBeCalledWith('record', 35000000000);
});

test('Expect onSave to be called with initial value if input is cancelled', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    format: 'memory',
    minimum: 1000000000,
    maximum: 34000000000,
  };
  const value = 2000000000;
  render(EditableConnectionResourceItem, { record, value, onSave });

  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();

  await userEvent.click(buttonEdit);

  const input = await screen.findByLabelText('record-description');
  expect(input).toBeInTheDocument();

  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('10');

  expect(onSave).toBeCalledWith('record', 10000000000);

  const buttonCancel = await screen.findByRole('button', { name: 'Cancel' });
  expect(buttonCancel).toBeInTheDocument();

  await userEvent.click(buttonCancel);

  expect(onSave).toBeCalledWith('record', 20000000000);
});

test('Expect input to render with the right units', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'Disk size',
    type: 'number',
    format: 'memory',
    minimum: 10000000000, // 10 GB
    maximum: 1500000000000, // 1.5 TB
  };
  const value = 10000000000; // 10 GB

  const { rerender } = render(EditableConnectionResourceItem, { record, value, onSave: onSave });
  expect(screen.getByTestId('editable-item-description')).toHaveTextContent('GB');
  expect(screen.getByTestId('editable-item-value')).toHaveTextContent('10');

  rerender({ record, value: 1000000000000, onSave: onSave });
  expect(screen.getByTestId('editable-item-description')).toHaveTextContent('TB');
  expect(screen.getByTestId('editable-item-value')).toHaveTextContent('1');

  rerender({ record, value: 1500000000000, onSave: onSave });
  expect(screen.getByTestId('editable-item-description')).toHaveTextContent('TB');
  expect(screen.getByTestId('editable-item-value')).toHaveTextContent('1.5');
});

test('Expect input to render with the right units when value is updated', async () => {
  const user = userEvent.setup();
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'Disk size',
    type: 'number',
    format: 'memory',
    minimum: 10000000000, // 10 GB
    maximum: 1500000000000, // 1.5 TB
  };
  const value = 10000000000; // 10 GB

  const onSaveMock = (recordId: string, newValue: number) => {
    rerender({ record, value: newValue, onSave: onSaveMock });
  };

  const { rerender } = render(EditableConnectionResourceItem, { record, value, onSave: onSaveMock });
  const buttonEdit = screen.getByRole('button', { name: 'Edit' });
  expect(buttonEdit).toBeInTheDocument();
  await user.click(buttonEdit);

  let input = await screen.findByLabelText('Disk size');
  expect(input).toBeInTheDocument();

  fireEvent.input(input, { target: { value: '1000' } });
  expect(screen.getByTestId('editable-item-description')).toHaveTextContent('TB');
  expect(screen.getByTestId('editable-item-value')).toHaveTextContent('1');

  await user.click(screen.getByRole('button', { name: 'Edit' }));
  input = await screen.findByLabelText('Disk size');
  fireEvent.input(input, { target: { value: '0.1' } });
  expect(screen.getByTestId('editable-item-description')).toHaveTextContent('GB');
  expect(screen.getByTestId('editable-item-value')).toHaveTextContent('100');
});
