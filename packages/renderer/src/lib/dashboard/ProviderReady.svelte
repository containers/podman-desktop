<script lang="ts">
import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';
import ProviderWarnings from './ProviderWarnings.svelte';

export let provider: ProviderInfo;

let preflightChecks: CheckStatus[] = [];
</script>

<ProviderCard provider="{provider}">
  <svelte:fragment slot="content">
    {#if provider.containerConnections.length > 0}
      <div class="flex flex-row text-xs text-gray-900 mt-4">
        <p>
          {provider.containerConnections.map(c => c.name).join(', ')}
        </p>
      </div>
    {/if}

    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <div class="mt-5 mb-1 w-full flex justify-around">
        <ProviderUpdateButton onPreflightChecks="{checks => (preflightChecks = checks)}" provider="{provider}" />
      </div>
    {/if}
    <PreflightChecks preflightChecks="{preflightChecks}" />

    <ProviderWarnings provider="{provider}" />
  </svelte:fragment>
</ProviderCard>
