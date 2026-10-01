<style>
.grid-table {
  display: grid;
  grid-template-columns: var(--table-grid-table-columns);
}
</style>

<script lang="ts" generics="T extends { selected?: boolean; name?: string }">
import { onMount } from 'svelte';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import Checkbox from '../checkbox/Checkbox.svelte';
import ChevronExpander from '../icons/ChevronExpander.svelte';
import type { ListOrganizerItem } from '../layouts/ListOrganizer';
import ListOrganizer from '../layouts/ListOrganizer.svelte';
import type { Column, Row } from './table';
import { collapsedStateMap, tablePersistence } from './table-persistence-store.svelte';

export let kind: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let columns: Column<T, any>[];
export let row: Row<T>;
export let data: T[];
export let defaultSortColumn: string | undefined = undefined;
export let collapsed: string[] = collapsedStateMap.get(kind) ?? [];
/**
 * To better distinct individual row, you can provide a dedicated key method
 *
 * By default, it will use the object name property
 */
export let key: (object: T) => string = item => item.name ?? String(item);
/**
 * Specify the aria-label for a given item
 *
 * By default, it will use the object name property
 */
export let label: (object: T) => string = item => item.name ?? String(item);

export let enableLayoutConfiguration: boolean = false;

let columnItems: ListOrganizerItem[] = [];
let columnOrdering = new SvelteMap<string, number>();
let isInitialized = false;
let isLoading = false;

// Initialize default column configuration
function getDefaultColumnItems(): ListOrganizerItem[] {
  return columns.map((col, index) => ({
    id: col.title,
    label: col.title,
    enabled: true,
    originalOrder: index,
  }));
}

// Initialize column configuration
async function initializeColumns(): Promise<void> {
  if (isInitialized || isLoading) return;

  isLoading = true;
  try {
    if (enableLayoutConfiguration) {
      const loadedItems = await loadColumnConfiguration();
      columnItems = loadedItems;
    } else {
      columnItems = getDefaultColumnItems();
    }
    isInitialized = true;
  } catch (error: unknown) {
    console.error('Failed to load column configuration:', error);
    // Fallback to default configuration
    columnItems = getDefaultColumnItems();
    isInitialized = true;
  } finally {
    isLoading = false;
  }
}

// Initialize columns on mount
onMount(async () => {
  await initializeColumns();
});

// Load configuration
async function loadColumnConfiguration(): Promise<ListOrganizerItem[]> {
  if (enableLayoutConfiguration && tablePersistence.storage) {
    const loadedItems = await tablePersistence.storage.load(
      kind,
      columns.map(col => col.title),
    );

    if (loadedItems.length > 0) {
      // Ensure loaded items have proper originalOrder from defaults if missing
      const defaultItems = getDefaultColumnItems();
      const items = loadedItems.map((item: ListOrganizerItem) => ({
        ...item,
        originalOrder: item.originalOrder ?? defaultItems.find(d => d.id === item.id)?.originalOrder ?? 0,
      }));

      // Build ordering map from loaded items
      // Check if items are in a different order than their original order
      const isReordered = items.some((item, index) => item.originalOrder !== index);
      if (isReordered) {
        const ordering = new SvelteMap<string, number>();
        items.forEach((item, index) => {
          ordering.set(item.id, index);
        });
        columnOrdering = ordering;
      } else {
        columnOrdering.clear();
      }

      return items;
    }
  }
  return getDefaultColumnItems();
}

// Save configuration
async function saveColumnConfiguration(): Promise<void> {
  if (enableLayoutConfiguration && tablePersistence.storage) {
    // Create ordered items based on current state
    const orderedItems = getOrderedColumns();
    await tablePersistence.storage.save(kind, orderedItems);
  }
}

// Get ordered columns based on current ordering
function getOrderedColumns(): ListOrganizerItem[] {
  if (columnOrdering.size === 0) {
    return columnItems.toSorted((a, b) => a.originalOrder - b.originalOrder);
  }
  return columnItems.toSorted((a, b) => {
    const aOrder = columnOrdering.get(a.id) ?? a.originalOrder;
    const bOrder = columnOrdering.get(b.id) ?? b.originalOrder;
    return aOrder - bOrder;
  });
}

// Save configuration whenever columnItems or ordering changes (after initialization)
$: if (isInitialized && columnItems.length > 0) {
  columnOrdering;
  saveColumnConfiguration().catch((error: unknown) => {
    console.error('Failed to save column configuration:', error);
  });
}

// Computed visible columns based on configuration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
$: visibleColumns = ((): Column<T, any>[] => {
  if (columnItems.length === 0) {
    // Fallback to all columns when not yet initialized
    return columns;
  }

  // Get ordered columns inline to ensure reactivity
  const orderedColumns =
    columnOrdering.size === 0
      ? columnItems.toSorted((a, b) => a.originalOrder - b.originalOrder)
      : columnItems.toSorted((a, b) => {
          const aOrder = columnOrdering.get(a.id) ?? a.originalOrder;
          const bOrder = columnOrdering.get(b.id) ?? b.originalOrder;
          return aOrder - bOrder;
        });

  const result = orderedColumns
    .filter(item => item.enabled)
    .map(item => columns.find(col => col.title === item.id)!)
    .filter(Boolean);

  return result;
})();

let tableHtmlDivElement: HTMLDivElement | undefined = undefined;

// Reactive source of truth for the selection UI. Callers may pass a plain /
// $derived array whose elements are not reactive, so selection is tracked in
// this SvelteSet; object.selected is mutated in parallel so callers can read it
// back (e.g. data.filter(o => o.selected)).
let selectedItems = new SvelteSet<T>();

// (Re)seed the selection from the incoming data whenever it changes.
$: {
  const selected = new SvelteSet<T>();
  for (const object of data) {
    if (object.selected) {
      selected.add(object);
    }
    for (const child of row.info.children?.(object) ?? []) {
      if (child.selected) {
        selected.add(child);
      }
    }
  }
  selectedItems = selected;
}

function setSelected(object: T, checked: boolean): void {
  object.selected = checked;
  if (checked) {
    selectedItems.add(object);
  } else {
    selectedItems.delete(object);
  }
  selectedItems = selectedItems;
}

// All selectable items (parents and their children) in the current view.
let selectableItems: T[] = [];
$: {
  if (!row.info.selectable) {
    selectableItems = [];
  } else {
    let items: T[] = [];
    for (const object of data) {
      if (row.info.selectable(object)) {
        items.push(object);
      }
      for (const child of row.info.children?.(object) ?? []) {
        if (row.info.selectable(child)) {
          items.push(child);
        }
      }
    }
    selectableItems = items;
  }
}

// number of selected items in the list
export let selectedItemsNumber: number = 0;
$: selectedItemsNumber = selectableItems.filter(item => selectedItems.has(item)).length;

// do we need to unselect all checkboxes if we don't have all items being selected ?
let selectedAllCheckboxes: boolean | undefined;
$: selectedAllCheckboxes = selectableItems.length > 0 && selectableItems.every(item => selectedItems.has(item));

function toggleAll(event: CustomEvent<boolean>): void {
  const checked = event.detail;
  for (const item of selectableItems) {
    setSelected(item, checked);
  }
  selectedItems = selectedItems;
}

const defaultSortCol = columns.find(column => column.title === defaultSortColumn && column.info.comparator);
let sortCol: Column<T> | undefined = defaultSortCol;
let sortAscending = defaultSortCol?.info.initialOrder ? defaultSortCol.info.initialOrder !== 'descending' : true;

let rows: T[];
$: rows = ((): T[] => {
  const comparator = sortCol?.info.comparator;
  if (!comparator) {
    return data;
  }

  const cmp = sortAscending ? comparator : (a: T, b: T): number => -comparator(a, b);
  return data.toSorted(cmp);
})();

function sort(column: Column<T>): void {
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
}

let gridTemplateColumns: string;
$: {
  // section and checkbox columns
  let columnWidths: string[] = ['20px'];

  if (row.info.selectable) {
    columnWidths.push('32px');
  }

  // custom columns
  visibleColumns.map(c => c.info.width ?? '1fr').forEach(w => columnWidths.push(w));

  if (enableLayoutConfiguration && tablePersistence) {
    // Add space for settings icon in header (32px)
    columnWidths.push('32px');
  } else {
    // final spacer
    columnWidths.push('5px');
  }

  gridTemplateColumns = columnWidths.join(' ');
}

function objectChecked(object: T, event: CustomEvent<boolean>): void {
  const checked = event.detail;
  setSelected(object, checked);
  // check for children and set them to the same state
  if (row.info.children) {
    const children = row.info.children(object);
    if (children) {
      children.forEach(child => setSelected(child, checked));
    }
  }
  selectedItems = selectedItems;
}

function childChecked(child: T, event: CustomEvent<boolean>): void {
  setSelected(child, event.detail);
  selectedItems = selectedItems;
}

function toggleChildren(name: string | undefined): void {
  if (!name) {
    return;
  }

  if (collapsed.includes(name)) {
    const index = collapsed.indexOf(name, 0);
    if (index > -1) {
      collapsed.splice(index, 1);
    }
  } else {
    collapsed.push(name);
  }
  // trigger Svelte update
  collapsed = collapsed;
  collapsedStateMap.set(kind, [...collapsed]);
}

// Handle column order changes from ListOrganizer
function handleColumnOrderChange(newOrdering: SvelteMap<string, number>): void {
  columnOrdering = newOrdering;
}

// Handle column toggle changes from ListOrganizer
function handleColumnToggle(itemId: string, enabled: boolean): void {
  columnItems = columnItems.map(item => (item.id === itemId ? { ...item, enabled } : item));
}

// Reset columns to default state and clear saved configuration
async function resetColumns(): Promise<void> {
  try {
    if (enableLayoutConfiguration && tablePersistence.storage) {
      columnItems = await tablePersistence.storage.reset(
        kind,
        columns.map(col => col.title),
      );
      columnOrdering.clear();
    } else {
      columnItems = getDefaultColumnItems();
      columnOrdering.clear();
    }
  } catch (error: unknown) {
    console.error(`Failed to reset column configuration in table ${kind}: ${error}`);
    // Fallback to default configuration
    columnItems = getDefaultColumnItems();
    columnOrdering.clear();
  }
}

const INTERACTIVE_SELECTOR =
  'button, a, input, select, textarea, label, [role="button"], [role="menuitem"], [role="checkbox"], [role="switch"]';

function isRowClickable(object: T): boolean {
  return !!row.info.onClick && (row.info.clickable?.(object) ?? true);
}

function eventTargetElement(event: MouseEvent): Element | undefined {
  if (event.target instanceof Element) {
    return event.target;
  }
  if (event.target instanceof Text) {
    return event.target.parentElement ?? undefined;
  }
  return undefined;
}

function isInteractiveClick(event: MouseEvent, rowElement: HTMLElement): boolean {
  const target = eventTargetElement(event);
  if (!target || !rowElement.contains(target)) {
    return false;
  }

  return target.closest(INTERACTIVE_SELECTOR) !== null;
}

function shouldIgnoreRowClick(rowElement: HTMLElement, event: MouseEvent): boolean {
  const target = eventTargetElement(event);

  // Clicks on the row background / CSS grid gaps must navigate.
  if (!target || target === rowElement) {
    return false;
  }

  // Do not stopPropagation: Svelte 5 delegates onclick to the document, so
  // stopping at a cell prevents action buttons from receiving the click.
  if (isInteractiveClick(event, rowElement)) {
    return true;
  }

  const cell = target.closest('[role="cell"]');
  if (!cell || !rowElement.contains(cell)) {
    return true;
  }

  const cells = Array.from(rowElement.querySelectorAll(':scope > [role="cell"]'));
  const cellIndex = cells.indexOf(cell as HTMLElement);
  if (cellIndex < 0) {
    return true;
  }

  const columnIndex = cellIndex - (row.info.selectable ? 2 : 1);
  if (columnIndex < 0) {
    // Expander and checkbox columns: allow navigation unless an interactive control handled above.
    return false;
  }

  if (columnIndex >= visibleColumns.length) {
    return true;
  }

  return visibleColumns[columnIndex].info.excludeFromRowClick === true;
}

function invokeRowClick(object: T, rowElement: HTMLElement, event: Event): void {
  if (!isRowClickable(object) || !row.info.onClick) {
    return;
  }

  if (event instanceof MouseEvent && shouldIgnoreRowClick(rowElement, event)) {
    return;
  }

  row.info.onClick(object, event);
}

function handleRowClick(object: T, event: MouseEvent): void {
  invokeRowClick(object, event.currentTarget as HTMLElement, event);
}

function handleRowKeyDown(object: T, event: KeyboardEvent): void {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return;
  }

  const rowElement = event.currentTarget as HTMLElement;
  if (event.target !== rowElement) {
    return;
  }

  event.preventDefault();
  invokeRowClick(object, rowElement, event);
}
</script>

<div
  style="--table-grid-table-columns: {gridTemplateColumns}"
  class="w-full mx-5"
  class:hidden={data.length === 0}
  role="table"
  aria-label={kind}
  bind:this={tableHtmlDivElement}>
  <!-- Table header -->
  <div role="rowgroup" class="relative">
    <div
      class="grid grid-table gap-x-0.5 h-7 sticky top-0 text-[var(--pd-table-header-text)] uppercase z-2"
      role="row">
      <div class="whitespace-nowrap justify-self-start" role="columnheader"></div>
      {#if row.info.selectable}
        <div class="whitespace-nowrap place-self-center" role="columnheader">
          <Checkbox
            title="Toggle all"
            checked={selectedAllCheckboxes}
            disabled={!row.info.selectable || data.filter(object => row.info.selectable?.(object)).length === 0}
            indeterminate={selectedItemsNumber > 0 && !selectedAllCheckboxes}
            on:click={toggleAll} />
        </div>
      {/if}
      {#each visibleColumns as column, index (index)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-interactive-supports-focus -->
        <div
          class="max-w-full overflow-hidden flex flex-row text-sm font-semibold items-center whitespace-nowrap {column
            .info.align === 'right'
            ? 'justify-self-end'
            : column.info.align === 'center'
              ? 'justify-self-center'
              : 'justify-self-start'} self-center select-none"
          class:cursor-pointer={column.info.comparator}
          on:click={sort.bind(undefined, column)}
          role="columnheader">
          <div class="overflow-hidden text-ellipsis">
            {column.title}
          </div>
          {#if column.info.comparator}<i
              class="fas pl-0.5"
              class:fa-sort={sortCol !== column}
              class:fa-sort-up={sortCol === column && sortAscending}
              class:fa-sort-down={sortCol === column && !sortAscending}
              class:text-[var(--pd-table-header-unsorted)]={sortCol !== column}
              aria-hidden="true"></i
            >{/if}
        </div>
      {/each}
      <!-- Empty space for settings - only when layout configuration is enabled -->
      {#if enableLayoutConfiguration && tablePersistence.storage}
        <div class="whitespace-nowrap justify-self-end place-self-center" role="columnheader"></div>
      {/if}
    </div>

    <!-- Settings - only show when layout configuration is enabled -->
    {#if enableLayoutConfiguration && tablePersistence.storage}
      <div class="absolute top-0 right-0 h-7 flex items-center pr-2 z-10">
        <ListOrganizer
          items={columnItems}
          ordering={columnOrdering}
          title="Configure Columns"
          enableReorder={true}
          enableToggle={true}
          onOrderChange={handleColumnOrderChange}
          onToggle={handleColumnToggle}
          onReset={resetColumns}
          resetButtonLabel="Reset to default"
        />
      </div>
    {/if}
  </div>
  <!-- Table body -->
  <div role="rowgroup">
    {#each rows as object (object)}
      {@const children = row.info.children?.(object) ?? []}
      {@const itemKey = key(object)}
      <div class="min-h-[48px] h-fit bg-[var(--pd-content-card-bg)] rounded-lg mb-2 border border-[var(--pd-content-table-border)]">
        <div
          class="grid grid-table gap-x-0.5 min-h-[48px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--pd-button-focus-ring)]"
          class:group={!!row.info.onClick}
          class:hover:bg-[var(--pd-content-card-hover-bg)]={!row.info.onClick}
          class:rounded-t-lg={!collapsed.includes(itemKey) &&
            children.length > 0}
          class:rounded-lg={collapsed.includes(itemKey) ||
            children.length === 0}
          class:cursor-pointer={isRowClickable(object)}
          role="row"
          tabindex={isRowClickable(object) ? 0 : undefined}
          aria-label={label(object)}
          on:click={handleRowClick.bind(undefined, object)}
          on:keydown={handleRowKeyDown.bind(undefined, object)}>
          <div
            class="whitespace-nowrap place-self-center"
            class:group-hover:bg-[var(--pd-content-card-hover-bg)]={row.info.onClick && isRowClickable(object)}
            role="cell">
            {#if children.length > 0}
              <button
                title={collapsed.includes(itemKey) ? 'Expand Row' : 'Collapse Row'}
                aria-expanded={!collapsed.includes(itemKey)}
                on:click={toggleChildren.bind(undefined, itemKey)}
              >
                <ChevronExpander
                  expanded={!collapsed.includes(itemKey)}
                  size="0.8x"
                  class="text-[var(--pd-table-body-text)] cursor-pointer" />
              </button>
            {/if}
          </div>
          {#if row.info.selectable}
            <div class="whitespace-nowrap place-self-center" role="cell">
              <Checkbox
                title="Toggle {kind}"
                checked={selectedItems.has(object)}
                disabled={!row.info.selectable(object)}
                disabledTooltip={row.info.disabledText}
                on:click={objectChecked.bind(undefined, object)} />
            </div>
          {/if}
          {#each visibleColumns as column, index (index)}
            <div
              class="whitespace-nowrap {column.info.align === 'right'
                ? 'justify-self-end'
                : column.info.align === 'center'
                  ? 'justify-self-center'
                  : 'justify-self-start'} self-center {column.info.overflow === true
                ? ''
                : 'overflow-hidden'} max-w-full py-1.5"
              class:col-span-2={index === visibleColumns.length - 1 && enableLayoutConfiguration && tablePersistence.storage}
              class:group-hover:bg-[var(--pd-content-card-hover-bg)]={row.info.onClick &&
                isRowClickable(object) &&
                !column.info.excludeFromRowClick}
              class:opacity-50={row.info.onClick && !isRowClickable(object) && !column.info.excludeFromRowClick}
              class:cursor-default={column.info.excludeFromRowClick && isRowClickable(object)}
              role="cell">
              {#if column.info.renderer}
                <svelte:component
                  this={column.info.renderer}
                  object={column.info.renderMapping ? column.info.renderMapping(object) : object} />
              {/if}
            </div>
          {/each}
        </div>

        <!-- Child objects -->
        {#if !collapsed.includes(itemKey) && children.length > 0}
          {#each children as child, i (child)}
            <div
              class="grid grid-table gap-x-0.5 hover:bg-[var(--pd-content-card-hover-bg)]"
              class:rounded-b-lg={i === children.length - 1}
              role="row"
              aria-label={child.name}>
              <div class="whitespace-nowrap justify-self-start" role="cell"></div>
              {#if row.info.selectable}
                <div class="whitespace-nowrap place-self-center" role="cell">
                  <Checkbox
                    title="Toggle {kind}"
                    checked={selectedItems.has(child)}
                    disabled={!row.info.selectable(child)}
                    disabledTooltip={row.info.disabledText}
                    on:click={childChecked.bind(undefined, child)} />
                </div>
              {/if}
              {#each visibleColumns as column, index (index)}
                <div
                  class="whitespace-nowrap {column.info.align === 'right'
                    ? 'justify-self-end'
                    : column.info.align === 'center'
                      ? 'justify-self-center'
                      : 'justify-self-start'} self-center {column.info.overflow === true
                    ? ''
                    : 'overflow-hidden'} max-w-full py-1.5"
                  class:col-span-2={index === visibleColumns.length - 1 && enableLayoutConfiguration && tablePersistence.storage}
                  role="cell">
                  {#if column.info.renderer}
                    <svelte:component
                      this={column.info.renderer}
                      object={column.info.renderMapping ? column.info.renderMapping(child) : child} />
                  {/if}
                </div>
              {/each}
            </div>
          {/each}
        {/if}
      </div>
    {/each}
  </div>
</div>
