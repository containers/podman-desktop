<script lang="ts">
import { setContext, createEventDispatcher } from 'svelte';
import { key } from './menu.ts';

export let x;
export let y;

// whenever x and y is changed, restrict box to be within bounds
$: (() => {
  if (!menuEl) return;

  const rect = menuEl.getBoundingClientRect();
  x = Math.min(window.innerWidth - rect.width, x);
  if (y > window.innerHeight - rect.height) y -= rect.height;
})(x, y);

const dispatch = createEventDispatcher();

setContext(key, {
  dispatchClick: () => dispatch('click'),
});

let menuEl;
function onPageClick(event: PointerEvent) {
  if (event.target === menuEl || menuEl.contains(event.target)) return;
  dispatch('clickoutside');
}
</script>

<svelte:body on:click="{onPageClick}" />

<div
  bind:this="{menuEl}"
  style="top: {y}px; left: {x}px;"
  class="absolute z-10 w-40 origin-top-right border border-gray-600 bg-zinc-800 shadow-md focus:outline-none right-5 top-2">
  <slot />
</div>
