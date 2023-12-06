<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import { providerInfos } from '../../stores/providers';
import { onDestroy, onMount } from 'svelte';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '../../../../main/src/plugin/api/provider-info';
import { isContainerConnection } from './Util';
import type { Unsubscriber } from 'svelte/store';
import PreferencesConnectionCreationRendering from '/@/lib/preferences/PreferencesConnectionCreationOrEditRendering.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import CustomIcon from '/@/lib/images/CustomIcon.svelte';
import WarningMessage from '/@/lib/ui/WarningMessage.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string | undefined = undefined;
export let name: string | undefined = undefined;

let connectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo;
let scope: string;
let providerInfo: ProviderInfo;

let providersUnsubscribe: Unsubscriber;
onMount(async () => {
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    const connectionName = Buffer.from(name || '', 'base64').toString();
    providerInfo = providers.filter(provider => provider.internalId === providerInternalId)[0];
    connectionInfo = providerInfo.containerConnections.filter(connection => connection.name === connectionName)[0];
  });
  scope = isContainerConnection(connectionInfo) ? 'ContainerConnection' : 'KubernetesConnection';
});

onDestroy(() => {
  if (providersUnsubscribe) {
    providersUnsubscribe();
  }
});

async function editConnection(
  internalProviderId: string,
  params: { [key: string]: any },
  key: symbol,
  keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
  tokenId?: number,
): Promise<void> {
  await window.editProviderConnectionLifecycle(internalProviderId, connectionInfo, params, key, keyLogger, tokenId);
}
</script>

{#if providerInfo && connectionInfo}
  <DetailsPage title="{connectionInfo.name}">
    <svelte:fragment slot="content">
      <PreferencesConnectionCreationRendering
        providerInfo="{providerInfo}"
        connectionInfo="{connectionInfo}"
        properties="{properties}"
        propertyScope="{scope}"
        callback="{editConnection}" />
    </svelte:fragment>
    <CustomIcon slot="icon" icon="{providerInfo?.images?.icon}" altText="{providerInfo?.name}" classes="max-h-10" />
    <svelte:fragment slot="subtitle">
      {#if connectionInfo.status === 'started'}
        <WarningMessage
          error="This may restart the container or Kubernetes engine. Existing containers or pods may be stopped." />
      {/if}
    </svelte:fragment>
  </DetailsPage>
{/if}
