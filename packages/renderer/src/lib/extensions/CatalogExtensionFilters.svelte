<script lang="ts">
import { Button, Checkbox, Dropdown, SearchInput } from '@podman-desktop/ui-svelte';

import { CATALOG_INSTALL_STATUS_OPTIONS, CatalogExtensionFilterState } from './catalog-extension-filter-state';

interface Props {
  searchTerm?: string;
  categories?: string[];
  onchange: (searchTerm: string) => void;
}

let { searchTerm = '', categories = [], onchange }: Props = $props();

let filterState = $derived(new CatalogExtensionFilterState(searchTerm, categories));

function handleSearchInput(event: Event): void {
  if (!(event.currentTarget instanceof HTMLInputElement)) {
    return;
  }
  onchange(event.currentTarget.value);
}

function handleInstallFilterChange(value: string): void {
  onchange(filterState.withInstallStatus(value));
}

function handleCategoryFilterChange(value: string): void {
  onchange(filterState.withCategory(value));
}

function handleFeaturedChange(checked: boolean): void {
  onchange(filterState.withFeatured(checked));
}

function clearFilters(): void {
  onchange('');
}
</script>

<div class="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
  <div class="grow shrink basis-40 min-w-40 max-w-72">
    <SearchInput
      {searchTerm}
      title="extensions"
      class="w-full"
      oninput={handleSearchInput} />
  </div>
  <Dropdown
    name="catalogInstallFilter"
    value={filterState.installStatus}
    onChange={handleInstallFilterChange}
    options={CATALOG_INSTALL_STATUS_OPTIONS}
    class="min-w-42"
    ariaLabel="Filter by install status" />
  {#if categories.length > 0}
    <Dropdown
      name="catalogCategoryFilter"
      value={filterState.category}
      onChange={handleCategoryFilterChange}
      options={filterState.categoryOptions}
      class="min-w-42"
      ariaLabel="Filter by category" />
  {/if}
  <Checkbox checked={filterState.featured} onclick={handleFeaturedChange}>Featured</Checkbox>
  {#if filterState.hasActiveFilters}
    <Button type="link" onclick={clearFilters}>Clear</Button>
  {/if}
</div>
