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
import { tick } from 'svelte';
import { expect, test } from 'vitest';

import TestMultiTables from './TestMultiTables.svelte';

test('Expect each table receive its own grid-tables-column values', async () => {
  const extractGridTableColumnsWidth = async (tableName: string): Promise<string> => {
    const table = await screen.findByRole('table', { name: tableName });
    expect(table).toBeDefined();

    // get the elements having the role "row" inside the table html element
    const rows = await within(table).findAllByRole('row');
    const gridTableColumnsValuesSet = new Set<string>();
    for (const element of rows) {
      gridTableColumnsValuesSet.add(element.style.gridTemplateColumns);
    }

    // all values should be the same in the set gridTableColumnsValues
    const items = Array.from(gridTableColumnsValuesSet.values());
    expect(items.length).toBe(1);

    const item = items[0];

    // split by space and keep the second value
    const values = item.split(' ');

    expect(values.length).toBe(3);

    return values[1];
  };

  render(TestMultiTables, {});

  // Wait for the tables to update
  await tick();

  // expect to receive for each table, the good values of the width (which is different for each table)
  const gridTableColumnsValuesPersonWidth = await extractGridTableColumnsWidth('person');
  expect(gridTableColumnsValuesPersonWidth).toBe('3fr');

  const gridTableColumnsValuesBookWidth = await extractGridTableColumnsWidth('book');
  expect(gridTableColumnsValuesBookWidth).toBe('2fr');
});
