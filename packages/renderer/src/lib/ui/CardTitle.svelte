<script lang="ts">
export let title: string;
export let subtitle: string | undefined = undefined;
export let icon: string | { light: string; dark: string } | undefined = undefined;
</script>

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
    <span class="text-md text-[var(--pd-invert-content-card-header-text)]" aria-label="title">{title}</span>
    {#if subtitle}
      <span class="text-xs text-[var(--pd-invert-content-card-subtitle-text)]" aria-label="subtitle">{subtitle}</span>
    {/if}
  </div>
</div>
