<script lang="ts">
import {
  NavigationPage,
  type ProviderConnectionInfo,
  type ProviderInfo,
  type SystemOverviewStatus,
} from '@desktop-framework/api';
import { Button } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import { handleNavigation } from '/@/navigation';
import {
  getConnectionDisplayName,
  getSystemOverviewStatus,
  SYSTEM_OVERVIEW_STATUS,
} from '/@/stores/dashboard/system-overview.svelte';

const STATUS_DOT_CLASS: Record<SystemOverviewStatus, string> = {
  healthy: 'bg-[var(--pd-status-running)]',
  stable: 'bg-[var(--pd-content-divider)]',
  progressing: 'bg-[var(--pd-status-starting)]',
  critical: 'bg-[var(--pd-status-terminated)]',
};

interface Props {
  connection?: ProviderConnectionInfo;
  provider: ProviderInfo;
  expanded?: boolean;
}

let { connection, provider, expanded = true }: Props = $props();

let connectionStatus = $derived(
  connection ? getSystemOverviewStatus(connection.status, connection.error) : SYSTEM_OVERVIEW_STATUS.stable,
);
let connectionName = $derived(connection ? getConnectionDisplayName(connection) : provider.name);

function navigateToConnection(): void {
  if (!connection) {
    handleNavigation({ page: NavigationPage.RESOURCES });
    return;
  }
  switch (connection.connectionType) {
    case 'container':
      handleNavigation({
        page: NavigationPage.CONTAINER_CONNECTION,
        parameters: {
          provider: provider.internalId,
          name: connection.name,
          socketPath: connection.endpoint.socketPath,
        },
      });
      break;
    case 'kubernetes':
      handleNavigation({
        page: NavigationPage.KUBERNETES_CONNECTION,
        parameters: {
          provider: provider.internalId,
          apiURL: connection.endpoint.apiURL,
        },
      });
      break;
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
</script>

<div class="relative flex-shrink-0 inline-flex">
  <span class="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full {STATUS_DOT_CLASS[connectionStatus.status]} z-1"></span>

  {#if expanded}
    <Button type="secondary" onclick={navigateToConnection} title="Navigate to {connectionName}" aria-label="Navigate to {connectionName}" padding="px-2 py-[3px]">
      <div class="flex items-center gap-1.5">
        <div class="flex-shrink-0 w-7 h-7 flex items-center justify-center">
          {#if provider.images?.icon}
            <Icon icon={provider.images.icon} title={provider.name} class="max-w-7 max-h-7 object-contain" />
          {/if}
        </div>
        <span class="text-xs whitespace-nowrap">{connectionName}</span>
      </div>
    </Button>
  {:else}
    <button
      class="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer bg-[var(--pd-content-card-bg)] hover:bg-[var(--pd-content-card-carousel-card-hover-bg)] transition-colors"
      onclick={navigateToConnection}
      aria-label="Navigate to {connectionName}"
      title="Navigate to {connectionName}">
      <div class="flex-shrink-0 w-7 h-7 flex items-center justify-center">
        {#if provider.images?.icon}
          <Icon icon={provider.images.icon} title={provider.name} class="max-w-7 max-h-7 object-contain" />
        {/if}
      </div>
    </button>
  {/if}
</div>
