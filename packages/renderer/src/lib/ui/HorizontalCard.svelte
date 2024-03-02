<script lang="ts">
import CardTitle from './CardTitle.svelte';

export let label: string;
export let title: string;
export let subtitle: string | undefined = undefined;
export let icon: string | { light: string; dark: string } | undefined = undefined;
</script>

<div role="row" class="bg-[var(--pd-invert-content-card-bg)] mb-5 rounded-md p-3 flex flex-col" aria-label="{label}">
  <div class="divide-x divide-[var(--pd-invert-content-card-divide)] flex flex-row">
    <div role="region" aria-label="Title Region">
      <!-- left col: icon/name + actions -->
      <div class="min-w-[170px] max-w-[200px]">
        <div class="flex space-x-2">
          <CardTitle title="{title}" subtitle="{subtitle}" icon="{icon}" />
        </div>
        <div class="text-center mt-10">
          <slot name="actions" />
        </div>
      </div>
    </div>
    <!-- content -->
    <div class="divide-[var(--pd-invert-content-card-divide)] ml-2" role="region" aria-label="Content">
      <slot name="content" />
    </div>
  </div>
  <slot name="footer" />
</div>
