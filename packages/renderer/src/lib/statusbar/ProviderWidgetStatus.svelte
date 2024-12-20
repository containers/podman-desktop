
<script lang="ts">
import type { ProviderStatus } from '@podman-desktop/api';

import type { ProviderInfo } from '/@api/provider-info';

interface Props {
  entry: ProviderInfo;
}

let { entry }: Props = $props();

let providerStatus = $derived.by(() => {
  if (entry.containerConnections.length > 0) {
    return entry.containerConnections[0].status;
  } else if (entry.kubernetesConnections.length > 0) {
    return entry.kubernetesConnections[0].status;
  } else {
    return entry.status;
  }
});

const faRegularIconStatus: ProviderStatus[] = ['ready', 'started', 'stopped', 'error', 'unknown'];
</script>

{#if providerStatus === 'starting' || providerStatus === 'stopping'}
  <div aria-label="Connection Status Icon" title={providerStatus} class="w-3 h-3 rounded-full animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent"></div>
{:else}
  <div aria-label="Connection Status Icon" title={providerStatus} class="w-3 h-3"
    class:fa-regular={faRegularIconStatus.includes(providerStatus)}
    class:fa={providerStatus === 'not-installed'}
    class:fa-circle-check={providerStatus === 'ready' || providerStatus === 'started'}
    class:fa-circle-dot={providerStatus === 'stopped'}
    class:fa-circle-xmark={providerStatus === 'error'}
    class:fa-exclamation-triangle={providerStatus === 'not-installed'}
    class:fa-circle-question={providerStatus === 'unknown'}
    >
  </div>
{/if}
