<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { faMinusCircle, faPlay, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';

import Button from '/@/lib/ui//Button.svelte';
import ErrorMessage from '/@/lib/ui//ErrorMessage.svelte';
import FormPage from '/@/lib/ui//FormPage.svelte';
import { providerInfos } from '/@/stores/providers';
import { createTask } from '/@/stores/tasks';

import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

let archivesToLoad: string[] = [];
let loadError: string = '';

let providers: ProviderInfo[] = [];
let providerConnections: ProviderContainerConnectionInfo[] = [];
let selectedProvider: ProviderContainerConnectionInfo | undefined = undefined;
let inProgress = false;

$: loadDisabled = !selectedProvider || archivesToLoad.length === 0;

onMount(async () => {
  providers = get(providerInfos);
  providerConnections = providers
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started');

  const selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;
});

async function addArchivesToLoad() {
  const archives = await window.openDialog({
    title: 'Select Tar Archive(s) containing Image(s) to load',
    selectors: ['multiSelections', 'openFile'],
  });

  if (!archives) {
    return;
  }

  archivesToLoad = [...archivesToLoad, ...archives];
}

function deleteImagesTarArchiveToLoad(index: number) {
  archivesToLoad = archivesToLoad.filter((_, i) => i !== index);
}

async function loadImages() {
  loadError = '';

  if (!selectedProvider) {
    throw new Error('Select a provider to load');
  }

  inProgress = true;

  const task = createTask('Load images');

  for (const archive of archivesToLoad) {
    try {
      await window.loadImages({
        provider: selectedProvider,
        archives: [archive],
      });
    } catch (e) {
      loadError += `Error while loading ${archive}: ${String(e)}\n`;
    }
  }

  inProgress = false;
  if (loadError === '') {
    task.status = 'success';
    task.state = 'completed';
    router.goto('/images');
  } else {
    task.status = 'failure';
    task.error = loadError;
    task.state = 'completed';
  }
}
</script>

<FormPage title="Load Images">
  <svelte:fragment slot="icon">
    <i class="fas fa-play fa-2x" aria-hidden="true"></i>
  </svelte:fragment>
  <div slot="content" class="p-5 min-w-full h-fit">
    <div class="bg-charcoal-600 px-6 py-4 space-y-2 lg:px-8 sm:pb-6 xl:pb-8">
      {#if providerConnections.length > 1}
        <label for="providerChoice" class="pt-6 block text-sm font-bold text-gray-400"
          >Container Engine
          <select
            class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
            name="providerChoice"
            id="providerChoice"
            bind:value="{selectedProvider}">
            {#each providerConnections as providerConnection}
              <option value="{providerConnection}">{providerConnection.name}</option>
            {/each}
          </select>
        </label>
      {/if}

      <Button on:click="{addArchivesToLoad}" icon="{faPlusCircle}" type="link">Add archive</Button>
      <!-- Display the list of existing imagesToLoad -->
      {#if archivesToLoad.length > 0}
        <div class="flex flex-row justify-center w-full py-1 text-sm font-medium text-gray-400">
          <div class="flex flex-col grow pl-2">Image Archives</div>
        </div>
      {/if}
      {#each archivesToLoad as archiveToLoad, index}
        <div class="flex flex-row justify-center w-full py-1">
          <Input bind:value="{archiveToLoad}" aria-label="archive path" readonly="{true}" />
          <Button type="link" on:click="{() => deleteImagesTarArchiveToLoad(index)}" icon="{faMinusCircle}" />
        </div>
      {/each}

      <div class="pt-5">
        <Button
          on:click="{() => loadImages()}"
          inProgress="{inProgress}"
          class="w-full"
          icon="{faPlay}"
          aria-label="Load images"
          bind:disabled="{loadDisabled}">
          Load Images
        </Button>
        <div aria-label="loadError">
          {#if loadError !== ''}
            <ErrorMessage class="py-2 text-sm" error="{loadError}" />
          {/if}
        </div>
      </div>
    </div>
  </div>
</FormPage>
