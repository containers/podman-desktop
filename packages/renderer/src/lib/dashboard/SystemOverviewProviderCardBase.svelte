<script lang="ts">
import type { ProviderConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import type { Snippet } from 'svelte';

import Label from '/@/lib/ui/Label.svelte';

import SystemOverviewProviderCardCompact from './SystemOverviewProviderCardCompact.svelte';

interface Props {
  provider: ProviderInfo;
  connection?: ProviderConnectionInfo;
  name?: string;
  version?: string;
  vmType?: string;
  subtitle?: Snippet;
  trailing?: Snippet;
  actions?: Snippet;
  children?: Snippet;
}

let { provider, connection, name, version, vmType, subtitle, trailing, actions, children }: Props = $props();

let resolvedVersion = $derived(version ?? provider.version);
let labelText = $derived([vmType, resolvedVersion ? `v${resolvedVersion}` : undefined].filter(Boolean).join(' - '));
</script>

<div class="flex flex-col gap-3 rounded-lg p-2 bg-[var(--pd-content-card-carousel-card-bg)]">
  <div class="flex flex-row items-center gap-3">
    <SystemOverviewProviderCardCompact {connection} {provider} expanded={false} />

    <div class="flex-1 min-w-0 flex flex-col gap-0.5">
      <div
        class="flex items-center gap-2 text-[var(--pd-content-card-text)] [--pd-label-bg:var(--pd-content-card-bg)] [--pd-label-text:var(--pd-content-text-sub)]">
        <span class="font-medium" aria-label='Connection name'>{name ?? provider.name}</span>
        {#if labelText}
          <span aria-label='Connection version'>
            <Label name={labelText} />
          </span>
        {/if}
      </div>
      {@render subtitle?.()}
    </div>
    {@render trailing?.()}
    {@render actions?.()}
  </div>
  {@render children?.()}
</div>
