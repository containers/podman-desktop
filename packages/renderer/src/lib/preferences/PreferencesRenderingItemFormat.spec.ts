/**********************************************************************
 * Copyright (C) 2023-2025 Red Hat, Inc.
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

import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { fireEvent, render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { tick } from 'svelte';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { getInitialValue } from '/@/lib/preferences/Util';
import { onDidChangeConfiguration } from '/@/stores/configurationProperties';

import PreferencesRenderingItemFormat from './PreferencesRenderingItemFormat.svelte';

beforeEach(() => {
  vi.resetAllMocks();
});

async function awaitRender(record: IConfigurationPropertyRecordedSchema, customProperties: any): Promise<void> {
  render(PreferencesRenderingItemFormat, {
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

test('Expect to see checkbox disabled with default to false', async () => {
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

test('Expect to see checkbox checked if givenValue is true', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'my boolean property',
    id: 'myid',
    parentId: '',
    type: 'boolean',
    default: false,
  };
  // remove display name
  await awaitRender(record, { givenValue: true });
  const button = screen.getByRole('checkbox');
  expect(button).toBeInTheDocument();
  expect(button).toBeChecked();
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
    default: 20,
  };
  await awaitRender(record, {});
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('text');
  expect((input as HTMLInputElement).name).toBe('record');
  expect((input as HTMLInputElement).value).toBe('20');
});

test('Expect record with type number and enableSlider false to use given value if available', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 1,
    maximum: 34,
  };
  await awaitRender(record, { givenValue: 5 });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('text');
  expect((input as HTMLInputElement).name).toBe('record');
  expect((input as HTMLInputElement).value).toBe('5');
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
  // readOnly by default is false now
  expect((readOnlyInput as HTMLInputElement).readOnly).toBeFalsy();
  const input = screen.getByLabelText('browse');
  expect(input).toBeInTheDocument();
});

test('Expect a fileinput with readonly being true, to show readOnly in element', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    placeholder: 'Example: text',
    description: 'record-description',
    type: 'string',
    format: 'file',
    readonly: true,
  };
  await awaitRender(record, {});
  const readOnlyInput = screen.getByLabelText('record-description');
  expect(readOnlyInput).toBeInTheDocument();
  expect(readOnlyInput instanceof HTMLInputElement).toBe(true);
  expect((readOnlyInput as HTMLInputElement).readOnly).toBe(true);
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

test('Expect a fileinput to be populated if the givenValue is defined', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    title: 'record',
    parentId: 'parent.record',
    placeholder: 'Example: text',
    description: 'record-description',
    type: 'string',
    format: 'folder',
  };
  await awaitRender(record, { givenValue: 'filename' });
  const readOnlyInput = screen.getByLabelText('record-description');
  expect(readOnlyInput).toBeInTheDocument();
  expect(readOnlyInput instanceof HTMLInputElement).toBe(true);
  expect((readOnlyInput as HTMLInputElement).value).equals('filename');
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
  expect(input.children[0]).toHaveAttribute('name', 'record');
});

test('Expect enum to have the givenValue selected', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    enum: ['first', 'second'],
  };
  await awaitRender(record, { givenValue: 'second' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input.children[0]).toHaveAttribute('name', 'record');
  expect(input).toHaveTextContent('second');
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

test('Expect a text input filled with givenValue when defined', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    placeholder: 'Example: text',
    type: 'string',
  };
  await awaitRender(record, { givenValue: 'fake' });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input instanceof HTMLInputElement).toBe(true);
  expect((input as HTMLInputElement).type).toBe('text');
  expect((input as HTMLSelectElement).name).toBe('record');
  expect((input as HTMLInputElement).value).equals('fake');
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

  const tooltipTrigger = screen.getByTestId('tooltip-trigger');
  await userEvent.hover(tooltipTrigger);

  const tooltip = await screen.findByRole('tooltip');
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

  const tooltipTrigger = screen.getByTestId('tooltip-trigger');
  await userEvent.hover(tooltipTrigger);

  const tooltip = await screen.findByRole('tooltip');
  expect(tooltip).toBeInTheDocument();
  expect(tooltip.textContent).toBe('The value cannot be greater than 34');
});

test('Expect a text input when record is type integer', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'Hello',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'integer',
    minimum: 1,
    maximum: 15,
  };
  await awaitRender(record, {});
  const inputField = screen.getByRole('textbox', { name: 'record-description' }) as HTMLInputElement;
  expect(inputField).toBeInTheDocument();
  expect(inputField.type).toBe('text');
  expect(inputField.name).toBe('record');
});

test('Expect value is updated from an external change', async () => {
  const recordId = 'record';
  const record: IConfigurationPropertyRecordedSchema = {
    id: recordId,
    title: 'Hello',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'integer',
    scope: 'DEFAULT',
    default: 1,
    minimum: 1,
    maximum: 15,
  };

  await awaitRender(record, {});
  const inputField = screen.getByRole('textbox', { name: 'record-description' }) as HTMLInputElement;
  expect(inputField).toBeInTheDocument();

  // initial value should be 1
  expect(inputField.value).toBe('1');

  // change getConfigurationValue to return 5
  vi.mocked(window.getConfigurationValue).mockResolvedValue(5);

  // now update the configuration value
  onDidChangeConfiguration.dispatchEvent(
    new CustomEvent(recordId, {
      detail: {
        key: 'record',
        value: 5,
      },
    }),
  );

  // initial value should be 5
  await vi.waitFor(() => expect(inputField.value).toBe('5'));
});

test('Expect boolean record to be updated from checked to not checked', async () => {
  const RECORD_ID = 'boolean-record-id';
  const BOOLEAN_RECORD: IConfigurationPropertyRecordedSchema = {
    id: RECORD_ID,
    title: 'Hello',
    parentId: 'parent.record',
    description: 'boolean-record-description',
    type: 'boolean',
    scope: 'DEFAULT',
    default: true,
  };

  // getConfigurationValue to return true
  vi.mocked(window.getConfigurationValue).mockResolvedValue(true);

  // render
  await awaitRender(BOOLEAN_RECORD, {});
  const checkbox = screen.getByRole('checkbox', { name: BOOLEAN_RECORD.description });

  // ensure the checkbox is checked
  await vi.waitFor(() => {
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toBeChecked();
  });

  // getConfigurationValue to return false
  vi.mocked(window.getConfigurationValue).mockResolvedValue(false);

  // now update the configuration value
  onDidChangeConfiguration.dispatchEvent(
    new CustomEvent(RECORD_ID, {
      detail: {
        key: 'record',
        value: false,
      },
    }),
  );

  // checkbox should not be checked anymore
  await vi.waitFor(() => expect(checkbox).not.toBeChecked());
});

test('Expect a password input when record is type string and format is password', async () => {
  const record: IConfigurationPropertyRecordedSchema & { description: string } = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    format: 'password',
    type: 'string',
  };
  await awaitRender(record, {});
  const passwordInput = screen.getByLabelText(record.description);
  expect(passwordInput).toBeInTheDocument();
  expect(passwordInput).toBeInstanceOf(HTMLInputElement);

  // enter the value foobar from keyboard
  await userEvent.click(passwordInput);
  await userEvent.keyboard('foobar');

  // check that the typed value is hidden
  expect(passwordInput).toHaveAttribute('type', 'password');

  // check that the name is properly set and the value too
  expect(passwordInput).toHaveAttribute('name', 'record');
  expect(passwordInput).toHaveValue('foobar');
});

describe('experimental configuration update', () => {
  test('Expect updateExperimentalConfigurationValue to be called for experimental records', async () => {
    const record: IConfigurationPropertyRecordedSchema = {
      id: 'experimental.record',
      title: 'Experimental feature',
      parentId: 'parent.record',
      description: 'experimental-description',
      type: 'boolean',
      default: false,
      scope: 'DEFAULT',
      experimental: { githubDiscussionLink: 'https://github.com/test' },
    };

    render(PreferencesRenderingItemFormat, {
      record,
      initialValue: getInitialValue(record),
      enableAutoSave: true,
    });

    const checkbox = screen.getByRole('checkbox');
    await fireEvent.click(checkbox);

    await vi.waitFor(
      () => {
        expect(window.updateExperimentalConfigurationValue).toHaveBeenCalledWith(
          'experimental.record',
          expect.anything(),
          'DEFAULT',
        );
      },
      { timeout: 3000 },
    );
    expect(window.updateConfigurationValue).not.toHaveBeenCalled();
  });

  test('Expect updateConfigurationValue to be called for non-experimental records', async () => {
    const record: IConfigurationPropertyRecordedSchema = {
      id: 'regular.record',
      title: 'Regular feature',
      parentId: 'parent.record',
      description: 'regular-description',
      type: 'boolean',
      default: false,
      scope: 'DEFAULT',
    };

    render(PreferencesRenderingItemFormat, {
      record,
      initialValue: getInitialValue(record),
      enableAutoSave: true,
    });

    const checkbox = screen.getByRole('checkbox');
    await fireEvent.click(checkbox);

    await vi.waitFor(
      () => {
        expect(window.updateConfigurationValue).toHaveBeenCalledWith('regular.record', expect.anything(), 'DEFAULT');
      },
      { timeout: 3000 },
    );
    expect(window.updateExperimentalConfigurationValue).not.toHaveBeenCalled();
  });
});
