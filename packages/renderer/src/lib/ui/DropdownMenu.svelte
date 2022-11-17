<script lang="ts">
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
export let backgroundColor = 'bg-zinc-800';

// Show and hide the menu using clickOutside
let showMenu = false;

// If we touch outside the window, hide the menu
let outsideWindow;

// If we hit ESC while the menu is open, close it
function handleEscape({ key }) {
  if (key === 'Escape') {
    showMenu = false;
  }
}

function toggleMenu() {
  showMenu = !showMenu;
}

// If we click outside the menu, close the menu
function onWindowClick(e) {
  if (outsideWindow.contains(e.target) == false) showMenu = false;
}
</script>

<!-- Required in order for Svelte to track all key presses and if you pressed "ESC" -->
<svelte:window on:keyup="{handleEscape}" on:click="{onWindowClick}" />

<!-- Create a "kebab" menu for additional actions. -->
<div class="relative inline-block text-left">
  <!-- Button for the dropdown menu -->
  <button
    on:click="{() => {
      toggleMenu();
    }}"
    bind:this="{outsideWindow}"
    class="border-l-2 border-gray-600 hover:border-gray-600 px-3 py-2 hover:text-violet-600 font-medium text-sm inline-flex items-center text-center">
    <Fa class="h-4 w-4 text-xl" icon="{faEllipsisVertical}" />
  </button>

  <!-- Dropdown menu for all other actions -->
  {#if showMenu}
    <div
      class="origin-top-right absolute right-0 z-10 m-2 rounded-md shadow-lg bg-zinc-900 ring-1 ring-black ring-opacity-5 divide-y divide-gray-600 focus:outline-none">
      <slot />
    </div>
  {/if}
</div>
