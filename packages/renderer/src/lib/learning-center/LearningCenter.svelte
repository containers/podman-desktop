<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import { onDidChangeConfiguration } from '/@/stores/configurationProperties';

import type { Guide } from '../../../../main/src/plugin/learning-center/learning-center-api';
import Carousel from '../carousel/Carousel.svelte';
import { fadeSlide } from '../ui/animations';
import GuideCard from './GuideCard.svelte';

let guides: Guide[] = $state([]);
let expanded: boolean = $state(true);
let initialized: boolean = $state(false);

const listener: EventListener = (obj: any) => {
  if ('detail' in obj) {
    const detail = obj.detail as { key: string; value: boolean };
    if (CONFIGURATION_KEY === detail?.key) {
      expanded = detail.value;
    }
  }
};

const CONFIGURATION_KEY = 'learningCenter.expanded';

onMount(async () => {
  guides = await window.listGuides();

  onDidChangeConfiguration.addEventListener(CONFIGURATION_KEY, listener);
  expanded = (await window.getConfigurationValue<boolean>(CONFIGURATION_KEY)) ?? true;
  initialized = true;
});

onDestroy(() => {
  onDidChangeConfiguration.removeEventListener(CONFIGURATION_KEY, listener);
});

async function toggle(): Promise<void> {
  expanded = !expanded;
  await window.updateConfigurationValue(CONFIGURATION_KEY, expanded);
}
</script>

<div class="flex flex-1 flex-col bg-[var(--pd-content-card-bg)] p-5 rounded-lg">
  <div>
    <button onclick={toggle} aria-expanded="{expanded}">
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

  {#if initialized}
  {#if expanded}
    <div role="region" class="mt-5">
      <div transition:fadeSlide={{ duration: 250 }}>
        <Carousel cards={guides} let:card>
          <GuideCard guide={card} />
        </Carousel>
      </div>
    </div>
  {/if}
  {/if}
</div>
