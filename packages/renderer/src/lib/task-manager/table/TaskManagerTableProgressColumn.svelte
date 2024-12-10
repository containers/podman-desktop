<script lang="ts">
import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerTableProgressColumnCompleted from './TaskManagerTableProgressColumnCompleted.svelte';
import TaskManagerTableProgressColumnRunning from './TaskManagerTableProgressColumnRunning.svelte';

interface Props {
  object: TaskInfoUI;
}

const { object }: Props = $props();
</script>

{#if object.state === 'completed'}
  <TaskManagerTableProgressColumnCompleted task={object} />
{:else if object.state === 'running'}
  <TaskManagerTableProgressColumnRunning task={object} />
{/if}
