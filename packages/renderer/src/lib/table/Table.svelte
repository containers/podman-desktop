<style>
.grid-table {
  display: grid;
}
</style>

<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { afterUpdate, tick } from 'svelte';
import Checkbox from '../ui/Checkbox.svelte';
import type { Column, Row } from './table';
import { flip } from 'svelte/animate';
/* eslint-enable import/no-duplicates */

export let kind: string;
export let data: any[];
export let columns: Column<any>[];
export let row: Row<any>;

// number of selected items in the list
export let selectedItemsNumber: number = 0;
$: selectedItemsNumber = row.selectable
  ? data.filter(object => row.selectable?.(object)).filter(object => object.selected).length
  : 0;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes = row.selectable
  ? data.filter(object => row.selectable?.(object)).every(object => object.selected)
  : false;

function toggleAll(checked: boolean) {
  if (!row.selectable) {
    return;
  }
  const toggleData = data;
  toggleData.filter(object => row.selectable?.(object)).forEach(object => (object.selected = checked));
  data = toggleData;
}

let sortCol: Column<any>;
let sortAscending: boolean;

function sort(column: Column<any>) {
  if (!column) {
    return;
  }

  let comparator = column.comparator;
  if (!comparator) {
    // column is not sortable
    return;
  }

  if (sortCol === column) {
    sortAscending = !sortAscending;
  } else {
    sortCol = column;
    sortAscending = true;
  }
  if (!sortAscending) {
    // we're already sorted, switch to reverse order
    let comparatorTemp = comparator;
    comparator = (a, b) => -comparatorTemp(a, b);
  }
  const sortedData = data;
  sortedData.sort(comparator);
  data = sortedData;
}

afterUpdate(async () => {
  await tick();
  setGridColumns();
});

function setGridColumns() {
  // section and checkbox columns
  let columnWidths: string[] = ['20px', '32px'];

  // custom columns
  for (const column of columns) {
    if (column.info.width) {
      columnWidths.push(column.info.width);
    } else {
      columnWidths.push('1fr');
    }
  }

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
  <div
    class="grid grid-table gap-x-0.5 mx-5 h-7 sticky top-0 bg-charcoal-700 text-xs text-gray-600 font-bold uppercase z-[2]"
    role="row">
    <div class="whitespace-nowrap justify-self-start"></div>
    <div class="whitespace-nowrap place-self-center" role="columnheader">
      {#if row.selectable}
        <Checkbox
          title="Toggle all"
          bind:checked="{selectedAllCheckboxes}"
          indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
          on:click="{event => toggleAll(event.detail)}" />
      {/if}
    </div>
    {#each columns as column}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <!-- svelte-ignore a11y-interactive-supports-focus -->
      <div
        class="whitespace-nowrap {column.info.align === 'right'
          ? 'justify-self-end'
          : column.info.align === 'center'
            ? 'justify-self-center'
            : 'justify-self-start'} self-center"
        on:click="{() => sort(column)}"
        role="columnheader">
        {column.title}{#if column.comparator}<i
            class="fas pl-0.5"
            class:fa-sort="{sortCol !== column}"
            class:fa-sort-up="{sortCol === column && !sortAscending}"
            class:fa-sort-down="{sortCol === column && sortAscending}"
            aria-hidden="true"></i
          >{/if}
      </div>
    {/each}
  </div>
  <!-- Table body -->
  {#each data as object (object)}
    <div
      class="grid grid-table gap-x-0.5 mx-5 h-12 bg-charcoal-800 hover:bg-zinc-700 rounded-lg mb-2"
      animate:flip="{{ duration: 300 }}"
      role="row">
      <div class="whitespace-nowrap justify-self-start"></div>
      <div class="whitespace-nowrap place-self-center">
        {#if row.selectable}
          <Checkbox
            title="Toggle {kind}"
            bind:checked="{object.selected}"
            disabled="{!row.selectable(object)}"
            disabledTooltip="{row.disabledText}}" />
        {/if}
      </div>
      {#each columns as column}
        <div
          class="whitespace-nowrap {column.info.align === 'right'
            ? 'justify-self-end'
            : column.info.align === 'center'
              ? 'justify-self-center'
              : 'justify-self-start'} self-center overflow-hidden"
          role="cell">
          {#if column.info.renderer}
            <svelte:component this="{column.info.renderer}" object="{object}" />
          {/if}
        </div>
      {/each}
    </div>
  {/each}
</div>
