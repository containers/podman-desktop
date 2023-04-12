/**********************************************************************
 * Copyright (C) 2023 Red Hat, Inc.
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
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */

import '@testing-library/jest-dom';
import { test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn();
});

test('Expect to see checkbox enabled', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: true,
  };
  // remove display name
  render(PreferencesRenderingItemFormat, { record });
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).toBeChecked();
});

test('Expect to see checkbox enabled', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: false,
  };
  // remove display name
  render(PreferencesRenderingItemFormat, { record });
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).not.toBeChecked();
});

test('Expect a checkbox when record is type boolean', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'boolean',
  };
  await render(PreferencesRenderingItemFormat, {
    record,
  });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('checkbox');
});

test('Expect a slider when record and its maximum are type number and enableSlider is true', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  await render(PreferencesRenderingItemFormat, {
    record,
    enableSlider: true,
  });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('range');
});

test('Expect a text input when record is type number and enableSlider is false', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  await render(PreferencesRenderingItemFormat, {
    record,
  });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('text');
});

test('Expect an input button with Browse as placeholder when record is type string and format file', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };
  await render(PreferencesRenderingItemFormat, {
    record,
  });
  const input = screen.getByLabelText('button-record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).placeholder).toBe('Browse ...');
});

test('Expect a select when record is type string and has enum values', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    enum: ['first', 'second'],
  };
  await render(PreferencesRenderingItemFormat, {
    record,
  });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLSelectElement).toBe(true);
});

test('Expect a text input when record is type string', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
  };
  await render(PreferencesRenderingItemFormat, {
    record,
  });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('text');
});
