<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import type { KubernetesProviderConnection } from '@podman-desktop/api';
import { providerInfos } from '../../stores/providers';
import { onMount } from 'svelte';
import type { ProviderInfo, ProviderKubernetesConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
import Logger from './Logger.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let apiUrlBase64: string = '';

let scope: KubernetesProviderConnection;
let providers: ProviderInfo[] = [];
onMount(() => {
  lifecycleError = '';
  providerInfos.subscribe(value => {
    providers = value;
  });
});

$: apiURL = Buffer.from(apiUrlBase64, 'base64').toString();

let providerInfo: ProviderInfo;
$: providerInfo = providers.find(provider => provider.internalId === providerInternalId);

$: connectionName = providers
  .filter(provider => provider.internalId === providerInternalId)
  .map(provider => {
    const matchingConnection = provider.kubernetesConnections?.filter(
      connection => connection.endpoint.apiURL === apiURL,
    );

    if (matchingConnection) {
      return matchingConnection.length === 1 ? matchingConnection[0].name : 'N/A';
    } else {
      return '';
    }
  })
  .flat();

// get only ContainerConnection scope fields
let configurationKeys: IConfigurationPropertyRecordedSchema[];
$: configurationKeys = properties
  .filter(property => property.scope === 'KubernetesConnection')
  .sort((a, b) => a.id.localeCompare(b.id));

// key + value for the properties declared for the ContainerConnection scope and has a value
let connectionSettings = [];
$: Promise.all(
  configurationKeys.map(async configurationKey => {
    return {
      ...configurationKey,
      value: await window.getConfigurationValue(configurationKey.id, scope),
    };
  }),
).then(values => (connectionSettings = values.filter(configurationKey => configurationKey.value !== undefined)));
$: scope = {
  endpoint: {
    apiURL,
  },
} as KubernetesProviderConnection;

let kubernetesConnectionInfo: ProviderKubernetesConnectionInfo = undefined;
$: kubernetesConnectionInfo = providerInfo?.kubernetesConnections?.find(
  connection => connection.endpoint.apiURL === apiURL,
);

function createNewConnection(providerId: string) {
  router.goto(`/preferences/provider/${providerId}`);
}

let lifecycleError = '';
router.subscribe(async route => {
  lifecycleError = '';
});
async function startConnection() {
  lifecycleError = undefined;
  try {
    // await window.startProviderConnectionLifecycle(providerInfo.internalId, kubernetesConnectionInfo);
  } catch (err) {
    lifecycleError = err;
  }
}

async function stopConnection() {
  lifecycleError = undefined;
  //  await window.stopProviderConnectionLifecycle(providerInfo.internalId, kubernetesConnectionInfo);
}

async function deleteConnection() {
  lifecycleError = undefined;
  // await window.deleteProviderConnectionLifecycle(providerInfo.internalId, kubernetesConnectionInfo);
  router.goto('/preferences/providers');
}

let showModal: ProviderInfo = undefined;

let logsTerminal;

async function stopReceivingLogs(provider: ProviderInfo): Promise<void> {
  // await window.stopReceiveLogs(provider.internalId, kubernetesConnectionInfo);
}
</script>

<div class="flex flex-1 flex-col bg-zinc-800 px-2">
  <div class="flex flex-row align-middle my-4">
    <div class="capitalize text-xl">{connectionName}</div>
    {#if providerInfo?.containerProviderConnectionCreation}
      <div class="flex-1 ml-10">
        <button
          on:click="{() => createNewConnection(providerInfo.internalId)}"
          class="pf-c-button pf-m-secondary"
          type="button">
          <span class="pf-c-button__icon pf-m-start">
            <i class="fas fa-plus-circle" aria-hidden="true"></i>
          </span>
          Create New
        </button>
      </div>
    {/if}
  </div>
  <p class="capitalize text-sm">provider: {providerInfo?.name}</p>

  <!-- Display lifecycle -->
  {#if kubernetesConnectionInfo?.lifecycleMethods && kubernetesConnectionInfo.lifecycleMethods.length > 0}
    <div class="py-2 flex flex:row">
      <!-- start is enabled only in stopped mode-->
      {#if kubernetesConnectionInfo.lifecycleMethods.includes('start')}
        <div class="px-2 text-sm italic text-gray-400">
          <button
            disabled="{kubernetesConnectionInfo.status !== 'stopped'}"
            on:click="{() => startConnection()}"
            class="pf-c-button pf-m-primary"
            type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-play" aria-hidden="true"></i>
            </span>
            Start
          </button>
        </div>
      {/if}

      <!-- stop is enabled only in started mode-->
      {#if kubernetesConnectionInfo.lifecycleMethods.includes('stop')}
        <div class="px-2 text-sm italic text-gray-400">
          <button
            disabled="{kubernetesConnectionInfo.status !== 'started'}"
            on:click="{() => stopConnection()}"
            class="pf-c-button pf-m-primary"
            type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-stop" aria-hidden="true"></i>
            </span>
            Stop
          </button>
        </div>
      {/if}

      <!-- delete is disabled if it is running-->
      {#if kubernetesConnectionInfo.lifecycleMethods.includes('delete')}
        <div class="px-2 text-sm italic text-gray-400">
          <button
            disabled="{kubernetesConnectionInfo.status !== 'stopped'}"
            on:click="{() => deleteConnection()}"
            class="pf-c-button pf-m-secondary"
            type="button">
            <span class="pf-c-button__icon pf-m-start">
              <i class="fas fa-trash" aria-hidden="true"></i>
            </span>
            Delete
          </button>
        </div>
      {/if}
      <div class="px-2 text-sm italic text-gray-400">
        <button
          type="button"
          disabled="{kubernetesConnectionInfo.status !== 'started'}"
          on:click="{() => {
            showModal = providerInfo;
          }}"
          class="pf-c-button pf-m-secondary">
          <span class="pf-c-button__icon pf-m-start">
            <i class="fas fa-history" aria-hidden="true"></i>
          </span>
          Show Logs
        </button>
      </div>
    </div>

    {#if lifecycleError}
      <ErrorMessage error="{lifecycleError}" />
    {/if}
  {/if}

  {#each connectionSettings as connectionSetting}
    <div class="pl-1 py-2">
      <div class="text-sm italic text-gray-400">{connectionSetting.description}</div>
      <div class="pl-3">{connectionSetting.value}</div>
    </div>
  {/each}

  {#if kubernetesConnectionInfo}
    <div class="pl-1 py-2">
      <div class="text-sm italic text-gray-400">Status</div>
      <div class="pl-3">{kubernetesConnectionInfo.status}</div>
    </div>
    <div class="pl-1 py-2">
      <div class="text-sm italic text-gray-400">Kubernetes endpoint API URL</div>
      <div class="pl-3">{kubernetesConnectionInfo.endpoint.apiURL}</div>
    </div>
  {/if}
</div>
{#if showModal}
  <Modal
    on:close="{() => {
      stopReceivingLogs(showModal);
      showModal = undefined;
    }}">
    <h2 slot="header">Logs</h2>
    <div id="log" style="height: 400px; width: 650px;">
      <div style="width:100%; height:100%;">
        <Logger bind:logsTerminal="{logsTerminal}" onInit="{() => {}}" />
      </div>
    </div>
  </Modal>
{/if}
