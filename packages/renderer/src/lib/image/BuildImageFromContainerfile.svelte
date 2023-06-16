<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import { get } from 'svelte/store';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

import { providerInfos } from '../../stores/providers';
import NavPage from '../ui/NavPage.svelte';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';
import {
  type BuildImageCallback,
  clearBuildTask,
  disconnectUI,
  eventCollect,
  reconnectUI,
  startBuild,
} from './build-image-task';
import { type BuildImageInfo, buildImagesInfo } from '/@/stores/build-images';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import type { Terminal } from 'xterm';

let buildFinished = false;
let containerImageName = 'my-custom-image';
let containerFilePath = undefined;
let containerBuildContextDirectory = undefined;
let hasInvalidFields = true;

let buildImageInfo: BuildImageInfo | undefined = undefined;
let providers: ProviderInfo[] = [];
let providerConnections: ProviderContainerConnectionInfo[] = [];
let selectedProvider: ProviderContainerConnectionInfo = undefined;
let selectedProviderConnection: ProviderContainerConnectionInfo = undefined;
let logsTerminal: Terminal;

function getTerminalCallback(): BuildImageCallback {
  return {
    onStream: function (data: string): void {
      logsTerminal.write(`${data}\r`);
    },
    onError: function (error: string): void {
      logsTerminal.write(`Error:${error}\r`);
    },
    onEnd: function (): void {
      buildFinished = true;
      window.dispatchEvent(new CustomEvent('image-build', { detail: { name: containerImageName } }));
    },
  };
}

async function buildContainerImage(): Promise<void> {
  buildFinished = false;

  if (containerFilePath) {
    // extract the relative path from the containerFilePath and containerBuildContextDirectory
    const relativeContainerfilePath = containerFilePath.substring(containerBuildContextDirectory.length + 1);

    buildImageInfo = startBuild(containerImageName, getTerminalCallback());
    // store the key
    buildImagesInfo.set(buildImageInfo);
    try {
      await window.buildImage(
        containerBuildContextDirectory,
        relativeContainerfilePath,
        containerImageName,
        selectedProvider,
        buildImageInfo.buildImageKey,
        eventCollect,
      );
    } catch (error) {
      logsTerminal.write('Error:' + error + '\r');
    } finally {
      buildImageInfo.buildRunning = false;
      buildFinished = true;
    }
  }
}

function cleanupBuild(): void {
  // clear
  if (buildImageInfo) {
    clearBuildTask(buildImageInfo);
    buildImageInfo = undefined;
  }

  // redirect to the imlage list
  window.location.href = '#/images';
}

onMount(async () => {
  providers = get(providerInfos);
  providerConnections = providers
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started');

  const selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
  selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;

  // check if we have an existing build info
  buildImageInfo = get(buildImagesInfo);
  if (buildImageInfo) {
    reconnectUI(buildImageInfo.buildImageKey, getTerminalCallback());
  }
});

onDestroy(() => {
  if (buildImageInfo) {
    disconnectUI(buildImageInfo.buildImageKey);
  }
});

async function getContainerfileLocation() {
  const result = await window.openFileDialog('Select Containerfile to build');
  if (!result.canceled && result.filePaths.length === 1) {
    containerFilePath = result.filePaths[0];
    hasInvalidFields = false;
    if (!containerBuildContextDirectory) {
      // select the parent directory of the file as default
      containerBuildContextDirectory = containerFilePath.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
    }
  }
}

async function getContainerBuildContextDirectory() {
  const result = await window.openFolderDialog('Select Root Context');

  if (!result.canceled && result.filePaths.length === 1) {
    containerBuildContextDirectory = result.filePaths[0];
  }
}
</script>

<NavPage title="Build Image from Containerfile" searchEnabled="{false}">
  <div slot="empty" class="p-5">
    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else}
      <div class="bg-charcoal-900 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg">
        <div hidden="{buildImageInfo?.buildRunning}">
          <label for="containerFilePath" class="block mb-2 text-sm font-bold text-gray-400">Containerfile path</label>
          <input
            on:click="{() => getContainerfileLocation()}"
            name="containerFilePath"
            id="containerFilePath"
            bind:value="{containerFilePath}"
            readonly
            placeholder="Select Containerfile to build..."
            class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
            required />
        </div>

        <div hidden="{!containerFilePath || buildImageInfo?.buildRunning}">
          <label for="containerBuildContextDirectory" class="block mb-2 text-sm font-bold text-gray-400"
            >Build context directory</label>
          <input
            on:click="{() => getContainerBuildContextDirectory()}"
            name="containerBuildContextDirectory"
            id="containerBuildContextDirectory"
            bind:value="{containerBuildContextDirectory}"
            readonly
            class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
            required />
        </div>

        <div hidden="{buildImageInfo?.buildRunning}">
          <label for="containerImageName" class="block mb-2 text-sm font-bold text-gray-400">Image Name</label>
          <input
            type="text"
            bind:value="{containerImageName}"
            name="containerImageName"
            id="containerImageName"
            placeholder="Enter image name (e.g. quay.io/namespace/my-custom-image)"
            class="w-full p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
            required />
          {#if providerConnections.length > 1}
            <label for="providerChoice" class="py-6 block mb-2 text-sm font-bold text-gray-400 dark:text-gray-400"
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
          {#if providerConnections.length === 1 && selectedProviderConnection}
            <input type="hidden" name="providerChoice" readonly bind:value="{selectedProviderConnection.name}" />
          {/if}
        </div>

        <div class="w-full flex flex-row space-x-4">
          {#if !buildImageInfo?.buildRunning}
            <button
              on:click="{() => buildContainerImage()}"
              disabled="{hasInvalidFields}"
              class="w-full pf-c-button pf-m-primary"
              type="button">
              <span class="pf-c-button__icon pf-m-start">
                <i class="fas fa-cube" aria-hidden="true"></i>
              </span>
              Build
            </button>
          {/if}

          {#if buildFinished}
            <button on:click="{() => cleanupBuild()}" class="w-full pf-c-button pf-m-primary">Done</button>
          {/if}
        </div>

        <TerminalWindow bind:terminal="{logsTerminal}" />
      </div>
    {/if}
  </div>
</NavPage>
