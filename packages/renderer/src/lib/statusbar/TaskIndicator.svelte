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
  if (runningTasks.length !== 0) return undefined;
  return runningTasks[0].progress ?? 0;
});

function toggleTaskManager(): void {
  return window.events?.send('toggle-task-manager', '');
}
</script>

{#if runningTasks.length > 0}
  <div class="flex items-center">
    <Tooltip top tip={title}>
      <button aria-label="Toggle Task Manager" onclick={toggleTaskManager}>
        <div class="flex items-center gap-x-2">
          <span role="status" class="max-w-32 text-ellipsis overflow-hidden whitespace-nowrap">{title}</span>
          {#if (progress ?? 0) >= 0}
            <ProgressBar height="h-1" width="w-20" progress={progress} />
          {/if}
        </div>
      </button>
    </Tooltip>
  </div>
{/if}
