<script lang="ts">
import type { ProviderInfo } from '/@api/provider-info';

import ProviderCard from './ProviderCard.svelte';

export let provider: ProviderInfo;
</script>

<ProviderCard provider={provider}>
  <svelte:fragment slot="content">
    {#if provider.containerConnections.length > 0}
      <div class="flex flex-row text-gray-900 mt-4">
        <p>
          {provider.containerConnections.map(c => c.name).join(', ')}
        </p>
      </div>
    {/if}
  </svelte:fragment>
</ProviderCard>
