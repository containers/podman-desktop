<script lang="ts">
import { type SvelteToastOptions, toast } from '@zerodevx/svelte-toast';
import { type ComponentType, onMount } from 'svelte';

import { onDidChangeConfiguration } from '/@/stores/configurationProperties';
import { tasksInfo } from '/@/stores/tasks';
import type { TaskInfo } from '/@api/taskInfo';
import { ExperimentalTasksSettings } from '/@api/tasks-preferences';

import ToastCustomUi from './ToastCustomUi.svelte';

// extends TaskInfo by adding the toast id
interface TaskInfoWithToastId extends TaskInfo {
  toastId: number;
}

const CONFIGURATION_KEY = `${ExperimentalTasksSettings.SectionName}.${ExperimentalTasksSettings.Toast}`;

// keep a local copy of the tasks with their toast id
const currentTasks: TaskInfoWithToastId[] = $state([]);

// is that the configuration is enabled or not, will be updated by configuration
let enabled = $state(false);

// Responsible to display the toast notifications in case of tasks
// subscribe to the tasks and keep a local copy there
// it allows to compare when tasks are updated

function handleTasks(tasks: TaskInfo[]): void {
  // grab the tasks that are not in the currentTasks
  const newTasks = tasks.filter(task => !currentTasks.find(currentTask => currentTask.id === task.id));

  // get the existing one that we should update
  const toUpdateTasks = tasks.filter(task => currentTasks.find(currentTask => currentTask.id === task.id));

  // get deleted tasks
  const toDeleteTasks = currentTasks.filter(currentTask => !tasks.find(task => task.id === currentTask.id));

  // for the new one, create the notification
  for (const taskInfo of newTasks) {
    const number = displayNewToast(taskInfo);
    currentTasks.push({ ...taskInfo, toastId: number });
  }

  // for the existing one, update the toast
  for (const taskInfo of toUpdateTasks) {
    const currentTask = currentTasks.find(currentTask => currentTask.id === taskInfo.id);

    if (currentTask) {
      // replace the task in the currentTasks
      currentTasks.splice(currentTasks.indexOf(currentTask), 1, { ...taskInfo, toastId: currentTask.toastId });
      toast.set(currentTask.toastId, createToastOptions(taskInfo));
    }
  }

  // remove from currentTasks all the items from deletedTasks
  for (const taskInfo of toDeleteTasks) {
    currentTasks.splice(currentTasks.indexOf(taskInfo), 1);
    toast.pop(taskInfo.toastId);
  }
}

// create a toast with a custom UI
function createToastOptions(taskInfo: TaskInfo): SvelteToastOptions {
  const src = ToastCustomUi as unknown as ComponentType;

  return {
    component: {
      src,
      props: {
        taskInfo,
      },
      sendIdTo: 'toastId',
    },
    dismissable: false,
    initial: 0,
  };
}

function displayNewToast(taskInfo: TaskInfo): number {
  const toastOptions = createToastOptions(taskInfo);
  return toast.push(taskInfo.name, toastOptions);
}

onMount(async () => {
  // read initial value
  enabled = (await window.getConfigurationValue<boolean>(CONFIGURATION_KEY)) ?? false;

  // update the enabled flag each time the configuration properties is updated
  onDidChangeConfiguration.addEventListener(CONFIGURATION_KEY, obj => {
    if ('detail' in obj) {
      const detail = obj.detail as { key: string; value: boolean };
      if (CONFIGURATION_KEY === detail?.key) {
        enabled = detail.value;
        if (!enabled) {
          toast.pop(0);
          currentTasks.length = 0;
        }
      }
    }
  });

  // create/update toasts when tasks are updated
  tasksInfo.subscribe(tasks => {
    if (enabled) {
      handleTasks(tasks);
    }
  });
});
</script>
