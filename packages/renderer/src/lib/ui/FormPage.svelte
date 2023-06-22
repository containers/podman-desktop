<script lang="ts">
export let name: string = undefined;
export let title: string;
export let parentName: string = undefined;
export let parentURL: string = undefined;
</script>

<div class="flex flex-col w-full h-full shadow-pageheader">
  <div class="flex flex-row w-full h-fit px-5 py-4">
    <div class="flex flex-col w-full h-fit">
      {#if parentName}
        <div class="flex flew-row items-center">
          <a
            aria-label="back"
            class="text-violet-400 text-base hover:no-underline"
            href="{parentURL}"
            title="Go back to {parentName}">{parentName}</a>
          <div class="text-xl mx-2 text-gray-700">></div>
          <div class="text-sm font-extralight text-gray-700">{name}</div>
        </div>
      {/if}
      <h1 aria-label="{title}" class="text-xl first-letter:uppercase">{title}</h1>
    </div>
    <div class="flex flex-1 justify-end">
      {#if parentURL}
        <a href="{parentURL}" title="Close" class="mt-2 mr-2 text-gray-900">
          <i class="fas fa-times" aria-hidden="true"></i>
        </a>
      {/if}
    </div>
  </div>
  <div class="flex w-full h-full bg-zinc-700 overflow-auto">
    <slot name="content" />
  </div>
</div>
