<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import type { Snippet } from 'svelte';

import ProviderButtonStatus from './ProviderButtonStatus.svelte';

interface Props {
  provider: ProviderInfo;
  onclick: () => void;
  class?: string;
  left?: Snippet<[]>;
}

let { provider, onclick, left, class: className }: Props = $props();

let providerStatus = $derived.by(() => {
  if (provider) {
    if (provider.updateInfo?.version) {
      return 'Update available';
    } else if (provider.containerConnections.length > 0) {
      return provider.containerConnections[0].status;
    } else if (provider.kubernetesConnections.length > 0) {
      return provider.kubernetesConnections[0].status;
    } else if (provider.vmConnections.length > 0) {
      return provider.vmConnections[0].status;
    } else {
      return provider.status;
    }
  } else {
    return 'unknown';
  }
});

let classes = $derived(`max-h-[15px] grayscale ${providerStatus === 'stopped' ? 'brightness-50' : ''}`);
</script>

<button
  onclick={onclick}
  class="px-1 py-px flex flex-row h-full items-center gap-1 min-w-fit hover:bg-[var(--pd-statusbar-hover-bg)] hover:cursor-pointer relative {className}"
  aria-label={provider.name}>
  {@render left?.()}
  {#if provider.images.icon}
    <div class="relative flex h-full items-center">
    {#if typeof provider.images.icon !== 'string' && provider.images.icon.fontId}
      <span role="img" aria-label={provider.name} class="podman-desktop-icon-{provider.images.icon.fontId} {classes}"></span>
    {:else if provider.images.icon}
      <Icon icon={provider.images.icon} class={classes} title={provider.name} />
    {/if}
    <ProviderButtonStatus status={providerStatus} />
    </div>
  {/if}
  {#if provider.name}
    <span class="whitespace-nowrap h-fit">{provider.name}</span>
  {/if}
</button>
