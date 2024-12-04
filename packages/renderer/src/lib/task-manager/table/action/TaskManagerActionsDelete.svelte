<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import type { TaskInfoUI } from '/@/stores/tasks';

const { task }: { task: TaskInfoUI } = $props();

async function removeTask(): Promise<void> {
  await window.clearTask(task.id);
}
</script>

<ListItemButtonIcon
  title="Archive/delete completed task"
  onClick={removeTask}
  hidden={task?.state !== 'completed'}
  icon={faTrash} />
