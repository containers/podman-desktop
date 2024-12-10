<script lang="ts">
import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerActionsCancel from './TaskManagerActionsCancel.svelte';
import TaskManagerActionsDelete from './TaskManagerActionsDelete.svelte';
import TaskManagerActionsView from './TaskManagerActionsView.svelte';

interface Props {
  task: TaskInfoUI;
}
const { task }: Props = $props();
</script>

<TaskManagerActionsView task={task} />
<TaskManagerActionsCancel task={task} />
<TaskManagerActionsDelete task={task} />
