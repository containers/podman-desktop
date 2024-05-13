<script>
import Tooltip from './Tooltip.svelte';

export let tip;
export let top = false;
export let topLeft = false;
export let topRight = false;
export let right = false;
export let bottom = false;
export let bottomLeft = false;
export let bottomRight = false;
export let left = false;
</script>

<Tooltip
  top="{top}"
  topLeft="{topLeft}"
  topRight="{topRight}"
  right="{right}"
  bottom="{bottom}"
  bottomLeft="{bottomLeft}"
  bottomRight="{bottomRight}"
  left="{left}">
  <svelte:fragment slot="content">
    <slot />
  </svelte:fragment>
  <svelte:fragment slot="tip">
    {#if tip}
      <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">{tip}</div>
    {/if}
  </svelte:fragment>
</Tooltip>
