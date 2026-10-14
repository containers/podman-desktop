<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { faCircleArrowDown, faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { get } from 'svelte/store';
import { router } from 'tinro';

import ContainerConnectionDropdown from '/@/lib/forms/ContainerConnectionDropdown.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import { providerInfos } from '/@/stores/providers';

let containersToImport: { imagePath: string; nameWhenImporting: string }[] = $state([]);
let importError: string = $state('');

let providers: ProviderInfo[] = [];
let providerConnections: ProviderContainerConnectionInfo[] = $state([]);
let selectedProvider: ProviderContainerConnectionInfo | undefined = $state(undefined);
let inProgress = $state(false);

let importDisabled = $derived(!selectedProvider || containersToImport.length === 0);

onMount(async () => {
  providers = get(providerInfos);
  providerConnections = providers
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started');

  const selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;
});

async function addContainersToImport(): Promise<void> {
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

function onHostContainerPortMappingInput(event: Event, index: number): void {
  const target = event.currentTarget as HTMLInputElement;
  containersToImport[index].nameWhenImporting = target.value;
  containersToImport = containersToImport;
}

function deleteContainerToImport(index: number): void {
  containersToImport = containersToImport.filter((_, i) => i !== index);
}

async function importContainers(): Promise<void> {
  importError = '';

  if (!selectedProvider) {
    throw new Error('Select a provider to import');
  }

  inProgress = true;

  for (const containerImage of containersToImport) {
    try {
      await window.importContainer({
        provider: $state.snapshot(selectedProvider),
        archivePath: containerImage.imagePath,
        imageTag: containerImage.nameWhenImporting,
      });
    } catch (e) {
      importError += `Error while importing ${containerImage.imagePath}: ${String(e)}\n`;
    }
  }

  inProgress = false;
  if (importError === '') {
    router.goto('/images');
  }
}
</script>

<EngineFormPage title="Import Containers">
  {#snippet icon()}
    <i class="fas fa-play fa-2x" aria-hidden="true"></i>
  {/snippet}
  {#snippet content()}
  <div class="space-y-2">
    {#if providerConnections.length > 1}
    <div class="mb-4">
      <label for="providerChoice" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
        >Container engine</label>
      <ContainerConnectionDropdown
        id="providerChoice"
        name="providerChoice"
        bind:value={selectedProvider}
        connections={providerConnections}/>
    </div>
    {/if}

    <label for="modalContainersImport" class="block mb-2 font-semibold text-[var(--pd-content-card-header-text)]"
      >Containers to import</label>
    <Button on:click={addContainersToImport} icon={faPlusCircle} type="link">Add images to import</Button>
    <!-- Display the list of existing containersToImport -->
    {#if containersToImport.length > 0}
      <div class="flex flex-row justify-center w-full py-1 text-sm font-semibold text-[var(--pd-content-card-text)]">
        <div class="flex flex-col grow pl-2">Image Path</div>
        <div class="flex flex-col w-2/4 mr-2.5">Image Name when importing (e.g quay.io/podman/hello)</div>
      </div>
    {/if}
    {#each containersToImport as containerToImport, index (index)}
      <div class="flex flex-row justify-center w-full py-1">
        <Input bind:value={containerToImport.imagePath} aria-label="container image path" readonly={true} />
        <Input
          bind:value={containerToImport.nameWhenImporting}
          on:input={(event): void => onHostContainerPortMappingInput(event, index)}
          aria-label="container importing name"
          placeholder="Image Name when Importing (e.g. quay.io/namespace/my-image-name)"
          class="ml-2" />
        <Button type="link" on:click={(): void => deleteContainerToImport(index)} icon={faMinusCircle} aria-label="Remove container" />
      </div>
    {/each}

    <div class="pt-5">
      <ButtonRow>
        <Button
          on:click={importContainers}
          inProgress={inProgress}
          icon={faCircleArrowDown}
          aria-label="Import containers"
          disabled={importDisabled}>
          Import Containers
        </Button>
      </ButtonRow>
      <div aria-label="importError">
        {#if importError !== ''}
          <ErrorMessage class="py-2 text-sm" error={importError} />
        {/if}
      </div>
    </div>
  </div>
  {/snippet}
</EngineFormPage>
