<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

export let inUse;
</script>

{#if inUse}
  <div class="bg-green-600 flex flex-col justify-center align-middle m-3 p-2 w-10 rounded" title="In Use">
    <Fa class="text-gray-50" icon="{faLayerGroup}" />
  </div>
{:else}
  <div class="border-gray-400 border-2 flex flex-col justify-center align-middle m-3 p-2 w-10 rounded" title="Not Used">
    <Fa class="text-gray-400" icon="{faLayerGroup}" />
  </div>
{/if}
