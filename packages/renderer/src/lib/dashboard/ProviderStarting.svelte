<script lang="ts">
import type { CheckStatus, ProviderInfo } from '@desktop-framework/api';

import ProviderCard from './ProviderCard.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';

interface Props {
  provider: ProviderInfo;
}
let { provider }: Props = $props();
</script>

<ProviderCard provider={provider}>
  {#snippet content()}
    {#if provider.containerConnections.length > 0}
      <div class="flex flex-row text-[var(--pd-content-text)] mt-4">
        <p>
          {provider.containerConnections.map(c => c.name).join(', ')}
        </p>
      </div>
    {/if}
  {/snippet}
  {#snippet update()}
    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <ProviderUpdateButton onPreflightChecks={(): CheckStatus[] => []} provider={provider} />
    {/if}
  {/snippet}
</ProviderCard>
