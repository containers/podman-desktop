<script lang="ts">
import { NavigationPage } from '@desktop-framework/api';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonRow, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';

import EngineFormPage from '/@/lib/ui/EngineFormPage.svelte';
import { Uri } from '/@/lib/uri/Uri';
import { handleNavigation } from '/@/navigation';
import { lastPage } from '/@/stores/breadcrumb';
import { containersInfos } from '/@/stores/containers';

import type { ContainerInfoUI } from './ContainerInfoUI';

interface Props {
  containerID: string;
}
let { containerID }: Props = $props();

let container: ContainerInfoUI | undefined = $state(undefined);

let invalidName = $state(false);
let invalidFolder = $state(true);
let outputTarget = $state('');
let outputUri: Uri;
let exportedError = $state('');
let inProgress = $state(false);
let invalidFields = $derived(invalidName || invalidFolder);

onMount(() => {
  // loading container info
  return containersInfos.subscribe(containers => {
    const matchingContainer = containers.find(c => c.id === containerID);
    if (matchingContainer) {
      // copy: this object is local to the screen and must not alias the store's element
      container = { ...matchingContainer };
    } else {
      handleNavigation({
        page: NavigationPage.CONTAINERS,
      });
    }
  });
});

async function selectFolderPath(): Promise<void> {
  if (!container) return;

  const result = await window.saveDialog({
    title: 'Select the directory where to export the container content',
    defaultUri: {
      fsPath: `${container.name}.tar`,
      path: `${container.name}.tar`,
      scheme: 'file',
    } as Uri,
  });
  if (!result) {
    if (!outputTarget) {
      invalidFolder = true;
    }
    return;
  }
  const uriAPI = Uri.revive(result);
  outputUri = uriAPI;
  outputTarget = uriAPI.fsPath;
  invalidFolder = false;
}

async function exportContainer(): Promise<void> {
  if (!container) return;

  exportedError = '';
  inProgress = true;

  try {
    await window.exportContainer(container.engineId, {
      id: container.id,
      outputTarget: outputUri.fsPath,
    });
    // go back to containers list
    handleNavigation({ page: NavigationPage.CONTAINERS });
  } catch (error) {
    exportedError = String(error);
  } finally {
    inProgress = false;
  }
}
</script>

{#if container}
  <EngineFormPage title="Export container {container.name}">
    {#snippet icon()}
      <i class="fas fa-download fa-2x" aria-hidden="true"></i>
    {/snippet}

    {#snippet content()}
      {#if container}
        <div class="space-y-2">
          <div>
            <label for="modalSelectTarget" class="block mb-2 text-sm font-medium text-[var(--pd-content-card-header-text)]"
              >Export to:</label>
            <div class="flex w-full">
              <Input
                class="grow mr-2"
                name={container.id}
                readonly
                value={outputTarget}
                id="input-export-container-name"
                aria-invalid={invalidFolder} />
              <Button
                on:click={selectFolderPath}
                title="Open dialog to select the output file"
                aria-label="Select output file">Browse...</Button>
            </div>
            <ButtonRow class="mt-5">
              <Button type="link" on:click={(): void => router.goto($lastPage.path)}>Cancel</Button>
              <Button
                on:click={exportContainer}
                icon={faDownload}
                inProgress={inProgress}
                disabled={invalidFields}
                aria-label="Export container">
                Export Container
              </Button>
            </ButtonRow>
            <div aria-label="createError">
              {#if exportedError}
                <ErrorMessage class="py-2 text-sm" error={exportedError} />
              {/if}
            </div>
          </div>
        </div>
      {/if}
    {/snippet}
  </EngineFormPage>
{/if}
