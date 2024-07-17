<script lang="ts">
import {
  faClose,
  faInfoCircle,
  faSquareCheck,
  faTriangleExclamation,
  type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

import ProgressBar from '/@/lib/task-manager/ProgressBar.svelte';
import { isNotificationTask, isStatefulTask, removeTask } from '/@/stores/tasks';
import type { NotificationTask, Task } from '/@api/task';

import Markdown from '../markdown/Markdown.svelte';
import { type StatefulTaskUI, TaskManager } from './task-manager';

export let task: Task;

const taskManager = new TaskManager();

let taskUI: StatefulTaskUI | NotificationTask;
$: taskUI = taskManager.toTaskUi(task);

let showError = false;
let icon: IconDefinition;
let iconColor: string;
onMount(() => {
  if (isStatefulTask(task)) {
    if (task.status === 'success') {
      icon = faSquareCheck;
      iconColor = 'text-[var(--pd-state-success)]';
      return;
    } else if (task.status === 'failure') {
      icon = faTriangleExclamation;
      iconColor = 'text-[var(--pd-state-error)]';
      return;
    }
  }

  icon = faInfoCircle;
  iconColor = 'text-[var(--pd-invert-content-info-icon)]';
});

function closeCompleted(taskUI: StatefulTaskUI | NotificationTask) {
  // needs to delete the task from the svelte store
  removeTask(taskUI.id);
}

function doExecuteAction(taskUI: StatefulTaskUI) {
  taskUI?.action?.execute();
}
</script>

<!-- Display a task item-->
<div class="flex flew-row w-full py-2">
  <!-- first column is the icon-->
  <div class="flex w-3 {iconColor} justify-center">
    <Fa size="0.875x" icon={icon} />
  </div>
  <!-- second column is about the task-->
  <div class="flex flex-col w-full pl-2">
    <div class="flex flex-row w-full">
      <div title={taskUI.name} class="w-60 pb-1 cursor-default truncate text-[var(--pd-modal-text)]">
        {taskUI.name}
      </div>

      <div class="flex flex-col flex-grow items-end">
        <!-- if completed task, display a close icon-->
        {#if isNotificationTask(taskUI) || (isStatefulTask(taskUI) && taskUI.state === 'completed')}
          <button title="Clear notification" class="text-[var(--pd-modal-text)]" on:click={() => closeCompleted(taskUI)}
            ><Fa size="0.75x" icon={faClose} /></button>
        {/if}
      </div>
    </div>
    {#if isNotificationTask(taskUI)}
      <div class="text-[var(--pd-modal-text)] text-xs my-2">{taskUI.description}</div>
      {#if taskUI.markdownActions}
        <div class="flex justify-end">
          <Markdown markdown={taskUI.markdownActions} />
        </div>
      {/if}
    {/if}
    {#if isStatefulTask(taskUI)}
      {#if taskUI.error}
        <div class:hidden={!showError} class="text-xs my-2 break-words text-[var(--pd-modal-text)]">
          {taskUI.error}
        </div>
      {/if}
      <!-- age -->
      <div class="text-[var(--pd-modal-text)] text-xs">{taskUI.age}</div>
    {/if}

    <!-- if in-progress task, display a link to resume-->
    {#if isStatefulTask(taskUI) && taskUI.status === 'in-progress'}
      <div class="flex flex-row w-full">
        {#if (taskUI.progress ?? 0) >= 0}
          <ProgressBar progress={taskUI.progress} />
        {/if}
      </div>
    {/if}

    {#if isStatefulTask(taskUI) && taskUI.status !== 'failure'}
      <div class="flex flex-row w-full">
        <div class="flex flex-1 flex-col w-full items-end text-[var(--pd-button-secondary)] text-xs">
          {#if taskUI.action}
            <button
              class="text-[var(--pd-button-secondary)] cursor-pointer"
              on:click={() => {
                if (isStatefulTask(taskUI)) doExecuteAction(taskUI);
              }}
              aria-label="action button">{taskUI.action.name}</button>
          {/if}
        </div>
      </div>
    {/if}

    <!-- if failed task, display the error-->
    {#if isStatefulTask(taskUI) && taskUI.status === 'failure'}
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
