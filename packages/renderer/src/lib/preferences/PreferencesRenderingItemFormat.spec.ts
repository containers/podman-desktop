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

import '@testing-library/jest-dom/vitest';

import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import { getInitialValue } from '/@/lib/preferences/Util';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';

beforeAll(() => {
  (window as any).getConfigurationValue = vi.fn().mockResolvedValue(undefined);
});

async function awaitRender(record: IConfigurationPropertyRecordedSchema, customProperties: any) {
  const result = render(PreferencesRenderingItemFormat, {
    record,
    initialValue: getInitialValue(record),
    ...customProperties,
  });
  await tick();
}

test('Expect to see checkbox enabled', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: true,
  };
  // remove display name
  await awaitRender(record, {});
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).toBeChecked();
});

test('Expect to see the checkbox disabled / unable to press when readonly is passed into record', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: true,
    readonly: true,
  };
  // remove display name
  await awaitRender(record, {});
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).toBeChecked();
  expect(button).toBeDisabled();
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
  await awaitRender(record, {});
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).not.toBeChecked();
});

test('Expect a checkbox when record is type boolean', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'boolean',
  };
  await awaitRender(record, {});
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('checkbox');
  expect((input as HTMLInputElement).name).toBe('record');
});

test('Expect a slider when record and its maximum are type number and enableSlider is true', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  await awaitRender(record, {
    enableSlider: true,
  });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('range');
  expect((input as HTMLInputElement).name).toBe('record');
});

test('Expect a text input when record is type number and enableSlider is false', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  await awaitRender(record, {});
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('text');
  expect((input as HTMLInputElement).name).toBe('record');
});

test('Expect a fileinput when record is type string and format file', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    placeholder: 'Example: text',
    description: 'record-description',
    type: 'string',
    format: 'file',
  };
  await awaitRender(record, {});
  const readOnlyInput = screen.getByLabelText('record-description');
  expect(readOnlyInput).toBeInTheDocument();
  expect(readOnlyInput instanceof HTMLInputElement).toBe(true);
  expect((readOnlyInput as HTMLInputElement).placeholder).toBe(record.placeholder);
  expect((readOnlyInput as HTMLInputElement).readOnly).toBeTruthy();
  const input = screen.getByLabelText('browse');
  expect(input).toBeInTheDocument();
});

test('Expect an editable text fileinput when record is type string and format file', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    placeholder: 'Example: text',
    description: 'record-description',
    type: 'string',
    format: 'file',
    readonly: false,
  };
  await awaitRender(record, {});
  const writeInput = screen.getByLabelText('record-description');
  expect(writeInput).toBeInTheDocument();
  expect(writeInput instanceof HTMLInputElement).toBe(true);
  expect((writeInput as HTMLInputElement).readOnly).toBeFalsy();
});

test('Expect a fileinput when record is type string and format folder', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    placeholder: 'Example: text',
    description: 'record-description',
    type: 'string',
    format: 'folder',
  };
  await awaitRender(record, {});
  const readOnlyInput = screen.getByLabelText('record-description');
  expect(readOnlyInput).toBeInTheDocument();
  expect(readOnlyInput instanceof HTMLInputElement).toBe(true);
  expect((readOnlyInput as HTMLInputElement).placeholder).toBe(record.placeholder);
  const input = screen.getByLabelText('browse');
  expect(input).toBeInTheDocument();
});

test('Expect a select when record is type string and has enum values', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    enum: ['first', 'second'],
  };
  await awaitRender(record, {});
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLSelectElement).toBe(true);
  expect((input as HTMLSelectElement).name).toBe('record');
});

test('Expect a text input when record is type string', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    placeholder: 'Example: text',
    type: 'string',
  };
  await awaitRender(record, {});
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('text');
  expect((input as HTMLSelectElement).name).toBe('record');
  expect((input as HTMLInputElement).placeholder).toBe(record.placeholder);
});

test('Expect tooltip text shows info when input is less than minimum', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  await awaitRender(record, {});
  const input = screen.getByLabelText('record-description');
  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('0');
  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toBe('The value cannot be less than 1');
});

test('Expect tooltip text shows info when input is higher than maximum', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  await awaitRender(record, {});
  const input = screen.getByLabelText('record-description');
  await userEvent.click(input);
  await userEvent.clear(input);
  await userEvent.keyboard('40');
  const tooltip = screen.getByLabelText('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toBe('The value cannot be greater than 34');
});
