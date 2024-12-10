<script lang="ts">
import { CloseButton, NavPage } from '@podman-desktop/ui-svelte';

import { filtered, searchPattern } from '/@/stores/tasks';

import TaskManagerBulkDeleteButton from './button/TaskManagerBulkDeleteButton.svelte';
import TaskManagerClearAllButton from './button/TaskManagerClearAllButton.svelte';
import TaskManagerNoFilteredTasks from './screen/TaskManagerNoFilteredTasks.svelte';
import TaskManagerTable from './table/TaskManagerTable.svelte';
import TaskManagerBottomArrow from './TaskManagerBottomArrow.svelte';
import TaskManagerTabs from './TaskManagerTabs.svelte';
import TaskManagerWindowEvents from './TaskManagerWindowEvents.svelte';

interface Props {
  searchTerm?: string;
}

let { searchTerm = $bindable('') }: Props = $props();

// display or not the tasks manager (defaut is false)
let showTaskManager = $state(false);

// to filter
let outsideWindow: HTMLDivElement | undefined = $state();

let selectedItemsNumber: number = $state(0);

// hide the task manager
function hide(): void {
  showTaskManager = false;
}

// update the search pattern store when the variable is updated
$effect(() => {
  searchPattern.set(searchTerm);
});

// task or tasks depending on the number of selected items
const taskWordPlural = $derived(selectedItemsNumber > 1 ? 'tasks' : 'task');
</script>

<!-- track keys like "ESC" or clicking outside the window, etc. -->
<TaskManagerWindowEvents bind:showTaskManager={showTaskManager} bind:outsideWindow={outsideWindow} />
{#if showTaskManager}
  <div
    bind:this={outsideWindow}
    class="fixed bottom-8 right-4 bg-[var(--pd-modal-bg)] min-h-96 h-3/4 w-[calc(100%-52px-theme(width.leftnavbar))] z-40 border border-[var(--pd-modal-border)] rounded-md  shadow-xl shadow-black">
    <NavPage title="Tasks" bind:searchTerm={searchTerm}>
      <svelte:fragment slot="additional-actions">
        <TaskManagerClearAllButton />
        <CloseButton title="Hide (Escape)" on:click={hide} />
      </svelte:fragment>

      <svelte:fragment slot="tabs">
        <TaskManagerTabs bind:searchTerm={searchTerm} />
      </svelte:fragment>

      <svelte:fragment slot="bottom-additional-actions">
        {#if selectedItemsNumber > 0}
          <TaskManagerBulkDeleteButton
            title="Delete {selectedItemsNumber} selected {taskWordPlural}"
            bulkOperationTitle="delete {selectedItemsNumber} {taskWordPlural}" />
          <span>On {selectedItemsNumber} selected {taskWordPlural}.</span>
        {/if}
      </svelte:fragment>

      <div class="flex min-w-full h-full" slot="content">
        <TaskManagerTable bind:selectedItemsNumber={selectedItemsNumber} tasks={$filtered} />
        {#if $filtered.length === 0}
          <TaskManagerNoFilteredTasks bind:searchTerm={searchTerm} />
        {/if}
      </div>
    </NavPage>
  </div>
  <TaskManagerBottomArrow />

{/if}
