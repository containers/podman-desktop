<script lang="ts">
import CardTitle from './CardTitle.svelte';

export let highlighted: boolean = false;
export let label: string = '';
export let icon: string | { light: string; dark: string } | undefined = undefined;
export let title: string;
export let subtitle: string | undefined = undefined;
</script>

<div
  role="row"
  class="{highlighted
    ? 'bg-[var(--pd-invert-content-card-bg)]'
    : 'bg-[var(--pd-invert-content-card-bg-highlighted)]'} mb-5 rounded-md p-3 flex-nowrap"
  aria-label="{label}">
  <div class="pb-2">
    <div class="flex space-x-2">
      <CardTitle title="{title}" subtitle="{subtitle}" icon="{icon}" />
      <slot name="actions" />
    </div>
    <slot name="subheader" />
  </div>
  <div class="grow flex-column divide-[var(--pd-invert-content-card-divide)] text-[var(--pd-invert-content-card-text)]">
    <slot name="content" />
  </div>
</div>
