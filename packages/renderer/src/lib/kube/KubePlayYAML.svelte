<script lang="ts">
import { onMount, tick, onDestroy } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
let providerUnsubscribe: Unsubscriber;

import { providerInfos } from '../../stores/providers';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import NoContainerEngineEmptyScreen from '../image/NoContainerEngineEmptyScreen.svelte';
import NavPage from '../ui/NavPage.svelte';
import KubePlayIcon from '../kube/KubePlayIcon.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

let runStarted = false;
let runFinished = false;
let runError = '';
let kubernetesYamlFilePath = undefined;
let hasInvalidFields = true;

let playKubeResultRaw;

let providers: ProviderInfo[] = [];
$: providerConnections = providers
  .map(provider => provider.containerConnections)
  .flat()
  // keep only podman providers as it is not supported by docker
  .filter(providerContainerConnection => providerContainerConnection.type === 'podman')
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');
$: selectedProviderConnection = providerConnections.length > 0 ? providerConnections[0] : undefined;
let selectedProvider: ProviderContainerConnectionInfo = undefined;
$: selectedProvider = !selectedProvider && selectedProviderConnection ? selectedProviderConnection : selectedProvider;

function removeEmptyOrNull(obj: any) {
  Object.keys(obj).forEach(
    k =>
      (obj[k] && typeof obj[k] === 'object' && removeEmptyOrNull(obj[k])) ||
      (!obj[k] && obj[k] !== undefined && delete obj[k]),
  );
  return obj;
}

async function playKubeFile(): Promise<void> {
  runStarted = true;
  runFinished = false;
  runError = '';
  if (kubernetesYamlFilePath) {
    try {
      const result = await window.playKube(kubernetesYamlFilePath, selectedProvider);
      // remove the null values from the result
      playKubeResultRaw = JSON.stringify(removeEmptyOrNull(result), null, 2);
      runFinished = true;
    } catch (error) {
      runError = error;
      console.error('error playing kube file', error);
    }
  }
  runStarted = false;
}

onMount(() => {
  providerUnsubscribe = providerInfos.subscribe(value => {
    providers = value;
  });
});

onDestroy(() => {
  if (providerUnsubscribe) {
    providerUnsubscribe();
  }
});

async function getKubernetesfileLocation() {
  const result = await window.openFileDialog('Select a .yaml file to play', {
    name: 'YAML files',
    extensions: ['yaml', 'yml'],
  });
  if (!result.canceled && result.filePaths.length === 1) {
    kubernetesYamlFilePath = result.filePaths[0];
    hasInvalidFields = false;
  }
}
</script>

{#if providerConnections.length === 0}
  <NoContainerEngineEmptyScreen />
{/if}

{#if providerConnections.length > 0}
  <NavPage title="Play Pods or Containers from a Kubernetes YAML File" searchEnabled="{false}">
    <div slot="empty" class="bg-zinc-700 p-5 h-full">
      <div class="bg-zinc-800 px-6 py-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
        <div class="text-xl font-medium">Select file:</div>
        <div hidden="{runStarted}">
          <label for="containerFilePath" class="block mb-2 text-sm font-medium text-gray-300"
            >Kubernetes YAML file</label>
          <input
            on:click="{() => getKubernetesfileLocation()}"
            name="containerFilePath"
            id="containerFilePath"
            bind:value="{kubernetesYamlFilePath}"
            readonly
            placeholder="Select a .yaml file to play"
            class="w-full p-2 outline-none text-sm bg-zinc-900 rounded-sm text-gray-400 placeholder-gray-400"
            required />
        </div>

        <div hidden="{runStarted}">
          {#if providerConnections.length > 1}
            <label
              for="providerConnectionName"
              class="py-6 block mb-2 text-sm font-medium text-gray-300 dark:text-gray-300"
              >Container Engine
              <select
                class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-gray-600 border-gray-500 placeholder-gray-400 text-white"
                name="providerChoice"
                bind:value="{selectedProvider}">
                {#each providerConnections as providerConnection}
                  <option value="{providerConnection}">{providerConnection.name}</option>
                {/each}
              </select>
            </label>
          {/if}
          {#if providerConnections.length == 1}
            <input type="hidden" name="providerChoice" readonly bind:value="{selectedProviderConnection.name}" />
          {/if}
        </div>

        {#if !runFinished}
          <button
            on:click="{() => playKubeFile()}"
            disabled="{hasInvalidFields || runStarted}"
            class="w-full pf-c-button pf-m-primary"
            type="button">
            <div class="flex flex-row align-text-top justify-center items-center">
              {#if runStarted}
                <div class="mr-4">
                  <i class="pf-c-button__progress">
                    <span class="pf-c-spinner pf-m-md" role="progressbar">
                      <span class="pf-c-spinner__clipper"></span>
                      <span class="pf-c-spinner__lead-ball"></span>
                      <span class="pf-c-spinner__tail-ball"></span>
                    </span>
                  </i>
                </div>
              {:else}
                <KubePlayIcon />
              {/if}

              Play
            </div>
          </button>
        {/if}
        {#if runStarted}
          <div class="text-gray-400 text-sm">
            Please wait during the Play Kube and do not change screen. This process may take a few minutes to
            complete...
          </div>
        {/if}
        <div class="text-sm"><ErrorMessage error="{runError}" /></div>
        {#if runFinished}
          <!-- On click, go BACK to the previous page (if clicked on Pods page, go back to pods, same for Containers)-->
          <button on:click="{() => history.back()}" class="w-full pf-c-button pf-m-primary">Done</button>
        {/if}
      </div>
      {#if playKubeResultRaw}
        <div class=" h-full w-full px-6 pb-4 space-y-6 lg:px-8 sm:pb-6 xl:pb-8">
          <MonacoEditor content="{playKubeResultRaw}" language="json" />
        </div>
      {/if}
    </div>
  </NavPage>
{/if}
