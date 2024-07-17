<script lang="ts">
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import Tooltip from '../tooltip/Tooltip.svelte';

export let error: string;
export let icon = false;
</script>

{#if icon}
  {#if error !== undefined && error !== ''}
    <Tooltip top tip={error}>
      <Fa size="1.1x" class="cursor-pointer text-[var(--pd-state-error)] {$$props.class}" icon={faExclamationCircle} />
    </Tooltip>
  {/if}
{:else}
  <div
    class="text-[var(--pd-state-error)] p-1 flex flex-row items-center {$$props.class}"
    class:opacity-0={error === undefined || error === ''}>
    <Fa size="1.1x" class="cursor-pointer text-[var(--pd-state-error)]" icon={faExclamationCircle} />
    <div role="alert" aria-label="Error Message Content" class="ml-2">{error}</div>
  </div>
{/if}
