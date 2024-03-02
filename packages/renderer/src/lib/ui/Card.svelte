<script lang="ts">
export let highlighted: boolean = false;
export let label: string = '';
export let icon: string | { light: string; dark: string } | undefined = undefined;
export let title: string;
export let subtitle: string | undefined = undefined;
</script>

<div
  role="row"
  class="{highlighted ? 'bg-charcoal-600' : 'bg-charcoal-700'} mb-5 rounded-md p-3 flex-nowrap"
  aria-label="{label}">
  <div class="pb-2">
    <div class="flex space-x-2">
      {#if icon}
        {#if typeof icon === 'string'}
          <img src="{icon}" alt="{title}" aria-label="logo" class="max-w-[40px] max-h-[40px] h-full" />
          <!-- TODO check theme used for image, now use dark by default -->
        {:else}
          <img src="{icon.dark}" alt="{title}" aria-label="logo" class="max-w-[40px]" />
        {/if}
      {/if}

      <!-- Centered items div -->
      <div class="flex-grow flex flex-col justify-center">
        <div class="flex flex-col items-left">
          <span class="text-md" aria-label="context-name">{title}</span>
          {#if subtitle}
            <span class="text-xs text-gray-600" aria-label="subtitle">{subtitle}</span>
          {/if}
        </div>
      </div>
      <slot name="actions" />
    </div>
    <slot name="subheader" />
  </div>
  <div class="grow flex-column divide-gray-900 text-gray-400">
    <slot name="content" />
  </div>
</div>
