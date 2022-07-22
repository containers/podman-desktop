<script lang="ts">
import type { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';
import { onMount } from 'svelte';
import { statusBarEntries } from '../../stores/statusbar';
import StatusBarItem from './StatusBarItem.svelte';

let leftEntries: StatusBarEntry[] = [];
let rightEntries: StatusBarEntry[] = [];

onMount(async () => {
  statusBarEntries.subscribe(value => {
    leftEntries = value
      .filter(descriptor => {
        return descriptor.alignLeft === true;
      })
      .sort((d1, d2) => {
        if (d1.priority > d2.priority) {
          return 1;
        } else if (d1.priority < d2.priority) {
          return -1;
        } else {
          return 0;
        }
      })
      .map(descriptor => {
        return descriptor.entry;
      });

    rightEntries = value
      .filter(descriptor => {
        return descriptor.alignLeft === false;
      })
      .sort((d1, d2) => {
        if (d1.priority > d2.priority) {
          return 1;
        } else if (d1.priority < d2.priority) {
          return -1;
        } else {
          return 0;
        }
      })
      .map(descriptor => {
        return descriptor.entry;
      });
  });
});
</script>

<div class="flex flex-wrap items-center justify-between px-2 h-6 bg-[#302251] text-sm">
  <div class="w-1/2">
    <ul class="flex flex-wrap list-none space-x-4">
      {#each leftEntries as entry}
        <li>
          <StatusBarItem entry="{entry}" />
        </li>
      {/each}
    </ul>
  </div>
  <div class="w-1/2">
    <ul class="flex flex-wrap flex-row-reverse list-none space-x-2 space-x-reverse">
      {#each rightEntries as entry}
        <li>
          <StatusBarItem entry="{entry}" />
        </li>
      {/each}
    </ul>
  </div>
</div>
