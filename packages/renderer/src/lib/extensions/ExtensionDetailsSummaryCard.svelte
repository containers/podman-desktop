<script lang="ts">
import type { ExtensionDetailsUI } from './extension-details-ui';
import ExtensionDetailsSummaryCardEntry from './InstalledExtensionDetailsSummaryCardEntry.svelte';

export let extensionDetails: ExtensionDetailsUI;
</script>

<div class="w-48 flex flex-row grow justify-end">
  <div class="bg-charcoal-600 w-40 h-fit mx-4 p-4 rounded-md flex flex-col">
    <ExtensionDetailsSummaryCardEntry label="version" value="{extensionDetails.version}" />

    <ExtensionDetailsSummaryCardEntry label="released" value="{extensionDetails.releaseDate}" />

    <ExtensionDetailsSummaryCardEntry label="published by" value="{extensionDetails.publisherDisplayName}" />

    {#if extensionDetails.categories.length > 0}
      <ExtensionDetailsSummaryCardEntry label="categories" value="{extensionDetails.categories.join(', ')}" />
    {/if}
  </div>
</div>
