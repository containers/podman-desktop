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
import { beforeAll, expect, test, vi } from 'vitest';

import type { IConfigurationPropertyRecordedSchema } from '../../../../../main/src/plugin/configuration-registry';
import EnumItem from './EnumItem.svelte';

beforeAll(() => {
  Object.defineProperty(window, 'getConfigurationValue', { value: vi.fn() });
});

test('Enum without default', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    enum: ['hello', 'world'],
  };

  render(EnumItem, { record });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input).toHaveTextContent('hello');
});

test('Enum with default', async () => {
  const record: IConfigurationPropertyRecordedSchema = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    enum: ['hello', 'world'],
    default: 'world',
  };

  render(EnumItem, { record, value: record.default });
  const input = screen.getByLabelText('record-description');
  expect(input).toBeInTheDocument();
  expect(input).toHaveTextContent('world');
});
