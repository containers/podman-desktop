<script lang="ts">
import { faEye } from '@fortawesome/free-solid-svg-icons';

import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import type { TaskInfoUI } from '/@/stores/tasks';

interface Props {
  task: TaskInfoUI;
}
const { task }: Props = $props();

async function viewAction(): Promise<void> {
  await window.executeTask(task.id);
  // ask to toggle the panel
  await window.executeCommand('show-task-manager');
}
</script>

<ListItemButtonIcon
  title="View action"
  onClick={viewAction}
  hidden={!task?.action}
  icon={faEye}
  iconOffset="pl-[0.15rem]" />
