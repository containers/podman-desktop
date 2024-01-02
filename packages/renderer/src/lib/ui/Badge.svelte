<script lang="ts">
import Tooltip from './Tooltip.svelte';

export let text = '';

export let tooltip: string | undefined = undefined;

export let classColor = '';
</script>

<div class="flex items-center bg-charcoal-500 p-1 rounded-md">
  <div class="w-2 h-2 {classColor} rounded-full mr-2"></div>
  <span class="text-xs capitalize mr-1">
    {#if tooltip !== undefined}
      <Tooltip tip="{tooltip}" left>{text}</Tooltip>
    {:else}
      {text}
    {/if}
  </span>
</div>
