<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import NoLogIcon from '/@/lib/ui/NoLogIcon.svelte';
import { podsInfos } from '/@/stores/pods';

import { terminalService } from './KubernetesTerminalService';
import type { PodInfoUI } from './PodInfoUI';

let key = 0;

export let pod: PodInfoUI;

$: currentContainerStatus =
  $podsInfos
    .find(p => p.Name === pod.name)
    ?.Containers.reduce((acc, c) => {
      acc.set(c.Names, c.Status);
      return acc;
    }, new Map<string, string>()) ?? new Map<string, string>();

let currentContainerName = '';

onMount(() => {
  if (pod.containers.length > 0) {
    currentContainerName = pod.containers[0].Names;
    terminalService.ensureTerminalExists(pod.name, currentContainerName);
  }
  key++;
});

function handleSelectionChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  currentContainerName = target.value;
  terminalService.ensureTerminalExists(pod.name, currentContainerName);
  key++;
}
</script>

<div class="flex flex-col h-full">
  <div class="flex py-2 h-[40px]">
    <label
      for="input-standard-{pod.name}"
      class="block w-auto text-sm font-medium whitespace-nowrap leading-6 text-gray-900 pl-2 pr-2">
      {#key key}
        {#if terminalService.hasTerminal(pod.name, currentContainerName) && currentContainerStatus.get(currentContainerName) === 'running'}
          Connected to:
        {:else}
          Connecting to:
        {/if}
      {/key}
    </label>
    <div class="w-full">
      {#if pod.containers.length > 1}
        <select
          on:change={handleSelectionChange}
          aria-labelledby="listbox-label"
          class="block w-48 p-1 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700"
          name={pod.name}
          id="input-standard-{pod.name}">
          {#each pod.containers as container}
            <option value={container.Names}>{container.Names}</option>
          {/each}
        </select>
      {:else}
        <span
          id="input-standard-{pod.name}"
          class="block text-sm font-bold leading-6 text-gray-900"
          aria-labelledby="listbox-label">{currentContainerName}</span>
      {/if}
    </div>
  </div>

  <div class="flex grow w-full min-h-0">
    {#key key}
      {#if terminalService.hasTerminal(pod.name, currentContainerName) && currentContainerStatus.get(currentContainerName) === 'running'}
        <svelte:component
          this={terminalService.getTerminal(pod.name, currentContainerName).component}
          {...terminalService.getTerminal(pod.name, currentContainerName).props} />
      {/if}
    {/key}
  </div>
</div>

<EmptyScreen
  hidden={!currentContainerStatus.get(currentContainerName)}
  icon={NoLogIcon}
  title="No Terminal"
  message="Container is not running" />
