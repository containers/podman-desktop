<script lang="ts">
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import CatalogExtension from './CatalogExtension.svelte';

export let catalogExtensions: CatalogExtensionInfoUI[];
export let title: string = 'Available extensions';
export let showEmptyScreen: boolean = true;
export let oninstall: (extensionId: string) => void = () => {};
export let ondetails: (extensionId: string) => void = () => {};

async function fetchCatalog() {
  try {
    await window.refreshCatalogExtensions();
  } catch (error) {
    window.showMessageBox({
      type: 'error',
      title: 'Error',
      message: 'Failed to refresh the catalog',
      detail: String(error),
    });
  }
}
</script>

<div class="flex flex-col grow px-5 py-3">
  {#if catalogExtensions.length > 0}
    <div class="mb-4 flex flex-row">
      <div class="flex items-center text-[var(--pd-content-header)]">{title}</div>
      <div class="flex-1 text-right">
        <Button type="link" on:click={() => fetchCatalog()}>Refresh the catalog</Button>
      </div>
    </div>
  {:else if showEmptyScreen}
    <EmptyScreen
      title="No extensions in the catalog"
      message="No extensions from the catalog. It seems that the internet connection was not available to download the catalog."
      icon={faPuzzlePiece}>
      <div class="flex gap-2 justify-center">
        <Button type="link" on:click={() => fetchCatalog()}>Refresh the catalog</Button>
      </div>
    </EmptyScreen>
  {/if}

  <div class="flex flex-col w-full">
    <div
      class="grid min-[920px]:grid-cols-2 min-[1180px]:grid-cols-3 gap-3"
      role="region"
      aria-label="Catalog Extensions">
      {#each catalogExtensions as catalogExtension (catalogExtension.id)}
        <CatalogExtension ondetails={ondetails} oninstall={oninstall} catalogExtensionUI={catalogExtension} />
      {/each}
    </div>
  </div>
</div>
