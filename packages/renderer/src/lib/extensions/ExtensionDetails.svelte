<script lang="ts">
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';

import FeaturedExtensionDownload from '/@/lib/featured/FeaturedExtensionDownload.svelte';
import extensionIcon from '/@/lib/images/ExtensionIcon.svelte';
import ExtensionIcon from '/@/lib/preferences/ExtensionIcon.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import ExtensionStatus from '/@/lib/ui/ExtensionStatus.svelte';
import { combinedInstalledExtensions } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';

import type { ExtensionDetailsUI } from './extension-details-ui';
import ExtensionBadge from './ExtensionBadge.svelte';
import ExtensionDetailsError from './ExtensionDetailsError.svelte';
import ExtensionDetailsReadme from './ExtensionDetailsReadme.svelte';
import ExtensionDetailsSummaryCard from './ExtensionDetailsSummaryCard.svelte';
import { ExtensionsUtils } from './extensions-utils';
import InstalledExtensionActions from './InstalledExtensionActions.svelte';

interface Props {
  extensionId: string;
}
let { extensionId }: Props = $props();

let screen = $state<'README' | 'ERROR'>('README');
let detailsPage = $state<DetailsPage>();
const extensionsUtils = new ExtensionsUtils();

let extension: ExtensionDetailsUI | undefined = $derived.by(() => {
  return extensionsUtils.extractExtensionDetail(
    $catalogExtensionInfos,
    $combinedInstalledExtensions,
    decodeURIComponent(extensionId),
  );
});
</script>

{#if extension}
  <DetailsPage title="{extension.displayName} extension" subtitle={extension.description} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      <div class="flex flex-col mt-1 items-baseline w-8">
        <div class="w-8 min-h-8">
          <!-- Display icon being installed using base64 -->
          {#if extension.icon}
            <ExtensionIcon {extension} />
          {:else if extension.iconRef}
            <img src={extension.iconRef} alt="{extension.displayName} icon" class="max-w-8 max-h-8" />
          {/if}
        </div>
        <div class="flex flex-row mt-3">
          <ExtensionStatus status={extension.type === 'dd' ? 'started' : extension.state} />
        </div>
      </div>
    {/snippet}
    {#snippet actionsSnippet()}
      <div class="flex items-center space-x-10 w-full">
        {#if extension.installedExtension}
          <InstalledExtensionActions class="w-48" extension={extension.installedExtension} />
        {:else if extension.fetchable}
          <div class="flex flex-1 justify-items-end w-18 flex-col items-end place-content-center">
            <div class="italic text-sm text-[var(--pd-content-text)] pb-3">
              Install this extension with a single click
            </div>
            <FeaturedExtensionDownload {extension} />
          </div>
        {/if}
      </div>
    {/snippet}

    {#snippet detailSnippet()}
      <div class="flex">
        <ExtensionBadge class="mt-2" {extension} />
      </div>
    {/snippet}
    <!-- Display tabs only if extension is in error state -->
    {#snippet tabsSnippet()}
      {#if extension.state === 'failed'}
        <Button
          type="tab"
          on:click={(): void => {
            screen = 'README';
          }}
          selected={screen === 'README'}>Readme</Button>
        <Button
          type="tab"
          on:click={(): void => {
            screen = 'ERROR';
          }}
          selected={screen === 'ERROR'}>Error</Button>
      {/if}
    {/snippet}

    {#snippet contentSnippet()}
      <div class="flex w-full h-full overflow-y-auto p-5 flex-col lg:flex-row">
        {#if screen === 'README'}
          <ExtensionDetailsSummaryCard extensionDetails={extension} />
          <ExtensionDetailsReadme readme={extension.readme} extensionId={extension.id} />
        {:else if screen === 'ERROR'}
          <ExtensionDetailsError {extension} />
        {/if}
      </div>
    {/snippet}
  </DetailsPage>
{:else}
  <DetailsPage title="{extensionId} extension" bind:this={detailsPage}>
    {#snippet contentSnippet()}
      <div class="flex w-full h-full">
        <EmptyScreen
          title="Extension not found"
          message="Extension with id '{extensionId}' is not available in the catalog"
          icon={extensionIcon} />
      </div>
    {/snippet}
  </DetailsPage>
{/if}
