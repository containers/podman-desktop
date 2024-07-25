<script lang="ts">
import StarIcon from '../icons/StarIcon.svelte';
import Spinner from '../progress/Spinner.svelte';

// status: one of RUNNING, STARTING, USED, CREATED, DELETING, or DEGRADED
// any other status will result in a standard outlined box
export let status: 'RUNNING' | 'STARTING' | 'USED' | 'DEGRADED' | 'DELETING' | 'CREATED' | string = 'UNKNOWN';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let icon: any = undefined;
export let size = 20;

$: solid = status === 'RUNNING' || status === 'STARTING' || status === 'USED' || status === 'DEGRADED';
</script>

<div class="grid place-content-center" style="position:relative">
  <div
    class="grid place-content-center rounded aspect-square text-xs"
    class:bg-[var(--pd-status-running)]={status === 'RUNNING' || status === 'USED'}
    class:bg-[var(--pd-status-starting)]={status === 'STARTING'}
    class:bg-[var(--pd-status-degraded)]={status === 'DEGRADED'}
    class:border-2={!solid && status !== 'DELETING'}
    class:p-0.5={!solid}
    class:p-1={solid}
    class:border-[var(--pd-status-not-running)]={!solid}
    class:text-[var(--pd-status-not-running)]={!solid}
    class:text-[var(--pd-status-contrast)]={solid}
    role="status"
    title={status}>
    {#if status === 'DELETING'}
      <Spinner size="1.4em" />
    {:else if typeof icon === 'string'}
      <span class={icon} aria-hidden="true"></span>
    {:else}
      <svelte:component this={icon} size={size} solid={solid} />
    {/if}
  </div>
  {#if status === 'CREATED'}
    <StarIcon size="8" style="position:absolute;top:0;right:0" />
  {/if}
</div>
