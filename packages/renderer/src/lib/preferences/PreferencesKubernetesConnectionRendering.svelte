<script lang="ts">
import { Tab } from '@podman-desktop/ui-svelte';
import { Buffer } from 'buffer';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import Route from '../../Route.svelte';
import { providerInfos } from '../../stores/providers';
import IconImage from '../appearance/IconImage.svelte';
import ConnectionErrorInfoButton from '../ui/ConnectionErrorInfoButton.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';
import PreferencesKubernetesConnectionDetailsSummary from './PreferencesKubernetesConnectionDetailsSummary.svelte';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import { getProviderConnectionName } from './Util';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string | undefined = undefined;
export let apiUrlBase64 = '';

const apiURL: string = Buffer.from(apiUrlBase64, 'base64').toString();
let connectionName = '';
let connectionStatus: IConnectionStatus;
let noLog = true;
let connectionInfo: ProviderKubernetesConnectionInfo | undefined;
let providerInfo: ProviderInfo | undefined;
let loggerHandlerKey: symbol | undefined;
let configurationKeys: IConfigurationPropertyRecordedSchema[];
$: configurationKeys = properties
  .filter(property => property.scope === 'KubernetesConnection')
  .sort((a, b) => (a?.id ?? '').localeCompare(b?.id ?? ''));
let detailsPage: DetailsPage;

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
      // closing the page of a connection that has been removed
      detailsPage.close();
      return;
    }
    if (!providerInfo) {
      return;
    }
    connectionName = connectionInfo.name;
    const kubernetesConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (kubernetesConnectionName && (!connectionStatus || connectionStatus.status !== connectionInfo.status)) {
      if (loggerHandlerKey !== undefined) {
        connectionStatus = {
          inProgress: true,
          action: 'restart',
          status: connectionInfo.status,
        };
        startConnectionProvider(providerInfo, connectionInfo, loggerHandlerKey);
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
) {
  await window.startProviderConnectionLifecycle(provider.internalId, connectionInfo, loggerHandlerKey, eventCollect);
}

function updateConnectionStatus(
  provider: ProviderInfo,
  connectionInfo: ProviderKubernetesConnectionInfo | ProviderContainerConnectionInfo,
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

function addConnectionToRestartingQueue(connection: IConnectionRestart) {
  loggerHandlerKey = connection.loggerHandlerKey;
}

function setNoLogs() {
  noLog = false;
}
</script>

{#if connectionInfo}
  <DetailsPage title={connectionInfo.name} bind:this={detailsPage}>
    <svelte:fragment slot="subtitle">
      <div class="flex flex-row">
        <ConnectionStatus status={connectionInfo.status} />
        <ConnectionErrorInfoButton status={connectionStatus} />
      </div>
    </svelte:fragment>
    <svelte:fragment slot="actions">
      {#if providerInfo}
        <div class="flex justify-end">
          <PreferencesConnectionActions
            provider={providerInfo}
            connection={connectionInfo}
            connectionStatus={connectionStatus}
            updateConnectionStatus={updateConnectionStatus}
            addConnectionToRestartingQueue={addConnectionToRestartingQueue} />
        </div>
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="icon">
      <IconImage image={providerInfo?.images?.icon} alt={providerInfo?.name} class="max-h-10" />
    </svelte:fragment>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      {#if connectionInfo.lifecycleMethods && connectionInfo.lifecycleMethods.length > 0}
        <Tab title="Logs" selected={isTabSelected($router.path, 'logs')} url={getTabUrl($router.path, 'logs')} />
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="content">
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
    </svelte:fragment>
  </DetailsPage>
{/if}
