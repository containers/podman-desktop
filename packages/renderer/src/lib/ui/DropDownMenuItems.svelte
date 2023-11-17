<script lang="ts">
import { onMount } from 'svelte';

let dropDownHeight: number;
let dropDownElement: HTMLElement;

export let clientY: number;

const STATUS_BAR_HEIGHT = 24;

// When initializing the widget, set the placement on top or on bottom
// depending on the clientY position (cursor position) and the height of the dropdown menu to display
onMount(() => {
  const innerHeight = window.innerHeight;
  if (innerHeight - clientY - STATUS_BAR_HEIGHT < dropDownHeight) {
    dropDownElement.style.top = `-${dropDownHeight}px`;
  } else {
    dropDownElement.style.top = '20px';
  }
});
</script>

<div
  title="Drop Down Menu Items"
  bind:clientHeight="{dropDownHeight}"
  bind:this="{dropDownElement}"
  class="origin-top-right absolute right-0 z-10 m-2 rounded-md shadow-lg bg-charcoal-600 ring-2 ring-purple-900 hover:ring-purple-700 divide-y divide-charcoal-600 focus:outline-none">
  <slot />
</div>
