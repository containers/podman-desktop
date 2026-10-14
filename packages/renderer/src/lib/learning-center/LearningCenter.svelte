<script lang="ts">
import type { Guide } from '@desktop-framework/api/learning-center';
import { Carousel, Expandable } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import { ExpandableState } from '/@/lib/ui/expandable-state.svelte';

import GuideCard from './GuideCard.svelte';

let guides: Guide[] = $state([]);

const expandableState = new ExpandableState('learningCenter.expanded');

onMount(async () => {
  guides = await window.listGuides();
});
</script>

{#snippet card(guide: Guide)}
  <GuideCard guide={guide} />
{/snippet}


<div class="flex flex-1 flex-col bg-[var(--pd-content-card-bg)] p-5 rounded-lg">
  <Expandable bind:initialized={expandableState.initialized} bind:expanded={expandableState.expanded} onclick={expandableState.toggle.bind(expandableState)}>
    <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
    {#snippet title()}<div class="text-lg font-semibold text-[var(--pd-content-card-header-text)]">Learning Center</div>{/snippet}
    <div class="pt-2">
      <Carousel cards={guides} {card} />
    </div>
  </Expandable>
</div>
