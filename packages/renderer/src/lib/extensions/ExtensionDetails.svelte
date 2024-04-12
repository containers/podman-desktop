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
import ExtensionBadge from './ExtensionBadge.svelte';
import ExtensionDetailsReadme from './ExtensionDetailsReadme.svelte';
import ExtensionDetailsSummaryCard from './ExtensionDetailsSummaryCard.svelte';
import InstalledExtensionActions from './InstalledExtensionActions.svelte';

export let extensionId: string;

let extension: ExtensionDetailsUI;

let detailsPage: DetailsPage;

const extensionDetailStore: Readable<ExtensionDetailsUI | undefined> = derived(
  [catalogExtensionInfos, combinedInstalledExtensions],
  ([$catalogExtensionInfos, $combinedInstalledExtensions]) => {
    const matchingInstalledExtension = $combinedInstalledExtensions.find(c => c.id === extensionId);
    // is it in the catalog
    const matchingCatalogExtension = $catalogExtensionInfos.find(c => c.id === extensionId);

    // not installed and not in the catalog, return undefined as it is not matching
    if (!matchingCatalogExtension && !matchingInstalledExtension) {
      return undefined;
    }

    let displayName: string;

    let description: string;

    let type: 'dd' | 'pd';

    let removable: boolean;
    let state: string;
    let icon: undefined | string | { light: string; dark: string };
    let iconRef: undefined | string;
    let name: string;
    let readme: { content?: string; uri?: string } = {};

    const nonPreviewVersions = matchingCatalogExtension?.versions.filter(v => v.preview === false) ?? [];
    const latestVersion = nonPreviewVersions.length > 0 ? nonPreviewVersions[0] : undefined;
    const latestVersionNumber = latestVersion ? `v${latestVersion.version}` : '';
    const latestVersionOciLink = latestVersion ? latestVersion.ociUri : undefined;
    const latestVersionIcon = latestVersion ? latestVersion.files.find(f => f.assetType === 'icon')?.data : undefined;
    const latestVersionReadme = latestVersion
      ? latestVersion.files.find(f => f.assetType.toLowerCase() === 'readme')?.data
      : undefined;
    const lastUpdated = latestVersion?.lastUpdated;

    // grab first from installed extension
    if (matchingInstalledExtension) {
      displayName = matchingInstalledExtension.displayName;
      description = matchingInstalledExtension.description;
      type = matchingInstalledExtension.type;
      removable = matchingInstalledExtension.removable;
      state = matchingInstalledExtension.state;
      icon = matchingInstalledExtension.icon;
      name = matchingInstalledExtension.name;
      readme.content = matchingInstalledExtension.readme;
    } else if (matchingCatalogExtension) {
      displayName = matchingCatalogExtension.displayName;
      description = matchingCatalogExtension.shortDescription;
      // catalog only includes Podman Desktop extensions
      type = 'pd';
      removable = true;
      state = 'downloadable';
      name = matchingCatalogExtension.extensionName;

      if (latestVersionReadme) {
        readme = { uri: latestVersionReadme };
      }

      if (latestVersionIcon) {
        iconRef = latestVersionIcon;
      }
    } else {
      displayName = 'Unknown';
      description = '';
      type = 'pd';
      removable = false;
      state = 'unknown';
      name = 'unknown';
    }

    let releaseDate: string = 'N/A';
    if (lastUpdated) {
      releaseDate = lastUpdated.toISOString().split('T')[0];
    }

    let publisherDisplayName = matchingCatalogExtension?.publisherDisplayName ?? 'N/A';

    if (matchingInstalledExtension && !matchingInstalledExtension.removable) {
      publisherDisplayName = 'Podman Desktop (built-in)';
    }

    let categories: string[] = matchingCatalogExtension?.categories ?? [];
    const matchingInstalledExtensionVersion = matchingInstalledExtension?.version
      ? `v${matchingInstalledExtension.version}`
      : undefined;
    let version = matchingInstalledExtensionVersion ?? latestVersionNumber ?? 'N/A';

    const installedExtension = matchingInstalledExtension;

    const fetchLink = latestVersionOciLink ?? '';
    const fetchVersion = latestVersion?.version ?? '';

    const fetchable = fetchLink.length > 0;

    const matchingExtension: ExtensionDetailsUI = {
      id: extensionId,
      displayName,
      description,
      type,
      removable,
      state,
      icon,
      iconRef,
      name,
      readme,
      releaseDate,
      categories,
      publisherDisplayName,
      version,
      installedExtension,
      fetchable,
      fetchLink,
      fetchVersion,
    };

    return matchingExtension;
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
