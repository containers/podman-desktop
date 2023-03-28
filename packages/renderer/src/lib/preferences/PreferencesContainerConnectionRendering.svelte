<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import type { ContainerProviderConnection } from '@podman-desktop/api';
import { providerInfos } from '../../stores/providers';
import { beforeUpdate, onMount } from 'svelte';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
import Logger from './Logger.svelte';
import { writeToTerminal } from './Util';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import { filesize } from 'filesize';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let connection: string = undefined;

let socketPath: string = '';
let scope: ContainerProviderConnection;
let providers: ProviderInfo[] = [];
onMount(() => {
  lifecycleError = '';
  providerInfos.subscribe(value => {
    providers = value;
  });
});

$: socketPath = Buffer.from(connection, 'base64').toString();

let providerInfo: ProviderInfo;
$: providerInfo = providers.find(provider => provider.internalId === providerInternalId);

$: connectionName = providers
  .filter(provider => provider.internalId === providerInternalId)
  .map(provider => {
    const matchingConnection = provider.containerConnections?.filter(
      connection => connection.endpoint.socketPath === socketPath,
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
  .filter(property => property.scope === 'ContainerConnection')
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
    socketPath,
  },
} as ContainerProviderConnection;

let containerConnectionInfo: ProviderContainerConnectionInfo = undefined;
$: containerConnectionInfo = providerInfo?.containerConnections?.find(
  connection => connection.endpoint.socketPath === socketPath,
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
    await window.startProviderConnectionLifecycle(providerInfo.internalId, containerConnectionInfo);
  } catch (err) {
    lifecycleError = err;
  }
}

async function stopConnection() {
  lifecycleError = undefined;
  await window.stopProviderConnectionLifecycle(providerInfo.internalId, containerConnectionInfo);
}

async function deleteConnection() {
  lifecycleError = undefined;
  await window.deleteProviderConnectionLifecycle(providerInfo.internalId, containerConnectionInfo);
  router.goto('/preferences/providers');
}

let showModal: ProviderInfo = undefined;

let logsTerminal;

async function startReceivinLogs(provider: ProviderInfo): Promise<void> {
  const logHandler = (newContent: any[], colorPrefix: string) => {
    writeToTerminal(logsTerminal, newContent, colorPrefix);
  };
  window.startReceiveLogs(
    provider.internalId,
    data => logHandler(data, '\x1b[37m'),
    data => logHandler(data, '\x1b[33m'),
    data => logHandler(data, '\x1b[1;31m'),
    containerConnectionInfo,
  );
}

async function stopReceivingLogs(provider: ProviderInfo): Promise<void> {
  await window.stopReceiveLogs(provider.internalId, containerConnectionInfo);
}
</script>

<div class="flex flex-1 flex-col bg-zinc-800 px-2">
  <div class="flex flex-row align-middle my-4">
    <div class="capitalize text-xl">{connectionName} settings</div>
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
  {#if containerConnectionInfo?.lifecycleMethods && containerConnectionInfo.lifecycleMethods.length > 0}
    <div class="py-2 flex flex:row">
      <!-- start is enabled only in stopped mode-->
      {#if containerConnectionInfo.lifecycleMethods.includes('start')}
        <div class="px-2 text-sm italic text-gray-400">
          <button
            disabled="{containerConnectionInfo.status !== 'stopped'}"
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
      {#if containerConnectionInfo.lifecycleMethods.includes('stop')}
        <div class="px-2 text-sm italic text-gray-400">
          <button
            disabled="{containerConnectionInfo.status !== 'started'}"
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
      {#if containerConnectionInfo.lifecycleMethods.includes('delete')}
        <div class="px-2 text-sm italic text-gray-400">
          <button
            disabled="{containerConnectionInfo.status !== 'stopped'}"
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
          disabled="{containerConnectionInfo.status !== 'started'}"
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
    <!--key is {connectionSetting.id} and value {connectionSetting.value}  <br />-->
    {#if connectionSetting.format === 'cpu'}
      <div class="pl-1 py-2">
        <div class="text-sm italic text-gray-400">{connectionSetting.description}</div>
        <div class="pl-3">{connectionSetting.value}</div>
      </div>
    {:else if connectionSetting.format === 'memory' || connectionSetting.format === 'diskSize'}
      <div class="pl-1 py-2">
        <div class="text-sm italic text-gray-400">{connectionSetting.description}</div>
        <div class="pl-3">{filesize(connectionSetting.value)}</div>
      </div>
    {:else}
      {connectionSetting.description}: {connectionSetting.value}
    {/if}
  {/each}

  {#if containerConnectionInfo}
    <div class="pl-1 py-2">
      <div class="text-sm italic text-gray-400">Status</div>
      <div class="pl-3">{containerConnectionInfo.status}</div>
    </div>
    <div class="pl-1 py-2">
      <div class="text-sm italic text-gray-400">Socket</div>
      <div class="pl-3">{containerConnectionInfo.endpoint.socketPath}</div>
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
        <Logger bind:logsTerminal="{logsTerminal}" onInit="{() => startReceivinLogs(showModal)}" />
      </div>
    </div>
  </Modal>
{/if}
