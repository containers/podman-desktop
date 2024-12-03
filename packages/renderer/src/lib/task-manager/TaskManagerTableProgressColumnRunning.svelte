<script lang="ts">
import type { TaskInfo } from '/@api/taskInfo';

import ProgressBar from './ProgressBar.svelte';

const { task }: { task: TaskInfo } = $props();
</script>

<div class="flex items-center gap-x-2">
  <ProgressBar class="items-center" height="h-1" width="w-20" progress={task.progress} />
</div>
