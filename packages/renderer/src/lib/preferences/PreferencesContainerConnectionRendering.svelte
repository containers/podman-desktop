<script lang="ts">
import type { ProviderConnectionInfo, ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
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
import PreferencesConnectionDetailsTerminal from './PreferencesConnectionDetailsTerminal.svelte';
import PreferencesContainerConnectionDetailsSummary from './PreferencesContainerConnectionDetailsSummary.svelte';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import { getProviderConnectionName } from './Util';

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  providerInternalId?: string;
  connection?: string;
  name?: string;
}
let { properties = [], providerInternalId, connection, name }: Props = $props();

const connectionName = $derived(Buffer.from(name ?? '', 'base64').toString());
const socketPath: string = $derived(Buffer.from(connection ?? '', 'base64').toString());
let connectionStatus: IConnectionStatus | undefined = $state();
let noLog = $state(true);
let connectionInfo: ProviderContainerConnectionInfo | undefined = $state();
let providerInfo: ProviderInfo | undefined = $state();
let loggerHandlerKey: symbol | undefined;
let configurationKeys: IConfigurationPropertyRecordedSchema[] = $derived(
  properties
    .filter(property => property.scope === 'ContainerConnection')
    .toSorted((a, b) => (a.id ?? '').localeCompare(b.id ?? '')),
);

let providersUnsubscribe: Unsubscriber;
onMount(async () => {
  noLog = true;
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);
    connectionInfo = providerInfo?.containerConnections?.find(
      connection => connection.endpoint.socketPath === socketPath && connection.name === connectionName,
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
    const containerConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (containerConnectionName && connectionStatus?.status !== connectionInfo.status) {
      if (loggerHandlerKey !== undefined) {
        connectionStatus = {
          inProgress: true,
          action: 'restart',
          status: connectionInfo.status,
        };
        startContainerProvider(providerInfo, connectionInfo, loggerHandlerKey).catch((err: unknown) =>
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

async function startContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  loggerHandlerKey: symbol,
): Promise<void> {
  await window.startProviderConnectionLifecycle(
    provider.internalId,
    $state.snapshot(containerConnectionInfo),
    loggerHandlerKey,
    eventCollect,
  );
}
function updateConnectionStatus(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderConnectionInfo,
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
      status: containerConnectionInfo.status,
    };
  }
  connectionStatus = connectionStatus;
}

function addConnectionToRestartingQueue(container: IConnectionRestart): void {
  loggerHandlerKey = container.loggerHandlerKey;
}

function setNoLogs(): void {
  noLog = false;
}
</script>

{#if connectionInfo}
  <DetailsPage title={connectionInfo.displayName}>
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
        {#if connectionInfo.shellAccess}
          <Tab
            title="Terminal"
            selected={isTabSelected($router.path, 'terminal')}
            url={getTabUrl($router.path, 'terminal')} />
        {/if}
      {/if}
    {/snippet}
    {#snippet contentSnippet()}
      {#if connectionInfo}
        <div class="h-full">
          <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
            <PreferencesContainerConnectionDetailsSummary
              containerConnectionInfo={connectionInfo}
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
          {#if providerInfo}
            <Route path="/terminal" breadcrumb="Terminal" navigationHint="tab">
              <PreferencesConnectionDetailsTerminal
                provider={providerInfo}
                connectionInfo={connectionInfo}
                screenReaderMode={true} />
            </Route>
          {/if}
        </div>
      {/if}
    {/snippet}
  </DetailsPage>
{/if}
