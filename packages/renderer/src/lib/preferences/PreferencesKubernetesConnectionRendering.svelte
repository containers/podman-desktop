<script lang="ts">
import type { ProviderConnectionInfo, ProviderInfo, ProviderKubernetesConnectionInfo } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import { Tab } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { Buffer } from 'buffer';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import ConnectionErrorIndicator from '/@/lib/ui/ConnectionErrorIndicator.svelte';
import ConnectionErrorInfoButton from '/@/lib/ui/ConnectionErrorInfoButton.svelte';
import ConnectionStatus from '/@/lib/ui/ConnectionStatus.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import { handleNavigation } from '/@/navigation';
import Route from '/@/Route.svelte';
import { providerInfos } from '/@/stores/providers';

import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';
import PreferencesKubernetesConnectionDetailsSummary from './PreferencesKubernetesConnectionDetailsSummary.svelte';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import { getProviderConnectionName } from './Util';

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  providerInternalId?: string;
  apiUrlBase64?: string;
}
let { properties = [], providerInternalId, apiUrlBase64 = '' }: Props = $props();

const apiURL = $derived<string>(Buffer.from(apiUrlBase64, 'base64').toString());
let connectionName = '';
let connectionStatus = $state<IConnectionStatus>();
let noLog = $state<boolean>(true);
let connectionInfo = $state<ProviderKubernetesConnectionInfo>();
let providerInfo = $state<ProviderInfo>();
let loggerHandlerKey = $state<symbol>();
let configurationKeys = $derived<IConfigurationPropertyRecordedSchema[]>(
  properties
    .filter(property => property.scope === 'KubernetesConnection')
    .toSorted((a, b) => (a?.id ?? '').localeCompare(b?.id ?? '')),
);

let providersUnsubscribe: Unsubscriber;
onMount(async () => {
  noLog = true;
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);

    connectionInfo = providerInfo?.kubernetesConnections?.find(
      connection => connection.endpoint.apiURL === apiURL || connection.name === connectionName,
    );
    if (!connectionInfo) {
      handleNavigation({
        page: NavigationPage.RESOURCES,
      });
      return;
    }
    if (!providerInfo) {
      return;
    }
    connectionName = connectionInfo.name;
    const kubernetesConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (kubernetesConnectionName && connectionStatus?.status !== connectionInfo.status) {
      if (loggerHandlerKey !== undefined) {
        connectionStatus = {
          inProgress: true,
          action: 'restart',
          status: connectionInfo.status,
        };
        startConnectionProvider(providerInfo, connectionInfo, loggerHandlerKey).catch((err: unknown) =>
          console.error(`Error starting provider ${connectionInfo?.name}`, err),
        );
        loggerHandlerKey = undefined;
      } else {
        connectionStatus = {
          inProgress: false,
          action: undefined,
          status: connectionInfo.status,
        };
      }
    }
    connectionStatus = connectionStatus;
  });
});

onDestroy(() => {
  if (providersUnsubscribe) {
    providersUnsubscribe();
  }
});

async function startConnectionProvider(
  provider: ProviderInfo,
  connectionInfo: ProviderKubernetesConnectionInfo,
  loggerHandlerKey: symbol,
): Promise<void> {
  await window.startProviderConnectionLifecycle(
    provider.internalId,
    $state.snapshot(connectionInfo),
    loggerHandlerKey,
    eventCollect,
  );
}

function updateConnectionStatus(
  provider: ProviderInfo,
  connectionInfo: ProviderConnectionInfo,
  action?: string,
  error?: string,
): void {
  if (error) {
    if (connectionStatus) {
      connectionStatus = {
        ...connectionStatus,
        inProgress: false,
        error,
      };
    }
  } else if (action) {
    connectionStatus = {
      inProgress: true,
      action: action,
      status: connectionInfo.status,
    };
  }
  connectionStatus = connectionStatus;
}

function addConnectionToRestartingQueue(connection: IConnectionRestart): void {
  loggerHandlerKey = connection.loggerHandlerKey;
}

function setNoLogs(): void {
  noLog = false;
}
</script>

{#if connectionInfo}
  <DetailsPage title={connectionInfo.name}>
    {#snippet subtitleSnippet()}
      {#if connectionInfo}
        <div class="flex flex-row">
          <ConnectionStatus status={connectionInfo.status} />
          <ConnectionErrorIndicator error={connectionInfo.error} />
          <ConnectionErrorInfoButton status={connectionStatus} />
        </div>
      {/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if connectionInfo && providerInfo}
        <div class="flex justify-end">
          <PreferencesConnectionActions
            provider={providerInfo}
            connection={connectionInfo}
            connectionStatus={connectionStatus}
            updateConnectionStatus={updateConnectionStatus}
            addConnectionToRestartingQueue={addConnectionToRestartingQueue} />
        </div>
      {/if}
    {/snippet}
    {#snippet iconSnippet()}
      {#if providerInfo?.images?.icon}
        <Icon icon={providerInfo.images.icon} title={providerInfo?.name} class="max-h-10" />
      {/if}
    {/snippet}
    {#snippet tabsSnippet()}
      {#if connectionInfo}
        <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
        {#if connectionInfo.lifecycleMethods && connectionInfo.lifecycleMethods.length > 0}
          <Tab title="Logs" selected={isTabSelected($router.path, 'logs')} url={getTabUrl($router.path, 'logs')} />
        {/if}
      {/if}
    {/snippet}
    {#snippet contentSnippet()}
      <div class="h-full">
        <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
          <PreferencesKubernetesConnectionDetailsSummary
            kubernetesConnectionInfo={connectionInfo}
            providerInternalId={providerInternalId}
            properties={configurationKeys} />
        </Route>
        <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
          <PreferencesConnectionDetailsLogs
            providerInternalId={providerInternalId}
            connectionInfo={connectionInfo}
            setNoLogs={setNoLogs}
            noLog={noLog} />
        </Route>
      </div>
    {/snippet}
  </DetailsPage>
{/if}
