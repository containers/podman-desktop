<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

import type { Task } from '/@api/task';

import TaskManagerItem from './TaskManagerItem.svelte';

export let icon: IconDefinition;
export let tasks: Task[];
export let title: string;
export let lineColor: string;

// check if the item is the last one
let lastItem = (a: unknown[], i: number) => i === a.length - 1;
</script>

<!-- Display a title and then the list of the tasks -->
<div class="flex flex-col w-full">
  <div class="flex flex-row items-center w-full flex-nowrap text-[var(--pd-modal-header-text)]">
    <hr class="w-3 h-[2px] my-3 bg-[var(--pd-modal-header-text)] border-0" />
    <div class="flex mx-2 flex-row items-center">
      <Fa class="mr-1" size="0.45x" icon={icon} />
      <div class="flex-nowrap uppercase font-bold text-xs">{title} ({tasks.length})</div>
    </div>
    <hr class="flex-grow flex w-max h-[2px] bg-[var(--pd-modal-header-text)] border-0" />
  </div>
  <div class="w-full">
    {#each tasks as task, index}
      <TaskManagerItem task={task} />
      <!-- only if there are more items-->
      {#if !lastItem(tasks, index)}
        <hr class="w-full h-[1px] border-0 {lineColor}" />
      {/if}
    {/each}
  </div>
</div>
