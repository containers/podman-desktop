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
  class="{highlighted ? 'bg-charcoal-600' : 'bg-charcoal-700'} mb-5 rounded-md p-3 flex-nowrap"
  aria-label="{label}">
  <div class="pb-2">
    <div class="flex space-x-2">
      <CardTitle title="{title}" subtitle="{subtitle}" icon="{icon}" />
      <slot name="actions" />
    </div>
    <slot name="subheader" />
  </div>
  <div class="grow flex-column divide-gray-900 text-gray-400">
    <slot name="content" />
  </div>
</div>
