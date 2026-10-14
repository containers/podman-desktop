<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import type { Component, Snippet } from 'svelte';

import Icon from '../icons/Icon.svelte';
import DropDownMenuItems from './DropDownMenuItems.svelte';

interface Props {
  onBeforeToggle?: () => void;
  icon?: IconDefinition | Component | string;
  shownAsMenuActionItem?: boolean;
  hidden?: boolean;
  title?: string;
  children?: Snippet;
}
let {
  onBeforeToggle = (): void => {},
  icon = faEllipsisVertical,
  shownAsMenuActionItem = false,
  hidden = false,
  title = '',
  children,
}: Props = $props();

// Show and hide the menu using clickOutside
let showMenu = $state(false);

// If we touch outside the window, hide the menu
let outsideWindow = $state<HTMLButtonElement>();

// If we hit ESC while the menu is open, close it
function handleEscape({ key }: KeyboardEvent): void {
  if (key === 'Escape') {
    showMenu = false;
  }
}

let clientY = $state(0);
let clientX = $state(0);

function toggleMenu(): void {
  onBeforeToggle();
  showMenu = !showMenu;
}

// If we click outside the menu, close the menu
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onWindowClick(e: any): void {
  if (!hidden) {
    showMenu = outsideWindow?.contains(e.target) ?? false;
  }
}

function onButtonClick(e: MouseEvent): void {
  // keep track of the cursor position
  clientY = e.clientY;
  clientX = e.clientX;
  toggleMenu();
}
</script>

<!-- Required in order for Svelte to track all key presses and if you pressed "ESC" -->
<svelte:window on:keyup={handleEscape} on:click={onWindowClick} />

{#if !hidden}
  <!-- Create a "kebab" menu for additional actions. -->
  <div class="relative inline-block text-left">
    <!-- Button for the dropdown menu -->
    <button
      aria-label={title.length > 0 ? title : 'kebab menu'}
      onclick={onButtonClick}
      title={title}
      bind:this={outsideWindow}
      class="text-[var(--pd-button-icon-text)] {shownAsMenuActionItem
        ? 'bg-[var(--pd-button-detailed-bg)] px-3'
        : 'hover:bg-[var(--pd-button-detailed-bg)]'} hover:text-[var(--pd-button-icon-hover-text)] font-medium rounded-md inline-flex items-center px-2 py-2 text-center">
        <Icon class="h-4 w-4" icon={icon}/>
      </button>

    <!-- Dropdown menu for all other actions -->
    {#if showMenu}
      <DropDownMenuItems clientY={clientY} clientX={clientX}>
        {@render children?.()}
      </DropDownMenuItems>
    {/if}
  </div>
{/if}
