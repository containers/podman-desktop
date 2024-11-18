/**********************************************************************
 * Copyright (C) 2024 Red Hat, Inc.
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

import { render, screen, within } from '@testing-library/svelte';
import { expect, test } from 'vitest';

import ConditionsTable from './ConditionsTable.svelte';

test('conditions are displayed in a table', async () => {
  render(ConditionsTable, {
    conditions: [
      {
        type: 'Ready',
        status: 'True',
        lastTransitionTime: new Date(),
        reason: 'Kubelet ready',
        message: 'kubelet is posting ready status',
      },
    ],
  });

  const table = screen.getByRole('table');
  expect(table).toBeInTheDocument();
  const rows = within(table).getAllByRole('row');
  // the first row is the header
  expect(rows.length).toBe(2);
  const row = rows[1];
  within(row).getByText('Ready');
  within(row).getByText('True');
  within(row).getByText('0 seconds');
  within(row).getByText('Kubelet ready');
  within(row).getByText('kubelet is posting ready status');
});
