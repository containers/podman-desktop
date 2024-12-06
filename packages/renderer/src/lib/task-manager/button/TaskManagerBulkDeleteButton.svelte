<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import { filtered } from '/@/stores/tasks';

interface Props {
  title: string;
  bulkOperationTitle: string;
}
const { title, bulkOperationTitle }: Props = $props();

let bulkDeleteInProgress: boolean = $state(false);

async function deleteSelectedTasks() {
  const selectedTasks = $filtered.filter(task => task.selected);
  if (selectedTasks.length === 0) {
    return;
  }

  // mark tasks for deletion
  bulkDeleteInProgress = true;
  for (const taskToDelete of selectedTasks) {
    await window.clearTask(taskToDelete.id);
  }

  bulkDeleteInProgress = false;
}

function onClick(): void {
  withBulkConfirmation(deleteSelectedTasks, bulkOperationTitle);
}
</script>

<Button title={title} on:click={onClick} inProgress={bulkDeleteInProgress} icon={faTrash} />
