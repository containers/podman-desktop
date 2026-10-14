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

import '@testing-library/jest-dom/vitest';

import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeAll, expect, test, vi } from 'vitest';

import SliderItem from './SliderItem.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
});

test('Ensure HTMLInputElement', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 4,
    maximum: 34,
  };

  render(SliderItem, { record, value: 15 });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();

  expect(input instanceof HTMLInputElement).toBe(true);
});

test('Expect slider to be disabled when record.readonly is true', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 4,
    maximum: 34,
    readonly: true,
  };

  render(SliderItem, { record, value: 15 });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input).toBeDisabled();
});

test('Expect track to render a two-tone gradient reflecting the current value, thumb to use accent color', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 4,
    maximum: 34,
  };

  render(SliderItem, { record, value: 15 });
  const input = screen.getByLabelText('record-description');
  expect(input).toHaveClass('accent-(--pd-input-toggle-on-bg)');

  // (15 - 4) / (34 - 4) * 100 = 36.67%
  expect(input).toHaveStyle(
    'background: linear-gradient(to right, var(--pd-input-toggle-on-bg) 36.67%, var(--pd-input-slider-track-bg) 36.67%)',
  );
});

test('Expect track gradient to update live as the slider is dragged', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 0,
    maximum: 100,
  };

  const onChange = vi.fn().mockResolvedValue(undefined);
  render(SliderItem, { record, value: 0, onChange });
  const input: HTMLInputElement = screen.getByLabelText('record-description');

  await fireEvent.input(input, { target: { value: '75' } });

  await waitFor(() => {
    expect(input).toHaveStyle(
      'background: linear-gradient(to right, var(--pd-input-toggle-on-bg) 75.00%, var(--pd-input-slider-track-bg) 75.00%)',
    );
  });
  expect(onChange).toHaveBeenCalledWith('record', 75);
});

test('Expect track fill to default to the midpoint when value is omitted, matching the native thumb position', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 0,
    maximum: 100,
  };

  render(SliderItem, { record });
  const input = screen.getByLabelText('record-description');

  expect(input).toHaveStyle(
    'background: linear-gradient(to right, var(--pd-input-toggle-on-bg) 50.00%, var(--pd-input-slider-track-bg) 50.00%)',
  );
});

test('Expect slider to be disabled when record.locked is true', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'number',
    minimum: 4,
    maximum: 34,
    locked: true,
  };

  render(SliderItem, { record, value: 15 });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input).toBeDisabled();
});
