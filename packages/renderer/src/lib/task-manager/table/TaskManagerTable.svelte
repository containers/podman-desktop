<script lang="ts">
import { Table, TableColumn, TableDurationColumn, TableRow, TableSimpleColumn } from '@podman-desktop/ui-svelte';
import moment from 'moment';

import type { TaskInfoUI } from '/@/stores/tasks';

import TaskManagerTableActionsColumn from './TaskManagerTableActionsColumn.svelte';
import TaskManagerTableProgressColumn from './TaskManagerTableProgressColumn.svelte';

interface Props {
  tasks: TaskInfoUI[];
  selectedItemsNumber?: number;
}

let { tasks, selectedItemsNumber = $bindable() }: Props = $props();

const nameColumn = new TableColumn<TaskInfoUI, string>('Name', {
  width: '3fr',
  renderer: TableSimpleColumn,
  renderMapping: task => task.name,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

const progressColumn = new TableColumn<TaskInfoUI>('Progress', {
  width: '3fr',
  renderer: TaskManagerTableProgressColumn,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

const ageColumn = new TableColumn<TaskInfoUI, Date>('Age', {
  renderMapping: task => moment(task.started).toDate(),
  renderer: TableDurationColumn,
  comparator: (a, b) => moment(b.started).diff(moment(a.started)),
});

const actionsColumn = new TableColumn<TaskInfoUI>('Actions', {
  align: 'right',
  width: '150px',
  renderer: TaskManagerTableActionsColumn,
  overflow: true,
});

const columns = [nameColumn, progressColumn, ageColumn, actionsColumn];

const row = new TableRow<TaskInfoUI>({
  selectable: task => task.state === 'completed',
  disabledText: 'Task is still running',
});
</script>

<Table
  bind:selectedItemsNumber={selectedItemsNumber}
  kind="tasks"
  data={tasks}
  columns={columns}
  row={row}
  defaultSortColumn="Age" />
