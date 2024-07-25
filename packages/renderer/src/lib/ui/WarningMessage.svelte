<script lang="ts">
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

export let error: string;
export let icon = false;
</script>

{#if icon}
  {#if error !== undefined && error !== ''}
    <Tooltip top tip={error}>
      <Fa size="1.125x" class="cursor-pointer text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
    </Tooltip>
  {/if}
{:else}
  <div
    class="text-[var(--pd-state-warning)] p-1 flex flex-row items-center {$$props.class}"
    class:opacity-0={error === undefined || error === ''}>
    <Fa size="1.125x" class="cursor-pointer text-[var(--pd-state-warning)]" icon={faTriangleExclamation} />
    <div role="alert" aria-label="Warning Message Content" class="ml-2">{error}</div>
  </div>
{/if}
