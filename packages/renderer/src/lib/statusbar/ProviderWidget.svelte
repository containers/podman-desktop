<script lang="ts">
import { router } from 'tinro';

import type { ProviderInfo } from '/@api/provider-info';

import ProviderIcons from './ProviderIcons.svelte';

let { entry, command = () => router.goto('/preferences/resources') }: { entry: ProviderInfo; command?: () => void } =
  $props();
let statusStyle = $state('bg-gray-900 text-gray-900');

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

$effect(() => {
  if (entry.containerConnections.length > 0) {
    statusStyle = statusesStyle.get(entry.containerConnections[0].status) ?? 'bg-gray-900 text-gray-900';
  } else if (entry.kubernetesConnections.length > 0) {
    statusStyle = statusesStyle.get(entry.kubernetesConnections[0].status) ?? 'bg-gray-900 text-gray-900';
  } else {
    statusStyle = statusesStyle.get(entry.status) ?? 'bg-gray-900 text-gray-900';
  }
});
</script>
  
<button
  onclick={executeCommand}
  class="px-2 py-1 gap-1 flex h-full min-w-fit items-center hover:bg-[var(--pd-statusbar-hover-bg)] hover:cursor-pointer relative text-base text-[var(--pd-button-text)]"
  title={tooltipText(entry)}
  aria-label={entry.name}>
  
  {#if entry.containerConnections.length > 0 || entry.kubernetesConnections.length > 0 || entry.status }
    <div aria-label="Connection Status Icon" title={entry.status} class="w-3 h-3 rounded-full {statusStyle}"></div>
  {/if}
  <ProviderIcons entry={entry} />
  {#if entry.name}
    <span class="whitespace-nowrap h-fit">{entry.name}</span>
  {/if}
</button>
