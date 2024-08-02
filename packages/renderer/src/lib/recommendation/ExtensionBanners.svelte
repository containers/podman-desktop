<script lang="ts">
import { onMount } from 'svelte';

import ExtensionBanner from '/@/lib/recommendation/ExtensionBanner.svelte';
import { extensionBannerInfos } from '/@/stores/extensionBanners';

import { AppearanceUtil } from '../appearance/appearance-util';

let isDark: boolean;

onMount(async () => {
  // Retrieve the current theme appearance colour of PD for the banners we will be showing
  const appearanceUtil = new AppearanceUtil();
  isDark = await appearanceUtil.isDarkMode();
});
</script>

{#each $extensionBannerInfos as banner (banner.extensionId)}
  <ExtensionBanner banner={banner} isDark={isDark} />
{/each}
