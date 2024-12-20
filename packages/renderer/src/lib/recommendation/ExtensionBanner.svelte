<script lang="ts">
import { CloseButton } from '@podman-desktop/ui-svelte';

import FeaturedExtension from '/@/lib/featured/FeaturedExtension.svelte';

import type { MessageBoxReturnValue } from '../../../../main/src/plugin/message-box';
import { type ExtensionBanner } from '../../../../main/src/plugin/recommendations/recommendations-api';

// Pass in the theme appearance colour of PD to the banner, we do it here so we don't have to do multiple isDark checks when rendering multiple banners.
let { banner, isDark }: { banner: ExtensionBanner; isDark: boolean } = $props();

let style = $state<string | undefined>(undefined);
let hasBackground = $state(
  !!banner.background && ((!!banner.background.dark && !!banner.background.light) || !!banner.background.gradient),
);

$effect(() => {
  if (banner.background?.gradient) {
    style = `background: linear-gradient(${banner.background.gradient.start}, ${banner.background.gradient.end});`;
  } else if (isDark && banner.background?.dark) {
    style = `background-image: url("${banner.background.dark}");`;
  } else if (!isDark && banner.background?.light) {
    style = `background-image: url("${banner.background.light}");`;
  } else {
    style = undefined;
  }
});

async function onClose(): Promise<void> {
  let result: MessageBoxReturnValue = { response: -1 };
  try {
    result = await window.showMessageBox({
      title: 'Hide extension recommendation banners',
      message: `Do you want to hide extension recommendation banners?`,
      type: 'warning',
      buttons: [`No, keep them`, 'Yes, hide'],
    });

    if (result && result.response === 1) {
      await window.updateConfigurationValue(`extensions.ignoreBannerRecommendations`, true, 'DEFAULT');
    }
  } finally {
    let choice: 'hide' | 'keep' = result && result.response === 1 ? 'hide' : 'keep';
    await window.telemetryTrack('hideRecommendationExtensionBanner', { choice });
  }
}
</script>

<div
  style={style}
  aria-label="Recommended extension"
  class:bg-[var(--pd-modal-bg)]={!hasBackground}
  class="bg-[var(--pd-modal-bg)] bg-cover max-h-[180px] px-5 py-5 rounded-lg grid grid-cols-[20px_8fr_7fr] gap-4 overflow-hidden">
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
    <div class="flex flex-row justify-end">
      <CloseButton on:click={onClose} />
    </div>
    <FeaturedExtension displayTitle={true} variant="secondary" featuredExtension={banner.featured} />
    <span class="text-base w-full text-end">{banner.featured.description}</span>
  </div>
</div>
