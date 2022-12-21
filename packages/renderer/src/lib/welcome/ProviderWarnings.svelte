<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import type * as extensionApi from '@tmpwip/extension-api';
import { providerInfos } from '../../stores/providers';

export let provider: ProviderInfo;

// Retrieve the provider information from the store
let providerInfo: ProviderInfo;
$: {
  providerInfo = $providerInfos.find(providerSearch => providerSearch.internalId === provider.internalId);
}
</script>

<div class="flex flex-col items-center text-center mt-3">
  <!-- TODO: Add dismiss button / ignore warning? -->
  {#if providerInfo?.warnings?.length > 0}
    {#each providerInfo.warnings as warn}
      <div class="flex-row items-center mt-0.5">
        ⚠️
        <span class="ml-1 text-sm text-gray-200 font-semibold">{warn.name}:</span>
        <span class="ml-1 text-sm text-gray-400">{warn.details}</span>
      </div>
    {/each}
  {/if}
</div>
