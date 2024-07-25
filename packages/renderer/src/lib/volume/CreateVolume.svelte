<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';

import VolumeIcon from '/@/lib/images/VolumeIcon.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import { providerInfos } from '/@/stores/providers';
/* eslint-enable import/no-duplicates */
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

let providers: ProviderInfo[] = [];
let providerConnections: ProviderContainerConnectionInfo[] = [];
let selectedProvider: ProviderContainerConnectionInfo | undefined = undefined;
let selectedProviderConnection: ProviderContainerConnectionInfo | undefined = undefined;

onMount(async () => {
  providers = get(providerInfos);
  providerConnections = providers
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started');

  const selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;
});

let createVolumeInProgress = false;
onDestroy(() => {});

async function createVolume(providerConnectionInfo: ProviderContainerConnectionInfo) {
  createVolumeInProgress = true;
  try {
    await window.createVolume(providerConnectionInfo, { Name: volumeName });
  } finally {
    createVolumeInProgress = false;
    createVolumeFinished = true;
  }
}

function end() {
  // redirect to the volumes page
  router.goto('/volumes');
}

let createVolumeFinished = false;

export let volumeName = '';
</script>

<EngineFormPage
  title="Create a volume"
  inProgress={createVolumeInProgress}
  showEmptyScreen={providerConnections.length === 0}>
  <svelte:fragment slot="icon">
    <VolumeIcon />
  </svelte:fragment>
  <div slot="content" class="space-y-6">
    <div>
      <label for="containerBuildContextDirectory" class="block mb-2 font-bold text-[var(--pd-content-card-header-text)]"
        >Volume name:</label>
      <Input clearable aria-label="Volume Name" disabled={createVolumeFinished} bind:value={volumeName} required />
    </div>
    <div class:hidden={providerConnections.length < 2}>
      {#if providerConnections.length > 1}
        <label for="providerChoice" class="py-3 block mb-2 font-bold text-[var(--pd-content-card-header-text)]"
          >Container Engine
          <select
            class="w-full p-2 outline-none bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-card-text)]"
            aria-label="Provider Choice"
            disabled={createVolumeFinished}
            bind:value={selectedProvider}>
            {#each providerConnections as providerConnection}
              <option value={providerConnection}>{providerConnection.name}</option>
            {/each}
          </select>
        </label>
      {/if}
    </div>
    {#if providerConnections.length === 1 && selectedProviderConnection}
      <input type="hidden" aria-label="Provider Choice" readonly bind:value={selectedProvider} />
    {/if}

    <div class="w-full flex flex-row space-x-4">
      {#if !createVolumeFinished && selectedProvider}
        {@const connection = selectedProvider}
        <Button
          on:click={() => createVolume(connection)}
          disabled={createVolumeInProgress}
          class="w-full"
          inProgress={createVolumeInProgress}
          icon={faPlusCircle}>
          Create
        </Button>
      {/if}

      {#if createVolumeFinished}
        <Button on:click={() => end()} class="w-full">Done</Button>
      {/if}
    </div>
  </div>
</EngineFormPage>
