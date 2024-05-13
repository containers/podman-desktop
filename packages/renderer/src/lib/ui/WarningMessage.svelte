<script lang="ts">
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

export let error: string;
export let icon = false;
</script>

{#if icon}
  {#if error !== undefined && error !== ''}
    <Tooltip top>
      <svelte:fragment slot="item">
        <Fa size="1.125x" class="cursor-pointer text-amber-500" icon="{faTriangleExclamation}" />
      </svelte:fragment>
      <svelte:fragment slot="tip">
        {#if error}
          <div class="inline-block py-2 px-4 rounded-md bg-charcoal-800 text-xs text-white" aria-label="tooltip">
            {error}
          </div>
        {/if}
      </svelte:fragment>
    </Tooltip>
  {/if}
{:else}
  <div
    class="text-amber-500 p-1 flex flex-row items-center {$$props.class}"
    class:opacity-0="{error === undefined || error === ''}">
    <Fa size="1.125x" class="cursor-pointer text-amber-500" icon="{faTriangleExclamation}" />
    <div role="alert" aria-label="Warning Message Content" class="ml-2">{error}</div>
  </div>
{/if}
