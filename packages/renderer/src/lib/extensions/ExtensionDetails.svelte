<script lang="ts">
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';
import { derived, type Readable } from 'svelte/store';

import extensionIcon from '/@/lib/images/ExtensionIcon.svelte';
import ExtensionIcon from '/@/lib/preferences/ExtensionIcon.svelte';
import { combinedInstalledExtensions } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';

import FeaturedExtensionDownload from '../featured/FeaturedExtensionDownload.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import ExtensionStatus from '../ui/ExtensionStatus.svelte';
import type { ExtensionDetailsUI } from './extension-details-ui';
import ExtensionBadge from './ExtensionBadge.svelte';
import ExtensionDetailsError from './ExtensionDetailsError.svelte';
import ExtensionDetailsReadme from './ExtensionDetailsReadme.svelte';
import ExtensionDetailsSummaryCard from './ExtensionDetailsSummaryCard.svelte';
import { ExtensionsUtils } from './extensions-utils';
import InstalledExtensionActions from './InstalledExtensionActions.svelte';

export let extensionId: string;

let screen: 'README' | 'ERROR' = 'README';
let detailsPage: DetailsPage;
const extensionsUtils = new ExtensionsUtils();

let extension: Readable<ExtensionDetailsUI | undefined>;

$: extension = derived(
  [catalogExtensionInfos, combinedInstalledExtensions],
  ([$catalogExtensionInfos, $combinedInstalledExtensions]) => {
    return extensionsUtils.extractExtensionDetail(
      $catalogExtensionInfos,
      $combinedInstalledExtensions,
      decodeURIComponent(extensionId),
    );
  },
);
</script>

{#if $extension}
  <DetailsPage title="{$extension.displayName} extension" subtitle={$extension.description} bind:this={detailsPage}>
    <div class="flex flex-col mt-1 items-baseline w-8" slot="icon">
      <div class="w-8 min-h-8">
        <!-- Display icon being installed using base64 -->
        {#if $extension.icon}
          <ExtensionIcon extension={$extension} />
        {:else if $extension.iconRef}
          <img src={$extension.iconRef} alt="{$extension.displayName} icon" class="max-w-8 max-h-8" />
        {/if}
      </div>
      <div class="flex flex-row mt-3">
        <ExtensionStatus status={$extension.type === 'dd' ? 'started' : $extension.state} />
      </div>
    </div>
    <svelte:fragment slot="actions">
      <div class="flex items-center space-x-10 w-full">
        {#if $extension.installedExtension}
          <InstalledExtensionActions class="w-48" extension={$extension.installedExtension} />
        {:else if $extension.fetchable}
          <div class="flex flex-1 justify-items-end w-18 flex-col items-end place-content-center">
            <div class="italic text-sm text-[var(--pd-content-text)] pb-3">
              Install this extension with a single click
            </div>
            <FeaturedExtensionDownload extension={$extension} />
          </div>
        {/if}
      </div>
    </svelte:fragment>

    <div slot="detail" class="flex">
      <ExtensionBadge class="mt-2" extension={$extension} />
    </div>
    <!-- Display tabs only if extension is in error state -->
    <svelte:fragment slot="tabs">
      {#if $extension.state === 'failed'}
        <Button
          type="tab"
          on:click={() => {
            screen = 'README';
          }}
          selected={screen === 'README'}>Readme</Button>
        <Button
          type="tab"
          on:click={() => {
            screen = 'ERROR';
          }}
          selected={screen === 'ERROR'}>Error</Button>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="content">
      <div class="flex w-full h-full overflow-y-auto p-5 flex-col lg:flex-row">
        {#if screen === 'README'}
          <ExtensionDetailsSummaryCard extensionDetails={$extension} />
          <ExtensionDetailsReadme readme={$extension.readme} />
        {:else if screen === 'ERROR'}
          <ExtensionDetailsError extension={$extension} />
        {/if}
      </div>
    </svelte:fragment>
  </DetailsPage>
{:else}
  <DetailsPage title="{extensionId} extension" bind:this={detailsPage}>
    <svelte:fragment slot="content">
      <div class="flex w-full h-full">
        <EmptyScreen
          title="Extension not found"
          message="Extension with id '{extensionId}' is not available in the catalog"
          icon={extensionIcon} />
      </div>
    </svelte:fragment>
  </DetailsPage>
{/if}
