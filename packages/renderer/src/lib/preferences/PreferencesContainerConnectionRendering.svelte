<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../preload/src/configuration-registry';
import PreferencesRenderingItem from './PreferencesRenderingItem.svelte';

import { Buffer } from 'buffer';
import type { ContainerProviderConnection } from '@tmpwip/extension-api';
import { providerInfos } from '../../stores/providers';
import { onMount } from 'svelte';
import type { ProviderInfo } from '../../../../preload/src/api/provider-info';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerId: string = undefined;
export let connection: string = undefined;
export let matchingRecords: IConfigurationPropertyRecordedSchema[] = [];

let socketPath: string = '';
let scope: ContainerProviderConnection;
let providers: ProviderInfo[] = [];
onMount(() => {
  providerInfos.subscribe(value => {
    providers = value;
  });
});

function getMatchingRecords() {
  return [];
}

$: socketPath = Buffer.from(connection, 'base64').toString();

$: matchingRecords = getMatchingRecords();

let providerName;
$: providerName = providers.filter(provider => provider.id === providerId).map(provider => provider.name)[0];
$: connectionName = providers
  .filter(provider => provider.id === providerId)
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
let connectionSettings;
$: connectionSettings = configurationKeys
  .map(configurationKey => {
    return {
      ...configurationKey,
      value: window.getConfigurationValue(configurationKey.id, scope),
    };
  })
  .filter(configurationKey => configurationKey.value !== undefined);

$: scope = {
  endpoint: {
    socketPath,
  },
} as ContainerProviderConnection;
</script>

<div class="flex flex-1 flex-col">
  <h1 class="capitalize text-xl">{connectionName} settings</h1>
  <p class="capitalize text-sm">provider: {providerName}</p>
  <!--Connection Rendering with title being provider and connection {connection} aka {socketPath} with response {providerName} and connection name {connectionName}-->

  {#each connectionSettings as connectionSetting}
    <!--key is {connectionSetting.id} and value {connectionSetting.value}  <br />-->
    {#if connectionSetting.format === 'cpu'}
      <div class="pl-1 py-2">
        <div class="text-sm italic  text-gray-400">{connectionSetting.description}</div>
        <div class="pl-3">{connectionSetting.value}</div>
      </div>
    {:else if connectionSetting.format === 'memory'}
      <div class="pl-1 py-2">
        <div class="text-sm italic  text-gray-400">{connectionSetting.description}</div>
        <div class="pl-3">{connectionSetting.value} MB</div>
      </div>
    {:else if connectionSetting.format === 'diskSize'}
      <div class="pl-1 py-2">
        <div class="text-sm italic  text-gray-400">{connectionSetting.description}</div>
        <div class="pl-3">{connectionSetting.value} GB</div>
      </div>
    {:else}
      {connectionSetting.description}: {connectionSetting.value}
    {/if}
  {/each}

  {#if connectionSettings.length === 0}
    <div class="pf-c-empty-state h-full">
      <div class="pf-c-empty-state__content">
        <i class="fas fa-cubes pf-c-empty-state__icon" aria-hidden="true"></i>
        <h1 class="pf-c-title pf-m-lg">No settings</h1>
        <div class="pf-c-empty-state__body">No settings provided by this provider</div>
      </div>
    </div>
  {/if}
  <br /><br /><br /><br />

  <table class="divide-y divide-gray-800 mt-2 min-w-full">
    <tbody class="bg-gray-800 divide-y divide-gray-200 ">
      {#each matchingRecords as record}
        <tr>
          <td>
            <PreferencesRenderingItem record="{record}" />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
