<script lang="ts">
import { faCloudDownload } from '@fortawesome/free-solid-svg-icons';
import { derived, type Readable, writable } from 'svelte/store';

import InstalledExtensionList from '/@/lib/extensions/InstalledExtensionList.svelte';
import ExtensionIcon from '/@/lib/images/ExtensionIcon.svelte';
import Button from '/@/lib/ui/Button.svelte';
import FilteredEmptyScreen from '/@/lib/ui/FilteredEmptyScreen.svelte';
import NavPage from '/@/lib/ui/NavPage.svelte';
import { type CombinedExtensionInfoUI, combinedInstalledExtensions } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { featuredExtensionInfos } from '/@/stores/featuredExtensions';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import CatalogExtensionList from './CatalogExtensionList.svelte';
import { ExtensionsUtils } from './extensions-utils';
import InstallManuallyExtensionModal from './InstallManuallyExtensionModal.svelte';

export let searchTerm = '';
const combinedInstalledExtensionSearchPattern = writable('');
$: combinedInstalledExtensionSearchPattern.set(searchTerm);

const extensionsUtils = new ExtensionsUtils();

let filteredItems: number = 0;
$: filteredItems = $combinedInstalledExtensions.length - $filteredInstalledExtensions.length;
const filteredInstalledExtensions: Readable<CombinedExtensionInfoUI[]> = derived(
  [combinedInstalledExtensions, combinedInstalledExtensionSearchPattern],
  ([$combinedInstalledExtensions, $combinedInstalledExtensionSearchPattern]) => {
    return $combinedInstalledExtensions.filter(extension => {
      return extension.displayName.toLowerCase().includes($combinedInstalledExtensionSearchPattern.toLowerCase());
    });
  },
);

// combine data from featured extensions and catalog extension
// need to add in the catalog extension a flag to know if extension is featured or not
// and featured extensions need to be displayed first
const enhancedCatalogExtensions: Readable<CatalogExtensionInfoUI[]> = derived(
  [catalogExtensionInfos, featuredExtensionInfos, combinedInstalledExtensions],
  ([$catalogExtensionInfos, $featuredExtensionInfos, $combinedInstalledExtensions]) => {
    return extensionsUtils.extractCatalogExtensions(
      $catalogExtensionInfos,
      $featuredExtensionInfos,
      $combinedInstalledExtensions,
    );
  },
);

function closeModal() {
  installManualImageModal = false;
}

let screen: 'installed' | 'catalog' = 'installed';

let installManualImageModal: boolean = false;
</script>

<NavPage bind:searchTerm="{searchTerm}" title="extensions">
  <svelte:fragment slot="additional-actions">
    <Button
      on:click="{() => {
        installManualImageModal = true;
      }}"
      icon="{faCloudDownload}"
      title="Install manually an extension">Install custom...</Button>
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    <!-- display filter out items-->
    {#if filteredItems > 0 && screen === 'installed'}
      <div class="text-sm text-gray-400">
        Filtered out {filteredItems} items of {$combinedInstalledExtensions.length}
      </div>
    {/if}
  </svelte:fragment>

  <svelte:fragment slot="tabs">
    <Button
      type="tab"
      on:click="{() => {
        screen = 'installed';
      }}"
      selected="{screen === 'installed'}">Installed</Button>
    <Button
      type="tab"
      on:click="{() => {
        screen = 'catalog';
      }}"
      selected="{screen === 'catalog'}">Catalog</Button>
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    {#if searchTerm && $filteredInstalledExtensions.length === 0}
      <FilteredEmptyScreen
        icon="{ExtensionIcon}"
        kind="extensions"
        searchTerm="{searchTerm}"
        on:resetFilter="{() => (searchTerm = '')}" />
    {/if}

    {#if screen === 'installed'}
      <InstalledExtensionList extensionInfos="{$filteredInstalledExtensions}" />
    {:else}
      <CatalogExtensionList catalogExtensions="{$enhancedCatalogExtensions}" />
    {/if}
  </div>
</NavPage>

{#if installManualImageModal}
  <InstallManuallyExtensionModal
    closeCallback="{() => {
      closeModal();
    }}" />
{/if}
