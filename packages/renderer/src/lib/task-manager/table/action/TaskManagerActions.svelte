<script lang="ts">
import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerActionsCancel from './TaskManagerActionsCancel.svelte';
import TaskManagerActionsDelete from './TaskManagerActionsDelete.svelte';
import TaskManagerActionsView from './TaskManagerActionsView.svelte';

const { task }: { task: TaskInfoUI } = $props();
</script>

<TaskManagerActionsView task={task} />
<TaskManagerActionsCancel task={task} />
<TaskManagerActionsDelete task={task} />
