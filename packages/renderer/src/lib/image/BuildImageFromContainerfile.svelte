<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { get } from 'svelte/store';
import { onDestroy, onMount } from 'svelte';
/* eslint-enable import/no-duplicates */
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

import { providerInfos } from '../../stores/providers';
import FormPage from '../ui/FormPage.svelte';
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
import Button from '../ui/Button.svelte';
import { faCube } from '@fortawesome/free-solid-svg-icons';
import BuildImageFromContainerfileCards from './BuildImageFromContainerfileCards.svelte';
import Input from '/@/lib/ui/Input.svelte';

let buildFinished = false;
let containerImageName = 'my-custom-image';
let containerFilePath: string;
let containerBuildContextDirectory: string;
let containerBuildPlatform: string;

let buildImageInfo: BuildImageInfo | undefined = undefined;
let cancellableTokenId: number | undefined = undefined;
let providers: ProviderInfo[] = [];
let providerConnections: ProviderContainerConnectionInfo[] = [];
let selectedProvider: ProviderContainerConnectionInfo | undefined = undefined;
let selectedProviderConnection: ProviderContainerConnectionInfo | undefined = undefined;
let logsTerminal: Terminal;

$: hasInvalidFields = !containerFilePath || !containerBuildContextDirectory;

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

  if (containerFilePath && selectedProvider) {
    // extract the relative path from the containerFilePath and containerBuildContextDirectory
    const relativeContainerfilePath = containerFilePath.substring(containerBuildContextDirectory.length + 1);

    buildImageInfo = startBuild(containerImageName, getTerminalCallback());
    // store the key
    buildImagesInfo.set(buildImageInfo);
    try {
      cancellableTokenId = await window.getCancellableTokenSource();
      await window.buildImage(
        containerBuildContextDirectory,
        relativeContainerfilePath,
        containerImageName,
        containerBuildPlatform,
        selectedProvider,
        buildImageInfo.buildImageKey,
        eventCollect,
        cancellableTokenId,
      );
    } catch (error) {
      logsTerminal.write('Error:' + error + '\r');
    } finally {
      cancellableTokenId = undefined;
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
  const result = await window.openDialog({ title: 'Select Containerfile to build' });
  if (result?.[0]) {
    containerFilePath = result[0];
    if (!containerBuildContextDirectory) {
      // select the parent directory of the file as default
      // eslint-disable-next-line no-useless-escape
      containerBuildContextDirectory = containerFilePath.replace(/\\/g, '/').replace(/\/[^\/]*$/, '');
    }
  }
}

async function getContainerBuildContextDirectory() {
  const result = await window.openDialog({ title: 'Select Root Context', selectors: ['openDirectory'] });

  if (result?.[0]) {
    containerBuildContextDirectory = result[0];
  }
}

async function abortBuild() {
  if (cancellableTokenId) {
    await window.cancelToken(cancellableTokenId);
    cancellableTokenId = undefined;
  }
}
</script>

<FormPage title="Build Image from Containerfile" inProgress="{buildImageInfo?.buildRunning}">
  <svelte:fragment slot="icon">
    <i class="fas fa-cube fa-2x" aria-hidden="true"></i>
  </svelte:fragment>
  <div slot="content" class="p-5 min-w-full h-full">
    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else}
      <div class="bg-charcoal-900 pt-5 space-y-6 px-8 sm:pb-6 xl:pb-8 rounded-lg">
        <div hidden="{buildImageInfo?.buildRunning}">
          <label for="containerFilePath" class="block mb-2 text-sm font-bold text-gray-400">Containerfile Path</label>
          <div class="flex flex-row space-x-3">
            <Input
              name="containerFilePath"
              id="containerFilePath"
              bind:value="{containerFilePath}"
              placeholder="Containerfile to build"
              class="w-full"
              required />
            <Button on:click="{() => getContainerfileLocation()}">Browse...</Button>
          </div>
        </div>

        <div hidden="{buildImageInfo?.buildRunning}">
          <label for="containerBuildContextDirectory" class="block mb-2 text-sm font-bold text-gray-400"
            >Build Context Directory</label>
          <div class="flex flex-row space-x-3">
            <Input
              name="containerBuildContextDirectory"
              id="containerBuildContextDirectory"
              bind:value="{containerBuildContextDirectory}"
              placeholder="Folder to build in"
              class="w-full"
              required />
            <Button on:click="{() => getContainerBuildContextDirectory()}">Browse...</Button>
          </div>
        </div>

        <div hidden="{buildImageInfo?.buildRunning}">
          <label for="containerImageName" class="block mb-2 text-sm font-bold text-gray-400">Image Name</label>
          <Input
            bind:value="{containerImageName}"
            name="containerImageName"
            id="containerImageName"
            placeholder="image name (e.g. quay.io/namespace/my-custom-image)"
            class="w-full"
            required />
          {#if providerConnections.length > 1}
            <label for="providerChoice" class="py-6 block mb-2 text-sm font-bold text-gray-400"
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

        <div hidden="{buildImageInfo?.buildRunning}">
          <label for="containerBuildPlatform" class="block mb-2 text-sm font-bold text-gray-400">Platform</label>
          <BuildImageFromContainerfileCards bind:platforms="{containerBuildPlatform}" />
        </div>

        <div class="w-full flex flex-row space-x-4">
          {#if !buildImageInfo?.buildRunning}
            <Button
              on:click="{() => buildContainerImage()}"
              disabled="{hasInvalidFields}"
              class="w-full"
              icon="{faCube}">
              Build
            </Button>
          {/if}

          {#if buildFinished}
            <Button on:click="{() => cleanupBuild()}" class="w-full">Done</Button>
          {/if}
        </div>

        <TerminalWindow bind:terminal="{logsTerminal}" />
        <div class="w-full">
          {#if buildImageInfo?.buildRunning}
            <Button on:click="{() => abortBuild()}" class="w-full">Cancel</Button>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</FormPage>
