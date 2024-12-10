<script lang="ts">
import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';
import type { TaskInfoUI } from '/@/stores/tasks';

interface Props {
  task: TaskInfoUI;
}

const { task }: Props = $props();
</script>

<div class="flex items-center gap-x-2">
  <ProgressBar class="items-center" height="h-1" width="w-20" progress={task.progress} />
</div>
