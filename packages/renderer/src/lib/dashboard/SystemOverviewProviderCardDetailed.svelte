<script lang="ts">
import {
  NavigationPage,
  type ProviderConnectionInfo,
  type ProviderContainerConnectionInfo,
  type ProviderInfo,
} from '@desktop-framework/api';
import { Button } from '@podman-desktop/ui-svelte';

import SystemOverviewProviderCardBase from '/@/lib/dashboard/SystemOverviewProviderCardBase.svelte';
import SystemOverviewProviderCardCompact from '/@/lib/dashboard/SystemOverviewProviderCardCompact.svelte';
import SystemOverviewResourceUsage from '/@/lib/dashboard/SystemOverviewResourceUsage.svelte';
import { handleNavigation } from '/@/navigation';
import { getConnectionDisplayName, getSystemOverviewStatus } from '/@/stores/dashboard/system-overview.svelte';

import {
  getConnectionStatusConfig,
  hasStartLifecycle,
  startConnection,
  STATUS_TEXT_CLASS,
} from './system-overview-utils.svelte';

export type ChildConnection = {
  connection: ProviderConnectionInfo;
  provider: ProviderInfo;
};

interface Props {
  connection: ProviderConnectionInfo;
  provider: ProviderInfo;
  childConnections?: ChildConnection[];
}

let { connection, provider, childConnections = [] }: Props = $props();
let errorMessage = $state<string | undefined>(undefined);

let connectionStatus = $derived(getSystemOverviewStatus(connection.status, connection.error));
let statusConfig = $derived(getConnectionStatusConfig(connection.status, provider, connection.error));
let displayName = $derived(getConnectionDisplayName(connection));

let vmType = $derived.by((): string | undefined => {
  if (connection.connectionType === 'container') {
    return connection.vmType?.name;
  }
  return undefined;
});

function navigateToConnection(): void {
  switch (connection.connectionType) {
    case 'container': {
      handleNavigation({
        page: NavigationPage.CONTAINER_CONNECTION,
        parameters: {
          provider: provider.internalId,
          name: connection.name,
          socketPath: connection.endpoint.socketPath,
        },
      });
      break;
    }
    case 'kubernetes': {
      handleNavigation({
        page: NavigationPage.KUBERNETES_CONNECTION,
        parameters: {
          provider: provider.internalId,
          apiURL: connection.endpoint.apiURL,
        },
      });
      break;
    }
    case 'vm':
      handleNavigation({
        page: NavigationPage.VM_CONNECTION,
        parameters: {
          provider: provider.internalId,
          name: connection.name,
        },
      });
      break;
  }
}

async function handleActionButtonClick(): Promise<void> {
  try {
    errorMessage = undefined;
    const canStart = (connection.status === 'stopped' || !!connection.error) && hasStartLifecycle(provider);
    if (canStart) {
      await startConnection(provider.internalId, $state.snapshot(connection));
      await window.telemetryTrack('dashboard.healthCard.provider.started', { providerName: provider.name });
    } else {
      navigateToConnection();
    }
  } catch (error: unknown) {
    console.error(`Error handling action button click: ${error}`);
    errorMessage = error instanceof Error ? error.message : String(error);
  }
}
</script>

<SystemOverviewProviderCardBase {provider} {connection} name={displayName} version={provider.version} {vmType}>
  {#snippet subtitle()}
    <div class="flex items-center gap-1.5 mt-0.5">
      <span class="text-sm {STATUS_TEXT_CLASS[connectionStatus.status]}" aria-label='Connection status'>{statusConfig.label}</span>
      {#if connectionStatus.status === 'stable'}
        <div class="text-sm text-[var(--pd-content-text-sub)]">
          -
          {#if connection.connectionType === 'container'}
            Required to run containers and pods
          {:else if connection.connectionType === 'kubernetes'}
            Start to deploy Kubernetes workloads locally
          {:else}
            Not running
          {/if}
        </div>
      {/if}
    </div>
  {/snippet}

  {#snippet actions()}
    {#if connection.connectionType === 'container' && connection.status === 'started'}
      <SystemOverviewResourceUsage {provider} connection={connection as ProviderContainerConnectionInfo} />
    {:else if connection.error ?? (connection.status !== 'starting' && connection.status !== 'stopping')}
      <Button type={statusConfig.buttonType} onclick={handleActionButtonClick}>
        {statusConfig.buttonText}
      </Button>
    {/if}
  {/snippet}

  {#if provider.warnings.length || (connection.error ?? errorMessage)}
    <div class="flex items-center gap-1.5 text-sm text-[var(--pd-status-terminated)]" aria-label='Connection error'>
      {#each provider.warnings as warning, index (index)}
        {warning.details ?? warning.name}
      {/each}
      {#if connection.error}
        {connection.error}
      {:else if errorMessage}
        {errorMessage}
      {/if}
    </div>
  {/if}

  {#if childConnections.length > 0}
    <div class="flex flex-wrap items-center gap-2">
      {#each childConnections as { connection: childConnection, provider: childProvider } (childProvider.id + ':' + childConnection.name)}
        <SystemOverviewProviderCardCompact connection={childConnection} provider={childProvider} />
      {/each}
    </div>
  {/if}
</SystemOverviewProviderCardBase>
