<script lang="ts">
import type { ExtensionDetailsUI } from './extension-details-ui';
import ExtensionDetailsSummaryCardEntry from './InstalledExtensionDetailsSummaryCardEntry.svelte';

export let extensionDetails: ExtensionDetailsUI;
</script>

<div class="order-first lg:order-last w-full lg:w-48 flex flex-row grow justify-end pb-4 lg:pb-0">
  <div
    class="bg-[var(--pd-details-card-bg)] lg:w-40 h-fit lg:ml-4 p-4 rounded-md flex flex-row lg:flex-col w-full space-x-4 lg:space-x-0">
    <ExtensionDetailsSummaryCardEntry label="version" value={extensionDetails.version} />

    <ExtensionDetailsSummaryCardEntry label="released" value={extensionDetails.releaseDate} />

    <ExtensionDetailsSummaryCardEntry label="published by" value={extensionDetails.publisherDisplayName} />

    {#if extensionDetails.categories.length > 0}
      <ExtensionDetailsSummaryCardEntry label="categories" value={extensionDetails.categories.join(', ')} />
    {/if}
  </div>
</div>
