<script lang="ts">
import { faEdit, faPlay, faRotateRight, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Buffer } from 'buffer';
import { router } from 'tinro';

import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '/@api/provider-info';

import LoadingIconButton from '../ui/LoadingIconButton.svelte';
import { type ConnectionCallback, eventCollect, startTask } from './preferences-connection-rendering-task';
import { type IConnectionRestart, type IConnectionStatus } from './Util';

export let connectionStatus: IConnectionStatus | undefined;
export let provider: ProviderInfo;
export let connection: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo;
export let updateConnectionStatus: (
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
  action?: string,
  error?: string,
  inProgress?: boolean,
) => void;
export let addConnectionToRestartingQueue: (connection: IConnectionRestart) => void;

async function startConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
  loggerHandlerKey?: symbol,
): Promise<void> {
  try {
    if (providerConnectionInfo.status === 'stopped') {
      if (!loggerHandlerKey) {
        updateConnectionStatus(provider, providerConnectionInfo, 'start');
        loggerHandlerKey = startTask(
          `Start ${providerConnectionInfo.name}`,
          '/preferences/resources',
          getLoggerHandler(provider, providerConnectionInfo),
        );
      }
      await window.startProviderConnectionLifecycle(
        provider.internalId,
        providerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function restartConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): Promise<void> {
  if (providerConnectionInfo.status === 'started') {
    updateConnectionStatus(provider, providerConnectionInfo, 'restart');
    const loggerHandlerKey = startTask(
      `Restart ${providerConnectionInfo.name}`,
      '/preferences/resources',
      getLoggerHandler(provider, providerConnectionInfo),
    );
    await window.stopProviderConnectionLifecycle(
      provider.internalId,
      providerConnectionInfo,
      loggerHandlerKey,
      eventCollect,
    );
    addConnectionToRestartingQueue({
      container: providerConnectionInfo.name,
      provider: provider.internalId,
      loggerHandlerKey,
    });
  }
}

async function stopConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): Promise<void> {
  try {
    if (providerConnectionInfo.status === 'started') {
      updateConnectionStatus(provider, providerConnectionInfo, 'stop');
      const loggerHandlerKey = startTask(
        `Stop ${providerConnectionInfo.name}`,
        '/preferences/resources',
        getLoggerHandler(provider, providerConnectionInfo),
      );
      await window.stopProviderConnectionLifecycle(
        provider.internalId,
        providerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function editConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): Promise<void> {
  router.goto(
    `/preferences/container-connection/edit/${provider.internalId}/${Buffer.from(providerConnectionInfo.name).toString(
      'base64',
    )}`,
  );
}

async function deleteConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): Promise<void> {
  try {
    if (providerConnectionInfo.status === 'stopped' || providerConnectionInfo.status === 'unknown') {
      updateConnectionStatus(provider, providerConnectionInfo, 'delete');
      const loggerHandlerKey = startTask(
        `Delete ${providerConnectionInfo.name}`,
        '/preferences/resources',
        getLoggerHandler(provider, providerConnectionInfo),
      );
      await window.deleteProviderConnectionLifecycle(
        provider.internalId,
        providerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
      updateConnectionStatus(provider, providerConnectionInfo, 'delete', undefined, false);
    }
  } catch (e) {
    updateConnectionStatus(provider, providerConnectionInfo, 'delete', String(e));
    console.error(e);
  }
}

function getLoggerHandler(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): ConnectionCallback {
  return {
    log: () => {},
    warn: () => {},
    error: args => {
      updateConnectionStatus(provider, containerConnectionInfo, undefined, args);
    },
    onEnd: () => {},
  };
}
</script>

{#if connectionStatus}
  {#if connection.lifecycleMethods && connection.lifecycleMethods.length > 0}
    <div class="mt-2 relative">
      <!-- TODO: see action available like machine infos -->
      <div
        class="flex bg-[var(--pd-action-button-details-bg)] w-fit rounded-lg m-auto"
        role="group"
        aria-label="Connection Actions">
        {#if connection.lifecycleMethods.includes('start')}
          <div class="ml-2">
            <LoadingIconButton
              clickAction={() => startConnectionProvider(provider, connection)}
              action="start"
              icon={faPlay}
              state={connectionStatus}
              leftPosition="left-[0.15rem]" />
          </div>
        {/if}
        {#if connection.lifecycleMethods.includes('start') && connection.lifecycleMethods.includes('stop')}
          <LoadingIconButton
            clickAction={() => restartConnectionProvider(provider, connection)}
            action="restart"
            icon={faRotateRight}
            state={connectionStatus}
            leftPosition="left-1.5" />
        {/if}
        {#if connection.lifecycleMethods.includes('stop')}
          <LoadingIconButton
            clickAction={() => stopConnectionProvider(provider, connection)}
            action="stop"
            icon={faStop}
            state={connectionStatus}
            leftPosition="left-[0.22rem]" />
        {/if}
        {#if connection.lifecycleMethods.includes('edit')}
          <LoadingIconButton
            clickAction={() => editConnectionProvider(provider, connection)}
            action="edit"
            icon={faEdit}
            state={connectionStatus}
            leftPosition="left-[0.22rem]" />
        {/if}
        {#if connection.lifecycleMethods.includes('delete')}
          <div class="mr-2 text-sm">
            <LoadingIconButton
              clickAction={() => deleteConnectionProvider(provider, connection)}
              action="delete"
              icon={faTrash}
              state={connectionStatus}
              leftPosition="left-1" />
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}
