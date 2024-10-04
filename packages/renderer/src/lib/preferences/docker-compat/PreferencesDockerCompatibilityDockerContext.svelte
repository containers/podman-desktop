<script lang="ts">
import { onMount } from 'svelte';

import RefreshButton from '/@/lib/ui/RefreshButton.svelte';
import type { DockerContextInfo } from '/@api/docker-compatibility-info';

let dockerContexts: DockerContextInfo[] = $state([]);

let selectedContext: DockerContextInfo | undefined = $state(undefined);

async function refreshDockerContext(): Promise<void> {
  const items = await window.getDockerContexts();
  selectedContext = items.find(context => context.isCurrentContext);
  // update the list after selected context has been set
  dockerContexts = items;
}

onMount(async () => {
  // ask once to get the result, then it'll be triggered by the user clicking on refresh
  await refreshDockerContext();
});

$effect(() => {
  // get current selected context
  const currentSelectedContext = dockerContexts.find(context => context.isCurrentContext);
  if (!selectedContext || (currentSelectedContext && selectedContext?.name === currentSelectedContext.name)) {
    // do nothing if we're not changing the context
    return;
  }

  // set the selected context
  window.switchDockerContext(selectedContext.name).catch((error: unknown) => {
    console.error(`Failing to switch docket context to ${selectedContext?.name}`, error);
  });
});
</script>

<div
  class="bg-[var(--pd-invert-content-card-bg)] rounded-md mt-2 ml-2 divide-x divide-[var(--pd-content-divider)] flex flex-col lg:flex-row">
  <div class="flex flex-row grow px-2 py-2 justify-between text-[color:var(--pd-invert-content-card-text)]">
    <div class="flex flex-col">
      <div class="flex flex-row items-center text-[color:var(--pd-invert-content-card-text)]">
        Docker Context

        <div class="mx-2">
          <RefreshButton label="Refresh the context" onclick={refreshDockerContext} />
        </div>
      </div>
      {#if dockerContexts.length === 0}
        <div class="mt-2">No Docker context found</div>
      {:else}
        <div class="mt-2">
          Display and select between your different Docker-compatible socket contexts.
          <select
            class="w-full p-2 outline-none bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-text)]"
            aria-label="Docker Context selection"
            id="dockerContextChoice"
            bind:value={selectedContext}>
            {#each dockerContexts as dockerContext}
              <option selected={dockerContext.isCurrentContext} value={dockerContext}
                >{dockerContext.name} ({dockerContext.endpoints.docker.host})</option>
            {/each}
          </select>
        </div>
      {/if}
    </div>
  </div>
</div>
