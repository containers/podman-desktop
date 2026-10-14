<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
/* eslint-enable import/no-duplicates */
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import VolumeIcon from '/@/lib/images/VolumeIcon.svelte';
import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import { providerInfos } from '/@/stores/providers';
import { volumeListInfos } from '/@/stores/volumes';

interface Props {
  volumeName?: string;
}
const { volumeName: initialVolumeName = '' }: Props = $props();

interface ConnectionWithEngine {
  connection: ProviderContainerConnectionInfo;
  engineId: string;
}

let volumeName = $state(initialVolumeName);
let selectedIndex = $state(-1);
let createVolumeInProgress = $state(false);
let createError: string | undefined = $state(undefined);
let createVolumeFinished = $state(false);

let connectionsWithEngine: ConnectionWithEngine[] = $derived(
  $providerInfos.flatMap(provider =>
    provider.containerConnections
      .filter(c => c.status === 'started')
      .map(c => ({ connection: c, engineId: `${provider.id}.${c.name}` })),
  ),
);

let providerConnections = $derived(connectionsWithEngine.map(x => x.connection));
let selectedProvider = $derived(providerConnections[selectedIndex]);
let selectedEngineId = $derived(connectionsWithEngine[selectedIndex]?.engineId);

$effect(() => {
  if (connectionsWithEngine.length === 0) {
    selectedIndex = -1;
  } else if (selectedIndex < 0 || selectedIndex >= connectionsWithEngine.length) {
    selectedIndex = 0;
  }
});

let invalidName = $derived.by(() => {
  if (!volumeName || !selectedEngineId || createVolumeFinished) return false;
  return $volumeListInfos
    .filter(volume => volume.engineId === selectedEngineId)
    .some(volume => volume.name === volumeName);
});

let volumeNameError: string | undefined = $derived(
  invalidName ? `The name "${volumeName}" already exists. Please choose a different name.` : undefined,
);

async function createVolume(providerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> {
  createError = undefined;
  createVolumeInProgress = true;
  try {
    await window.createVolume(providerConnectionInfo, { Name: volumeName });
    createVolumeFinished = true;
  } catch (error: unknown) {
    createError = error instanceof Error ? error.message : String(error);
  } finally {
    createVolumeInProgress = false;
  }
}

function end(): void {
  // redirect to the volumes page
  router.goto('/volumes');
}
</script>

<EngineFormPage
  title="Create a volume"
  inProgress={createVolumeInProgress}
  showEmptyScreen={providerConnections.length === 0}>
  {#snippet icon()}
    <VolumeIcon />
  {/snippet}
  {#snippet content()}
  <div class="space-y-6">
    <div>
      <label for="containerBuildContextDirectory" class="block mb-2 font-bold text-[var(--pd-content-card-header-text)]"
        >Volume name:</label>
      <Input clearable aria-label="Volume Name" disabled={createVolumeFinished} bind:value={volumeName} error={volumeNameError} aria-invalid={invalidName || undefined} required />
    </div>
    <div class:hidden={providerConnections.length < 2}>
      {#if providerConnections.length > 1}
        <label for="providerChoice" class="py-3 block mb-2 font-bold text-[var(--pd-content-card-header-text)]"
          >Container Engine
          <select
            class="w-full p-2 outline-hidden bg-[var(--pd-select-bg)] rounded-xs text-[var(--pd-content-card-text)]"
            aria-label="Provider Choice"
            disabled={createVolumeFinished}
            bind:value={selectedIndex}>
            {#each providerConnections as providerConnection, index (index)}
              <option value={index}>{providerConnection.name}</option>
            {/each}
          </select>
        </label>
      {/if}
    </div>
    {#if providerConnections.length === 1 && providerConnections[0]}
      <input type="hidden" aria-label="Provider Choice" readonly value={selectedIndex} />
    {/if}

    <ButtonRow>
      {#if !createVolumeFinished && selectedProvider}
        {@const connection = selectedProvider}
        <Button
          onclick={(): Promise<void> => createVolume(connection)}
          disabled={createVolumeInProgress || invalidName}
          inProgress={createVolumeInProgress}
          icon={faPlusCircle}>
          Create
        </Button>
      {/if}

      {#if createVolumeFinished}
        <Button onclick={end}>Done</Button>
      {/if}
    </ButtonRow>

    {#if createError}
      <ErrorMessage class="text-sm" error={createError} />
    {/if}
  </div>
  {/snippet}
</EngineFormPage>
