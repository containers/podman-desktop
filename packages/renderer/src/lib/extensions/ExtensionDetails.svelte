<script lang="ts">
import { onMount } from 'svelte';
import { derived, type Readable } from 'svelte/store';

import ExtensionIcon from '/@/lib/preferences/ExtensionIcon.svelte';
import { combinedInstalledExtensions } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';

import FeaturedExtensionDownload from '../featured/FeaturedExtensionDownload.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import ExtensionStatus from '../ui/ExtensionStatus.svelte';
import type { ExtensionDetailsUI } from './extension-details-ui';
import { ExtensionUtils } from './extension-utils';
import ExtensionBadge from './ExtensionBadge.svelte';
import ExtensionDetailsReadme from './ExtensionDetailsReadme.svelte';
import ExtensionDetailsSummaryCard from './ExtensionDetailsSummaryCard.svelte';
import InstalledExtensionActions from './InstalledExtensionActions.svelte';

export let extensionId: string;

let extension: ExtensionDetailsUI;

let detailsPage: DetailsPage;
const extensionUtils = new ExtensionUtils();

const extensionDetailStore: Readable<ExtensionDetailsUI | undefined> = derived(
  [catalogExtensionInfos, combinedInstalledExtensions],
  ([$catalogExtensionInfos, $combinedInstalledExtensions]) => {
    return extensionUtils.extractExtensionDetail($catalogExtensionInfos, $combinedInstalledExtensions, extensionId);
  },
);

onMount(() => {
  // loading container info
  return extensionDetailStore.subscribe(value => {
    if (value) {
      extension = value;
    } else if (detailsPage) {
      // the extension has been deleted
      detailsPage.close();
    }
  });
});
</script>

{#if extension}
  <DetailsPage title="{extension.displayName} extension" subtitle="{extension.description}" bind:this="{detailsPage}">
    <div class="flex flex-col w-14 min-h-14 items-baseline" slot="icon">
      <!-- Display icon being installed using base64 -->
      {#if extension.icon}
        <ExtensionIcon extension="{extension}" />
      {:else if extension.iconRef}
        <img src="{extension.iconRef}" alt="{extension.displayName} icon" class="max-w-10 max-h-10" />
      {/if}
      <div class="flex flex-row mt-2">
        <ExtensionStatus status="{extension.type === 'dd' ? 'started' : extension.state}" />
      </div>
    </div>
    <svelte:fragment slot="actions">
      <div class="flex items-center space-x-10 w-full">
        {#if extension.installedExtension}
          <InstalledExtensionActions class="w-48" extension="{extension.installedExtension}" />
        {:else if extension.fetchable}
          <div class="flex flex-1 justify-items-end w-18 flex-col items-end place-content-center">
            <div class="italic text-xs text-gray-700 pb-3">Install this extension with a single click</div>
            <FeaturedExtensionDownload extension="{extension}" />
          </div>
        {/if}
      </div>
    </svelte:fragment>

    <div slot="detail" class="flex">
      <ExtensionBadge class="mt-2" extension="{extension}" />
    </div>

    <svelte:fragment slot="content">
      <div class="flex flex-row w-full h-full p-4">
        <ExtensionDetailsReadme readme="{extension.readme}" />
        <ExtensionDetailsSummaryCard extensionDetails="{extension}" />
      </div>
    </svelte:fragment>
  </DetailsPage>
{/if}
