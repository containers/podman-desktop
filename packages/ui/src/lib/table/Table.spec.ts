/**********************************************************************
 * Copyright (C) 2023-2026 Red Hat, Inc.
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
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Table, TableColumn, tablePersistence } from '/@/lib';
import type { ListOrganizerItem } from '/@/lib/layouts/ListOrganizer';
import SimpleColumn from '/@/lib/table/SimpleColumn.svelte';
import { Column, Row } from '/@/lib/table/table';
import { collapsedStateMap } from '/@/lib/table/table-persistence-store.svelte';

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

test('sorting invokes the fixture callback', async () => {
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

test.each([
  { direction: 'ascending', clicks: 1, expectedNames: ['Amy', 'Mia', 'Zoe'] },
  { direction: 'descending', clicks: 2, expectedNames: ['Zoe', 'Mia', 'Amy'] },
])('re-sorts replacement data by Name in $direction order', async ({ clicks, expectedNames }) => {
  const component = render(TestTable);
  const nameColumnHeader = screen.getByRole('columnheader', { name: 'Name' });

  for (let click = 0; click < clicks; click++) {
    await fireEvent.click(nameColumnHeader);
  }

  const people = [
    { id: 1, name: 'Zoe', age: 31, hobby: 'Reading' },
    { id: 2, name: 'Amy', age: 28, hobby: 'Hiking' },
    { id: 3, name: 'Mia', age: 35, hobby: 'Cycling' },
  ];
  await component.rerender({ people });

  await vi.waitFor(() => {
    const rows = screen.getAllByRole('row');
    expect(rows.slice(1).map(row => row.getAttribute('aria-label'))).toEqual(expectedNames);
  });
});

describe('Table#selection', () => {
  interface Item {
    id: string;
    name: string;
    selected?: boolean;
    selectable?: boolean;
    children?: Item[];
  }

  const NAME_COLUMN = new Column<Item, string>('Name', {
    renderMapping: (item): string => item.name,
    renderer: SimpleColumn,
  });
  const ROW = new Row<Item, Item>({
    selectable: (item): boolean => item.selectable !== false,
    children: (item): Item[] => item.children ?? [],
  });

  function renderTable(data: Item[]): void {
    render(Table<Item>, {
      kind: 'selection-test',
      data,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item): string => item.id,
    });
  }

  test('seeds selection from selected parents and children and shows an indeterminate header', () => {
    const data: Item[] = [
      {
        id: 'parent-1',
        name: 'Selected parent',
        selected: true,
        children: [{ id: 'child-1', name: 'Selected child', selected: true }],
      },
      {
        id: 'parent-2',
        name: 'Unselected parent',
        children: [{ id: 'child-2', name: 'Unselected child' }],
      },
    ];

    renderTable(data);

    expect(within(screen.getByRole('row', { name: 'Selected parent' })).getByRole('checkbox')).toBeChecked();
    expect(within(screen.getByRole('row', { name: 'Selected child' })).getByRole('checkbox')).toBeChecked();
    expect(within(screen.getByRole('row', { name: 'Unselected parent' })).getByRole('checkbox')).not.toBeChecked();
    expect(within(screen.getByRole('row', { name: 'Unselected child' })).getByRole('checkbox')).not.toBeChecked();

    const headerCheckbox = screen.getByRole('checkbox', { name: 'Toggle all' });
    expect(headerCheckbox).not.toBeChecked();
    expect(headerCheckbox.closest('label')?.querySelector('svg')).toHaveClass(
      'text-[var(--pd-input-checkbox-indeterminate)]',
    );
  });

  test.each([
    { targetChecked: true, initialChecked: false },
    { targetChecked: false, initialChecked: true },
  ])(
    'Toggle all sets every selectable parent and child to $targetChecked and preserves non-selectable items',
    async ({ targetChecked, initialChecked }) => {
      const selectableChild: Item = { id: 'child-1', name: 'Selectable child', selected: initialChecked };
      const nonSelectableChild: Item = {
        id: 'child-2',
        name: 'Non-selectable child',
        selectable: false,
        selected: initialChecked,
      };
      const selectableParent: Item = {
        id: 'parent-1',
        name: 'Selectable parent',
        selected: initialChecked,
        children: [selectableChild, nonSelectableChild],
      };
      const childOfNonSelectableParent: Item = {
        id: 'child-3',
        name: 'Selectable child of non-selectable parent',
        selected: initialChecked,
      };
      const nonSelectableParent: Item = {
        id: 'parent-2',
        name: 'Non-selectable parent',
        selectable: false,
        selected: initialChecked,
        children: [childOfNonSelectableParent],
      };
      const data = [selectableParent, nonSelectableParent];

      renderTable(data);

      await fireEvent.click(screen.getByRole('checkbox', { name: 'Toggle all' }));

      expect(selectableParent.selected).toBe(targetChecked);
      expect(selectableChild.selected).toBe(targetChecked);
      expect(childOfNonSelectableParent.selected).toBe(targetChecked);
      expect(nonSelectableParent.selected).toBe(initialChecked);
      expect(nonSelectableChild.selected).toBe(initialChecked);
      expect(within(screen.getByRole('row', { name: 'Selectable parent' })).getByRole('checkbox')).toHaveProperty(
        'checked',
        targetChecked,
      );
      expect(within(screen.getByRole('row', { name: 'Selectable child' })).getByRole('checkbox')).toHaveProperty(
        'checked',
        targetChecked,
      );
      expect(
        within(screen.getByRole('row', { name: 'Selectable child of non-selectable parent' })).getByRole('checkbox'),
      ).toHaveProperty('checked', targetChecked);
      expect(within(screen.getByRole('row', { name: 'Non-selectable parent' })).getByRole('checkbox')).toBeDisabled();
      expect(within(screen.getByRole('row', { name: 'Non-selectable child' })).getByRole('checkbox')).toBeDisabled();

      const selectedNames = data.filter(item => item.selected).map(item => item.name);
      expect(selectedNames).toEqual(targetChecked ? ['Selectable parent'] : ['Non-selectable parent']);
      expect(screen.getByRole('checkbox', { name: 'Toggle all' })).toHaveProperty('checked', targetChecked);
    },
  );

  test('toggling a parent cascades selection to its children and writes selected back to the data objects', async () => {
    const parent: Item = {
      id: 'parent-1',
      name: 'Parent',
      children: [
        { id: 'child-1', name: 'First child' },
        { id: 'child-2', name: 'Second child' },
      ],
    };
    const otherParent: Item = { id: 'parent-2', name: 'Other parent' };
    const data = [parent, otherParent];

    renderTable(data);
    const parentCheckbox = within(screen.getByRole('row', { name: 'Parent' })).getByRole('checkbox');

    await fireEvent.click(parentCheckbox);

    expect(parent.selected).toBeTruthy();
    expect(parent.children?.every(child => child.selected)).toBeTruthy();
    expect(data.filter(item => item.selected)).toEqual([parent]);
    expect(within(screen.getByRole('row', { name: 'First child' })).getByRole('checkbox')).toBeChecked();
    expect(within(screen.getByRole('row', { name: 'Second child' })).getByRole('checkbox')).toBeChecked();
    expect(within(screen.getByRole('row', { name: 'Other parent' })).getByRole('checkbox')).not.toBeChecked();
    await fireEvent.click(parentCheckbox);

    expect(parent.selected).toBeFalsy();
    expect(parent.children?.every(child => child.selected === false)).toBeTruthy();
  });

  test('toggling one child updates only that child', async () => {
    const parent: Item = {
      id: 'parent-1',
      name: 'Parent',
      children: [
        { id: 'child-1', name: 'First child' },
        { id: 'child-2', name: 'Second child' },
      ],
    };
    const data = [parent];

    renderTable(data);

    const parentCheckbox = within(screen.getByRole('row', { name: 'Parent' })).getByRole('checkbox');
    const firstChildCheckbox = within(screen.getByRole('row', { name: 'First child' })).getByRole('checkbox');
    const secondChildCheckbox = within(screen.getByRole('row', { name: 'Second child' })).getByRole('checkbox');

    await fireEvent.click(firstChildCheckbox);

    expect(parent.selected).toBeUndefined();
    expect(parent.children?.[0].selected).toBeTruthy();
    expect(parent.children?.[1].selected).toBeUndefined();
    expect(parentCheckbox).not.toBeChecked();
    expect(firstChildCheckbox).toBeChecked();
    expect(secondChildCheckbox).not.toBeChecked();
    const headerCheckbox = screen.getByRole('checkbox', { name: 'Toggle all' });
    expect(headerCheckbox).not.toBeChecked();
    expect(headerCheckbox.closest('label')?.querySelector('svg')).toHaveClass(
      'text-[var(--pd-input-checkbox-indeterminate)]',
    );

    await fireEvent.click(firstChildCheckbox);

    expect(parent.children?.[0].selected).toBeFalsy();
  });

  test('binds the selected item count to the consumer', async () => {
    const parent: Item = {
      id: 'parent-1',
      name: 'Selected parent',
      selected: true,
      children: [{ id: 'child-1', name: 'Selected child', selected: true }],
    };
    const otherParent: Item = { id: 'parent-2', name: 'Other parent' };
    const data = [parent, otherParent];
    let selectedItemsNumber = 0;

    render(Table<Item>, {
      kind: 'selection-binding-test',
      data,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item): string => item.id,
      get selectedItemsNumber(): number {
        return selectedItemsNumber;
      },
      set selectedItemsNumber(value: number) {
        selectedItemsNumber = value;
      },
    });

    const otherParentCheckbox = within(screen.getByRole('row', { name: 'Other parent' })).getByRole('checkbox');
    const parentCheckbox = within(screen.getByRole('row', { name: 'Selected parent' })).getByRole('checkbox');

    await vi.waitFor(() => expect(selectedItemsNumber).toBe(2));

    await fireEvent.click(otherParentCheckbox);
    await vi.waitFor(() => expect(selectedItemsNumber).toBe(3));

    await fireEvent.click(parentCheckbox);
    await vi.waitFor(() => expect(selectedItemsNumber).toBe(1));
  });

  test('accepts an initially undefined selected count binding', async () => {
    const item: Item = { id: 'item-1', name: 'Selectable item' };
    let selectedItemsNumber: number | undefined;

    render(Table<Item>, {
      kind: 'undefined-selection-binding-test',
      data: [item],
      columns: [NAME_COLUMN],
      row: ROW,
      key: (value): string => value.id,
      get selectedItemsNumber(): number | undefined {
        return selectedItemsNumber;
      },
      set selectedItemsNumber(value: number) {
        selectedItemsNumber = value;
      },
    });

    await vi.waitFor(() => expect(selectedItemsNumber).toBe(0));
    await fireEvent.click(within(screen.getByRole('row', { name: item.name })).getByRole('checkbox'));
    await vi.waitFor(() => expect(selectedItemsNumber).toBe(1));
  });
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

test('Expect table to have proper css style', async () => {
  render(TestTable, {});

  // Wait for the table to update
  await tick();

  const table = await screen.findByRole('table');
  expect(table).toBeDefined();
  // get the elements having the role "row" inside the table html element
  const rows = await within(table).findAllByRole('row');
  // expect each row of the table has the grid-template-columns style applied
  for (const element of rows) {
    expect(element).toHaveClass('grid-table');
  }

  expect(table).toHaveStyle({
    '--table-grid-table-columns': '20px 32px 1fr 3fr 1fr 1fr 1fr 5px',
  });

  // ok so now look at our dummy component
  const dummyComponent = await screen.findByRole('group', { name: 'dummy component' });
  expect(dummyComponent).toBeDefined();

  // and there should be no style applied to this group as it's not part of the table
  expect(dummyComponent.style.gridTemplateColumns).toBe('');
});

describe('Table#label', () => {
  interface Item {
    id: string;
    name?: string;
  }

  const ROW = new Row<Item>({});

  const SIMPLE_COLUMN = new Column<Item, string>('Name', {
    width: '3fr',
    renderMapping: (obj): string => obj.name ?? 'unknown',
    renderer: SimpleColumn,
  });

  test('expect table to set aria-label from label prop if item has undefined name', () => {
    const { queryByRole } = render(Table<Item>, {
      kind: 'demo',
      data: [
        {
          id: 'foo',
        },
      ],
      columns: [SIMPLE_COLUMN],
      row: ROW,
      collapsed: ['foo'],
      // create special value for the label
      label: (item): string => `label-${item.id}`,
      key: (item): string => item.id,
    });

    const row = queryByRole('row', { name: 'label-foo' });
    expect(row).toBeDefined();
  });
});

describe('Table#collapsed', () => {
  interface Item {
    id: string;
    name?: string;
  }

  const ROW = new Row<Item>({
    selectable: (): boolean => true,
    children: (person): Array<Item> => [
      {
        id: `${person.id}-child`,
        name: `${person.name} child`,
      },
    ],
  });

  const SIMPLE_COLUMN = new Column<Item, string>('Name', {
    width: '3fr',
    renderMapping: (obj): string => obj.name ?? 'unknown',
    renderer: SimpleColumn,
  });

  describe('collapse icons', () => {
    test('item without name should have correct icon when expanded', async () => {
      const { getByRole } = render(Table<Item>, {
        kind: 'demo',
        data: [
          {
            id: 'foo',
          },
        ],
        columns: [SIMPLE_COLUMN],
        row: ROW,
        key: ({ id }: Item): string => id,
        // nothing is collapsed
        collapsed: [],
      });

      const button = getByRole('button', { name: 'Collapse Row' });
      const chevronIcon = button.querySelector('svg') as SVGElement;
      expect(chevronIcon).toBeInTheDocument();
      expect(chevronIcon).toHaveClass('rotate-90');
    });

    test('item without name should have correct icon when collapsed', async () => {
      const { getByRole } = render(Table<Item>, {
        kind: 'demo',
        data: [
          {
            id: 'foo',
          },
        ],
        columns: [SIMPLE_COLUMN],
        row: ROW,
        key: ({ id }: Item): string => id,
        // the item is collapsed
        collapsed: ['foo'],
      });

      const button = getByRole('button', { name: 'Expand Row' });
      const chevronIcon = button.querySelector('svg') as SVGElement;
      expect(chevronIcon).toBeInTheDocument();
      expect(chevronIcon).toHaveClass('rotate-0');
    });
  });

  test('Table#collapsed prop should be used for collapsed', async () => {
    const { getByRole } = render(Table<Item>, {
      kind: 'demo',
      data: [
        {
          id: 'foo',
          name: 'foo',
        },
        {
          id: 'bar',
          name: 'bar',
        },
      ],
      columns: [SIMPLE_COLUMN],
      row: ROW,
      collapsed: ['foo'],
    });

    const fooRow = getByRole('row', { name: 'foo' });
    const fooExpandBtn = within(fooRow).getByRole('button', { name: 'Expand Row' });
    expect(fooExpandBtn).toHaveAttribute('aria-expanded', 'false');

    const barRow = getByRole('row', { name: 'bar' });
    const barCollapseBtn = within(barRow).getByRole('button', { name: 'Collapse Row' });
    expect(barCollapseBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('re-renders when toggling a row with a plain collapsed array prop', async () => {
    const { getByRole } = render(Table<Item>, {
      kind: 'plain-collapsed-array',
      data: [{ id: 'foo', name: 'foo' }],
      columns: [SIMPLE_COLUMN],
      row: ROW,
      collapsed: [],
      key: ({ id }: Item): string => id,
    });

    const row = getByRole('row', { name: 'foo' });
    expect(screen.getByRole('row', { name: 'foo child' })).toBeDefined();
    await fireEvent.click(within(row).getByRole('button', { name: 'Collapse Row' }));
    expect(within(row).getByRole('button', { name: 'Expand Row' })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('row', { name: 'foo child' })).not.toBeInTheDocument();

    await fireEvent.click(within(row).getByRole('button', { name: 'Expand Row' }));
    expect(within(row).getByRole('button', { name: 'Collapse Row' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('row', { name: 'foo child' })).toBeDefined();
  });

  test('item with same name can be distinct using Table#key prop', async () => {
    const { getAllByRole } = render(Table<Item>, {
      kind: 'demo',
      data: [
        {
          id: '1',
          name: 'foo',
        },
        {
          id: '2',
          name: 'foo',
        },
      ],
      columns: [SIMPLE_COLUMN],
      row: ROW,
      collapsed: ['1'],
      key: ({ id }: Item): string => id,
    });

    const [foo1, foo2] = getAllByRole('row', { name: 'foo' });

    const foo1ExpandBtn = within(foo1).getByRole('button', { name: 'Expand Row' });
    expect(foo1ExpandBtn).toHaveAttribute('aria-expanded', 'false');

    const foo2ExpandBtn = within(foo2).getByRole('button', { name: 'Collapse Row' });
    expect(foo2ExpandBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('should initialize with async/await pattern on mount when tablePersistence available', async () => {
    const mockCallbacks = {
      load: vi.fn().mockResolvedValue([
        { id: 'Name', label: 'Name', enabled: true, originalOrder: 0 },
        { id: 'Age', label: 'Age', enabled: false, originalOrder: 1 },
      ]),
      save: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue([]),
    };

    tablePersistence.storage = mockCallbacks;

    render(Table, {
      kind: 'test',
      columns: [new TableColumn('Name', {}), new TableColumn('Age', {})],
      row: {
        info: {},
      },
      data: [],
      enableLayoutConfiguration: true,
    });

    // Wait for mount and async initialization
    await tick();

    expect(mockCallbacks.load).toHaveBeenCalled();
  });

  test('should show layout management UI when tablePersistence available', async () => {
    const mockCallbacks = {
      load: vi.fn().mockResolvedValue([]),
      save: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue([]),
    };

    tablePersistence.storage = mockCallbacks;

    render(Table, {
      kind: 'test',
      columns: [new TableColumn('Name', {}), new TableColumn('Age', {})],
      row: {
        info: { selectable: (): boolean => true },
      },
      data: [],
      enableLayoutConfiguration: true,
    });

    await tick();

    // Should have 5 headers: expansion(1) + checkbox(1) + columns(2) + layout(1)
    const headers = await screen.findAllByRole('columnheader');
    expect(headers.length).toBe(5);

    // Should have layout management button
    const layoutButton = screen.getByTitle('Configure Columns');
    expect(layoutButton).toBeInTheDocument();
  });

  test('should not show layout management UI when no tablePersistence', async () => {
    tablePersistence.storage = undefined;

    render(Table, {
      kind: 'test',
      columns: [new TableColumn('Name', {}), new TableColumn('Age', {})],
      row: {
        info: { selectable: (): boolean => true },
      },
      data: [],
      enableLayoutConfiguration: true,
    });

    await tick();

    // Should have 4 headers: expansion(1) + checkbox(1) + columns(2)
    const headers = await screen.findAllByRole('columnheader');
    expect(headers.length).toBe(4);

    // Should not have layout management button
    const layoutButton = screen.queryByTitle('Configure Columns');
    expect(layoutButton).not.toBeInTheDocument();
  });
});

describe('Table column ordering persistence', () => {
  const kind = 'column-order-save-test';
  const columnItems: ListOrganizerItem[] = [
    { id: 'Name', label: 'Name', enabled: true, originalOrder: 0 },
    { id: 'Age', label: 'Age', enabled: true, originalOrder: 1 },
  ];

  afterEach(() => {
    tablePersistence.storage = undefined;
  });

  test('saves each column reorder, including a second reorder with the same map size', async () => {
    const storage = {
      load: vi.fn().mockResolvedValue(columnItems),
      save: vi.fn().mockResolvedValue(undefined),
      reset: vi.fn().mockResolvedValue(columnItems),
    };
    tablePersistence.storage = storage;

    render(Table, {
      kind,
      data: [{ name: 'Example row' }],
      columns: [new TableColumn('Name', {}), new TableColumn('Age', {})],
      row: { info: {} },
      enableLayoutConfiguration: true,
    });

    await vi.waitFor(() => expect(storage.save).toHaveBeenCalled());
    storage.save.mockClear();

    await fireEvent.click(screen.getByRole('button', { name: 'Configure Columns' }));
    let reorderButtons = screen.getAllByRole('button', {
      name: 'Use arrow keys to reorder, or drag with mouse',
    });
    await fireEvent.keyDown(reorderButtons[0], { key: 'ArrowDown' });

    await vi.waitFor(() =>
      expect(
        screen
          .getAllByRole('columnheader')
          .map(header => header.textContent?.trim())
          .filter(Boolean),
      ).toEqual(['Age', 'Name']),
    );
    await vi.waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Use arrow keys to reorder, or drag with mouse' })[1]).toHaveFocus(),
    );
    await vi.waitFor(() => expect(storage.save).toHaveBeenLastCalledWith(kind, [columnItems[1], columnItems[0]]));

    storage.save.mockClear();
    reorderButtons = screen.getAllByRole('button', {
      name: 'Use arrow keys to reorder, or drag with mouse',
    });
    await fireEvent.keyDown(reorderButtons[0], { key: 'ArrowDown' });

    await vi.waitFor(() =>
      expect(
        screen
          .getAllByRole('columnheader')
          .map(header => header.textContent?.trim())
          .filter(Boolean),
      ).toEqual(['Name', 'Age']),
    );
    await vi.waitFor(() =>
      expect(screen.getAllByRole('button', { name: 'Use arrow keys to reorder, or drag with mouse' })[1]).toHaveFocus(),
    );
    await vi.waitFor(() => expect(storage.save).toHaveBeenLastCalledWith(kind, columnItems));
  });
});

describe('Table collapse state persistence across remounts', () => {
  interface Item {
    id: string;
    name?: string;
  }

  const ROW = new Row<Item>({
    children: (item): Item[] => [{ id: `${item.id}-child`, name: `${item.name} child` }],
  });

  const COLUMN = new Column<Item, string>('Name', {
    width: '3fr',
    renderMapping: (obj): string => obj.name ?? 'unknown',
    renderer: SimpleColumn,
  });

  beforeEach(() => {
    collapsedStateMap.clear();
  });

  test('collapsed state is restored when Table with same kind is remounted', async () => {
    const data: Item[] = [{ id: 'group1', name: 'Group 1' }];

    const { unmount, getByRole } = render(Table<Item>, {
      kind: 'remount-test',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    const collapseBtn = getByRole('button', { name: 'Collapse Row' });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');

    await fireEvent.click(collapseBtn);

    const expandBtn = getByRole('button', { name: 'Expand Row' });
    expect(expandBtn).toHaveAttribute('aria-expanded', 'false');

    unmount();

    const { getByRole: getByRole2 } = render(Table<Item>, {
      kind: 'remount-test',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    const expandBtn2 = getByRole2('button', { name: 'Expand Row' });
    expect(expandBtn2).toHaveAttribute('aria-expanded', 'false');
  });

  test('different kind values maintain independent collapsed state', async () => {
    const data: Item[] = [{ id: 'group1', name: 'Group 1' }];

    const { unmount, getByRole } = render(Table<Item>, {
      kind: 'kind-a',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    await fireEvent.click(getByRole('button', { name: 'Collapse Row' }));
    unmount();

    const { getByRole: getByRole2 } = render(Table<Item>, {
      kind: 'kind-b',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    const collapseBtn = getByRole2('button', { name: 'Collapse Row' });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('expanding a previously collapsed row updates the persisted state', async () => {
    const data: Item[] = [{ id: 'group1', name: 'Group 1' }];

    const { unmount, getByRole } = render(Table<Item>, {
      kind: 'toggle-back-test',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    await fireEvent.click(getByRole('button', { name: 'Collapse Row' }));
    await fireEvent.click(getByRole('button', { name: 'Expand Row' }));

    unmount();

    const { getByRole: getByRole2 } = render(Table<Item>, {
      kind: 'toggle-back-test',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    const collapseBtn = getByRole2('button', { name: 'Collapse Row' });
    expect(collapseBtn).toHaveAttribute('aria-expanded', 'true');
  });

  test('multiple rows persist their individual collapsed state', async () => {
    const data: Item[] = [
      { id: 'g1', name: 'Group 1' },
      { id: 'g2', name: 'Group 2' },
    ];

    const { unmount, getAllByRole } = render(Table<Item>, {
      kind: 'multi-row-test',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    const collapseButtons = getAllByRole('button', { name: 'Collapse Row' });
    expect(collapseButtons).toHaveLength(2);

    await fireEvent.click(collapseButtons[0]);

    unmount();

    const { getByRole: getByRole2 } = render(Table<Item>, {
      kind: 'multi-row-test',
      data,
      columns: [COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
    });

    const g1Row = getByRole2('row', { name: 'Group 1' });
    const g1Btn = within(g1Row).getByRole('button', { name: 'Expand Row' });
    expect(g1Btn).toHaveAttribute('aria-expanded', 'false');

    const g2Row = getByRole2('row', { name: 'Group 2' });
    const g2Btn = within(g2Row).getByRole('button', { name: 'Collapse Row' });
    expect(g2Btn).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('Table#rowClick', () => {
  interface Item {
    id: string;
    name: string;
    selected?: boolean;
  }

  const DATA: Item[] = [{ id: '1', name: 'Alice', selected: false }];

  const NAME_COLUMN = new Column<Item, string>('Name', {
    width: '3fr',
    renderMapping: (obj): string => obj.name,
    renderer: SimpleColumn,
  });

  const ACTIONS_COLUMN = new Column<Item, string>('Actions', {
    width: '90px',
    align: 'right',
    renderMapping: (obj): string => obj.name,
    renderer: SimpleColumn,
    excludeFromRowClick: true,
  });

  test('row click in data cell calls onClick with object and event', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const cell = within(row).getByText('Alice');
    await fireEvent.click(cell);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(DATA[0], expect.any(MouseEvent));
  });

  test('click directly on row element calls onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-gap-click-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    await fireEvent.click(row);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(DATA[0], expect.any(MouseEvent));
  });

  test('click in empty expander column calls onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-expander-column-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const expanderCell = row.querySelectorAll('[role="cell"]')[0];
    expect(expanderCell).toBeDefined();
    await fireEvent.click(expanderCell!);

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(DATA[0], expect.any(MouseEvent));
  });

  test('click in excluded column does not call onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-excluded-test',
      data: DATA,
      columns: [NAME_COLUMN, ACTIONS_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const cells = within(row).getAllByText('Alice');
    await fireEvent.click(cells[1]);

    expect(onClick).not.toHaveBeenCalled();
  });

  test('clickable callback can disable row click', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({
      onClick,
      clickable: (): boolean => false,
    });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-disabled-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    await fireEvent.click(within(row).getByText('Alice'));

    expect(onClick).not.toHaveBeenCalled();
  });

  test('non-clickable row does not have cursor-pointer class', async () => {
    const ROW = new Row<Item>({
      onClick: vi.fn(),
      clickable: (): boolean => false,
    });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-disabled-style-test',
      data: DATA,
      columns: [NAME_COLUMN, ACTIONS_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    expect(row).not.toHaveClass('cursor-pointer');
    expect(row).not.toHaveClass('opacity-50');
    expect(row).not.toHaveClass('hover:bg-[var(--pd-content-card-hover-bg)]');

    const cells = row.querySelectorAll('[role="cell"]');
    const nameCell = cells[1];
    expect(nameCell).toHaveClass('opacity-50');
    expect(nameCell).not.toHaveClass('group-hover:bg-[var(--pd-content-card-hover-bg)]');

    const actionsCell = cells[cells.length - 1];
    expect(actionsCell).not.toHaveClass('opacity-50');
  });

  test('click on expand button does not call onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({
      onClick,
      children: (item): Item[] => [{ id: `${item.id}-child`, name: `${item.name} child` }],
    });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-expand-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const expandButton = within(row).getByRole('button', { name: 'Collapse Row' });
    await fireEvent.click(expandButton);

    expect(onClick).not.toHaveBeenCalled();
  });

  test('click on checkbox does not call onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({
      onClick,
      selectable: (): boolean => true,
    });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-checkbox-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const checkbox = within(row).getByRole('checkbox');
    await fireEvent.click(checkbox);

    expect(onClick).not.toHaveBeenCalled();
  });

  test('click on button in data column does not call onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-data-button-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const nameCell = within(row).getByText('Alice').closest('[role="cell"]');
    const actionButton = document.createElement('button');
    actionButton.textContent = 'Run';
    nameCell?.appendChild(actionButton);

    const buttonHandler = vi.fn();
    actionButton.addEventListener('click', buttonHandler);

    await fireEvent.click(actionButton);

    expect(buttonHandler).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  test('click on menu item in excluded column does not call onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-excluded-menu-test',
      data: DATA,
      columns: [NAME_COLUMN, ACTIONS_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const cells = row.querySelectorAll('[role="cell"]');
    const actionsCell = cells[cells.length - 1];
    const menuItem = document.createElement('div');
    menuItem.setAttribute('role', 'none');
    menuItem.textContent = 'Delete';
    actionsCell?.appendChild(menuItem);

    const menuHandler = vi.fn();
    menuItem.addEventListener('click', menuHandler);

    await fireEvent.click(menuItem);

    expect(menuHandler).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  test('click on button in excluded column does not call onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const ActionsButtonColumn = new Column<Item, string>('Actions', {
      width: '90px',
      renderMapping: (obj): string => obj.name,
      renderer: SimpleColumn,
      excludeFromRowClick: true,
    });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-actions-button-test',
      data: DATA,
      columns: [NAME_COLUMN, ActionsButtonColumn],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    // Add a button inside the actions cell to simulate row action buttons
    const row = getByRole('row', { name: 'Alice' });
    const cells = row.querySelectorAll('[role="cell"]');
    const actionsCell = cells[cells.length - 1];
    const actionButton = document.createElement('button');
    actionButton.textContent = 'Delete';
    actionsCell?.appendChild(actionButton);

    const buttonHandler = vi.fn();
    actionButton.addEventListener('click', buttonHandler);

    await fireEvent.click(actionButton);

    expect(buttonHandler).toHaveBeenCalledOnce();
    expect(onClick).not.toHaveBeenCalled();
  });

  test('clickable row has cursor-pointer class', async () => {
    const ROW = new Row<Item>({ onClick: vi.fn() });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-cursor-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    expect(row).toHaveClass('cursor-pointer');
    expect(row).toHaveClass('group');
    expect(row).not.toHaveClass('hover:bg-[var(--pd-content-card-hover-bg)]');

    const nameCell = within(row).getByText('Alice').closest('[role="cell"]');
    expect(nameCell).toHaveClass('group-hover:bg-[var(--pd-content-card-hover-bg)]');
  });

  test('clickable row is keyboard focusable', async () => {
    const ROW = new Row<Item>({ onClick: vi.fn() });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-tabindex-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    expect(row).toHaveAttribute('tabindex', '0');
  });

  test('non-clickable row is not keyboard focusable', async () => {
    const ROW = new Row<Item>({
      onClick: vi.fn(),
      clickable: (): boolean => false,
    });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-no-tabindex-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    expect(row).not.toHaveAttribute('tabindex');
  });

  test('Enter key on focused row calls onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-enter-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    row.focus();
    await fireEvent.keyDown(row, { key: 'Enter' });

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(DATA[0], expect.any(KeyboardEvent));
  });

  test('Space key on focused row calls onClick', async () => {
    const onClick = vi.fn();
    const ROW = new Row<Item>({ onClick });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-space-test',
      data: DATA,
      columns: [NAME_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    row.focus();
    await fireEvent.keyDown(row, { key: ' ' });

    expect(onClick).toHaveBeenCalledOnce();
    expect(onClick).toHaveBeenCalledWith(DATA[0], expect.any(KeyboardEvent));
  });

  test('excluded column cell has cursor-default class', async () => {
    const ROW = new Row<Item>({ onClick: vi.fn() });

    const { getByRole } = render(Table<Item>, {
      kind: 'row-click-excluded-cursor-test',
      data: DATA,
      columns: [NAME_COLUMN, ACTIONS_COLUMN],
      row: ROW,
      key: (item: Item): string => item.id,
      label: (item: Item): string => item.name,
    });

    const row = getByRole('row', { name: 'Alice' });
    const cells = row.querySelectorAll('[role="cell"]');
    const actionsCell = cells[cells.length - 1];
    expect(actionsCell).toHaveClass('cursor-default');
  });
});
