<script lang="ts">
import { onMount, tick } from 'svelte';
import { router } from 'tinro';
import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import type { PullEvent } from '../../../../main/src/plugin/api/pull-event';

import { providerInfos } from '../../stores/providers';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';
import NavPage from '../ui/NavPage.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import type { Terminal } from 'xterm';

let logsPull: Terminal;
let pullError = '';
let pullInProgress = false;
let pullFinished = false;
export let imageToPull: string = undefined;

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

let selectedProviderConnection: ProviderContainerConnectionInfo;

const lineNumberPerId = new Map<string, number>();
let lineIndex = 0;

function callback(event: PullEvent) {
  let lineIndexToWrite;
  if (event.status) {
    if (event.id) {
      const lineNumber = lineNumberPerId.get(event.id);
      if (lineNumber) {
        lineIndexToWrite = lineNumber;
      } else {
        lineIndex++;
        lineIndexToWrite = lineIndex;
        lineNumberPerId.set(event.id, lineIndex);
      }
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
    } else if (event.progressDetail && event.progressDetail.current && event.progressDetail.total) {
      logsPull.write(` ${Math.round((event.progressDetail.current / event.progressDetail.total) * 100)}%`);
    }
    // write end of line
    logsPull.write('\n\r');
  } else if (event.error) {
    logsPull.write(event.error.replaceAll('\n', '\n\r') + '\n\r');
  }
}

async function pullImage() {
  lineNumberPerId.clear();
  lineIndex = 0;
  await tick();
  logsPull?.reset();

  pullInProgress = true;
  try {
    await window.pullImage(selectedProviderConnection, imageToPull.trim(), callback);
    pullInProgress = false;
    pullFinished = true;
  } catch (error) {
    const errorMessage = error.message ? error.message : error;
    pullError = 'Could not connect to ' + selectedProviderConnection.name + ': ' + errorMessage;
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

let imageNameInvalid = undefined;
function validateImageName(event): void {
  imageToPull = event.target.value;
  if (imageToPull === undefined || imageToPull.trim() === '') {
    imageNameInvalid = 'Please enter a value';
  } else {
    imageNameInvalid = '';
  }
}
</script>

<NavPage title="Pull Image From a Registry" searchEnabled="{false}">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    <button on:click="{() => gotoManageRegistries()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-cog" aria-hidden="true"></i>
      </span>
      Manage registries
    </button>
  </div>

  <div slot="empty" class="p-5">
    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else}
      <div class="bg-charcoal-900 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg">
        <div class="w-full">
          <label for="imageName" class="block mb-2 text-sm font-bold text-gray-400">Image to Pull</label>
          <input
            id="imageName"
            class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
            type="text"
            name="serverUrl"
            disabled="{pullFinished || pullInProgress}"
            on:input="{event => validateImageName(event)}"
            bind:value="{imageToPull}"
            aria-invalid="{imageNameInvalid && imageNameInvalid !== ''}"
            placeholder="Image name"
            aria-label="imageName"
            required />
          {#if imageNameInvalid}
            <ErrorMessage error="{imageNameInvalid}" />
          {/if}

          {#if providerConnections.length > 1}
            <div class="pt-4">
              <div class="block mb-2 text-sm font-bold text-gray-400">
                <label for="providerChoice">Container Engine:</label>
                <select
                  id="providerChoice"
                  class="w-auto border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 bg-gray-900 border-gray-900 placeholder-gray-700 text-white"
                  name="providerChoice"
                  bind:value="{selectedProviderConnection}">
                  {#each providerConnections as providerConnection}
                    <option value="{providerConnection}">{providerConnection.name}</option>
                  {/each}
                </select>
              </div>
            </div>
          {/if}
          {#if providerConnections.length === 1}
            <input type="hidden" name="providerChoice" readonly bind:value="{selectedProviderConnection}" />
          {/if}
        </div>
        <footer>
          <div class="w-full flex flex-col justify-end">
            {#if !pullFinished}
              <button
                class="pf-c-button pf-m-primary"
                disabled="{!imageToPull || imageToPull.trim() === '' || pullInProgress}"
                type="submit"
                on:click="{() => pullImage()}">
                {#if pullInProgress === true}
                  <i class="pf-c-button__progress">
                    <span class="pf-c-spinner pf-m-md" role="progressbar">
                      <span class="pf-c-spinner__clipper"></span>
                      <span class="pf-c-spinner__lead-ball"></span>
                      <span class="pf-c-spinner__tail-ball"></span>
                    </span>
                  </i>
                {/if}
                Pull image</button>
            {:else}
              <button class="pf-c-button pf-m-primary" type="button" on:click="{() => pullImageFinished()}">
                Done</button>
            {/if}
            {#if pullError}
              <ErrorMessage error="{pullError}" />
            {/if}
          </div>
        </footer>
        <TerminalWindow bind:terminal="{logsPull}" />
      </div>
    {/if}
  </div>
</NavPage>
