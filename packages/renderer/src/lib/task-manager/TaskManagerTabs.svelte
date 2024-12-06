<script lang="ts">
import { Button } from '@podman-desktop/ui-svelte';

import { IS_TASK_STATUSES } from '/@/stores/tasks';
import { TASK_STATUSES } from '/@api/taskInfo';

interface Props {
  searchTerm: string;
  onUpdate?: (searchTerm: string) => void;
}

let { searchTerm = $bindable(), onUpdate = (): void => {} }: Props = $props();

function toggleSearchTerm(status?: string): void {
  const searchStatus = status ? String(status) : undefined;

  // if we don't want to filter for a given status, it means all tasks are wanted
  // need to remove all the is: prefix in searchTerm
  // is:running is:completed is:failed is:cancelled, etc
  let tmpSearchTerm = searchTerm
    .split(' ')
    // remove the matching is: entries
    .filter(pattern => !IS_TASK_STATUSES.includes(pattern))
    .join(' ');

  // if the status is not yet in the searchTerm, add it
  if (searchStatus) {
    tmpSearchTerm = `is:${searchStatus} ${tmpSearchTerm}`;
  }
  searchTerm = tmpSearchTerm;
  onUpdate(searchTerm);
}

function isSearchMatchingStatus(status?: string): boolean {
  if (status) {
    // check if the given status is in the searchTerm
    return searchTerm.split(' ').some(pattern => pattern === `is:${status}`);
  }
  // all usecase
  return !searchTerm.split(' ').some(pattern => IS_TASK_STATUSES.includes(pattern));
}
</script>

<!-- Add All button -->
<Button type="tab" on:click={(): void => toggleSearchTerm()} selected={isSearchMatchingStatus()}>All</Button>

<!-- Add other specific statuses -->
{#each TASK_STATUSES as status}
  <Button
    type="tab"
    on:click={(): void => toggleSearchTerm(status)}
    class="capitalize"
    selected={isSearchMatchingStatus(status)}>{status}</Button>
{/each}
