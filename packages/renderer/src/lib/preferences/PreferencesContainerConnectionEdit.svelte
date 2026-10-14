<script lang="ts">
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { Buffer } from 'buffer';

import PreferencesConnectionCreationRendering from '/@/lib/preferences/PreferencesConnectionCreationOrEditRendering.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import WarningMessage from '/@/lib/ui/WarningMessage.svelte';
import { providerInfos } from '/@/stores/providers';

import { isContainerConnection } from './Util';

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  providerInternalId?: string;
  name?: string;
}
let { properties = [], providerInternalId, name }: Props = $props();

let connectionName = $derived(Buffer.from(name ?? '', 'base64').toString());
let providerInfo: ProviderInfo = $derived(
  $providerInfos.filter(provider => provider.internalId === providerInternalId)[0],
);
let connectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo = $derived(
  providerInfo.containerConnections.filter(connection => connection.name === connectionName)[0],
);
let scope: string = $derived(isContainerConnection(connectionInfo) ? 'ContainerConnection' : 'KubernetesConnection');

async function editConnection(
  internalProviderId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: { [key: string]: any },
  key: symbol,
  keyLogger: (key: symbol, eventName: 'log' | 'warn' | 'error' | 'finish', args: string[]) => void,
  tokenId: number | undefined,
  taskId: number | undefined,
): Promise<void> {
  await window.editProviderConnectionLifecycle(
    internalProviderId,
    connectionInfo,
    params,
    key,
    keyLogger,
    tokenId,
    taskId,
  );
}
</script>

{#if providerInfo && connectionInfo}
  <DetailsPage title={connectionInfo.name}>
    {#snippet contentSnippet()}
      <div class="text-[var(--pd-content-text)]">
        <PreferencesConnectionCreationRendering
          providerInfo={providerInfo}
          connectionInfo={connectionInfo}
          properties={properties}
          propertyScope={scope}
          callback={editConnection} />
      </div>
    {/snippet}
    {#snippet iconSnippet()}
      {#if providerInfo?.images?.icon}
        <Icon icon={providerInfo.images.icon} title={providerInfo?.name} class="max-h-10" />
      {/if}
    {/snippet}
    {#snippet subtitleSnippet()}
      {#if connectionInfo.status === 'started'}
        <WarningMessage
          error="This may restart the container or Kubernetes engine. Existing containers or pods may be stopped." />
      {/if}
    {/snippet}
  </DetailsPage>
{/if}
