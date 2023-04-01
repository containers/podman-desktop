<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import type { KubernetesProviderConnection } from '@podman-desktop/api';
import { providerInfos } from '../../stores/providers';
import { onMount } from 'svelte';
import type { ProviderInfo, ProviderKubernetesConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
import TerminalWindow from '../ui/TerminalWindow.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Route from '../../Route.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import PreferencesKubernetesConnectionDetailsSummary from './PreferencesKubernetesConnectionDetailsSummary.svelte';
import type { Terminal } from 'xterm';
import Tab from '../ui/Tab.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let apiUrlBase64 = '';

let kubernetesConnectionInfo: ProviderKubernetesConnectionInfo;

let scope: KubernetesProviderConnection;
let providers: ProviderInfo[] = [];
onMount(() => {
  lifecycleError = '';
  providerInfos.subscribe(value => {
    providers = value;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);
    kubernetesConnectionInfo = providerInfo.kubernetesConnections?.find(
      connection => connection.endpoint.apiURL === apiURL,
    );
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

$: kubernetesConnectionInfo = providerInfo?.kubernetesConnections?.find(
  connection => connection.endpoint.apiURL === apiURL,
);

let lifecycleError = '';
router.subscribe(() => {
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

let logsTerminal: Terminal;

async function stopReceivingLogs(_provider: ProviderInfo): Promise<void> {
  // await window.stopReceiveLogs(provider.internalId, kubernetesConnectionInfo);
}
</script>

{#if kubernetesConnectionInfo}
<Route path="/*" breadcrumb="{connectionName} Settings" let:meta>
  <div class="flex flex-1 flex-col">
    <div class="bg-[#222222]">
      <div class="px-5">
        <div class="pt-3">
          <button
            aria-label="Close"
            class="'hover:text-gray-400 float-right text-lg"
            on:click="{() => router.goto('/preferences/resources')}">
            <Fa icon="{faXmark}" />
          </button>    
          <h1 class="capitalize text-xs text-gray-400">Resources > {providerInfo?.name} > Details</h1>
        </div>      
        <div class="flex flex-row justify-between">        
            <div class="flex flex-row my-3">
              <div>
              {#if providerInfo?.images && providerInfo?.images.icon}
                {#if typeof providerInfo.images.icon === 'string'}
                  <img src="{providerInfo.images.icon}" alt="{providerInfo.name}" class="max-h-10" />
                  <!-- TODO check theme used for image, now use dark by default -->
                {:else}
                  <img src="{providerInfo.images.icon.dark}" alt="{providerInfo.name}" class="max-h-10" />
                {/if}
              {/if}
              </div>
              <div class="flex flex-col ml-3">
                <div class="capitalize text-md pt-1">{providerInfo?.name}</div>
                <div class="flex flex-row mt-1"><ConnectionStatus status="{kubernetesConnectionInfo?.status}" /></div>
              </div>
            </div>        
            <div class="mx-10 pt-1">
            </div>
        </div>
    </div>
    <!-- Display lifecycle -->
    {#if kubernetesConnectionInfo?.lifecycleMethods && kubernetesConnectionInfo.lifecycleMethods.length > 0}
      <div class="py-2 flex flex:row">
        <!-- start is enabled only in stopped mode-->
        {#if kubernetesConnectionInfo.lifecycleMethods.includes('start')}
          <div class="px-2 text-sm italic text-gray-700">
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
          <div class="px-2 text-sm italic text-gray-700">
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
          <div class="px-2 text-sm italic text-gray-700">
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
        <div class="px-2 text-sm italic text-gray-700">
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
        <div class="text-sm italic text-gray-700">{connectionSetting.description}</div>
        <div class="pl-3">{connectionSetting.value}</div>
      </div>
    {/each}

    <section class="pf-c-page__main-tabs pf-m-limit-width">
      <div class="pf-c-page__main-body">
        <div class="pf-c-tabs" id="open-tabs-example-tabs-list">
          <div class="pl-5">
            <ul class="pf-c-tabs__list">
              <Tab title="Summary" url="summary"/>
            </ul>
          </div>            
        </div>
      </div>
    </section> 
    <Route path="/summary" breadcrumb="Summary">
      <PreferencesKubernetesConnectionDetailsSummary kubernetesConnectionInfo="{kubernetesConnectionInfo}" properties="{configurationKeys}" />
    </Route>
  </div>
  
</Route>
{/if}
{#if showModal}
  <Modal
    on:close="{() => {
      stopReceivingLogs(showModal);
      showModal = undefined;
    }}">
    <h2 slot="header">Logs</h2>
    <div id="log" style="height: 400px; width: 650px;">
      <div style="width:100%; height:100%;">
        <TerminalWindow bind:terminal="{logsTerminal}" />
      </div>
    </div>
  </Modal>
{/if}
