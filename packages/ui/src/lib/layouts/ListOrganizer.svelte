<script lang="ts">
import { faCheck, faGripVertical, faPen, faUndo } from '@fortawesome/free-solid-svg-icons';
import { SvelteMap, SvelteSet } from 'svelte/reactivity';

import { Icon } from '../icons';
import type { ListOrganizerItem } from './ListOrganizer';

/**
 * ListOrganizer Component
 *
 * A dropdown component that allows users to toggle visibility and reorder items in a layout.
 * Displays as a hamburger menu button that opens a dropdown with checkboxes and drag handles.
 *
 * Usage:
 * ```svelte
 * <ListOrganizer
 *   items={listItems}
 *   ordering={columnOrdering}
 *   enableToggle={true}
 *   enableReorder={true}
 *   onToggle={(id, enabled) => handleToggle(id, enabled)}
 *   onOrderChange={(newOrdering) => handleOrderChange(newOrdering)}
 *   onReset={() => resetLayout()}
 * />
 * ```
 *
 * Features:
 * - Toggle items on/off with checkmarks
 * - Drag & drop reordering (mouse + keyboard accessible)
 * - Reset to default state
 * - Fully keyboard accessible
 */
interface Props {
  items: ListOrganizerItem[];
  ordering?: SvelteMap<string, number>;
  title?: string;
  enableReorder?: boolean;
  enableToggle?: boolean;
  onOrderChange?: (newOrdering: SvelteMap<string, number>) => void;
  onToggle?: (itemId: string, enabled: boolean) => void;
  onReset?: () => void;
  resetButtonLabel?: string;
  class?: string;
}

let {
  items = [],
  ordering = new SvelteMap(),
  title = 'Select items',
  enableReorder = false,
  enableToggle = false,
  onOrderChange,
  onToggle,
  onReset,
  resetButtonLabel = 'Reset to default',
  class: className = '',
}: Props = $props();

// Create ordered items list based on the ordering Map
let orderedItems = $derived.by(() => {
  // If no ordering provided, use original order
  if (ordering.size === 0) {
    return [...items].toSorted((a, b) => a.originalOrder - b.originalOrder);
  }

  // All items should be in the ordering map when reordering is active
  return [...items].toSorted((a, b) => {
    const aOrder = ordering.get(a.id) ?? a.originalOrder;
    const bOrder = ordering.get(b.id) ?? b.originalOrder;
    return aOrder - bOrder;
  });
});

// Create a reactive set derived from items (read-only)
let enabledItems: Set<string> = $derived(new SvelteSet(items.filter(item => item.enabled).map(item => item.id)));

let isResetDisabled = $derived.by(() => {
  // Reset callback must be provided
  if (!onReset) {
    return true;
  }

  // Reset is disabled if all items are enabled and in original order
  const allEnabled = items.every(item => item.enabled);

  // Check if items are in their original order (no custom ordering)
  const isInOriginalOrder = ordering.size === 0 || orderedItems.every((item, index) => item.originalOrder === index);

  return allEnabled && isInOriginalOrder;
});

let isOpen = $state(false);
let containerElement: HTMLDivElement;

// Drag and drop state (custom implementation)
let draggedIndex: number | undefined = $state(undefined);
let dragOverIndex: number | undefined = $state(undefined);
let isDraggingActive = $state(false);
let isGripHovered: boolean = $state(false);

function toggleDropdown(): void {
  isOpen = !isOpen;
}

function closeDropdown(): void {
  isOpen = false;
}

function handleItemToggle(item: ListOrganizerItem): void {
  if (!enableToggle || isDraggingActive) return;
  onToggle?.(item.id, !item.enabled);
}

// Creates a visual preview of the list while dragging.
function createDragPreview(dragIndex: number, hoverIndex: number): ListOrganizerItem[] {
  const newItems = [...orderedItems];
  const draggedItem = newItems[dragIndex];
  newItems.splice(dragIndex, 1);
  newItems.splice(hoverIndex, 0, draggedItem);
  return newItems;
}

// Starts the drag operation on mouse down.
function startDrag(event: MouseEvent, index: number): void {
  // Only react to left-click
  if (event.button !== 0) return;
  event.preventDefault();

  isDraggingActive = true;
  draggedIndex = index;
  dragOverIndex = index;
}

// Handles mouse movement anywhere on the window during a drag.
function handleWindowMouseMove(event: MouseEvent): void {
  if (!isDraggingActive) return;

  const targetElement = (event.target as Element).closest('[data-item-id]');
  if (!targetElement) return;

  const allItemElements = Array.from(containerElement.querySelectorAll('[data-item-id]'));
  const hoverIndex = allItemElements.findIndex(el => el === targetElement);

  if (hoverIndex !== -1 && dragOverIndex !== hoverIndex) {
    dragOverIndex = hoverIndex;
  }
}

// Stops the drag operation on mouse up.
function stopDrag(): void {
  if (!isDraggingActive || draggedIndex === undefined || dragOverIndex === undefined) {
    return;
  }

  if (draggedIndex !== dragOverIndex) {
    // Create new ordering based on the drag operation
    const newOrdering = new SvelteMap<string, number>();
    const reorderedItems = [...orderedItems];
    const [draggedItem] = reorderedItems.splice(draggedIndex, 1);
    reorderedItems.splice(dragOverIndex, 0, draggedItem);

    // Update the ordering map with new positions for ALL items
    reorderedItems.forEach((item, index) => {
      newOrdering.set(item.id, index);
    });

    onOrderChange?.(newOrdering);
  }
  resetDragging();
}

function resetDragging(): void {
  setTimeout(() => {
    isDraggingActive = false;
    draggedIndex = undefined;
    dragOverIndex = undefined;
  }, 0);
}

// Keyboard navigation for drag handles
function handleGripKeydown(event: KeyboardEvent, index: number): void {
  const { key } = event;

  // Prevent Space/Enter from toggling the item
  if (key === ' ' || key === 'Enter') {
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  // Handle arrow key reordering
  if (key === 'ArrowUp' || key === 'ArrowDown') {
    event.preventDefault();
    event.stopPropagation();

    const newIndex = key === 'ArrowUp' ? Math.max(0, index - 1) : Math.min(orderedItems.length - 1, index + 1);

    if (newIndex !== index) {
      // Create new ordering based on keyboard movement
      const newOrdering = new SvelteMap<string, number>();
      const reorderedItems = [...orderedItems];
      const [movedItem] = reorderedItems.splice(index, 1);
      reorderedItems.splice(newIndex, 0, movedItem);

      // Update the ordering map with new positions for ALL items
      reorderedItems.forEach((item, itemIndex) => {
        newOrdering.set(item.id, itemIndex);
      });

      onOrderChange?.(newOrdering);

      // Update focus to follow the moved item
      setTimeout(() => {
        const gripElements = containerElement.querySelectorAll('[data-grip-index]');
        const targetGrip = gripElements[newIndex] as HTMLElement;
        targetGrip?.focus();
      }, 0);
    }
  }
}

// Window event handlers
function handleWindowClick(e: Event): void {
  if (isOpen && e.target instanceof Node && !containerElement?.contains(e.target)) {
    closeDropdown();
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isOpen) {
    closeDropdown();
  }
}

// Handle reset - clear ordering and call parent reset
function handleReset(): void {
  // Clear the ordering Map to reset to original order
  onOrderChange?.(new SvelteMap());
  // Call parent reset handler for any additional reset logic
  onReset?.();
}
</script>

<svelte:window onclick={handleWindowClick} onkeydown={handleKeydown} onmousemove={handleWindowMouseMove} onmouseup={stopDrag} />
<svelte:body class:cursor-grabbing={isDraggingActive} />

<div class="relative inline-block {className}" bind:this={containerElement}>
  <button
    class="cursor-pointer text-[var(--pd-button-icon-text)] hover:text-[var(--pd-button-icon-hover-text)] transition-all duration-150 hover:scale-110 active:scale-95 flex items-center justify-center p-1"
    class:text-[var(--pd-button-icon-hover-text)]={isOpen}
    onclick={toggleDropdown}
    title={title}
    aria-label={title}
    aria-expanded={isOpen}
    tabindex="0"
  >
    <Icon icon={faPen} />
  </button>

  {#if isOpen}
    <div
      class="origin-top-right absolute z-50 right-0 top-full mt-1 overflow-y-auto overflow-x-hidden rounded-md shadow-lg bg-[var(--pd-dropdown-bg)] border border-[var(--pd-dropdown-border)] text-nowrap animate-in fade-in zoom-in-95 duration-200"
    >
      <div class="bg-[var(--pd-dropdown-header-bg)]">
        {#each (isDraggingActive && draggedIndex !== undefined && dragOverIndex !== undefined) ? createDragPreview(draggedIndex, dragOverIndex) : orderedItems as item, index (item.id)}
          {@const originalIndex = orderedItems.findIndex(originalItem => originalItem.id === item.id)}
            <button
              class="flex items-center justify-between px-3 py-2 w-full"
              class:cursor-pointer={!isDraggingActive && !isGripHovered}
              class:cursor-default={!isDraggingActive && isGripHovered}
              class:cursor-grabbing={isDraggingActive}
              class:hover:bg-[var(--pd-dropdown-item-hover-bg)]={!isDraggingActive}
              class:bg-[var(--pd-dropdown-item-hover-bg)]={isDraggingActive && dragOverIndex === index}
              class:opacity-60={isDraggingActive && draggedIndex === originalIndex}
              data-item-id={item.id}
              onclick={(): void => handleItemToggle(item)}
            >
              <div class="flex items-center justify-start gap-3 flex-1">
                <div class="w-4 h-4 flex items-center justify-center flex-shrink-0 pointer-events-none">
                  {#if enabledItems.has(item.id)}
                    <Icon icon={faCheck}/>
                  {/if}
                </div>
                <span class="text-sm text-[var(--pd-dropdown-item-text)] pr-10 flex-1 text-left">
                  {item.label}
                </span>
              </div>

              {#if enableReorder}
              <div
                class="text-[var(--pd-dropdown-item-text)] flex-shrink-0 rounded-sm p-1"
                class:cursor-grab={!isDraggingActive}
                class:cursor-grabbing={isDraggingActive}
                draggable={true}
                role="button"
                tabindex="0"
                data-grip-index={originalIndex}
                onmousedown={(e): void => startDrag(e, originalIndex)}
                onclick={(e): void => e.stopPropagation()}
                onkeydown={(e): void => handleGripKeydown(e, originalIndex)}
                onmouseenter={(): void => {isGripHovered = true;}}
                onmouseleave={(): void => {isGripHovered = false;}}
                title="Use arrow keys to reorder, or drag with mouse"
              >
                <Icon icon={faGripVertical} class="text-[var(--pd-dropdown-item-text)]"/>
              </div>
            {/if}
          </button>
        {/each}
      </div>

      <div class="flex items-center justify-between">
        {#if onReset}
          <button
            class="flex items-center justify-start px-3 pb-2 w-full transition-colors select-none"
            class:cursor-pointer={!isResetDisabled}
            class:cursor-not-allowed={isResetDisabled}
            class:hover:bg-[var(--pd-dropdown-item-hover-bg)]={!isResetDisabled}
            class:opacity-50={isResetDisabled}
            class:text-[var(--pd-dropdown-item-disabled-text)]={isResetDisabled}
            onclick={isResetDisabled ? undefined : handleReset}
            disabled={isResetDisabled}
            tabindex={isResetDisabled ? -1 : 0}
          >
            <div class="flex items-center justify-start gap-3 flex-1 border-t border-(--pd-dropdown-divider) pt-2">
              <div class="w-4 h-4 flex items-center justify-center flex-shrink-0">
                <Icon icon={faUndo} size='0.8x'/>
              </div>
              <span class="text-sm text-[var(--pd-dropdown-item-text)] select-none flex-1 text-left">
                {resetButtonLabel}
              </span>
            </div>
          </button>
        {/if}
      </div>
    </div>
  {/if}
</div>
