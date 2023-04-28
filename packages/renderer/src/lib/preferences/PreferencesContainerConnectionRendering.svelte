<script lang="ts">
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

import { Buffer } from 'buffer';
import { providerInfos } from '../../stores/providers';
import { onDestroy, onMount } from 'svelte';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { router } from 'tinro';
import { getProviderConnectionName, writeToTerminal } from './Util';
import type { IConnectionRestart, IConnectionStatus } from './Util';
import Route from '../../Route.svelte';
import { eventCollect } from './preferences-connection-rendering-task';
import type { ConnectionCallback } from './preferences-connection-rendering-task';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import type { Unsubscriber } from 'svelte/store';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import PreferencesContainerConnectionDetailsSummary from './PreferencesContainerConnectionDetailsSummary.svelte';
import PreferencesConnectionDetailsLogs from './PreferencesConnectionDetailsLogs.svelte';
import { TerminalSettings } from '../../../../main/src/plugin/terminal-settings';
import { Terminal } from 'xterm';
import { getPanelDetailColor } from '../color/color';
import Tab from '../ui/Tab.svelte';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let connection: string = undefined;

const socketPath: string = Buffer.from(connection, 'base64').toString();
$: connectionStatus = new Map<string, IConnectionStatus>();
let logsTerminal: Terminal;
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
  // grab font size
  const fontSize = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.FontSize,
  );
  const lineHeight = await window.getConfigurationValue<number>(
    TerminalSettings.SectionName + '.' + TerminalSettings.LineHeight,
  );
  logsTerminal = new Terminal({
    fontSize,
    lineHeight,
    disableStdin: true,
    theme: {
      background: getPanelDetailColor(),
    },
    convertEol: true,
  });
  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    const providers = providerInfosValue;
    providerInfo = providers.find(provider => provider.internalId === providerInternalId);
    connectionInfo = providerInfo?.containerConnections?.find(
      connection => connection.endpoint.socketPath === socketPath,
    );
    const containerConnectionName = getProviderConnectionName(providerInfo, connectionInfo);
    if (containerConnectionName) {
      if (
        !connectionStatus.has(containerConnectionName) ||
        connectionStatus.get(containerConnectionName).status !== connectionInfo.status
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

function getLoggerHandler(): ConnectionCallback {
  const logHandler = (newContent: any[], colorPrefix: string) => {
    writeToTerminal(logsTerminal, newContent, colorPrefix);
  };
  return {
    log: data => logHandler(data, '\x1b[37m'),
    warn: data => logHandler(data, '\x1b[37m'),
    error: data => logHandler(data, '\x1b[37m'),
    onEnd: () => {},
  };
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
                updateConnectionStatus="{updateConectionStatus}"
                addConnectionToRestartingQueue="{addConnectionToRestartingQueue}"
                loggerHandler="{getLoggerHandler()}" />
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
      </div>

      <Route path="/summary" breadcrumb="Summary">
        <PreferencesContainerConnectionDetailsSummary
          containerConnectionInfo="{connectionInfo}"
          providerInternalId="{providerInternalId}"
          properties="{configurationKeys}" />
      </Route>
      <Route path="/logs" breadcrumb="Logs">
        <PreferencesConnectionDetailsLogs
          connection="{connection}"
          providerInternalId="{providerInternalId}"
          containerConnectioniInfo="{connectionInfo}"
          logsTerminal="{logsTerminal}"
          setNoLogs="{setNoLogs}"
          noLog="{noLog}" />
      </Route>
    </div>
  </Route>
{/if}
