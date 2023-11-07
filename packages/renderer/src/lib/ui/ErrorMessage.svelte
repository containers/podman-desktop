<script lang="ts">
import Fa from 'svelte-fa';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Tooltip from './Tooltip.svelte';

export let error: string;
export let icon = false;
</script>

{#if icon}
  {#if error !== undefined && error !== ''}
    <Tooltip tip="{error}" top>
      <Fa size="18" class="cursor-pointer text-red-500 {$$props.class}" icon="{faExclamationCircle}" />
    </Tooltip>
  {/if}
{:else}
  <div
    class="text-red-500 p-1 flex flex-row items-center {$$props.class}"
    class:opacity-0="{error === undefined || error === ''}">
    <Fa size="18" class="cursor-pointer text-red-500" icon="{faExclamationCircle}" />
    <div role="alert" aria-label="Error Message Content" class="ml-2">{error}</div>
  </div>
{/if}
