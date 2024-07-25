<script lang="ts">
import SearchInput from '../inputs/SearchInput.svelte';

export let title: string;
export let searchTerm = '';
export let searchEnabled = true;
</script>

<div class="flex flex-col w-full h-full shadow-pageheader">
  <div class="flex flex-col w-full h-full pt-4" role="region" aria-label={title}>
    <div class="flex pb-2" role="region" aria-label="header">
      <div class="px-5">
        <h1 class="text-xl font-bold capitalize text-[var(--pd-content-header)]">{title}</h1>
      </div>
      <div class="flex flex-1 justify-end">
        <div class="px-5" role="group" aria-label="additionalActions">
          {#if $$slots['additional-actions']}
            <div class="space-x-2 flex flex-nowrap text-[var(--pd-content-text)]">
              <slot name="additional-actions" />
            </div>
          {:else}&nbsp;{/if}
        </div>
      </div>
    </div>
    {#if searchEnabled}
      <div class="flex flex-row pb-4" role="region" aria-label="search">
        <div class="pl-5 w-72">
          <SearchInput bind:searchTerm={searchTerm} title={title} />
        </div>
        <div class="flex flex-1 px-5" role="group" aria-label="bottomAdditionalActions">
          {#if $$slots['bottom-additional-actions']}
            <div class="space-x-2 flex flex-row justify-start items-center w-full text-[var(--pd-content-text)]">
              <slot name="bottom-additional-actions" />
            </div>
          {:else}&nbsp;{/if}
        </div>
      </div>
    {/if}

    {#if $$slots.tabs}
      <div class="flex flex-row mx-5 px-2 mb-2 border-b border-[var(--pd-content-divider)]">
        <slot name="tabs" />
      </div>
    {/if}

    <div class="flex w-full h-full overflow-auto" role="region" aria-label="content">
      <slot name="content" />
    </div>
  </div>
</div>
