<script lang="ts">
import { faCheck, faChevronDown, faCircle } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import { clearNotifications, isStatefulTask, tasksInfo } from '/@/stores/tasks';

import TaskIcon from '../images/TaskIcon.svelte';
import Button from '../ui/Button.svelte';
import TaskManagerEmptyScreen from './TaskManagerEmptyScreen.svelte';
import TaskManagerGroup from './TaskManagerGroup.svelte';

// display or not the tasks manager (defaut is false)
export let showTaskManager = false;

$: runningTasks = $tasksInfo.filter(task => {
  if (isStatefulTask(task)) {
    return task.state === 'running';
  }
  return false;
});
$: notificationsTasks = $tasksInfo.filter(task => {
  if (isStatefulTask(task)) {
    return task.state === 'completed';
  }
  return true;
});

// hide the task manager
function hide() {
  showTaskManager = false;
}

// If we hit ESC while the menu is open, close it
function handleEscape({ key }: any) {
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
  <div title="Tasks manager" class="fixed bottom-9 right-4 bg-charcoal-800 h-96 w-80 z-40">
    <!-- Draw the arrow below the box-->
    <div
      class="absolute bottom-0 z-50 right-[17px] transform -translate-x-1/2 translate-y-1/2 rotate-45 w-4 h-4 {$tasksInfo.length >
      0
        ? 'bg-charcoal-800'
        : 'bg-charcoal-600'} border-r border-b border-zinc-600">
    </div>

    <div title="" class="flex flex-col h-full w-full border border-zinc-600">
      <!-- header of the task manager -->
      <div class="flex flex-row w-full">
        <!-- title of bars-->
        <div class="p-2 flex flex-row items-center w-full text-gray-400">
          <TaskIcon size="15" />
          <div class="text-xs uppercase ml-2">tasks</div>
          <div class="flex-1"></div>
          <!--
          <div title="Toggle Do Not Disturb Mode" class="cursor-pointer hover:bg-charcoal-600 p-1">
            <BellSlashIcon size="15" />
          </div>
          -->
          <button on:click="{() => hide()}" title="Hide (Escape)" class="cursor-pointer hover:bg-charcoal-600 p-1 ml-1">
            <Fa icon="{faChevronDown}" size="0.9x" />
          </button>
        </div>
      </div>

      {#if $tasksInfo.length > 0}
        <div class="flex flex-col grow h-[100px] overflow-y-auto">
          <!-- running tasks-->
          {#if runningTasks.length > 0}
            <div class="flex bg-zinc-700 px-4">
              <TaskManagerGroup
                lineColor="bg-charcoal-600"
                icon="{faCircle}"
                tasks="{runningTasks}"
                title="running tasks" />
            </div>
          {/if}

          <!-- completed tasks-->
          {#if notificationsTasks.length > 0}
            <div class="flex bg-charcoal-600 pt-1 px-4">
              <TaskManagerGroup
                lineColor="bg-zinc-400"
                icon="{faCheck}"
                tasks="{notificationsTasks}"
                title="notifications" />
            </div>
          {/if}
        </div>
      {/if}

      <!-- footer of the task manager -->
      <!-- only if there are tasks-->
      {#if notificationsTasks.length > 0}
        <div class="flex flex-row w-full">
          <div class="p-2 flex flex-row space-x-2 w-full">
            <Button on:click="{() => clearNotifications()}">Clear</Button>
            <!--<Button>View task history</Button>-->
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
