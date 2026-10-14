<script lang="ts">
import type { ViewInfoUI } from '@desktop-framework/api';
import type { ImageInfo } from '@desktop-framework/extension-api';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';

import { ImageUtils } from '/@/lib/image/image-utils';
import ImageDetailsSummary from '/@/lib/image/ImageDetailsSummary.svelte';
import type { ImageInfoUI } from '/@/lib/image/ImageInfoUI';
import ManifestIcon from '/@/lib/images/ManifestIcon.svelte';
import Badge from '/@/lib/ui/Badge.svelte';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { containersInfos } from '/@/stores/containers';
import { imagesInfos } from '/@/stores/images';

interface Props {
  imageID: string;
  engineId: string;
  base64RepoTag: string;
}

let { imageID, engineId, base64RepoTag }: Props = $props();

let viewContributions: ViewInfoUI[] = [];
let allImages: ImageInfo[];

let imageInfo: ImageInfo | undefined;
let imageMetadataInfo = $state<ImageInfoUI>();
let detailsPage = $state<DetailsPage>();

const imageUtils = new ImageUtils();

// We use updateImage from "Image" since it will still contain details
// regarding the manifest (example: tags, size, etc.) even if the size is less than 5KB, it's still
// useful to provide that information.
function updateImage(): void {
  if (!allImages) {
    return;
  }
  imageInfo = allImages.find(c => c.Id === imageID && c.engineId === engineId);
  let tempImage;
  if (imageInfo) {
    tempImage = imageUtils.getImageInfoUI(imageInfo, base64RepoTag, $containersInfos, undefined, viewContributions);
  }
  if (tempImage) {
    imageMetadataInfo = tempImage;
  } else {
    // the image has been deleted
    detailsPage?.close();
  }
}

onMount(() => {
  // loading image info
  return imagesInfos.subscribe(images => {
    allImages = images;
    updateImage();
  });
});
</script>

{#if imageMetadataInfo}
  <DetailsPage
    title={imageMetadataInfo.name}
    titleDetail={imageMetadataInfo.shortId}
    subtitle={imageMetadataInfo.tag}
    bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if imageMetadataInfo}<StatusIcon icon={ManifestIcon} size={24} status={imageMetadataInfo.status} />{/if}
    {/snippet}
    {#snippet subtitleSnippet()}
      {#if imageMetadataInfo?.badges.length}
        <div class="flex flex-row">
          {#each imageMetadataInfo.badges as badge, index (index)}
            <Badge color={badge.color} label={badge.label} />
          {/each}
        </div>
      {/if}
    {/snippet}

    <!-- Add "actions" here in the future. -->
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
    {/snippet}
    {#snippet contentSnippet()}
      {#if imageMetadataInfo}
        <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
          <ImageDetailsSummary image={imageMetadataInfo} />
        </Route>
      {/if}
    {/snippet}
  </DetailsPage>
{/if}
