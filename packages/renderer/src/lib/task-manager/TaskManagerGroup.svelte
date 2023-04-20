<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import TaskManagerItem from './TaskManagerItem.svelte';

import type { Task } from '../../../../main/src/plugin/api/task';

export let icon;
export let tasks: Task[];
export let title;
export let lineColor;

// check if the item is the last one
let lastItem = (a: unknown[], i: number) => i == a.length - 1;
</script>

<!-- Display a title and then the list of the tasks -->
<div class="flex flex-col w-full">
  <div class="flex flex-row items-center w-full flex-nowrap">
    <hr class="w-3 h-[2px] my-3 {lineColor} border-0" />
    <div class="flex mx-2 flex-row items-center">
      <Fa class="mr-1 text-purple-300" size="7" icon="{icon}" />
      <div class="flex-nowrap uppercase font-bold text-xs">{title} ({tasks.length})</div>
    </div>
    <hr class="flex-grow flex w-max h-[2px] {lineColor} border-0" />
  </div>
  <div class="w-full">
    {#each tasks as task, index}
      <TaskManagerItem task="{task}" />
      <!-- only if there are more items-->
      {#if !lastItem(tasks, index)}
        <hr class="w-full h-[1px] border-0 {lineColor}" />
      {/if}
    {/each}
  </div>
</div>
