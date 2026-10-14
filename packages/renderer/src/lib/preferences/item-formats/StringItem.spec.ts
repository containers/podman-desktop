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

import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { beforeAll, expect, test, vi } from 'vitest';

import StringItem from './StringItem.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
});

test('Ensure HTMLInputElement', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
  };

  render(StringItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLInputElement).toBe(true);
});

test('Ensure placeholder is correctly used', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    placeholder: 'placeholder',
  };

  render(StringItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect((input as HTMLInputElement).placeholder).toBe(record.placeholder);
});

test('Ensure HTMLInputElement readonly', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    readonly: true,
  };

  render(StringItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect((input as HTMLInputElement).readOnly).toBeTruthy();
});

test('Ensure that after typing into the input, that onChange is called each time', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
  };

  // We "mock" the rejected value since catch() ends up invalidEntry = true anyways.
  const onChange = vi.fn().mockRejectedValue(new Error('foo'));
  render(StringItem, { record, value: '', onChange });

  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  // Ensure it's been called 9 times as "new value" is 6 characters
  await userEvent.type(input, 'foobar');
  expect(onChange).toHaveBeenCalledTimes(6);
});

test('Ensure HTMLInputElement readonly when locked', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    locked: true,
  };

  render(StringItem, { record, value: '' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect((input as HTMLInputElement).readOnly).toBeTruthy();
});
