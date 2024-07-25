<script lang="ts">
import { faArrowCircleDown, faCog } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage } from '@podman-desktop/ui-svelte';
import { onMount, tick } from 'svelte';
import { router } from 'tinro';
import type { Terminal } from 'xterm';

import type { ProviderContainerConnectionInfo } from '/@api/provider-info';
import type { PullEvent } from '/@api/pull-event';

import { providerInfos } from '../../stores/providers';
import EngineFormPage from '../ui/EngineFormPage.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import RecommendedRegistry from './RecommendedRegistry.svelte';

let logsPull: Terminal;
let pullError = '';
let pullInProgress = false;
let pullFinished = false;

export let imageToPull: string | undefined = undefined;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

let selectedProviderConnection: ProviderContainerConnectionInfo | undefined;

const lineNumberPerId = new Map<string, number>();
let lineIndex = 0;

function callback(event: PullEvent) {
  let lineIndexToWrite;
  if (event.status && event.id) {
    const lineNumber = lineNumberPerId.get(event.id);
    if (lineNumber) {
      lineIndexToWrite = lineNumber;
    } else {
      lineIndex++;
      lineIndexToWrite = lineIndex;
      lineNumberPerId.set(event.id, lineIndex);
    }
  }
  // no index, append
  if (!lineIndexToWrite) {
    lineIndex++;
    lineIndexToWrite = lineIndex;
  }

  if (event.status) {
    // move cursor to the home
    logsPull.write(`\u001b[${lineIndexToWrite};0H`);
    // erase the line
    logsPull.write('\u001B[2K');
    // do we have id ?
    if (event.id) {
      logsPull.write(`${event.id}: `);
    }
    logsPull.write(event.status);
    // do we have progress ?
    if (event.progress && event.progress !== '') {
      logsPull.write(event.progress);
    } else if (event?.progressDetail?.current && event?.progressDetail?.total) {
      logsPull.write(` ${Math.round((event.progressDetail.current / event.progressDetail.total) * 100)}%`);
    }
    // write end of line
    logsPull.write('\n\r');
  } else if (event.error) {
    logsPull.write(event.error.replaceAll('\n', '\n\r') + '\n\r');
  }
}

async function pullImage() {
  if (!selectedProviderConnection) {
    pullError = 'No current provider connection';
    return;
  }

  if (!imageToPull) {
    pullError = 'No image to pull';
    return;
  }

  lineNumberPerId.clear();
  lineIndex = 0;
  await tick();
  logsPull?.reset();

  // reset error
  pullError = '';

  pullInProgress = true;
  try {
    await window.pullImage(selectedProviderConnection, imageToPull.trim(), callback);
    pullInProgress = false;
    pullFinished = true;
  } catch (error: any) {
    const errorMessage = error.message ? error.message : error;
    pullError = `Error while pulling image from ${selectedProviderConnection.name}: ${errorMessage}`;
    pullInProgress = false;
  }
}

async function pullImageFinished() {
  router.goto('/images');
}

async function gotoManageRegistries() {
  router.goto('/preferences/registries');
}

onMount(() => {
  if (!selectedProviderConnection) {
    selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  }
});

let imageNameInvalid: string | undefined = undefined;
let imageNameIsInvalid = imageToPull === undefined || imageToPull.trim() === '';
function validateImageName(event: any): void {
  imageToPull = event.target.value;
  if (imageToPull === undefined || imageToPull.trim() === '') {
    imageNameIsInvalid = true;
    imageNameInvalid = 'Please enter a value';
  } else {
    imageNameIsInvalid = false;
    imageNameInvalid = undefined;
  }
}

function requestFocus(element: HTMLInputElement) {
  element.focus();
}
</script>

<EngineFormPage
  title="Pull image from a registry"
  inProgress={pullInProgress}
  showEmptyScreen={providerConnections.length === 0}>
  <svelte:fragment slot="icon">
    <i class="fas fa-arrow-circle-down fa-2x" aria-hidden="true"></i>
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <Button on:click={() => gotoManageRegistries()} icon={faCog}>Manage registries</Button>
  </svelte:fragment>

  <div slot="content" class="space-y-6">
    <div class="w-full">
      <label for="imageName" class="block mb-2 font-bold text-[var(--pd-content-card-header-text)]"
        >Image to Pull</label>
      <input
        id="imageName"
        class="w-full p-2 outline-none bg-[var(--pd-select-bg)] border-[1px] border-transparent border-b-[var(--pd-input-field-stroke)] rounded-sm text-[var(--pd-content-card-text)] placeholder:text-[color:var(--pd-input-field-placeholder-text)]"
        type="text"
        name="imageName"
        disabled={pullFinished || pullInProgress}
        on:input={event => validateImageName(event)}
        on:keypress={event => {
          if (event.key === 'Enter') {
            pullImage();
          }
        }}
        bind:value={imageToPull}
        aria-invalid={imageNameInvalid !== ''}
        placeholder="Image name"
        aria-label="imageName"
        required
        use:requestFocus />
      {#if imageNameInvalid}
        <ErrorMessage error={imageNameInvalid} />
      {/if}

      {#if providerConnections.length > 1}
        <div class="pt-4">
          <label for="providerChoice" class="block mb-2 font-bold text-[var(--pd-content-card-header-text)]"
            >Container Engine:</label>
          <select
            id="providerChoice"
            class="w-auto border text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2.5 bg-[var(--pd-select-bg)] rounded-sm text-[var(--pd-content-card-text)]"
            name="providerChoice"
            bind:value={selectedProviderConnection}>
            {#each providerConnections as providerConnection}
              <option value={providerConnection}>{providerConnection.name}</option>
            {/each}
          </select>
        </div>
      {/if}
      {#if providerConnections.length === 1}
        <input type="hidden" name="providerChoice" readonly bind:value={selectedProviderConnection} />
      {/if}
    </div>
    <footer>
      <div class="w-full flex flex-col justify-end">
        {#if !pullFinished}
          <Button
            icon={faArrowCircleDown}
            bind:disabled={imageNameIsInvalid}
            on:click={() => pullImage()}
            bind:inProgress={pullInProgress}>
            Pull image
          </Button>
        {:else}
          <Button on:click={() => pullImageFinished()}>Done</Button>
        {/if}
        {#if pullError}
          <ErrorMessage error={pullError} />
        {/if}
        <RecommendedRegistry bind:imageError={pullError} imageName={imageToPull} />
      </div>
    </footer>
    <TerminalWindow bind:terminal={logsPull} />
  </div>
</EngineFormPage>
