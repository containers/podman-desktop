<script lang="ts">
import { Button, Dropdown, SearchInput } from '@podman-desktop/ui-svelte';

import type { CatalogExtensionInfoUI } from './catalog-extension-info-ui';
import { catalogListFilters } from './catalog-list-filters.svelte';
import ExtensionFilterCheckbox from './ExtensionFilterCheckbox.svelte';
import { ExtensionsUtils } from './extensions-utils';

interface Props {
  catalogExtensions: CatalogExtensionInfoUI[];
}

let { catalogExtensions }: Props = $props();

const extensionsUtils = new ExtensionsUtils();

const categories = $derived(extensionsUtils.collectCatalogCategories(catalogExtensions));
const filters = $derived(catalogListFilters.value);

const installOptions = [
  { value: 'all', label: 'All statuses' },
  { value: 'installed', label: 'Installed' },
  { value: 'not-installed', label: 'Not installed' },
];

let installFilterValue = $state('all');

const categoryOptions = $derived([
  { value: '', label: 'All categories' },
  ...categories.map(category => ({ value: category, label: category })),
]);

let categoryFilterValue = $state('');

$effect(() => {
  installFilterValue = filters.installed === true ? 'installed' : filters.installed === false ? 'not-installed' : 'all';
  categoryFilterValue = filters.category ?? '';
});

function handleInstallFilterChange(value: string): void {
  installFilterValue = value;
  if (value === 'installed') {
    catalogListFilters.setInstalled(true);
  } else if (value === 'not-installed') {
    catalogListFilters.setInstalled(false);
  } else {
    catalogListFilters.setInstalled(undefined);
  }
}

function handleCategoryFilterChange(value: string): void {
  categoryFilterValue = value;
  catalogListFilters.setCategory(value || undefined);
}

const hasActiveFilters = $derived(catalogListFilters.hasActiveFilters());

function clearAll(): void {
  catalogListFilters.reset();
}

function toggleFeatured(): void {
  catalogListFilters.toggleFeatured();
}
</script>

<div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
  <div class="relative z-50 grow shrink basis-40 min-w-40 max-w-72">
    <SearchInput bind:searchTerm={catalogListFilters.searchTerm} title="extensions" class="w-full" />
  </div>
  <div class="relative z-50">
    <Dropdown
      name="catalogInstallFilter"
      bind:value={installFilterValue}
      onChange={handleInstallFilterChange}
      options={installOptions}
      class="min-w-[10.5rem]"
      ariaLabel="Filter by install status" />
  </div>
  {#if categories.length > 0}
    <div class="relative z-50">
      <Dropdown
        name="catalogCategoryFilter"
        bind:value={categoryFilterValue}
        onChange={handleCategoryFilterChange}
        options={categoryOptions}
        class="min-w-[10.5rem]"
        ariaLabel="Filter by category" />
    </div>
  {/if}
  <div class="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 pl-1">
    <ExtensionFilterCheckbox
      checked={filters.featured === true}
      label="Featured"
      onToggle={toggleFeatured} />
  </div>
  {#if hasActiveFilters}
    <Button type="link" on:click={clearAll}>Clear</Button>
  {/if}
</div>
