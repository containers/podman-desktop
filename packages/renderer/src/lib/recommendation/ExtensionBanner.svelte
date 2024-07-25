<script lang="ts">
import { onMount } from 'svelte';

import FeaturedExtension from '/@/lib/featured/FeaturedExtension.svelte';

import type { ExtensionBanner } from '../../../../main/src/plugin/recommendations/recommendations-api';

export let banner: ExtensionBanner;

let style: string | undefined = undefined;
let hasBackground: boolean = !!banner.background && (!!banner.background.image || !!banner.background.gradient);

onMount(() => {
  if (banner.background?.gradient) {
    style = `background: linear-gradient(${banner.background.gradient.start}, ${banner.background.gradient.end});`;
  } else if (banner.background?.image) {
    style = `background-image: url("${banner.background.image}");`;
  } else {
    style = undefined;
  }
});
</script>

<div
  style={style}
  aria-label="Recommended extension"
  class:bg-charcoal-800={!hasBackground}
  class="bg-charcoal-800 bg-cover max-h-[180px] px-5 py-5 rounded-lg grid grid-cols-[20px_8fr_7fr] gap-4 overflow-hidden">
  <!-- icon column -->
  <div>
    <img class="w-4 h-4' object-contain mt-1" alt="banner icon" src={banner.icon} />
  </div>

  <!-- content column -->
  <div class="flex flex-col">
    <span class="text-xl">{banner.title}</span>

    <div class="grid grid-cols-[2fr_1fr]">
      <span class="text-base">{banner.description}</span>
      <img class="min-w-24 max-w-32 min-h-24 max-h-32 object-contain" alt="banner thumbnail" src={banner.thumbnail} />
    </div>
  </div>

  <!-- feature extension actions -->
  <div class="flex flex-col">
    <FeaturedExtension displayTitle={true} variant="secondary" featuredExtension={banner.featured} />
    <span class="text-base w-full text-end">{banner.featured.description}</span>
  </div>
</div>
