<script lang="ts">
import { FilteredEmptyScreen } from '@podman-desktop/ui-svelte';

import TaskIcon from '/@/lib/images/TaskIcon.svelte';

let { searchTerm = $bindable(), onReset = () => {} }: { searchTerm: string; onReset?: (term: string) => void } =
  $props();

function resetFilter(e: Event): void {
  searchTerm = '';
  e.preventDefault();
  onReset(searchTerm);
}
</script>

<FilteredEmptyScreen icon={TaskIcon} kind="tasks" bind:searchTerm={searchTerm} on:resetFilter={resetFilter} />
