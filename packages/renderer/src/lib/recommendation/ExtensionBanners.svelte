<script lang="ts">
import ExtensionBanner from '/@/lib/recommendation/ExtensionBanner.svelte';
import { extensionBannerInfos } from '/@/stores/extensionBanners';

import { isDark } from '../../stores/appearance';
</script>

{#each $extensionBannerInfos as banner (banner.extensionId)}
  <ExtensionBanner banner={banner} isDark={$isDark} />
{/each}
