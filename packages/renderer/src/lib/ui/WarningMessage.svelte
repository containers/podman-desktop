<script lang="ts">
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import Tooltip from './Tooltip.svelte';

export let error: string;
export let icon = false;
</script>

{#if icon}
  {#if error !== undefined && error !== ''}
    <Tooltip tip="{error}" top>
      <Fa size="1.125x" class="cursor-pointer text-amber-500" icon="{faTriangleExclamation}" />
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
