<script lang="ts">
import { derived, type Readable } from 'svelte/store';

import { combinedInstalledExtensions } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { featuredExtensionInfos } from '/@/stores/featuredExtensions';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import CatalogExtensionList from './CatalogExtensionList.svelte';
import { ExtensionsUtils } from './extensions-utils';

// restricted category to display
export let category: string | undefined = undefined;
export let keywords: string[] = [];
export let title = 'Available extensions';
export let showEmptyScreen: boolean = true;
export let oninstall: (extensionId: string) => void = () => {};
export let ondetails: (extensionId: string) => void = () => {};

// show installed extensions
export let showInstalled: boolean = true;

const extensionsUtils = new ExtensionsUtils();

const catalogExtensions: Readable<CatalogExtensionInfoUI[]> = derived(
  [catalogExtensionInfos, featuredExtensionInfos, combinedInstalledExtensions],
  ([$catalogExtensionInfos, $featuredExtensionInfos, $combinedInstalledExtensions]) => {
    if (category) {
      const filteredCategory = category;
      $catalogExtensionInfos = $catalogExtensionInfos.filter(catalogExtension =>
        catalogExtension.categories.includes(filteredCategory),
      );
    }
    for (const keyword of keywords) {
      const filteredKeyword = keyword;
      $catalogExtensionInfos = $catalogExtensionInfos.filter(catalogExtension =>
        catalogExtension.keywords.includes(filteredKeyword),
      );
    }
    if (!showInstalled) {
      $catalogExtensionInfos = $catalogExtensionInfos.filter(
        catalogExtension =>
          !$combinedInstalledExtensions.some(installedExtension => installedExtension.id === catalogExtension.id),
      );
    }

    return extensionsUtils.extractCatalogExtensions(
      $catalogExtensionInfos,
      $featuredExtensionInfos,
      $combinedInstalledExtensions,
    );
  },
);
</script>

<div class="flex bg-[var(--pd-content-bg)] text-left">
  <CatalogExtensionList
    oninstall={oninstall}
    ondetails={ondetails}
    title={title}
    showEmptyScreen={showEmptyScreen}
    catalogExtensions={$catalogExtensions} />
</div>
