<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';

export let provider: ProviderInfo;
</script>

<div class="p-2 flex flex-col bg-zinc-700 rounded-lg">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center">
    <p class="text-xl text-gray-300">
      {provider.name} is running
    </p>
    {#if provider.version}
      <p class="text-base font-semibold text-gray-400">
        version {provider.version}
      </p>
    {/if}
    {#if provider.containerConnections.length > 0}
      <div class="flex flex-row  text-xs text-gray-500 mt-4">
        <p>
          {provider.containerConnections.map(c => c.name).join(', ')}
        </p>
      </div>
    {/if}
  </div>
  {#if provider.updateInfo}
    <div class="mt-10 mb-1  w-full flex  justify-around">
      <ProviderUpdateButton provider="{provider}" />
    </div>
  {/if}
  <ProviderLinks provider="{provider}" />
</div>
