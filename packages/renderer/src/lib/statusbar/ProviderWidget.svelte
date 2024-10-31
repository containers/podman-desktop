<script lang="ts">
import { router } from 'tinro';

import type { ProviderInfo } from '/@api/provider-info';

import IconImage from '../appearance/IconImage.svelte';

export let entry: ProviderInfo;
export let command = () => router.goto('/preferences/resources');

function tooltipText(entry: ProviderInfo): string {
  let tooltip = '';
  if (entry.containerConnections.length > 0) {
    tooltip = entry.containerConnections.map(c => c.name).join(', ');
  }
  return tooltip;
}

async function executeCommand() {
  command();
}

const statusesStyle = new Map<string, string>([
  ['ready', 'bg-[var(--pd-status-connected)]'],
  ['started', 'bg-[var(--pd-status-running)]'],
  ['starting', 'animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent'],
  ['stopped', 'fa-regular fa-circle-dot'],
  ['stopping', 'animate-spin border border-solid border-[var(--pd-action-button-spinner)] border-t-transparent'],
  ['failed', 'bg-[var(--pd-status-terminated)]'],
  ['not set up', 'fa-regular fa-exclamation-triangle text-[var(--pd-button-text)]'],
  ['update available', 'fa-regular fa-circle-up text-[var(--pd-button-text)]'],
]);

$: statusStyle = statusesStyle.get(entry.status) ?? 'bg-gray-900 text-gray-900';
</script>
  
  <button
    on:click={() => {
      executeCommand();
    }}
    class="px-2 py-1 gap-x-2 flex h-full min-w-fit items-center hover:bg-[var(--pd-statusbar-hover-bg)] hover:cursor-pointer relative inline-block text-base text-[var(--pd-button-text)]"
    title={tooltipText(entry)}>
    {#if entry.status}
        <div aria-label="Connection Status Icon" class="w-3 h-3 rounded-full {statusStyle}"></div>
    {/if}
    {#if entry.images.icon}
      <IconImage image={entry.images.icon} class="max-h-3" alt={entry.name}></IconImage>
    {/if}
    {#if entry.name}
      <span class="ml-1 max-w-[70px] truncate">{entry.name}</span>
    {/if}
  </button>
