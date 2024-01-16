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

<div class="grid place-items-center" style="position:relative">
  <div
    class="grid place-items-center rounded aspect-square"
    class:bg-green-400="{status === 'RUNNING' || status === 'USED'}"
    class:bg-green-600="{status === 'STARTING'}"
    class:bg-amber-600="{status === 'DEGRADED'}"
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
      <span
        class="{icon}"
        aria-hidden="true"
        style="width: {size}px; height: {size}px; font-size: {size}px; line-height: {size}px;"></span>
    {:else}
      <svelte:component this="{icon}" size="{size}" solid="{solid}" />
    {/if}
  </div>
  {#if status === 'CREATED'}
    <StarIcon size="8" style="position:absolute;top:0;right:0" />
  {/if}
</div>
