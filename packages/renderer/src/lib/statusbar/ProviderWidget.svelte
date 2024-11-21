<script lang="ts">
import { router } from 'tinro';

import type { ProviderInfo } from '/@api/provider-info';

import IconImage from '../appearance/IconImage.svelte';

interface Props {
  entry: ProviderInfo;
  command?: () => void;
}

let { entry, command = () => router.goto('/preferences/resources') }: Props = $props();

let statusStyle = $derived.by(() => {
  if (entry.containerConnections.length > 0) {
    return (
      statusesStyle.get(entry.containerConnections[0].status) ??
      'bg-[var(--pd-status-not-running)] text-[var(--pd-status-not-running)]'
    );
  } else if (entry.kubernetesConnections.length > 0) {
    return (
      statusesStyle.get(entry.kubernetesConnections[0].status) ??
      'bg-[var(--pd-status-not-running)] text-[var(--pd-status-not-running)]'
    );
  } else {
    return statusesStyle.get(entry.status) ?? 'bg-gray-900 text-[var(--pd-content-text)]';
  }
});

function tooltipText(entry: ProviderInfo): string {
  let tooltip = '';
  if (entry.containerConnections.length > 0) {
    tooltip = entry.containerConnections.map(c => c.name).join(', ');
  } else if (entry.kubernetesConnections.length > 0) {
    tooltip = entry.kubernetesConnections.map(c => c.name).join(', ');
  }
  return tooltip;
}

async function executeCommand() {
  command();
}

const statusesStyle = new Map<string, string>([
  ['ready', 'fa-regular fa-circle-check'],
  ['started', 'fa-regular fa-circle-check'],
  ['starting', 'animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent'],
  ['stopped', 'fa-regular fa-circle-dot'],
  ['stopping', 'animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent'],
  ['error', 'fa-regular fa-circle-xmark'],
  ['not-installed', 'fa fa-exclamation-triangle'],
  ['update available', 'fa-regular fa-circle-up'],
  ['unknown', 'fa-regular fa-moon'],
]);
</script>
  
<button
  onclick={executeCommand}
  class="px-2 py-1 gap-1 flex h-full min-w-fit items-center hover:bg-[var(--pd-statusbar-hover-bg)] hover:cursor-pointer relative text-base text-[var(--pd-button-text)]"
  title={tooltipText(entry)}
  aria-label={entry.name}>
  
  {#if entry.containerConnections.length > 0 || entry.kubernetesConnections.length > 0 || entry.status }
    <div aria-label="Connection Status Icon" title={entry.status} class="w-3 h-3 rounded-full {statusStyle}"></div>
  {/if}
  {#if entry.images.icon}
    <IconImage image={entry.images.icon} class="max-h-3 grayscale" alt={entry.name}></IconImage>
  {/if}
  {#if entry.name}
    <span class="whitespace-nowrap h-fit">{entry.name}</span>
  {/if}
</button>
