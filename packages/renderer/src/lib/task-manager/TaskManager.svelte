<script lang="ts">
import {
  faCheck,
  faCheckCircle,
  faCheckDouble,
  faCheckSquare,
  faChevronDown,
  faCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { clearCompletedTasks, tasksInfo } from '/@/stores/tasks';

import Fa from 'svelte-fa/src/fa.svelte';
import BellSlashIcon from '../images/BellSlashIcon.svelte';
import TaskIcon from '../images/TaskIcon.svelte';
import TaskManagerEmptyScreen from './TaskManagerEmptyScreen.svelte';
import TaskManagerGroup from './TaskManagerGroup.svelte';

// display or not the tasks manager (defaut is false)
export let showTaskManager = false;

$: runningTasks = $tasksInfo.filter(task => task.state === 'running');
$: completedTasks = $tasksInfo.filter(task => task.state === 'completed');

// hide the task manager
function hide() {
  showTaskManager = false;
}

function clearCompleted() {
  // needs to delete the task from the svelte store
  clearCompletedTasks();
}

// If we hit ESC while the menu is open, close it
function handleEscape({ key }) {
  // if the task manager is not open, do not check any keys
  if (!showTaskManager) {
    return;
  }
  if (key === 'Escape') {
    showTaskManager = false;
  }
}

// listen to the event "toggle-task-manager" to toggle the task manager
window.events?.receive('toggle-task-manager', () => {
  showTaskManager = !showTaskManager;
});
</script>

<!-- track keys like "ESC" -->
<svelte:window on:keyup="{handleEscape}" />

{#if showTaskManager}
  <div title="Tasks manager" class="fixed bottom-9 right-4 bg-zinc-900 h-96 w-80 z-40">
    <!-- Draw the arrow below the box-->
    <div
      class="absolute bottom-0 z-50 right-[17px] transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 {$tasksInfo.length >
      0
        ? 'bg-zinc-900'
        : 'bg-zinc-800'} border-r border-b border-zinc-600">
    </div>

    <div title="" class="flex flex-col h-full w-full border border-zinc-600">
      <!-- header of the task manager -->
      <div class="flex flex-row w-full">
        <!-- title of bars-->
        <div class="p-2 flex flex-row items-center w-full text-gray-300">
          <TaskIcon size="15" />
          <div class="text-xs uppercase ml-2">tasks</div>
          <div class="flex-1"></div>
          <!--
          <div title="Toggle Do Not Disturb Mode" class="cursor-pointer hover:bg-zinc-800 p-1">
            <BellSlashIcon size="15" />
          </div>
          -->
          <button on:click="{() => hide()}" title="Hide (Escape)" class="cursor-pointer hover:bg-zinc-800 p-1 ml-1">
            <Fa icon="{faChevronDown}" size="15" />
          </button>
        </div>
      </div>

      {#if $tasksInfo.length > 0}
        <div class="flex flex-col grow h-[100px] overflow-y-auto">
          <!-- running tasks-->
          {#if runningTasks.length > 0}
            <div class="flex bg-zinc-700 px-4">
              <TaskManagerGroup
                lineColor="bg-zinc-800"
                icon="{faCircle}"
                tasks="{runningTasks}"
                title="running tasks" />
            </div>
          {/if}

          <!-- completed tasks-->
          {#if completedTasks.length > 0}
            <div class="flex bg-zinc-800 pt-1 px-4">
              <TaskManagerGroup
                lineColor="bg-zinc-400"
                icon="{faCheck}"
                tasks="{completedTasks}"
                title="completed tasks" />
            </div>
          {/if}
        </div>
      {/if}

      <!-- footer of the task manager -->
      <!-- only if there are tasks-->
      {#if completedTasks.length > 0}
        <div class="flex flex-row w-full">
          <div class="p-2 flex flex-row space-x-2 w-full text-gray-300">
            <button on:click="{() => clearCompleted()}" class="pf-c-button pf-m-secondary">Clear completed</button>
            <!--<button class="pf-c-button pf-m-secondary">View task history</button>-->
          </div>
        </div>
      {/if}
      <!-- display the empty screen -->
      {#if $tasksInfo.length === 0}
        <TaskManagerEmptyScreen />
      {/if}
    </div>
  </div>
{/if}
