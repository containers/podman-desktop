<script lang="ts">
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

import Tooltip from '../tooltip/Tooltip.svelte';

export let error: string;
export let icon = false;
export let wrapMessage = false;
let customClassWidth = '';
let left = false;
let top = false;

onMount(() => {
  if (wrapMessage) {
    customClassWidth = 'w-max max-w-[650px] overflow-hidden text-ellipsis text-wrap';
    left = true;
  } else {
    top = true;
  }
});
</script>

{#if icon}
  {#if error !== undefined && error !== ''}
    <Tooltip left={left} top={top} tip={error} class={customClassWidth}>
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
