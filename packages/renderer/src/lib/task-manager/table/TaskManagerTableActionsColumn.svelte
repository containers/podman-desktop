<script lang="ts">
import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerActions from './action/TaskManagerActions.svelte';

export let object: TaskInfoUI;
</script>

<TaskManagerActions task={object} />
