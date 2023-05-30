<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import type * as extensionApi from '@podman-desktop/api';
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
      <div class="flex-row items-center align-middle mt-0.5">
        <!-- Make line height center-->
        <span class="ml-1 text-md text-gray-700">{warn.symbol || '⚠'}</span>
        <span class="ml-1 text-sm text-gray-700">{warn.name}:</span>
        <span class="ml-1 text-sm text-gray-700">{warn.details}</span>
      </div>
    {/each}
  {/if}
</div>
