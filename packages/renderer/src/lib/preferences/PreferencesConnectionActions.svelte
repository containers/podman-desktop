<script lang="ts">
import type { ProviderConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import { faEdit, faPlay, faRotateRight, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Buffer } from 'buffer';
import type { Snippet } from 'svelte';
import { router } from 'tinro';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import LoadingIconButton from '/@/lib/ui/LoadingIconButton.svelte';

import {
  type ConnectionCallback,
  eventCollect,
  registerConnectionCallback,
} from './preferences-connection-rendering-task';
import { type IConnectionRestart, type IConnectionStatus } from './Util';

interface Props {
  connectionStatus: IConnectionStatus | undefined;
  provider: ProviderInfo;
  connection: ProviderConnectionInfo;
  updateConnectionStatus: (
    provider: ProviderInfo,
    providerConnectionInfo: ProviderConnectionInfo,
    action?: string,
    error?: string,
    inProgress?: boolean,
  ) => void;
  addConnectionToRestartingQueue: (connection: IConnectionRestart) => void;
  advanced_actions?: Snippet;
}

let {
  connectionStatus,
  provider,
  connection,
  updateConnectionStatus,
  addConnectionToRestartingQueue,
  advanced_actions,
}: Props = $props();

async function startConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderConnectionInfo,
  loggerHandlerKey?: symbol,
): Promise<void> {
  try {
    if (providerConnectionInfo.status === 'stopped') {
      if (!loggerHandlerKey) {
        updateConnectionStatus(provider, providerConnectionInfo, 'start');
        loggerHandlerKey = registerConnectionCallback(getLoggerHandler(provider, providerConnectionInfo));
      }
      await window.startProviderConnectionLifecycle(
        provider.internalId,
        $state.snapshot(providerConnectionInfo),
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
  providerConnectionInfo: ProviderConnectionInfo,
): Promise<void> {
  if (providerConnectionInfo.status === 'started') {
    updateConnectionStatus(provider, providerConnectionInfo, 'restart');
    const loggerHandlerKey = registerConnectionCallback(getLoggerHandler(provider, providerConnectionInfo));
    await window.stopProviderConnectionLifecycle(
      provider.internalId,
      $state.snapshot(providerConnectionInfo),
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
  providerConnectionInfo: ProviderConnectionInfo,
): Promise<void> {
  try {
    if (providerConnectionInfo.status === 'started') {
      updateConnectionStatus(provider, providerConnectionInfo, 'stop');
      const loggerHandlerKey = registerConnectionCallback(getLoggerHandler(provider, providerConnectionInfo));
      await window.stopProviderConnectionLifecycle(
        provider.internalId,
        $state.snapshot(providerConnectionInfo),
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
  providerConnectionInfo: ProviderConnectionInfo,
): Promise<void> {
  router.goto(
    `/preferences/container-connection/edit/${provider.internalId}/${Buffer.from(providerConnectionInfo.name).toString(
      'base64',
    )}`,
  );
}

async function deleteConnectionProvider(
  provider: ProviderInfo,
  providerConnectionInfo: ProviderConnectionInfo,
): Promise<void> {
  try {
    if (providerConnectionInfo.status === 'stopped' || providerConnectionInfo.status === 'unknown') {
      updateConnectionStatus(provider, providerConnectionInfo, 'delete');
      const loggerHandlerKey = registerConnectionCallback(getLoggerHandler(provider, providerConnectionInfo));
      await window.deleteProviderConnectionLifecycle(
        provider.internalId,
        $state.snapshot(providerConnectionInfo),
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

function getLoggerHandler(provider: ProviderInfo, containerConnectionInfo: ProviderConnectionInfo): ConnectionCallback {
  return {
    log: (): void => {},
    warn: (): void => {},
    error: (args): void => {
      updateConnectionStatus(provider, containerConnectionInfo, undefined, args);
    },
    onEnd: (): void => {},
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
        {#if connection.canStart}
          <div class="ml-2">
            <LoadingIconButton
              clickAction={(): Promise<void> => startConnectionProvider(provider, connection)}
              action="start"
              icon={faPlay}
              state={connectionStatus} />
          </div>
        {/if}
        {#if connection.canStart && connection.canStop}
          <LoadingIconButton
            clickAction={(): Promise<void> => restartConnectionProvider(provider, connection)}
            action="restart"
            icon={faRotateRight}
            state={connectionStatus}
            />
        {/if}
        {#if connection.canStop}
          <LoadingIconButton
            clickAction={(): Promise<void> => stopConnectionProvider(provider, connection)}
            action="stop"
            icon={faStop}
            state={connectionStatus}
            />
        {/if}
        {#if connection.canEdit}
          <LoadingIconButton
            clickAction={(): Promise<void> => editConnectionProvider(provider, connection)}
            action="edit"
            icon={faEdit}
            state={connectionStatus}
            />
        {/if}
        {#if connection.canDelete}
          <LoadingIconButton
            clickAction={withConfirmation.bind(undefined, deleteConnectionProvider.bind(undefined, provider, connection), `delete ${connection.name}`, { title: 'Delete Connection?', variant: 'delete' })}
            action="delete"
            icon={faTrash}
            state={connectionStatus}
            />
        {/if}
        <div class="mr-2 text-sm">
          {@render advanced_actions?.()}
        </div>
      </div>
    </div>
  {/if}
{/if}
