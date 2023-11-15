<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';

export let provider: ProviderInfo;
</script>

<div class="p-2 flex flex-col bg-charcoal-800 rounded-lg" role="region" aria-label="{provider.name} Provider">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center" aria-label="Actual State">
    <p class="text-xl text-gray-400">
      {provider.name} is stopped
    </p>
    {#if provider.version}
      <p class="text-base capitalize font-semibold text-gray-700" aria-label="Provider Version">
        version {provider.version}
      </p>
    {/if}
  </div>
  <ProviderLinks provider="{provider}" />
</div>
