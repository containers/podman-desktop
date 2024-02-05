<script lang="ts">
import StarIcon from './StarIcon.svelte';
import Spinner from '../ui/Spinner.svelte';

// status: one of RUNNING, STARTING, USED, CREATED, DELETING, or DEGRADED
// any other status will result in a standard outlined box
export let status = '';
export let icon: any = undefined;
export let size = 20;

$: solid = status === 'RUNNING' || status === 'STARTING' || status === 'USED' || status === 'DEGRADED';
</script>

<div class="grid place-content-center" style="position:relative">
  <div
    class="grid place-content-center rounded aspect-square text-xs"
    class:bg-status-running="{status === 'RUNNING' || status === 'USED'}"
    class:bg-status-starting="{status === 'STARTING'}"
    class:bg-status-degraded="{status === 'DEGRADED'}"
    class:border-2="{!solid && status !== 'DELETING'}"
    class:p-0.5="{!solid}"
    class:p-1="{solid}"
    class:border-gray-700="{!solid}"
    class:text-gray-700="{!solid}"
    role="status"
    title="{status}">
    {#if status === 'DELETING'}
      <Spinner size="1.4em" />
    {:else if typeof icon === 'string'}
      <span class="{icon}" aria-hidden="true"></span>
    {:else}
      <svelte:component this="{icon}" size="{size}" solid="{solid}" />
    {/if}
  </div>
  {#if status === 'CREATED'}
    <StarIcon size="8" style="position:absolute;top:0;right:0" />
  {/if}
</div>
