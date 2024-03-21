<script lang="ts">
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';

import { exportContainerInfo } from '/@/stores/export-container-store';
import { createTask } from '/@/stores/tasks';

import Button from '../ui/Button.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import FormPage from '../ui/FormPage.svelte';
import { Uri } from '../uri/Uri';
import type { ContainerInfoUI } from './ContainerInfoUI';

let container: ContainerInfoUI;

let invalidName = false;
let invalidFolder = true;
let outputTarget = '';
let outputUri: Uri;
let exportedError = '';
let inProgress = false;
$: invalidFields = invalidName || invalidFolder;

onMount(async () => {
  // grab current value
  container = $exportContainerInfo;
  if (!container) {
    // go back to containers list
    router.goto('/containers/');
  }
});

async function selectFolderPath() {
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

async function exportContainer() {
  exportedError = '';
  inProgress = true;
  const task = createTask(`Export container ${container.name}`);
  task.action = {
    name: 'Open folder >',
    execute: () => {
      window.openDialog({
        defaultUri: outputUri,
      });
    },
  };
  try {
    await window.exportContainer(container.engineId, {
      id: container.id,
      outputTarget: outputUri.fsPath,
    });
    task.status = 'success';
    // go back to containers list
    router.goto('/containers/');
  } catch (error) {
    task.status = 'failure';
    task.error = String(error);
    exportedError = String(error);
  } finally {
    task.state = 'completed';
    inProgress = false;
  }
}
</script>

{#if container}
  <FormPage title="Export container {container.name}">
    <svelte:fragment slot="icon">
      <i class="fas fa-download fa-2x" aria-hidden="true"></i>
    </svelte:fragment>

    <div slot="content" class="flex flex-col min-w-full h-fit p-5">
      <div class="bg-charcoal-600 px-6 py-4 space-y-2 lg:px-8 sm:pb-6 xl:pb-8">
        <div>
          <label for="modalSelectTarget" class="block mb-2 text-sm font-medium text-gray-400">Export to:</label>
          <div class="flex w-full">
            <Input
              class="grow mr-2"
              name="{container.id}"
              readonly
              value="{outputTarget}"
              id="input-export-container-name"
              aria-invalid="{invalidFolder}" />
            <Button
              on:click="{() => selectFolderPath()}"
              title="Open dialog to select the output file"
              aria-label="Select output file">Browse ...</Button>
          </div>
          <Button
            on:click="{() => exportContainer()}"
            class="w-full mt-5"
            icon="{faDownload}"
            inProgress="{inProgress}"
            bind:disabled="{invalidFields}"
            aria-label="Export container">
            Export Container
          </Button>
          <div aria-label="createError">
            {#if exportedError}
              <ErrorMessage class="py-2 text-sm" error="{exportedError}" />
            {/if}
          </div>
        </div>
      </div>
    </div></FormPage>
{/if}
