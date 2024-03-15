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
