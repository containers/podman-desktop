<script lang="ts">
import { onMount } from 'svelte';

import type { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';
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

<div class="flex items-center justify-between px-1 bg-[#302251] text-sm py-0.5 space-x-2 z-40">
  <div>
    <ul class="flex flex-wrap gap-x-2 list-none items-center">
      {#each leftEntries as entry}
        <li>
          <StatusBarItem entry="{entry}" />
        </li>
      {/each}
    </ul>
  </div>
  <div class="place-self-end">
    <ul class="flex flex-wrap flex-row-reverse gap-x-2 list-none items-center">
      {#each rightEntries as entry}
        <li>
          <StatusBarItem entry="{entry}" />
        </li>
      {/each}
    </ul>
  </div>
</div>
