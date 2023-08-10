<script lang="ts">
export let title: string;
export let searchTerm = '';
export let searchEnabled = true;
</script>

<div class="flex flex-col w-full h-full shadow-pageheader">
  <div class="flex flex-col w-full h-full pt-4" role="region" aria-label="{title}">
    <div class="flex pb-2" role="region" aria-label="header">
      <div class="px-5">
        <h1 class="text-xl first-letter:uppercase">{title}</h1>
      </div>
      <div class="flex flex-1 justify-end">
        <div class="px-5" role="group" aria-label="additionalActions">
          <slot name="additional-actions">&nbsp;</slot>
        </div>
      </div>
    </div>
    {#if searchEnabled}
      <div class="flex flex-row pb-4" role="region" aria-label="search">
        <div class="pl-5 lg:w-[35rem] w-[22rem]">
          <div class="flex items-center bg-charcoal-800 text-gray-700 rounded-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 ml-2 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              bind:value="{searchTerm}"
              type="text"
              name="containerSearchName"
              placeholder="Search {title}...."
              class="w-full py-2 outline-none text-sm bg-charcoal-800 rounded-sm text-gray-700 placeholder-gray-700" />
          </div>
        </div>
        <div class="flex flex-1 px-5" role="group" aria-label="bottomAdditionalActions">
          <slot name="bottom-additional-actions">&nbsp;</slot>
        </div>
      </div>
    {/if}

    <div class="flex w-full h-full overflow-auto" role="region" aria-label="content">
      <slot name="content" />
    </div>
  </div>
</div>
