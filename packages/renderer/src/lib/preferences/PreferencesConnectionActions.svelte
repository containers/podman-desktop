<script lang="ts">
import { faPlay, faRotateRight, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '../../../../main/src/plugin/api/provider-info';
import LoadingIconButton from '../ui/LoadingIconButton.svelte';
import { type ConnectionCallback, eventCollect, startTask } from './preferences-connection-rendering-task';
import { getProviderConnectionName, type IConnectionRestart, type IConnectionStatus } from './Util';

export let connectionStatuses: Map<string, IConnectionStatus>;
export let provider: ProviderInfo;
export let container: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo;
export let updateConnectionStatus: (
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
  action?: string,
  error?: string,
) => void;
export let addConnectionToRestartingQueue: (connection: IConnectionRestart) => void;
$: connectionStatus = connectionStatuses;

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
          `Start ${provider.name} ${providerConnectionInfo.name}`,
          `/preferences/resources`,
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
      `Restart ${provider.name} ${providerConnectionInfo.name}`,
      `/preferences/resources`,
      getLoggerHandler(provider, providerConnectionInfo),
    );
    addConnectionToRestartingQueue({
      container: providerConnectionInfo.name,
      provider: provider.internalId,
      loggerHandlerKey,
    });
    await window.stopProviderConnectionLifecycle(
      provider.internalId,
      providerConnectionInfo,
      loggerHandlerKey,
      eventCollect,
    );
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
        `Stop ${provider.name} ${providerConnectionInfo.name}`,
        `/preferences/resources`,
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

async function deleteConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
): Promise<void> {
  try {
    if (providerConnectionInfo.status === 'stopped' || providerConnectionInfo.status === 'unknown') {
      updateConnectionStatus(provider, providerConnectionInfo, 'delete');
      const loggerHandlerKey = startTask(
        `Delete ${provider.name} ${providerConnectionInfo.name}`,
        `/preferences/resources`,
        getLoggerHandler(provider, providerConnectionInfo),
      );
      await window.deleteProviderConnectionLifecycle(
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

{#if connectionStatus.has(getProviderConnectionName(provider, container))}
  {@const state = connectionStatus.get(getProviderConnectionName(provider, container))}
  {#if container.lifecycleMethods && container.lifecycleMethods.length > 0}
    <div class="mt-2 relative">
      <!-- TODO: see action available like machine infos -->
      <div class="flex bg-zinc-900 w-fit rounded-lg m-auto">
        {#if container.lifecycleMethods.includes('start')}
          <div class="ml-2">
            <LoadingIconButton
              clickAction="{() => startConnectionProvider(provider, container)}"
              action="start"
              icon="{faPlay}"
              state="{state}"
              leftPosition="left-[0.15rem]" />
          </div>
        {/if}
        {#if container.lifecycleMethods.includes('start') && container.lifecycleMethods.includes('stop')}
          <LoadingIconButton
            clickAction="{() => restartConnectionProvider(provider, container)}"
            action="restart"
            icon="{faRotateRight}"
            state="{state}"
            leftPosition="left-1.5" />
        {/if}
        {#if container.lifecycleMethods.includes('stop')}
          <LoadingIconButton
            clickAction="{() => stopConnectionProvider(provider, container)}"
            action="stop"
            icon="{faStop}"
            state="{state}"
            leftPosition="left-[0.22rem]" />
        {/if}
        {#if container.lifecycleMethods.includes('delete')}
          <div class="mr-2 text-sm">
            <LoadingIconButton
              clickAction="{() => deleteConnectionProvider(provider, container)}"
              action="delete"
              icon="{faTrash}"
              state="{state}"
              leftPosition="left-1" />
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}
