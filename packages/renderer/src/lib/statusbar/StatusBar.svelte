<script lang="ts">
import { onMount } from 'svelte';

import TaskIndicator from '/@/lib/statusbar/TaskIndicator.svelte';
import { statusBarEntries } from '/@/stores/statusbar';
import { ExperimentalTasksSettings } from '/@api/tasks-preferences';

import type { StatusBarEntry } from '../../../../main/src/plugin/statusbar/statusbar-registry';
import StatusBarItem from './StatusBarItem.svelte';

let leftEntries: StatusBarEntry[] = $state([]);
let rightEntries: StatusBarEntry[] = $state([]);

let experimentalTaskStatusBar: boolean = $state(false);

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

  experimentalTaskStatusBar =
    (await window.getConfigurationValue<boolean>(
      `${ExperimentalTasksSettings.SectionName}.${ExperimentalTasksSettings.StatusBar}`,
    )) ?? false;
});
</script>

<div
  class="flex justify-between px-1 bg-[var(--pd-statusbar-bg)] text-[var(--pd-statusbar-text)] text-sm space-x-2 z-40"
  role="contentinfo"
  aria-label="Status Bar">
  <div class="flex flex-wrap gap-x-1.5 h-full">
    {#each leftEntries as entry}
      <StatusBarItem entry={entry} />
    {/each}
  </div>
  <div class="flex flex-wrap flex-row-reverse gap-x-1.5 h-full place-self-end">
    {#each rightEntries as entry}
      <StatusBarItem entry={entry} />
    {/each}
    {#if experimentalTaskStatusBar}
      <TaskIndicator />
    {/if}
  </div>
</div>
