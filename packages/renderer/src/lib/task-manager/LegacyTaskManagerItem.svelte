<script lang="ts">
import {
  faCancel,
  faClose,
  faInfoCircle,
  faSquareCheck,
  faTimesCircle,
  faTriangleExclamation,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { TableDurationColumn, Tooltip } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';
import { isNotificationTask, removeTask } from '/@/stores/tasks';
import type { NotificationTaskInfo, TaskInfo } from '/@api/taskInfo';

import Markdown from '../markdown/Markdown.svelte';

export let task: TaskInfo | NotificationTaskInfo;

let showError = false;
let icon: IconDefinition;
let iconColor: string;
onMount(() => {
  switch (task.status) {
    case 'canceled':
      icon = faCancel;
      iconColor = 'text-[var(--pd-status-exited)]';
      break;
    case 'in-progress':
      icon = faInfoCircle;
      iconColor = 'text-[var(--pd-invert-content-info-icon)]';
      break;
    case 'success':
      icon = faSquareCheck;
      iconColor = 'text-[var(--pd-state-success)]';
      break;
    case 'failure':
      icon = faTriangleExclamation;
      iconColor = 'text-[var(--pd-state-error)]';
      break;
  }
});

async function cancelTask(): Promise<void> {
  if (task.cancellationTokenSourceId) {
    await window.cancelToken(task.cancellationTokenSourceId);
  }
}

async function closeCompleted(task: TaskInfo | NotificationTaskInfo) {
  // needs to delete the task from the svelte store
  return removeTask(task.id);
}

async function doExecuteAction(task: TaskInfo) {
  await window.executeTask(task.id);
}
</script>

<!-- Display a task item-->
<div class="flex flew-row w-full py-2">
  <!-- first column is the icon-->
  <div class="flex w-3 flex-col {iconColor}">
    <div class="align-top" role="img" aria-label="{task.status} icon of task {task.name}">
    <Fa size="0.875x" icon={icon} />
    </div>
    {#if task.state !== 'completed' && task.cancellable}
      <div class="items-end flex flex-grow">
        <Tooltip tip="Cancel the task" topRight>
          <button class="cursor-pointer" on:click={cancelTask} aria-label="Cancel task {task.name}">
            <Fa size="0.875x" icon={faTimesCircle} />
          </button>
        </Tooltip>
      </div>
    {/if}
  </div>
  <!-- second column is about the task-->
  <div class="flex flex-col w-full pl-2">
    <div class="flex flex-row w-full">
      <div title={task.name} class="w-60 pb-1 cursor-default truncate text-[var(--pd-modal-text)]">
        {task.name}
      </div>

      <div class="flex flex-col flex-grow items-end">
        <!-- if completed task, display a close icon-->
        {#if task.state === 'completed'}
          <button title="Clear notification" class="text-[var(--pd-modal-text)]" on:click={() => closeCompleted(task)}
            ><Fa size="0.75x" icon={faClose} /></button>
        {/if}
      </div>
    </div>
    {#if isNotificationTask(task)}
      <div class="text-[var(--pd-modal-text)] text-xs my-2">{task.body}</div>
      {#if task.markdownActions}
        <div class="flex justify-end">
          <Markdown markdown={task.markdownActions} />
        </div>
      {/if}
    {:else if task.error}
      <div class:hidden={!showError} class="text-xs my-2 break-words text-[var(--pd-modal-text)]">
        {task.error}
      </div>
    {/if}
    <!-- age -->
    <div class="text-[var(--pd-modal-text)] text-xs">
      <TableDurationColumn object={new Date(task.started)} />
    </div>

    <!-- if in-progress task, display a link to resume-->
    {#if task.state === 'running'}
      <div class="flex flex-row w-full">
        {#if (task.progress ?? 0) >= 0}
          <ProgressBar progress={task.progress} />
        {/if}
      </div>
    {/if}

    {#if task.action}
      <div class="flex flex-row w-full">
        <div class="flex flex-1 flex-col w-full items-end text-[var(--pd-button-secondary)] text-xs">
          <button
            class="text-[var(--pd-button-secondary)] cursor-pointer"
            on:click={async () => await doExecuteAction(task)}
            aria-label="action button">{task.action}</button>
        </div>
      </div>
    {/if}

    <!-- if failed task, display the error-->
    {#if task.status === 'failure'}
      <div class="flex flex-col w-full items-end">
        <button on:click={() => (showError = !showError)} class="text-[var(--pd-button-secondary)] text-xs">
          View Error
          {#if showError}
            <i class="fas fa-chevron-up"></i>
          {:else}
            <i class="fas fa-chevron-down"></i>
          {/if}
        </button>
      </div>
    {/if}
  </div>
</div>
