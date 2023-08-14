<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import { providerInfos } from '../../stores/providers';
import { onDestroy, onMount } from 'svelte';
import type { ProviderInfo, ProviderKubernetesConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import { getProviderConnectionName } from './Util';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import Route from '../../Route.svelte';
import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import type { Unsubscriber } from 'svelte/store';
import Tab from '../ui/Tab.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import PreferencesKubernetesConnectionDetailsSummary from './PreferencesKubernetesConnectionDetailsSummary.svelte';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import CustomIcon from '../images/CustomIcon.svelte';
import PreferencesConnectionDetailsKubeconfig from '/src/lib/preferences/PreferencesKubernetesConnectionDetailsKubeconfig.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let apiUrlBase64 = '';

const apiURL: string = Buffer.from(apiUrlBase64, 'base64').toString();
let connectionName = '';
$: connectionStatus = new Map<string, IConnectionStatus>();
let noLog = true;
let connectionInfo: ProviderKubernetesConnectionInfo;
let providerInfo: ProviderInfo;
let loggerHandlerKey: symbol;
let configurationKeys: IConfigurationPropertyRecordedSchema[];
$: configurationKeys = properties
  .filter(property => property.scope === 'KubernetesConnection')
  .sort((a, b) => a.id.localeCompare(b.id));

let providersUnsubscribe: Unsubscriber;
onMount(async () => {
  noLog = true;
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);
    console.log(providerInfo.images.icon);
    connectionInfo = providerInfo?.kubernetesConnections?.find(
      connection => connection.endpoint.apiURL === apiURL || connection.name === connectionName,
    );
    if (!connectionInfo) {
      return;
    }
    connectionName = connectionInfo.name;
    const kubernetesConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (
      kubernetesConnectionName &&
      (!connectionStatus.has(kubernetesConnectionName) ||
        connectionStatus.get(kubernetesConnectionName).status !== connectionInfo.status)
    ) {
      if (loggerHandlerKey !== undefined) {
        connectionStatus.set(kubernetesConnectionName, {
          inProgress: true,
          action: 'restart',
          status: connectionInfo.status,
        });
        startConnectionProvider(providerInfo, connectionInfo, loggerHandlerKey);
      } else {
        connectionStatus.set(kubernetesConnectionName, {
          inProgress: false,
          action: undefined,
          status: connectionInfo.status,
        });
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
  connectionInfo: ProviderKubernetesConnectionInfo,
  action?: string,
  error?: string,
): void {
  const connectionName = getProviderConnectionName(provider, connectionInfo);
  if (error) {
    const currentStatus = connectionStatus.get(connectionName);
    connectionStatus.set(connectionName, {
      ...currentStatus,
      inProgress: false,
      error,
    });
  } else if (action) {
    connectionStatus.set(connectionName, {
      inProgress: true,
      action: action,
      status: connectionInfo.status,
    });
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
  <div class="bg-charcoal-700 h-full">
    <DetailsPage title="{connectionInfo.name}">
      <svelte:fragment slot="subtitle">
        <div class="flex flex-row">
          <ConnectionStatus status="{connectionInfo.status}" />
        </div>
      </svelte:fragment>
      <svelte:fragment slot="actions">
        <div class="flex justify-end">
          <PreferencesConnectionActions
            provider="{providerInfo}"
            connection="{connectionInfo}"
            connectionStatuses="{connectionStatus}"
            updateConnectionStatus="{updateConnectionStatus}"
            addConnectionToRestartingQueue="{addConnectionToRestartingQueue}" />
        </div>
      </svelte:fragment>
      <svelte:fragment slot="icon">
        <CustomIcon icon="{providerInfo?.images?.icon}" altText="{providerInfo.name}" classes="max-h-10" />
      </svelte:fragment>
      <svelte:fragment slot="tabs">
        <Tab title="Summary" url="summary" />
        {#if connectionInfo.lifecycleMethods && connectionInfo.lifecycleMethods.length > 0}
          <Tab title="Logs" url="logs" />
        {/if}
        {#if connectionInfo.kubeconfig}
          <Tab title="Kubeconfig" url="kubeconfig" />
        {/if}
      </svelte:fragment>
      <svelte:fragment slot="content">
        <div class="h-full">
          <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
            <PreferencesKubernetesConnectionDetailsSummary
              kubernetesConnectionInfo="{connectionInfo}"
              providerInternalId="{providerInternalId}"
              properties="{configurationKeys}" />
          </Route>
          <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
            <PreferencesConnectionDetailsLogs
              providerInternalId="{providerInternalId}"
              connectionInfo="{connectionInfo}"
              setNoLogs="{setNoLogs}"
              noLog="{noLog}" />
          </Route>
          <Route path="/kubeconfig" breadcrumb="kubeconfig" navigationHint="tab">
            <PreferencesConnectionDetailsKubeconfig kubeconfig="{connectionInfo.kubeconfig}" />
          </Route>
        </div>
      </svelte:fragment>
    </DetailsPage>
  </div>
{/if}
