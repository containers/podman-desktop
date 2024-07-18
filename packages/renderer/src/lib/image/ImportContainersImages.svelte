<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { faMinusCircle, faPlay, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';

import { providerInfos } from '/@/stores/providers';
import { createTask } from '/@/stores/tasks';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '/@api/provider-info';

import EngineFormPage from '../ui/EngineFormPage.svelte';

let containersToImport: { imagePath: string; nameWhenImporting: string }[] = [];
let importError: string = '';

let providers: ProviderInfo[] = [];
let providerConnections: ProviderContainerConnectionInfo[] = [];
let selectedProvider: ProviderContainerConnectionInfo | undefined = undefined;
let inProgress = false;

$: importDisabled = !selectedProvider || containersToImport.length === 0;

onMount(async () => {
  providers = get(providerInfos);
  providerConnections = providers
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started');

  const selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;
});

async function addContainersToImport() {
  const images = await window.openDialog({
    title: 'Select Containers Images to import',
    selectors: ['multiSelections', 'openFile'],
  });

  if (!images) {
    return;
  }

  const imagesInfo: { imagePath: string; nameWhenImporting: string }[] = [];
  images.forEach(imgPath => {
    imgPath = imgPath.replace(/\\/g, '/');
    let lastSlashPos = imgPath.lastIndexOf('/') + 1;
    let lastDot: number | undefined = imgPath.lastIndexOf('.');
    if (lastDot === -1 || lastDot < lastSlashPos) {
      lastDot = undefined;
    }
    imagesInfo.push({
      imagePath: imgPath,
      nameWhenImporting: imgPath.substring(lastSlashPos, lastDot),
    });
  });

  containersToImport = [...containersToImport, ...imagesInfo];
}

function onHostContainerPortMappingInput(event: Event, index: number) {
  const target = event.currentTarget as HTMLInputElement;
  containersToImport[index].nameWhenImporting = target.value;
  containersToImport = containersToImport;
}

function deleteContainerToImport(index: number) {
  containersToImport = containersToImport.filter((_, i) => i !== index);
}

async function importContainers() {
  importError = '';

  if (!selectedProvider) {
    throw new Error('Select a provider to import');
  }

  inProgress = true;

  const task = createTask('Import containers');

  for (const containerImage of containersToImport) {
    try {
      await window.importContainer({
        provider: selectedProvider,
        archivePath: containerImage.imagePath,
        imageTag: containerImage.nameWhenImporting,
      });
    } catch (e) {
      importError += `Error while importing ${containerImage.imagePath}: ${String(e)}\n`;
    }
  }

  inProgress = false;
  if (importError === '') {
    task.status = 'success';
    task.state = 'completed';
    router.goto('/images');
  } else {
    task.status = 'failure';
    task.error = importError;
    task.state = 'completed';
  }
}
</script>

<EngineFormPage title="Import Containers">
  <svelte:fragment slot="icon">
    <i class="fas fa-play fa-2x" aria-hidden="true"></i>
  </svelte:fragment>
  <div slot="content" class="space-y-2">
    {#if providerConnections.length > 1}
      <label for="providerChoice" class="py-6 block mb-2 text-sm font-bold text-[var(--pd-content-card-header-text)]"
        >Container Engine
        <select
          class="w-full p-2 outline-none text-sm bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-card-text)]"
          name="providerChoice"
          id="providerChoice"
          bind:value={selectedProvider}>
          {#each providerConnections as providerConnection}
            <option value={providerConnection}>{providerConnection.name}</option>
          {/each}
        </select>
      </label>
    {/if}

    <label for="modalContainersImport" class="block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
      >Containers to import:</label>
    <Button on:click={addContainersToImport} icon={faPlusCircle} type="link">Add images to import</Button>
    <!-- Display the list of existing containersToImport -->
    {#if containersToImport.length > 0}
      <div class="flex flex-row justify-center w-full py-1 text-sm font-medium text-[var(--pd-content-card-text)]">
        <div class="flex flex-col grow pl-2">Image Path</div>
        <div class="flex flex-col w-2/4 mr-2.5">Image Name when importing (e.g quay.io/podman/hello)</div>
      </div>
    {/if}
    {#each containersToImport as containerToImport, index}
      <div class="flex flex-row justify-center w-full py-1">
        <Input bind:value={containerToImport.imagePath} aria-label="container image path" readonly={true} />
        <Input
          bind:value={containerToImport.nameWhenImporting}
          on:input={event => onHostContainerPortMappingInput(event, index)}
          aria-label="container importing name"
          placeholder="Image Name when Importing (e.g. quay.io/namespace/my-image-name)"
          class="ml-2" />
        <Button type="link" on:click={() => deleteContainerToImport(index)} icon={faMinusCircle} />
      </div>
    {/each}

    <div class="pt-5">
      <Button
        on:click={() => importContainers()}
        inProgress={inProgress}
        class="w-full"
        icon={faPlay}
        aria-label="Import containers"
        bind:disabled={importDisabled}>
        Import Containers
      </Button>
      <div aria-label="importError">
        {#if importError !== ''}
          <ErrorMessage class="py-2 text-sm" error={importError} />
        {/if}
      </div>
    </div>
  </div>
</EngineFormPage>
