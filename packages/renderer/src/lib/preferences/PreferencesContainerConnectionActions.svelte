<script lang="ts">
import { faPlay, faRotateRight, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import LoadingIconButton from '../ui/LoadingIconButton.svelte';
import { ConnectionCallback, eventCollect, startTask } from './preferences-connection-rendering-task';
import { getContainerConnectionName, IContainerRestart, IContainerStatus } from './Util';

export let containerConnectionStatuses: Map<string, IContainerStatus>;
export let provider: ProviderInfo;
export let container: ProviderContainerConnectionInfo;
export let updateContainerStatus: (
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  action?: string,
  error?: string,
) => void;
export let addContainerToRestartingQueue: (container: IContainerRestart) => void;
$: containerConnectionStatus = containerConnectionStatuses;

async function startContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  loggerHandlerKey?: symbol,
): Promise<void> {
  try {
    if (containerConnectionInfo.status === 'stopped') {
      if (!loggerHandlerKey) {
        updateContainerStatus(provider, containerConnectionInfo, 'start');
        loggerHandlerKey = startTask(
          `Start ${provider.name} ${containerConnectionInfo.name}`,
          `/preferences/resources`,
          getLoggerHandler(provider, containerConnectionInfo),
        );
      }
      await window.startProviderConnectionLifecycle(
        provider.internalId,
        containerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function restartContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  if (containerConnectionInfo.status === 'started') {
    updateContainerStatus(provider, containerConnectionInfo, 'restart');
    const loggerHandlerKey = startTask(
      `Restart ${provider.name} ${containerConnectionInfo.name}`,
      `/preferences/resources`,
      getLoggerHandler(provider, containerConnectionInfo),
    );
    addContainerToRestartingQueue({
      container: containerConnectionInfo.name,
      provider: provider.internalId,
      loggerHandlerKey,
    });
    await window.stopProviderConnectionLifecycle(
      provider.internalId,
      containerConnectionInfo,
      loggerHandlerKey,
      eventCollect,
    );
  }
}

async function stopContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  try {
    if (containerConnectionInfo.status === 'started') {
      updateContainerStatus(provider, containerConnectionInfo, 'stop');
      const loggerHandlerKey = startTask(
        `Stop ${provider.name} ${containerConnectionInfo.name}`,
        `/preferences/resources`,
        getLoggerHandler(provider, containerConnectionInfo),
      );
      await window.stopProviderConnectionLifecycle(
        provider.internalId,
        containerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  try {
    if (containerConnectionInfo.status === 'stopped' || containerConnectionInfo.status === 'unknown') {
      updateContainerStatus(provider, containerConnectionInfo, 'delete');
      const loggerHandlerKey = startTask(
        `Delete ${provider.name} ${containerConnectionInfo.name}`,
        `/preferences/resources`,
        getLoggerHandler(provider, containerConnectionInfo),
      );
      await window.deleteProviderConnectionLifecycle(
        provider.internalId,
        containerConnectionInfo,
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
  containerConnectionInfo: ProviderContainerConnectionInfo,
): ConnectionCallback {
  return {
    log: () => {},
    warn: () => {},
    error: args => {
      updateContainerStatus(provider, containerConnectionInfo, undefined, args);
    },
    onEnd: () => {},
  };
}
</script>

{#if containerConnectionStatus.has(getContainerConnectionName(provider, container))}
  {@const state = containerConnectionStatus.get(getContainerConnectionName(provider, container))}
  {#if container.lifecycleMethods && container.lifecycleMethods.length > 0}
    <div class="mt-2 relative">
      <!-- TODO: see action available like machine infos -->
      <div class="flex bg-zinc-900 w-fit rounded-lg m-auto">
        {#if container.lifecycleMethods.includes('start')}
          <div class="ml-2">
            <LoadingIconButton
              clickAction="{() => startContainerProvider(provider, container)}"
              action="start"
              icon="{faPlay}"
              state="{state}"
              leftPosition="left-[0.15rem]" />
          </div>
        {/if}
        {#if container.lifecycleMethods.includes('start') && container.lifecycleMethods.includes('stop')}
          <LoadingIconButton
            clickAction="{() => restartContainerProvider(provider, container)}"
            action="restart"
            icon="{faRotateRight}"
            state="{state}"
            leftPosition="left-1.5" />
        {/if}
        {#if container.lifecycleMethods.includes('stop')}
          <LoadingIconButton
            clickAction="{() => stopContainerProvider(provider, container)}"
            action="stop"
            icon="{faStop}"
            state="{state}"
            leftPosition="left-[0.22rem]" />
        {/if}
        {#if container.lifecycleMethods.includes('delete')}
          <div class="mr-2 text-sm">
            <LoadingIconButton
              clickAction="{() => deleteContainerProvider(provider, container)}"
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
