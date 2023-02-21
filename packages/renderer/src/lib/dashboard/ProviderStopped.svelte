<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';

export let provider: ProviderInfo;
</script>

<div class="p-2 flex flex-col bg-zinc-800 rounded-lg">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center">
    <p class="text-xl text-gray-300">
      {provider.name} is stopped
    </p>
    {#if provider.version}
      <p class="text-base capitalize font-semibold text-gray-400">
        version {provider.version}
      </p>
    {/if}
  </div>
  <ProviderLinks provider="{provider}" />
</div>
