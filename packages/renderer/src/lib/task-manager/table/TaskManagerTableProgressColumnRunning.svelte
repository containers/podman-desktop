<script lang="ts">
import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';
import type { TaskInfo } from '/@api/taskInfo';

const { task }: { task: TaskInfo } = $props();
</script>

<div class="flex items-center gap-x-2">
  <ProgressBar class="items-center" height="h-1" width="w-20" progress={task.progress} />
</div>
