<script lang="ts">
import type { ExploreFeature } from '@desktop-framework/api';
import { Carousel, Expandable } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import { ContextKeyExpr } from '/@/lib/context/contextKey';
import { ExpandableState } from '/@/lib/ui/expandable-state.svelte';
import { context } from '/@/stores/context';
import { exploreFeaturesInfo } from '/@/stores/explore-features';

import ExploreFeatureCard from './ExploreFeatureCard.svelte';

let features: ExploreFeature[] = $derived(
  $exploreFeaturesInfo.filter(feature => {
    if (feature.when) {
      const whenDeserialized = ContextKeyExpr.deserialize(feature.when);
      return whenDeserialized?.evaluate($context) && (feature.show ?? true);
    }
    return feature.show ?? true;
  }),
);

const expandableState = new ExpandableState('exploreFeatures.expanded');

onMount(() => {
  // event for the exploreFeaturesInfo store to check for an update
  window.dispatchEvent(new CustomEvent('update-explore-features', {}));
});

function featureClosed(featureId: string): void {
  features = features.filter(feature => feature.id !== featureId);
}
</script>

{#snippet card(feature: ExploreFeature)}
  <ExploreFeatureCard feature={feature} closeFeature={featureClosed} />
{/snippet}

{#if features.length > 0}
  <div class="flex flex-1 flex-col bg-[var(--pd-content-card-bg)] p-5 rounded-lg">
    <Expandable bind:initialized={expandableState.initialized} bind:expanded={expandableState.expanded} onclick={expandableState.toggle.bind(expandableState)}>
      <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
      {#snippet title()}<div class="text-lg font-semibold text-[var(--pd-content-card-header-text)]">Explore Features</div>{/snippet}
      <div class="pt-2">
        <Carousel cards={features} {card} />
      </div>
    </Expandable>
  </div>
{/if}
