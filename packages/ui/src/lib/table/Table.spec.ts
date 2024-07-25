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

import { fireEvent, render, screen, within } from '@testing-library/svelte';
import { tick } from 'svelte';
import { expect, test, vi } from 'vitest';

import TestTable from './TestTable.svelte';

test('Expect basic table layout', async () => {
  // render the component
  render(TestTable, {});

  // 3 people = header + 3 rows
  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);

  // first data row should contain John and his age
  expect(rows[1].textContent).toContain('John');
  expect(rows[1].textContent).toContain('57');

  // second data row should contain Henry and his age
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[2].textContent).toContain('27');

  // last data row should contain Charlie and his age
  expect(rows[3].textContent).toContain('Charlie');
  expect(rows[3].textContent).toContain('43');
});

test('Expect table has aria role and name', async () => {
  render(TestTable, {});

  const table = await screen.findByRole('table');
  expect(table).toBeDefined();
  expect(table).toHaveAccessibleName('people');
});

test('Expect basic column headers', async () => {
  render(TestTable, {});

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(7);
  expect(headers[2].textContent).toContain('Id');
  expect(headers[2]).toHaveClass('select-none');
  expect(headers[2]).toHaveClass('max-w-full');
  expect(headers[2]).toHaveClass('overflow-hidden');
  expect(headers[2].children[0]).toHaveClass('overflow-hidden');
  expect(headers[2].children[0]).toHaveClass('text-ellipsis');

  expect(headers[3].textContent).toContain('Name');
  expect(headers[3]).toHaveClass('select-none');
  expect(headers[3]).toHaveClass('max-w-full');
  expect(headers[3]).toHaveClass('overflow-hidden');
  expect(headers[3].children[0]).toHaveClass('overflow-hidden');
  expect(headers[3].children[0]).toHaveClass('text-ellipsis');

  expect(headers[4].textContent).toContain('Age');
  expect(headers[4]).toHaveClass('select-none');
  expect(headers[4]).toHaveClass('max-w-full');
  expect(headers[4]).toHaveClass('overflow-hidden');
  expect(headers[4].children[0]).toHaveClass('overflow-hidden');
  expect(headers[4].children[0]).toHaveClass('text-ellipsis');

  expect(headers[5].textContent).toContain('Hobby');
  expect(headers[5]).toHaveClass('select-none');
  expect(headers[5]).toHaveClass('max-w-full');
  expect(headers[5]).toHaveClass('overflow-hidden');
  expect(headers[5].children[0]).toHaveClass('overflow-hidden');
  expect(headers[5].children[0]).toHaveClass('text-ellipsis');

  expect(headers[6].textContent).toContain('Duration');
  expect(headers[6]).toHaveClass('select-none');
  expect(headers[6]).toHaveClass('max-w-full');
  expect(headers[6]).toHaveClass('overflow-hidden');
  expect(headers[6].children[0]).toHaveClass('overflow-hidden');
  expect(headers[6].children[0]).toHaveClass('text-ellipsis');
});

test('Expect column sort indicators', async () => {
  render(TestTable, {});

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(7);
  expect(headers[2].innerHTML).toContain('fa-sort');
  expect(headers[2]).toHaveClass('cursor-pointer');
  expect(headers[3].innerHTML).toContain('fa-sort');
  expect(headers[3]).toHaveClass('cursor-pointer');
  expect(headers[4].innerHTML).toContain('fa-sort');
  expect(headers[4]).toHaveClass('cursor-pointer');
  expect(headers[5].innerHTML).not.toContain('fa-sort');
  expect(headers[5]).not.toHaveClass('cursor-pointer');
});

test('Expect default sort indicator', async () => {
  render(TestTable, {});

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(7);
  expect(headers[2].textContent).toContain('Id');
  expect(headers[2].innerHTML).toContain('fa-sort-up');
});

test('Expect no default sort indicator on other columns', async () => {
  render(TestTable, {});

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(7);
  expect(headers[3].innerHTML).not.toContain('fa-sort-up');
  expect(headers[3].innerHTML).not.toContain('fa-sort-down');
  expect(headers[4].innerHTML).not.toContain('fa-sort-up');
  expect(headers[4].innerHTML).not.toContain('fa-sort-down');
});

test('Expect sorting by name works', async () => {
  render(TestTable, {});

  const nameCol = screen.getByText('Name');
  expect(nameCol).toBeInTheDocument();

  let rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);
  expect(rows[1].textContent).toContain('John');
  expect(rows[1]).toHaveAccessibleName('John');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[2]).toHaveAccessibleName('Henry');
  expect(rows[3].textContent).toContain('Charlie');
  expect(rows[3]).toHaveAccessibleName('Charlie');

  await fireEvent.click(nameCol);

  rows = await screen.findAllByRole('row');
  expect(rows[1].textContent).toContain('Charlie');
  expect(rows[1]).toHaveAccessibleName('Charlie');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[2]).toHaveAccessibleName('Henry');
  expect(rows[3].textContent).toContain('John');
  expect(rows[3]).toHaveAccessibleName('John');
});

test('Expect sorting by age sorts descending initially', async () => {
  render(TestTable, {});

  const ageCol = await screen.findByRole('columnheader', { name: 'Age' });
  expect(ageCol).toBeDefined();

  let rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('Charlie');

  await fireEvent.click(ageCol);

  expect(ageCol.innerHTML).toContain('fa-sort-down');

  rows = await screen.findAllByRole('row');
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Charlie');
  expect(rows[3].textContent).toContain('Henry');
});

test('Expect sorting by age twice sorts ascending', async () => {
  render(TestTable, {});

  const ageCol = await screen.findByRole('columnheader', { name: 'Age' });
  expect(ageCol).toBeDefined();

  let rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('Charlie');

  await fireEvent.click(ageCol);

  expect(ageCol.innerHTML).toContain('fa-sort-down');

  await fireEvent.click(ageCol);

  expect(ageCol.innerHTML).toContain('fa-sort-up');

  rows = await screen.findAllByRole('row');
  expect(rows[1].textContent).toContain('Henry');
  expect(rows[2].textContent).toContain('Charlie');
  expect(rows[3].textContent).toContain('John');
});

test('Expect correct aria roles', async () => {
  render(TestTable, {});

  // table data is 3 objects with 4 properties, so
  // there should be 6 column headers (expander, checkbox, 4 columns)
  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(7);

  // and 4 rows (first is header)
  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);

  // and each non-header row should have 6 cells (expander, checkbox, 4 cells)
  for (let i = 1; i < 4; i++) {
    const cells = await within(rows[i]).findAllByRole('cell');
    expect(cells).toBeDefined();
    expect(cells.length).toBe(7);
  }
});

test('Expect rowgroups', async () => {
  render(TestTable, {});

  // there should be two role groups
  const rowgroups = await screen.findAllByRole('rowgroup');
  expect(rowgroups).toBeDefined();
  expect(rowgroups.length).toBe(2);

  // one for the header row
  const headers = await within(rowgroups[0]).findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(7);

  // and one for the data rows
  const dataRows = await within(rowgroups[1]).findAllByRole('row');
  expect(dataRows).toBeDefined();
  expect(dataRows.length).toBe(3);
});

test('Expect overflow-hidden', async () => {
  render(TestTable, {});

  // get the 4 rows (first is header)
  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);

  // and each non-header row should have 6 cells (expander, checkbox, 4 cells).
  // all 4 data cells should have overflow-hidden, except for age which has it
  // disabled
  for (let i = 1; i < 4; i++) {
    const cells = await within(rows[i]).findAllByRole('cell');
    expect(cells).toBeDefined();
    expect(cells.length).toBe(7);

    expect(cells[2]).toHaveClass('overflow-hidden');
    expect(cells[3]).toHaveClass('overflow-hidden');
    expect(cells[4]).not.toHaveClass('overflow-hidden');
    expect(cells[5]).toHaveClass('overflow-hidden');
  }
});

test('Expect update callback', async () => {
  const callback = vi.fn();
  render(TestTable, { onUpdate: callback });

  const ageCol = await screen.findByRole('columnheader', { name: 'Age' });
  expect(ageCol).toBeDefined();

  await fireEvent.click(ageCol);

  expect(callback).toHaveBeenCalled();
});

test('Expect table to be sorted by Id on load', async () => {
  render(TestTable, {});

  // Wait for the table to load and fetch all rows
  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);

  const headers = await screen.findAllByRole('columnheader');
  expect(headers).toBeDefined();
  expect(headers.length).toBe(7);
  expect(headers[2].textContent).toContain('Id');

  // Check that Id column is sorted in ascending order
  // since Id is by 1,2,3 in TestTable, just using a for loop and converting
  // to string is enough to check the order
  for (let i = 1; i < 4; i++) {
    expect(rows[i].textContent).toContain(i.toString());
  }
});

test('Expect table to be sorted by Name on load, if something has changed in the store afterwards, it should not affect the order', async () => {
  const component = render(TestTable);

  const nameCol = screen.getByText('Name');
  expect(nameCol).toBeInTheDocument();

  let rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);
  expect(rows[1].textContent).toContain('John');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('Charlie');

  await fireEvent.click(nameCol);

  rows = await screen.findAllByRole('row');
  expect(rows[1].textContent).toContain('Charlie');
  expect(rows[2].textContent).toContain('Henry');
  expect(rows[3].textContent).toContain('John');

  // Change the store, this is similar to what is already in TestTable, but updates the hobbies of all the rows.
  // The original is:
  //
  //  { id: 1, name: 'John', age: 57, hobby: 'Skydiving' },
  //  { id: 2, name: 'Henry', age: 27, hobby: 'Cooking' },
  //  { id: 3, name: 'Charlie', age: 43, hobby: 'Biking' },
  //

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const people = [
    { id: 1, name: 'John', age: 57, hobby: 'Walking' },
    { id: 2, name: 'Henry', age: 27, hobby: 'Swimming' },
    { id: 3, name: 'Charlie', age: 43, hobby: 'Karting' },
  ];
  await component.rerender({ people });

  // Wait for the table to update
  await tick();

  // Check that the order is still the same even though hobbies had changed above.
  const newRows = await screen.findAllByRole('row');
  expect(newRows).toBeDefined();
  expect(newRows.length).toBe(4);
  expect(newRows[1].textContent).toContain('Charlie');
  expect(newRows[1].textContent).toContain('Karting');
  expect(newRows[2].textContent).toContain('Henry');
  expect(newRows[2].textContent).toContain('Swimming');
  expect(newRows[3].textContent).toContain('John');
  expect(newRows[3].textContent).toContain('Walking');
});

test('Expect duration cell to be empty when undefined', async () => {
  render(TestTable, {});

  // Wait for the table to update
  await tick();

  const rows = await screen.findAllByRole('row');
  expect(rows).toBeDefined();
  expect(rows.length).toBe(4);

  const expected = ['', '', '1 hour'];

  // We start at 1 as we do not iterate over headers
  for (let i = 1; i < expected.length + 1; i++) {
    const cells = await within(rows[i]).findAllByRole('cell');
    expect(cells).toBeDefined();
    expect(cells.length).toBe(7);

    expect(cells[6].textContent?.trim()).toBe(expected[i - 1]);
  }
});
