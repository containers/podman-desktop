<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@podman-desktop/ui-svelte/icons';

import { providerInfos } from '/@/stores/providers';

interface Props {
  provider: ProviderInfo;
}
let { provider }: Props = $props();

// Retrieve the provider information from the store
let providerInfo: ProviderInfo | undefined = $derived(
  $providerInfos.find(providerSearch => providerSearch.internalId === provider.internalId),
);
</script>

<!-- TODO: Add dismiss button / ignore warning? -->
{#if providerInfo && providerInfo.warnings?.length > 0}
  <div class="flex flex-col items-center text-center mt-3" role="list" aria-label="Provider Warnings">
    {#each providerInfo.warnings as warn, index (index)}
      <div class="flex-row items-center align-middle mt-0.5" role="listitem" aria-label={warn.name}>
        <!-- Make line height center-->
        <span class="ml-1 text-[var(--pd-content-card-text)]">
          <Icon icon={faTriangleExclamation} class="text-[var(--pd-state-warning)] inline" /> {warn.name}:</span>
        <div class="ml-1 text-[var(--pd-content-text)]">
          {warn.details}
        </div>
      </div>
    {/each}
  </div>
{/if}
