<script lang="ts">
import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';

export let provider: ProviderInfo;
</script>

<div class="p-2 flex flex-col bg-zinc-800 rounded-lg">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center">
    <p class="text-xl text-gray-300">
      {provider.name} is starting...
    </p>
    {#if provider.version}
      <p class="text-base capitalize font-semibold text-gray-400">
        version {provider.version}
      </p>
    {/if}
    {#if provider.containerConnections.length > 0}
      <div class="flex flex-row text-xs text-gray-500 mt-4">
        <p>
          {provider.containerConnections.map(c => c.name).join(', ')}
        </p>
      </div>
    {/if}
  </div>
  <ProviderLinks provider="{provider}" />
</div>
