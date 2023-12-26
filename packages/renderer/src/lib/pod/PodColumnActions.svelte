<script lang="ts">
import type { PodInfoUI } from './PodInfoUI';
import PodActions from './PodActions.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

export let object: PodInfoUI;
</script>

<div class="flex w-full">
  <div class="flex items-center w-5">
    {#if object.actionError}
      <ErrorMessage error="{object.actionError}" icon />
    {:else}
      <div>&nbsp;</div>
    {/if}
  </div>
  <div class="text-right w-full">
    <PodActions pod="{object}" dropdownMenu="{true}" on:update />
  </div>
</div>
