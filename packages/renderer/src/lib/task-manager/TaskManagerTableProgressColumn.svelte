<script lang="ts">
import type { TaskInfo } from '/@api/taskInfo';

import TaskManagerTableProgressColumnCompleted from './TaskManagerTableProgressColumnCompleted.svelte';
import TaskManagerTableProgressColumnRunning from './TaskManagerTableProgressColumnRunning.svelte';

const { object }: { object: TaskInfo } = $props();
</script>

{#if object.state === 'completed'}
  <TaskManagerTableProgressColumnCompleted task={object} />
{:else if object.state === 'running'}
  <TaskManagerTableProgressColumnRunning task={object} />
{/if}
