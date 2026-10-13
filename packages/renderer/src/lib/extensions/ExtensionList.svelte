<script lang="ts">
import { faCloudDownload } from '@fortawesome/free-solid-svg-icons';
import { Button, FilteredEmptyScreen, NavPage } from '@podman-desktop/ui-svelte';

import type { ExtensionListScreen } from '/@/lib/extensions/extension-list';
import InstalledExtensionList from '/@/lib/extensions/InstalledExtensionList.svelte';
import ExtensionIcon from '/@/lib/images/ExtensionIcon.svelte';
import { SearchTermParser } from '/@/lib/search/search-term-parser';
import { type CombinedExtensionInfoUI, combinedInstalledExtensions } from '/@/stores/all-installed-extensions';
import { catalogExtensionInfos } from '/@/stores/catalog-extensions';
import { featuredExtensionInfos } from '/@/stores/featuredExtensions';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import CatalogExtensionPage from './CatalogExtensionPage.svelte';
import DevelopmentExtensionList from './dev-mode/DevelopmentExtensionList.svelte';
import { ExtensionsUtils } from './extensions-utils';
import InstallManuallyExtensionModal from './InstallManuallyExtensionModal.svelte';

interface Props {
  searchTerm?: string;
  screen?: ExtensionListScreen;
}

let { searchTerm = '', screen = 'installed' }: Props = $props();

const extensionsUtils = new ExtensionsUtils();

let enableCustomExtensions = $derived(
  (await window.getConfigurationValue('extensions.customExtensions.enabled')) ?? true,
);

let enableLocalExtensions = $derived(
  (await window.getConfigurationValue('extensions.localExtensions.enabled')) ?? true,
);

let enableCatalog = $derived((await window.getConfigurationValue('extensions.catalog.enabled')) ?? true);

const filteredInstalledExtensions: CombinedExtensionInfoUI[] = $derived(
  extensionsUtils.filterInstalledExtensions($combinedInstalledExtensions, searchTerm),
);

let filteredInstalledItems: number = $derived($combinedInstalledExtensions.length - filteredInstalledExtensions.length);
// combine data from featured extensions and catalog extension
// need to add in the catalog extension a flag to know if extension is featured or not
// and featured extensions need to be displayed first
const enhancedCatalogExtensions: CatalogExtensionInfoUI[] = $derived(
  extensionsUtils.extractCatalogExtensions(
    $catalogExtensionInfos,
    $featuredExtensionInfos,
    $combinedInstalledExtensions,
  ),
);

function closeModal(): void {
  installManualImageModal = false;
}

let installManualImageModal: boolean = $state(false);

function changeScreen(newScreen: 'installed' | 'catalog' | 'development'): void {
  if (screen === newScreen) {
    return;
  }
  screen = newScreen;
  searchTerm = new SearchTermParser(searchTerm, ExtensionsUtils.CATALOG_FILTERS).terms.join(' ');
}
</script>

<NavPage bind:searchTerm={searchTerm} title="extensions" searchEnabled={screen !== 'catalog'}>
  {#snippet additionalActions()}
    {#if enableCustomExtensions}
      <Button
        on:click={(): void => {
          installManualImageModal = true;
        }}
        icon={faCloudDownload}
        title="Install manually an extension"
        aria-label="Install custom">Install custom...</Button>
    {/if}
  {/snippet}

  {#snippet bottomAdditionalActions()}
    <!-- display filter out items-->
    {#if filteredInstalledItems > 0 && screen === 'installed'}
      <div class="text-sm text-[var(--pd-content-text)]">
        Filtered out {filteredInstalledItems} items of {$combinedInstalledExtensions.length}
      </div>
    {/if}
  {/snippet}

  {#snippet tabs()}
    <Button
      type="tab"
      on:click={(): void => {
        changeScreen('installed');
      }}
      selected={screen === 'installed'}>Installed</Button>
    {#if enableCatalog}
      <Button
        type="tab"
        on:click={(): void => {
          changeScreen('catalog');
        }}
        selected={screen === 'catalog'}>Catalog</Button>
    {/if}
    {#if enableLocalExtensions}
      <Button
        type="tab"
        on:click={(): void => {
          changeScreen('development');
        }}
        selected={screen === 'development'}>Local extensions</Button>
    {/if}
 {/snippet}

  {#snippet content()}
  <div class="flex min-w-full grow">
    {#if screen === 'installed'}
      {#if searchTerm && filteredInstalledExtensions.length === 0}
        <FilteredEmptyScreen
          icon={ExtensionIcon}
          kind="extensions"
          searchTerm={searchTerm}
          on:resetFilter={(): string => (searchTerm = '')} />
      {/if}
      <InstalledExtensionList extensionInfos={filteredInstalledExtensions} />
    {:else if screen === 'catalog' && enableCatalog}
      <CatalogExtensionPage catalogExtensions={enhancedCatalogExtensions} {searchTerm} />
    {:else if screen === 'development' && enableLocalExtensions}
      <DevelopmentExtensionList />
    {/if}
  </div>
  {/snippet}
</NavPage>

{#if installManualImageModal}
  <InstallManuallyExtensionModal
    closeCallback={closeModal} />
{/if}
