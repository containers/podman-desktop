<style>
.grid-table {
  display: grid;
}
</style>

<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { afterUpdate, onMount, tick } from 'svelte';
import { flip } from 'svelte/animate';

import Checkbox from '../ui/Checkbox.svelte';
import type { Column, Row } from './table';
/* eslint-enable import/no-duplicates */

export let kind: string;
export let data: any[];
export let columns: Column<any>[];
export let row: Row<any>;
export let defaultSortColumn: string | undefined = undefined;

// number of selected items in the list
export let selectedItemsNumber: number = 0;
$: selectedItemsNumber = row.info.selectable
  ? data.filter(object => row.info.selectable?.(object) && object.selected).length
  : 0;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes = row.info.selectable
  ? data.filter(object => row.info.selectable?.(object)).every(object => object.selected)
  : false;

function toggleAll(checked: boolean) {
  if (!row.info.selectable) {
    return;
  }
  data.filter(object => row.info.selectable?.(object)).forEach(object => (object.selected = checked));
}

let sortCol: Column<any>;
let sortAscending: boolean;

if (data) {
  sortImpl();
}

function sort(column: Column<any>) {
  if (!column) {
    return;
  }

  let comparator = column.info.comparator;
  if (!comparator) {
    // column is not sortable
    return;
  }

  if (sortCol === column) {
    sortAscending = !sortAscending;
  } else {
    sortCol = column;
    sortAscending = column.info.initialOrder ? column.info.initialOrder !== 'descending' : true;
  }
  sortImpl();
}

function sortImpl() {
  // confirm we're sorting
  if (!sortCol) {
    return;
  }

  let comparator = sortCol.info.comparator;
  if (!comparator) {
    // column is not sortable
    return;
  }

  if (!sortAscending) {
    // we're already sorted, switch to reverse order
    let comparatorTemp = comparator;
    comparator = (a, b) => -comparatorTemp(a, b);
  }

  // eslint-disable-next-line etc/no-assign-mutated-array
  data = data.sort(comparator);
}

onMount(async () => {
  const column: Column<any> | undefined = columns.find(column => column.title === defaultSortColumn);
  if (column?.info.comparator) {
    sortCol = column;
    sortAscending = column.info.initialOrder ? column.info.initialOrder !== 'descending' : true;
  }
});

afterUpdate(async () => {
  await tick();
  setGridColumns();
});

function setGridColumns() {
  // section and checkbox columns
  let columnWidths: string[] = ['20px'];

  if (row.info.selectable) {
    columnWidths.push('32px');
  }

  // custom columns
  columns.map(c => c.info.width ?? '1fr').forEach(w => columnWidths.push(w));

  // final spacer
  columnWidths.push('5px');

  let wid = columnWidths.join(' ');
  let grids: HTMLCollection = document.getElementsByClassName('grid-table');
  for (const element of grids) {
    (element as HTMLElement).style.setProperty('grid-template-columns', wid);
  }
}
</script>

<div class="w-full" class:hidden="{data.length === 0}" role="table">
  <!-- Table header -->
  <div role="rowgroup">
    <div
      class="grid grid-table gap-x-0.5 mx-5 h-7 sticky top-0 bg-charcoal-700 text-xs text-gray-600 font-bold uppercase z-[2]"
      role="row">
      <div class="whitespace-nowrap justify-self-start" role="columnheader"></div>
      {#if row.info.selectable}
        <div class="whitespace-nowrap place-self-center" role="columnheader">
          <Checkbox
            title="Toggle all"
            bind:checked="{selectedAllCheckboxes}"
            indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
            on:click="{event => toggleAll(event.detail)}" />
        </div>
      {/if}
      {#each columns as column}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <div
          class="whitespace-nowrap {column.info.align === 'right'
            ? 'justify-self-end'
            : column.info.align === 'center'
              ? 'justify-self-center'
              : 'justify-self-start'} self-center select-none"
          class:cursor-pointer="{column.info.comparator}"
          on:click="{() => sort(column)}"
          role="columnheader">
          {column.title}{#if column.info.comparator}<i
              class="fas pl-0.5"
              class:fa-sort="{sortCol !== column}"
              class:fa-sort-up="{sortCol === column && sortAscending}"
              class:fa-sort-down="{sortCol === column && !sortAscending}"
              class:text-charcoal-200="{sortCol !== column}"
              aria-hidden="true"></i
            >{/if}
        </div>
      {/each}
    </div>
  </div>
  <!-- Table body -->
  <div role="rowgroup">
    {#each data as object (object)}
      <div
        class="grid grid-table gap-x-0.5 mx-5 min-h-[48px] h-fit bg-charcoal-800 hover:bg-zinc-700 rounded-lg mb-2"
        animate:flip="{{ duration: 300 }}"
        role="row">
        <div class="whitespace-nowrap justify-self-start" role="cell"></div>
        {#if row.info.selectable}
          <div class="whitespace-nowrap place-self-center" role="cell">
            <Checkbox
              title="Toggle {kind}"
              bind:checked="{object.selected}"
              disabled="{!row.info.selectable(object)}"
              disabledTooltip="{row.info.disabledText}" />
          </div>
        {/if}
        {#each columns as column}
          <div
            class="whitespace-nowrap {column.info.align === 'right'
              ? 'justify-self-end'
              : column.info.align === 'center'
                ? 'justify-self-center'
                : 'justify-self-start'} self-center {column.info.overflow === true ? '' : 'overflow-hidden'} max-w-full"
            role="cell">
            {#if column.info.renderer}
              <svelte:component
                this="{column.info.renderer}"
                object="{column.info.renderMapping?.(object) ?? object}"
                on:update />
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
