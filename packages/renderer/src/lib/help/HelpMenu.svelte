<script lang="ts">
import { onDestroy, onMount } from 'svelte';

let dropDownHeight: number;
let dropDownWidth: number;
let dropDownElement: HTMLElement;

const STATUS_BAR_HEIGHT = 24;

function updateMenuLocation() {
  dropDownElement.style.top = `${window.innerHeight - dropDownHeight - STATUS_BAR_HEIGHT}px`;
  dropDownElement.style.left = `${window.innerWidth - dropDownWidth - 1}px`;
}

onMount(() => {
  updateMenuLocation();
  window.addEventListener('resize', updateMenuLocation);
});

onDestroy(() => window.removeEventListener('resize', updateMenuLocation));
</script>

<div 
  bind:offsetHeight={dropDownHeight}
  bind:offsetWidth={dropDownWidth}
  bind:this={dropDownElement}
  class="absolute"
  data-testid="help-menu">
  <div
    title="Help Menu Items"
    class="z-10 m-1 rounded-md shadow-lg bg-[var(--pd-dropdown-bg)] ring-2 ring-[var(--pd-dropdown-ring)] hover:ring-[var(--pd-dropdown-hover-ring)] divide-y divide-[var(--pd-dropdown-divider)] focus:outline-none">
    <slot />
  </div>
</div>
