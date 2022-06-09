<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faChartSimple, faPowerOff, faSeedling } from '@fortawesome/free-solid-svg-icons';

export let state = '';
</script>

{#if state === 'RUNNING'}
  <Fa class="text-green-600" icon="{faChartSimple}" />
{:else if state === 'CREATED'}
  <Fa class="text-gray-400" icon="{faSeedling}" />
{:else}
  <Fa class="text-orange-600" icon="{faPowerOff}" />
{/if}
