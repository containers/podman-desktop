<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faChartSimple, faPowerOff, faSeedling } from '@fortawesome/free-solid-svg-icons';

export let state = '';
</script>

{#if state === 'RUNNING'}
  <div class="bg-green-600 flex flex-col justify-center align-middle m-3 p-2 w-10 rounded">
    <Fa class="text-gray-50" icon="{faChartSimple}" />
  </div>
{:else if state === 'CREATED'}
  <div class="border-gray-400 border-2 flex flex-col justify-center align-middle m-3 p-2 w-10 rounded">
    <Fa class="text-gray-400" icon="{faSeedling}" />
  </div>
{:else}
  <div class="border-orange-600 border-2 flex flex-col justify-center align-middle m-3 p-2 w-10 rounded">
    <Fa class="text-orange-600" icon="{faPowerOff}" />
  </div>
{/if}
