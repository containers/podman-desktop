<script lang="ts">
import { onMount } from 'svelte';

import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
import Carousel from '../carousel/Carousel.svelte';
import { fadeSlide } from '../ui/animations';
import GuideCard from './GuideCard.svelte';

let guides: Guide[] = [];
let expanded: boolean = true;

onMount(async () => {
  guides = await window.listGuides();
});
</script>

<div class="flex flex-1 flex-col bg-[var(--pd-content-card-bg)] p-5 rounded-lg">
  <div>
    <button on:click={() => (expanded = !expanded)} class="">
      <div class="flex flex-row space-x-2 items-center text-[var(--pd-content-card-header-text)]">
        {#if expanded}
          <i class="fas fa-chevron-down"></i>
        {:else}
          <i class="fas fa-chevron-right"></i>
        {/if}
        <p class="text-lg font-semibold">Learning Center</p>
      </div>
    </button>
  </div>
  {#if expanded}
    <div role="region" class="mt-5">
      <div transition:fadeSlide={{ duration: 500 }}>
        <Carousel cards={guides} let:card>
          <GuideCard guide={card} />
        </Carousel>
      </div>
    </div>
  {/if}
</div>
