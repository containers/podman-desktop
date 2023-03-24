<script lang="ts">
import { faClose, faInfoCircle, faSquareCheck, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher, onMount } from 'svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { TaskManager, TaskUI } from './task-manager';
import { removeTask, Task } from '/@/stores/tasks';

export let task: Task;

const taskManager = new TaskManager();
const dispatch = createEventDispatcher();

let taskUI: TaskUI;
$: taskUI = taskManager.toTaskUi(task);

let icon;
let iconColor;
onMount(() => {
  if (task.status === 'success') {
    icon = faSquareCheck;
    iconColor = 'text-green-600';
  } else if (task.status === 'failure') {
    icon = faTriangleExclamation;
    iconColor = 'text-red-500';
  } else {
    icon = faInfoCircle;
    iconColor = 'text-purple-500';
  }
});

function closeCompleted(taskUI: TaskUI) {
  // needs to delete the task from the svelte store
  removeTask(taskUI.id);
}

function gotoTask(taskUI: TaskUI) {
  // hide the task manager
  window.events?.send('toggle-task-manager', '');
  // and open the task
  taskUI?.gotoTask();
}
</script>

<!-- Display a task item-->
<div class="flex flew-row w-full py-2">
  <!-- first column is the icon-->
  <div class="flex w-3 {iconColor} justify-center">
    <Fa size="14" icon="{icon}" />
  </div>
  <!-- second column is about the task-->
  <div class="flex flex-col w-full pl-2">
    <div class="flex flex-row w-full">
      <div title="{taskUI.name}" class="w-60 pb-1 cursor-default truncate">{taskUI.name}</div>

      <div class="flex flex-col flex-grow items-end">
        <!-- if completed task, display a close icon-->
        {#if taskUI.state === 'completed'}
          <button
            title="Clear notification"
            class="hover:bg-zinc-900 hover:text-purple-500"
            on:click="{() => closeCompleted(taskUI)}"><Fa size="12" icon="{faClose}" /></button>
        {/if}
      </div>
    </div>
    <!-- age -->
    <div class="text-gray-400 text-xs">{taskUI.age}</div>

    <!-- if in-progress task, display a link to resume-->
    {#if taskUI.status === 'in-progress'}
      <div class="flex flex-row w-full">
        {#if taskUI.progress >= 0}
          <div class="w-32">
            <div class="w-full h-4 mb-4 rounded-full bg-gray-600">
              <div class="h-4 bg-purple-500 rounded-full" style="width: {taskUI.progress}%"></div>
            </div>
          </div>
          <div class="ml-2 text-xs">{taskUI.progress}%</div>
        {/if}
        <div class="flex flex-1 flex-col w-full items-end text-purple-500 text-xs">
          {#if taskUI.hasGotoTask}
            <button class="text-purple-500 cursor-pointer" on:click="{() => gotoTask(taskUI)}">Go to task ></button>
          {/if}
        </div>
      </div>
    {/if}

    <!-- if failed task, display the error-->
    {#if taskUI.status === 'failure'}
      <div class="flex flex-col w-full items-end text-purple-300 text-xs">
        <div>View Error ></div>
      </div>
    {/if}
  </div>
</div>
