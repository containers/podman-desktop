<script lang="ts">
export let label: string;
export let title: string;
export let icon: string | { light: string; dark: string } | undefined = undefined;
</script>

<div role="row" class="bg-charcoal-600 mb-5 rounded-md p-3 flex flex-col" aria-label="{label}">
  <div class="divide-x divide-gray-900 flex flex-row">
    <div role="region" aria-label="Title">
      <!-- left col: icon/name + actions -->
      <div class="min-w-[170px] max-w-[200px]">
        <div class="flex">
          {#if icon}
            {#if typeof icon === 'string'}
              <img src="{icon}" alt="{title}" class="max-w-[40px] max-h-[40px] h-full" />
              <!-- TODO check theme used for image, now use dark by default -->
            {:else}
              <img src="{icon.dark}" alt="{title}" aria-label="logo" class="max-w-[40px]" />
            {/if}
          {/if}
          <span class="my-auto text-gray-400 ml-3 break-words">{title}</span>
        </div>
        <div class="text-center mt-10">
          <slot name="actions" />
        </div>
      </div>
    </div>
    <!-- content -->
    <div class="divide-gray-900 ml-2" role="region" aria-label="Content">
      <slot name="content" />
    </div>
  </div>
  <slot name="footer" />
</div>
