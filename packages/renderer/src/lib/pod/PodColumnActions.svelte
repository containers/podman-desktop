<script lang="ts">
import { ErrorMessage } from '@podman-desktop/ui-svelte';

import PodActions from './PodActions.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let object: PodInfoUI;
</script>

<div class="flex w-full">
  <div class="flex items-center w-5">
    {#if object.actionError}
      <ErrorMessage error={object.actionError} icon />
    {:else}
      <div>&nbsp;</div>
    {/if}
  </div>
  <div class="text-right w-full">
    <PodActions pod={object} dropdownMenu={true} on:update />
  </div>
</div>
