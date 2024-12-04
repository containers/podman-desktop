<script lang="ts">
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import type { TaskInfoUI } from '/@/stores/tasks';

interface Props {
  task: TaskInfoUI;
}
const { task }: Props = $props();

function cancelTask(): void {
  const tokenId = task.cancellationTokenSourceId;
  if (task.cancellable && tokenId) {
    withConfirmation((): Promise<void> => window.cancelToken(tokenId), `Cancel task ${task.name}`);
  }
}
</script>

<ListItemButtonIcon
  title="Cancel task"
  onClick={cancelTask}
  hidden={!task?.cancellable || task?.state === 'completed'}
  icon={faTimesCircle} />
