/**********************************************************************
 * Copyright (C) 2025 Red Hat, Inc.
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
import { expect, test, vi } from 'vitest';

import PasswordStringItem from './PasswordStringItem.svelte';

test('Ensure HTMLInputElement', async () => {
  const record: IConfigurationPropertyRecordedSchema & { description: string } = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
  };

  render(PasswordStringItem, { record, value: '', onChange: vi.fn() });
  const input = screen.getByLabelText(record.description);
  expect(input).toBeInTheDocument();
  expect(input).toBeInstanceOf(HTMLInputElement);
});

test('Ensure HTMLInputElement readonly', async () => {
  const record: IConfigurationPropertyRecordedSchema & { description: string } = {
    id: 'record',
    title: 'record',
    parentId: 'parent.record',
    description: 'record-description',
    type: 'string',
    format: 'password',
    readonly: true,
  };

  render(PasswordStringItem, { record, value: '', onChange: vi.fn() });
  const input = screen.getByLabelText(record.description);
  expect(input).toBeInTheDocument();
  expect((input as HTMLInputElement).readOnly).toBeTruthy();
});
