<script lang="ts">
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons';
import { Button, EmptyScreen } from '@podman-desktop/ui-svelte';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import { catalogListFilters } from './catalog-list-filters.svelte';
import CatalogExtensionFilters from './CatalogExtensionFilters.svelte';
import CatalogExtensionList from './CatalogExtensionList.svelte';

interface Props {
  catalogExtensions: CatalogExtensionInfoUI[];
  searchTerm?: string;
}

let { catalogExtensions, searchTerm = '' }: Props = $props();

$effect(() => {
  if (searchTerm) {
    catalogListFilters.searchTerm = searchTerm;
  }
});

const visibleExtensions = $derived(catalogListFilters.apply(catalogExtensions));

function resetFilters(): void {
  catalogListFilters.reset();
}
</script>

<div class="flex grow flex-col">
  {#if catalogExtensions.length > 0}
    <div
      class="sticky top-0 z-40 mb-1 flex flex-col gap-3 border-b border-(--pd-content-divider) bg-(--pd-content-bg) px-5 pb-3 pt-3">
      <CatalogExtensionFilters {catalogExtensions} />
    </div>
  {/if}

  {#if catalogExtensions.length > 0 && visibleExtensions.length === 0}
    <EmptyScreen
      title="No extensions match your filters"
      message="No extensions match the current search and filters. Try adjusting or clearing them."
      icon={faPuzzlePiece}>
      <div class="flex justify-center gap-2">
        <Button on:click={resetFilters}>Clear filters</Button>
      </div>
    </EmptyScreen>
  {:else}
    <CatalogExtensionList catalogExtensions={visibleExtensions} />
  {/if}
</div>
