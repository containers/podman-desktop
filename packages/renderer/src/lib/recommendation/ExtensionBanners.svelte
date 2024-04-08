<script lang="ts">
import ExtensionBanner from '/@/lib/recommendation/ExtensionBanner.svelte';
import { extensionBannerInfos } from '/@/stores/extensionBanners';
</script>

<span>length {$extensionBannerInfos.length}</span>
{#each $extensionBannerInfos as banner (banner.extensionId)}
  <ExtensionBanner banner="{banner}" />
{/each}
