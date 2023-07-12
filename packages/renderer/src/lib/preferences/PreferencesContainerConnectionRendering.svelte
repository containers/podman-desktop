<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import { providerInfos } from '../../stores/providers';
import { onDestroy, onMount } from 'svelte';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { getProviderConnectionName } from './Util';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import Route from '../../Route.svelte';
import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import type { Unsubscriber } from 'svelte/store';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import PreferencesContainerConnectionDetailsSummary from './PreferencesContainerConnectionDetailsSummary.svelte';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';
import Tab from '../ui/Tab.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import CustomIcon from '../images/CustomIcon.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let connection: string = undefined;

const socketPath: string = Buffer.from(connection, 'base64').toString();
$: connectionStatus = new Map<string, IConnectionStatus>();
let noLog = true;
let connectionInfo: ProviderContainerConnectionInfo;
let providerInfo: ProviderInfo;
let loggerHandlerKey: symbol;
let configurationKeys: IConfigurationPropertyRecordedSchema[];
$: configurationKeys = properties
  .filter(property => property.scope === 'ContainerConnection')
  .sort((a, b) => a.id.localeCompare(b.id));

let providersUnsubscribe: Unsubscriber;
onMount(async () => {
  noLog = true;
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);
    connectionInfo = providerInfo?.containerConnections?.find(
      connection => connection.endpoint.socketPath === socketPath,
    );
    const containerConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (
      containerConnectionName &&
      (!connectionStatus.has(containerConnectionName) ||
        connectionStatus.get(containerConnectionName).status !== connectionInfo.status)
    ) {
      if (loggerHandlerKey !== undefined) {
        connectionStatus.set(containerConnectionName, {
          inProgress: true,
          action: 'restart',
          status: connectionInfo.status,
        });
        startContainerProvider(providerInfo, connectionInfo, loggerHandlerKey);
      } else {
        connectionStatus.set(containerConnectionName, {
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

async function startContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  loggerHandlerKey: symbol,
) {
  await window.startProviderConnectionLifecycle(
    provider.internalId,
    containerConnectionInfo,
    loggerHandlerKey,
    eventCollect,
  );
}

function updateConectionStatus(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  action?: string,
  error?: string,
): void {
  const containerConnectionName = getProviderConnectionName(provider, containerConnectionInfo);
  if (error) {
    const currentStatus = connectionStatus.get(containerConnectionName);
    connectionStatus.set(containerConnectionName, {
      ...currentStatus,
      inProgress: false,
      error,
    });
  } else if (action) {
    connectionStatus.set(containerConnectionName, {
      inProgress: true,
      action: action,
      status: containerConnectionInfo.status,
    });
  }
  connectionStatus = connectionStatus;
}

function addConnectionToRestartingQueue(container: IConnectionRestart) {
  loggerHandlerKey = container.loggerHandlerKey;
}

function setNoLogs() {
  noLog = false;
}
</script>

{#if connectionInfo}
  <div class="bg-charcoal-700 h-full">
    <DetailsPage title="{connectionInfo.name}">
      <div class="flex flex-row" slot="subtitle">
        <ConnectionStatus status="{connectionInfo.status}" />
      </div>
      <div slot="actions" class="flex justify-end">
        <PreferencesConnectionActions
          provider="{providerInfo}"
          connection="{connectionInfo}"
          connectionStatuses="{connectionStatus}"
          updateConnectionStatus="{updateConectionStatus}"
          addConnectionToRestartingQueue="{addConnectionToRestartingQueue}" />
      </div>
      <CustomIcon slot="icon" icon="{providerInfo?.images?.icon}" altText="{providerInfo.name}" classes="max-h-10" />
      <div slot="tabs" class="pf-c-tabs__list">
        <Tab title="Summary" url="summary" />
        {#if connectionInfo.lifecycleMethods && connectionInfo.lifecycleMethods.length > 0}
          <Tab title="Logs" url="logs" />
        {/if}
      </div>
      <div slot="content" class="h-full">
        <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
          <PreferencesContainerConnectionDetailsSummary
            containerConnectionInfo="{connectionInfo}"
            providerInternalId="{providerInternalId}"
            properties="{configurationKeys}" />
        </Route>
        <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
          <PreferencesConnectionDetailsLogs            
            providerInternalId="{providerInternalId}"
            connection="{connection}"
            connectionInfo="{connectionInfo}"
            setNoLogs="{setNoLogs}"
            noLog="{noLog}" />
        </Route>
      </div>
    </DetailsPage>
  </div>
{/if}
