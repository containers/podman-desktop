<script lang="ts">
import { lastPage, currentPage } from '../../stores/breadcrumb';

export let title: string;
export let showBreadcrumb = true;
</script>

<div class="flex flex-col w-full h-full shadow-pageheader">
  <div class="flex flex-row w-full h-fit px-5 py-4">
    <div class="flex flex-col w-full h-fit">
      {#if showBreadcrumb}
        <div class="flex flew-row items-center">
          <a
            aria-label="back"
            class="text-violet-400 text-base hover:no-underline"
            href="{$lastPage.path}"
            title="Go back to {$lastPage.name}">{$lastPage.name}</a>
          <div class="text-xl mx-2 text-gray-700">></div>
          <div class="text-sm font-extralight text-gray-700">{$currentPage.name}</div>
        </div>
      {/if}
      <div class="flex flex-row items-center pt-1">
        <h1 aria-label="{title}" class="text-xl first-letter:uppercase">{title}</h1>
      </div>
    </div>
    <div class="flex flex-1 justify-end">
      {#if showBreadcrumb}
        <a href="{$lastPage.path}" title="Close" class="mt-2 mr-2 text-gray-900">
          <i class="fas fa-times" aria-hidden="true"></i>
        </a>
      {/if}
    </div>
  </div>
  <div class="flex w-full h-full bg-zinc-700 overflow-auto">
    <slot name="content" />
  </div>
</div>
