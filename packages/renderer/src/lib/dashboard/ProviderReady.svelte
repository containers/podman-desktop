<script lang="ts">
import type { CheckStatus, ProviderInfo } from '/@api/provider-info';

import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';
import ProviderWarnings from './ProviderWarnings.svelte';

export let provider: ProviderInfo;

let preflightChecks: CheckStatus[] = [];
</script>

<ProviderCard provider={provider}>
  <svelte:fragment slot="content">
    {#if provider.containerConnections.length > 0}
      <div class="flex flex-row text-gray-900 w-full lg:w-2/3 justify-center items-center">
        <p>
          {provider.containerConnections.map(c => c.name).join(', ')}
        </p>
      </div>
    {/if}

    <PreflightChecks preflightChecks={preflightChecks} />

    <ProviderWarnings provider={provider} />
  </svelte:fragment>
  <svelte:fragment slot="update">
    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <ProviderUpdateButton onPreflightChecks={checks => (preflightChecks = checks)} provider={provider} />
    {/if}
  </svelte:fragment>
</ProviderCard>
