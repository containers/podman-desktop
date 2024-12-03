<script lang="ts">
import TaskManagerEmptyFilteredScreen from './TaskManagerEmptyFilteredScreen.svelte';
import TaskManagerEmptyScreen from './TaskManagerEmptyScreen.svelte';

let { searchTerm = $bindable('') }: { searchTerm: string } = $props();
</script>

{#if searchTerm}
  <TaskManagerEmptyFilteredScreen bind:searchTerm={searchTerm} />
{:else}
  <TaskManagerEmptyScreen />
{/if}
