<script lang="ts">
import TaskManagerEmptyFilteredScreen from './TaskManagerEmptyFilteredScreen.svelte';
import TaskManagerEmptyScreen from './TaskManagerEmptyScreen.svelte';

interface Props {
  searchTerm: string;
}
let { searchTerm = $bindable('') }: Props = $props();
</script>

{#if searchTerm}
  <TaskManagerEmptyFilteredScreen bind:searchTerm={searchTerm} />
{:else}
  <TaskManagerEmptyScreen />
{/if}
