<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import { providerInfos } from '../../stores/providers';
import { onDestroy, onMount } from 'svelte';
import type { ProviderInfo, ProviderKubernetesConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import { router } from 'tinro';
import { getProviderConnectionName } from './Util';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import Route from '../../Route.svelte';
import { eventCollect } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import type { Unsubscriber } from 'svelte/store';
import Fa from 'svelte-fa/src/fa.svelte';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import Tab from '../ui/Tab.svelte';
import PreferencesKubernetesConnectionDetailsSummary from './PreferencesKubernetesConnectionDetailsSummary.svelte';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';

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
    connectionInfo = providerInfo?.kubernetesConnections?.find(
      connection => connection.endpoint.apiURL === apiURL || connection.name === connectionName,
    );
    if (!connectionInfo) {
      return;
    }
    connectionName = connectionInfo.name;
    const kubernetesConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (kubernetesConnectionName) {
      if (
        !connectionStatus.has(kubernetesConnectionName) ||
        connectionStatus.get(kubernetesConnectionName).status !== connectionInfo.status
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
  <Route path="/*" breadcrumb="{connectionInfo?.name} Settings" let:meta>
    <div class="flex flex-1 flex-col">
      <div class="bg-[#222222]">
        <div class="mx-5">
          <div class="pt-3">
            <button
              aria-label="Close"
              class="'hover:text-gray-400 float-right text-lg"
              on:click="{() => router.goto('/preferences/resources')}">
              <Fa icon="{faXmark}" />
            </button>
            <h1 class="capitalize text-xs text-gray-400">Resources > {providerInfo?.name} > Details</h1>
          </div>
        </div>
      </div>
      <div>
        <div>
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
                <div class="capitalize text-md pt-1">{connectionInfo?.name}</div>
                <div class="flex flex-row mt-1"><ConnectionStatus status="{connectionInfo.status}" /></div>
              </div>
            </div>
            <div class="mx-10 pt-1">
              <PreferencesConnectionActions
                provider="{providerInfo}"
                connection="{connectionInfo}"
                connectionStatuses="{connectionStatus}"
                updateConnectionStatus="{updateConnectionStatus}"
                addConnectionToRestartingQueue="{addConnectionToRestartingQueue}" />
            </div>
          </div>
        </div>
        <section class="pf-c-page__main-tabs pf-m-limit-width">
          <div class="pf-c-page__main-body">
            <div class="pf-c-tabs" id="open-tabs-example-tabs-list">
              <div class="pl-5">
                <ul class="pf-c-tabs__list">
                  <Tab title="Summary" url="summary" />
                  {#if connectionInfo.lifecycleMethods && connectionInfo.lifecycleMethods.length > 0}
                    <Tab title="Logs" url="logs" />
                  {/if}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <Route path="/summary" breadcrumb="Summary">
          <PreferencesKubernetesConnectionDetailsSummary
            kubernetesConnectionInfo="{connectionInfo}"
            providerInternalId="{providerInternalId}"
            properties="{configurationKeys}" />
        </Route>
        <Route path="/logs" breadcrumb="Logs">
          <PreferencesConnectionDetailsLogs
            connection="{apiUrlBase64}"
            providerInternalId="{providerInternalId}"
            connectionInfo="{connectionInfo}"
            setNoLogs="{setNoLogs}"
            noLog="{noLog}" />
        </Route>
      </div>
    </div></Route>
{/if}
