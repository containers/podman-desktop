<script lang="ts">
import StarIcon from './StarIcon.svelte';
import { SvelteComponent } from 'svelte';

// status: one of RUNNING, STARTING, USED, CREATED, or DEGRADED
// any other status will result in a standard outlined box
export let status = '';
export let icon: any;

$: solid = status === 'RUNNING' || status === 'STARTING' || status === 'USED' || status === 'DEGRADED';
</script>

<div class="grid place-content-center" style="position:relative">
  <div
    class="grid place-content-center w-7 h-7 rounded"
    class:bg-green-400="{status === 'RUNNING' || status === 'USED'}"
    class:bg-green-600="{status === 'STARTING'}"
    class:bg-yellow-600="{status === 'DEGRADED'}"
    class:border-2="{!solid}"
    class:border-gray-400="{!solid}"
    class:text-gray-400="{!solid}"
    title="{status}">
    <svelte:component this="{icon}" size="20" solid="{solid}" />
  </div>
  {#if status === 'CREATED'}
    <StarIcon size="8" style="position:absolute;top:0;right:0" />
  {/if}
</div>
