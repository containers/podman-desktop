<script lang="ts">
import type { CheckStatus, ProviderInfo } from '@desktop-framework/api';

import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';
import ProviderWarnings from './ProviderWarnings.svelte';

interface Props {
  provider: ProviderInfo;
}
let { provider }: Props = $props();

let preflightChecks: CheckStatus[] = $state([]);
</script>

<ProviderCard provider={provider}>
  {#snippet content()}
    {#if provider.containerConnections.length > 0}
      <div class="flex flex-row text-[var(--pd-content-text)] w-full lg:w-2/3 justify-center items-center">
        <p>
          {provider.containerConnections.map(c => c.name).join(', ')}
        </p>
      </div>
    {/if}

    <PreflightChecks preflightChecks={preflightChecks} />

    <ProviderWarnings provider={provider} />
  {/snippet}
  {#snippet update()}
    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <ProviderUpdateButton onPreflightChecks={(checks): CheckStatus[] => (preflightChecks = checks)} provider={provider} />
    {/if}
  {/snippet}
</ProviderCard>
