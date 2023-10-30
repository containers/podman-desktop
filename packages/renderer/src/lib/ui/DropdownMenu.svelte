<script lang="ts">
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import DropDownMenuItems from './DropDownMenuItems.svelte';

export let onBeforeToggle = () => {};
// Show and hide the menu using clickOutside
let showMenu = false;

// If we touch outside the window, hide the menu
let outsideWindow: HTMLButtonElement;

// If we hit ESC while the menu is open, close it
function handleEscape({ key }: any) {
  if (key === 'Escape') {
    showMenu = false;
  }
}

let clientY: number;

function toggleMenu() {
  onBeforeToggle();
  showMenu = !showMenu;
}

// If we click outside the menu, close the menu
function onWindowClick(e: any) {
  showMenu = outsideWindow.contains(e.target);
}
</script>

<!-- Required in order for Svelte to track all key presses and if you pressed "ESC" -->
<svelte:window on:keyup="{handleEscape}" on:click="{onWindowClick}" />

<!-- Create a "kebab" menu for additional actions. -->
<div class="relative inline-block text-left">
  <!-- Button for the dropdown menu -->
  <button
    aria-label="kebab menu"
    on:click="{e => {
      // keep track of the cursor position
      clientY = e.clientY;
      toggleMenu();
    }}"
    bind:this="{outsideWindow}"
    class="mr-2 text-gray-400 hover:bg-charcoal-800 hover:text-purple-400 font-medium rounded-md inline-flex items-center px-2 py-2 text-center">
    <Fa class="h-4 w-4" icon="{faEllipsisVertical}" />
  </button>

  <!-- Dropdown menu for all other actions -->
  {#if showMenu}
    <DropDownMenuItems clientY="{clientY}"><slot /></DropDownMenuItems>
  {/if}
</div>
