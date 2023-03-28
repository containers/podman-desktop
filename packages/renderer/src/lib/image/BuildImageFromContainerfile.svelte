<script lang="ts">
import { onMount, tick, onDestroy } from 'svelte';
import { get } from 'svelte/store';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';

import { providerInfos } from '../../stores/providers';
import NavPage from '../ui/NavPage.svelte';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';
import {
  BuildImageCallback,
  clearBuildTask,
  disconnectUI,
  eventCollect,
  reconnectUI,
  startBuild,
} from './build-image-task';
import { buildImagesInfo } from '/@/stores/build-images';

let buildStarted = false;
let buildFinished = false;
let containerImageName = 'my-custom-image';
let containerFilePath = undefined;
let containerBuildContextDirectory = undefined;
let hasInvalidFields = true;

let logsXtermDiv: HTMLDivElement;
let logsTerminal: Terminal;

let buildImageKey: symbol | undefined = undefined;
let providers: ProviderInfo[] = [];
let providerConnections: ProviderContainerConnectionInfo[] = [];
let selectedProvider: ProviderContainerConnectionInfo = undefined;
let selectedProviderConnection: ProviderContainerConnectionInfo = undefined;

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
  buildStarted = true;
  buildFinished = false;

  if (containerFilePath) {
    // extract the relative path from the containerFilePath and containerBuildContextDirectory
    const relativeContainerfilePath = containerFilePath.substring(containerBuildContextDirectory.length + 1);

    buildImageKey = startBuild(containerImageName, getTerminalCallback());
    // store the key
    buildImagesInfo.set({ buildImageKey: buildImageKey });
    try {
      await window.buildImage(
        containerBuildContextDirectory,
        relativeContainerfilePath,
        containerImageName,
        selectedProvider,
        buildImageKey,
        eventCollect,
      );
    } catch (error) {
      logsTerminal.write('Error:' + error + '\r');
    }
  }
}

function cleanupBuild(): void {
  // clear
  if (buildImageKey) {
    clearBuildTask(buildImageKey);
    buildImageKey = undefined;
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

  await initTerminal();

  // check if we have an existing buil info
  const value = get(buildImagesInfo);
  if (value) {
    buildImageKey = value.buildImageKey;
    buildStarted = true;
    reconnectUI(buildImageKey, getTerminalCallback());
  }
});

onDestroy(() => {
  if (buildImageKey) {
    disconnectUI(buildImageKey);
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

async function initTerminal() {
  await tick();
  // missing element, return
  if (!logsXtermDiv) {
    return;
  }
  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );

  logsTerminal = new Terminal({ fontSize, lineHeight, disableStdin: true });
  const fitAddon = new FitAddon();
  logsTerminal.loadAddon(fitAddon);

  logsTerminal.open(logsXtermDiv);
  // disable cursor
  logsTerminal.write('\x1b[?25l');

  // call fit addon each time we resize the window
  window.addEventListener('resize', () => {
    fitAddon.fit();
  });
  fitAddon.fit();
}
</script>

{#if providerConnections.length === 0}
  <NoContainerEngineEmptyScreen />
{/if}

{#if providerConnections.length > 0}
  <NavPage title="Build Image from Containerfile" searchEnabled="{false}">
    <div slot="empty" class="p-5 bg-zinc-700">
      <div class="bg-zinc-800 pt-5 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
        <div class="text-xl">Build</div>
        <div hidden="{buildStarted}">
          <label for="containerFilePath" class="block mb-2 text-sm font-medium text-gray-300">Containerfile path</label>
          <input
            on:click="{() => getContainerfileLocation()}"
            name="containerFilePath"
            id="containerFilePath"
            bind:value="{containerFilePath}"
            readonly
            placeholder="Select Containerfile to build..."
            class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
            required />
        </div>

        <div hidden="{!containerFilePath || buildStarted}">
          <label for="containerBuildContextDirectory" class="block mb-2 text-sm font-medium text-gray-300"
            >Build context directory</label>
          <input
            on:click="{() => getContainerBuildContextDirectory()}"
            name="containerBuildContextDirectory"
            id="containerBuildContextDirectory"
            bind:value="{containerBuildContextDirectory}"
            readonly
            class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
            required />
        </div>

        <div hidden="{buildStarted}">
          <label for="containerImageName" class="block mb-2 text-sm font-medium text-gray-300">Image Name</label>
          <input
            type="text"
            bind:value="{containerImageName}"
            name="containerImageName"
            id="containerImageName"
            placeholder="Enter image name"
            class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
            required />
          {#if providerConnections.length > 1}
            <label
              for="providerConnectionName"
              class="py-6 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
              >Container Engine
              <select
                class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
                name="providerChoice"
                bind:value="{selectedProvider}">
                {#each providerConnections as providerConnection}
                  <option value="{providerConnection}">{providerConnection.name}</option>
                {/each}
              </select>
            </label>
          {/if}
          {#if providerConnections.length == 1 && selectedProviderConnection}
            <input type="hidden" name="providerChoice" readonly bind:value="{selectedProviderConnection.name}" />
          {/if}
        </div>

        {#if !buildStarted}
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

        <div bind:this="{logsXtermDiv}"></div>
      </div>
    </div>
  </NavPage>
{/if}
