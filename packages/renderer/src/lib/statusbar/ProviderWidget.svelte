<script lang="ts">
import { Button } from '@podman-desktop/ui-svelte';
import { router } from 'tinro';

import type { ProviderInfo } from '/@api/provider-info';

import IconImage from '../appearance/IconImage.svelte';
import ProviderWidgetStatus from './ProviderWidgetStatus.svelte';

interface Props {
  entry: ProviderInfo;
  command?: () => void;
}

let { entry, command = () => router.goto('/preferences/resources') }: Props = $props();

let tooltipText = $derived.by(() => {
  let tooltip = '';
  if (entry.containerConnections.length > 0) {
    tooltip = entry.containerConnections.map(c => c.name).join(', ');
  } else if (entry.kubernetesConnections.length > 0) {
    tooltip = entry.kubernetesConnections.map(c => c.name).join(', ');
  }
  return tooltip;
});
</script>
  
<Button
  on:click={command}
  class="rounded-none gap-1 flex h-full min-w-fit items-center hover:bg-[var(--pd-statusbar-hover-bg)] hover:cursor-pointer relative text-base text-[var(--pd-button-text)] bg-transparent"
  title={tooltipText}
  aria-label={entry.name}
  padding="px-2 py-1">
  
  {#if entry.containerConnections.length > 0 || entry.kubernetesConnections.length > 0 || entry.status }
    <ProviderWidgetStatus entry={entry} />
  {/if}
  {#if entry.images.icon}
    <IconImage image={entry.images.icon} class="max-h-3 grayscale" alt={entry.name}></IconImage>
  {/if}
  {#if entry.name}
    <span class="whitespace-nowrap h-fit">{entry.name}</span>
  {/if}
</Button>
