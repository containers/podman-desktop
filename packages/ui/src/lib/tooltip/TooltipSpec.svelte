<script lang="ts">
import Tooltip from './Tooltip.svelte';

export let tipProp: string | undefined = undefined;
export let tipSlot: string | undefined = undefined;
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
  tip={tipProp}
  top={top}
  topLeft={topLeft}
  topRight={topRight}
  right={right}
  bottom={bottom}
  bottomLeft={bottomLeft}
  bottomRight={bottomRight}
  left={left}>
  <slot />
  <svelte:fragment slot="tip">
    {#if tipSlot}
      {tipSlot}
    {/if}
  </svelte:fragment>
</Tooltip>
