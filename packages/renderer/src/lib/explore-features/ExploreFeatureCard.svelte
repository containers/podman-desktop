<script lang="ts">
import type { ExploreFeature } from '@desktop-framework/api';
import { faCirclePlay, faUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import { Button, CloseButton, Link } from '@podman-desktop/ui-svelte';
import { Icon } from '@podman-desktop/ui-svelte/icons';
import { router } from 'tinro';

interface Props {
  feature: ExploreFeature;
  closeFeature: (featureId: string) => void;
}

let { feature, closeFeature }: Props = $props();

async function openLearnMore(): Promise<void> {
  if (feature.learnMore) await window.openExternal(feature.learnMore);
}

async function openTutorial(): Promise<void> {
  if (feature.tutorialLink) await window.openExternal(feature.tutorialLink);
}

async function closeCard(): Promise<void> {
  closeFeature(feature.id);
  await window.closeFeatureCard(feature.id);
  await window.telemetryTrack('dashboard.exploreFeatureDismissed', {
    feature: feature.id,
  });
}

async function handleAction(): Promise<void> {
  await window.telemetryTrack('dashboard.exploreFeatureClicked', {
    feature: feature.title,
  });
  router.goto(feature.buttonLink);
}
</script>

<div
  class="flex flex-col flex-1 relative bg-[var(--pd-content-card-carousel-card-bg)] rounded-lg hover:bg-[var(--pd-content-card-carousel-card-hover-bg)] w-[360px] h-[400px]">
  <CloseButton onclick={closeCard} class="absolute right-2 top-2 text-[var(--pd-badge-text)]"/>
  {#if feature.img}
    <img src={feature.img} class="w-full max-h-[40%] object-cover rounded-t-sm pointer-events-none" alt={feature.id} />
  {/if}  
  <div class="p-4 flex flex-col h-full">
    <div class="pt-4 text-nowrap text-[var(--pd-content-card-carousel-card-header-text)] font-semibold">
      {feature.title}
    </div>
    <p class="pt-4 text-[var(--pd-content-card-carousel-card-text)]">{feature.description}</p>
    {#if feature.learnMore}
      <Link class="flex flex-row w-fit" onclick={openLearnMore}>Learn more <Icon class="ml-1 self-center" icon={faUpRightFromSquare}/></Link>
    {/if}
    <div class="flex flex-row justify-start items-end flex-1 pt-4 gap-2">
      <Button type="primary" icon={feature.buttonIcon} onclick={handleAction} title={feature.buttonTitle}
        >{feature.buttonTitle}</Button>
      {#if feature.tutorialLink}
        <Button type="secondary" icon={faCirclePlay} onclick={openTutorial} title="Watch Tutorial">Watch Tutorial</Button>
      {/if}
    </div>
  </div>
</div>
