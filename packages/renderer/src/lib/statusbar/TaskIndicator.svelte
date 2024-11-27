<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';
import { tasksInfo } from '/@/stores/tasks';

let runningTasks = $derived($tasksInfo.filter(task => task.state === 'running'));

let title: string | undefined = $derived.by(() => {
  if (runningTasks.length === 0) return undefined;
  if (runningTasks.length === 1) return runningTasks[0].name;
  return `${runningTasks.length} tasks running`;
});

let progress: number | undefined = $derived.by(() => {
  if (runningTasks.length !== 1) return undefined; // return indeterminate
  return runningTasks[0].progress; // return task's progress value
});

async function toggleTaskManager(): Promise<void> {
  await window.executeCommand('show-task-manager');
}
</script>

{#if runningTasks.length > 0}
  <div class="flex items-center">
    <Tooltip top tip={title}>
      <button aria-label="Toggle Task Manager" onclick={toggleTaskManager}>
        <div class="flex items-center gap-x-2">
          <span role="status" class="max-w-32 text-ellipsis overflow-hidden whitespace-nowrap">{title}</span>
          <ProgressBar class="items-center" height="h-1" width="w-20" progress={progress} />
        </div>
      </button>
    </Tooltip>
  </div>
{/if}
