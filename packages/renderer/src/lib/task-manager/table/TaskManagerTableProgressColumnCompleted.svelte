<script lang="ts">
import { faCircleCheck, faCircleXmark } from '@fortawesome/free-regular-svg-icons';
import { faCancel, faSquareCheck, type IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { TaskInfoUI } from '/@/stores/tasks';

interface Props {
  task: TaskInfoUI;
}

const { task }: Props = $props();

const { icon, iconColor } = $derived.by(() => {
  let icon: IconDefinition;
  let iconColor: string;
  switch (task.status) {
    case 'success':
      icon = faCircleCheck;
      iconColor = 'text-[var(--pd-state-success)]';
      break;
    case 'canceled':
      icon = faCancel;
      iconColor = 'text-[var(--pd-status-exited)]';
      break;
    case 'failure':
      icon = faCircleXmark;
      iconColor = 'text-[var(--pd-state-error)]';
      break;
    default:
      icon = faSquareCheck;
      iconColor = '';
  }

  return { icon, iconColor };
});
</script>

<div class="flex flex-row items-center" aria-label="completed status for task {task.name}" role="status">
  <div class={iconColor} role="img" aria-label="{task.status} icon of task {task.name}">
    <Fa size="0.875x" icon={icon} />
  </div>
  <div class="ml-1 text-[var(--pd-table-body-text)]">{task.status}</div>

  {#if task.status === 'failure'}
    <div class="cursor-default ml-1 text-[var(--pd-state-error)]" title={task.error}>
      ({task.error})
    </div>
  {/if}
</div>
