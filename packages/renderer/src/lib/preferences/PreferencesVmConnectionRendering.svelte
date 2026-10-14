<script lang="ts">
import type { ProviderConnectionInfo, ProviderInfo, ProviderVmConnectionInfo } from '@desktop-framework/api';
import { NavigationPage } from '@desktop-framework/api';
import { Tab } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
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
import PreferencesConnectionDetailsTerminal from './PreferencesConnectionDetailsTerminal.svelte';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import { getProviderConnectionName } from './Util';

interface Props {
  providerInternalId?: string;
  connectionName?: string;
}
let { providerInternalId, connectionName = '' }: Props = $props();

let connectionStatus: IConnectionStatus | undefined = $state();
let connectionInfo: ProviderVmConnectionInfo | undefined = $state();
let providerInfo: ProviderInfo | undefined = $state();
let loggerHandlerKey: symbol | undefined;

let providersUnsubscribe: Unsubscriber;
onMount(async () => {
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);

    connectionInfo = providerInfo?.vmConnections?.find(connection => connection.name === connectionName);
    if (!connectionInfo) {
      handleNavigation({
        page: NavigationPage.RESOURCES,
      });
      return;
    }
    if (!providerInfo) {
      return;
    }
    const vmConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (vmConnectionName && connectionStatus?.status !== connectionInfo.status) {
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
  connectionInfo: ProviderVmConnectionInfo,
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
      {#if providerInfo && connectionInfo}
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
      <Tab
        title="Terminal"
        selected={isTabSelected($router.path, 'terminal')}
        url={getTabUrl($router.path, 'terminal')} />
    {/snippet}
    {#snippet contentSnippet()}
      <div class="h-full">
        {#if providerInfo && connectionInfo}
          <Route path="/terminal" breadcrumb="Terminal" navigationHint="tab">
            <PreferencesConnectionDetailsTerminal
              provider={providerInfo}
              connectionInfo={connectionInfo}
              screenReaderMode={true} />
          </Route>
        {/if}
      </div>
    {/snippet}
  </DetailsPage>
{/if}
