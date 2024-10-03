<script lang="ts">
import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';
import { tasksInfo } from '/@/stores/tasks';

let runningTasks = $derived($tasksInfo.filter(task => task.state === 'running'));

function toggleTaskManager(): void {
  return window.events?.send('toggle-task-manager', '');
}
</script>

{#if runningTasks.length > 0}
  <button onclick={toggleTaskManager}>
    {#if runningTasks.length === 1}
      <div class="flex items-center gap-x-2">
        {runningTasks[0].name}
        {#if (runningTasks[0].progress ?? 0) >= 0}
          <ProgressBar height="h-1" width="w-20" progress={runningTasks[0].progress} />
        {/if}
      </div>
    {:else if runningTasks.length > 1}
      <div class="flex items-center gap-x-2">
        {runningTasks.length} tasks running
        <ProgressBar height="h-1" width="w-20" progress={undefined} />
      </div>
    {/if}
  </button>
{/if}
