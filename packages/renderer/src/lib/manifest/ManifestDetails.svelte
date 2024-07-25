<script lang="ts">
import type { ImageInfo } from '@podman-desktop/api';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';

import { containersInfos } from '/@/stores/containers';
import type { ViewInfoUI } from '/@api/view-info';

import Route from '../../Route.svelte';
import { imagesInfos } from '../../stores/images';
import type { ContextUI } from '../context/context';
import { ImageUtils } from '../image/image-utils';
import ImageDetailsSummary from '../image/ImageDetailsSummary.svelte';
import type { ImageInfoUI } from '../image/ImageInfoUI';
import ManifestIcon from '../images/ManifestIcon.svelte';
import Badge from '../ui/Badge.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';

export let imageID: string;
export let engineId: string;
export let base64RepoTag: string;

let globalContext: ContextUI;
let viewContributions: ViewInfoUI[] = [];
let allImages: ImageInfo[];

let imageInfo: ImageInfo | undefined;
let imageMetadataInfo: ImageInfoUI | undefined;
let detailsPage: DetailsPage | undefined;

const imageUtils = new ImageUtils();

// We use updateImage from "Image" since it will still contain details
// regarding the manifest (example: tags, size, etc.) even if the size is less than 5KB, it's still
// useful to provide that information.
function updateImage() {
  if (!allImages) {
    return;
  }
  imageInfo = allImages.find(c => c.Id === imageID && c.engineId === engineId);
  let tempImage;
  if (imageInfo) {
    tempImage = imageUtils.getImageInfoUI(imageInfo, base64RepoTag, $containersInfos, globalContext, viewContributions);
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
    <StatusIcon slot="icon" icon={ManifestIcon} size={24} status={imageMetadataInfo.status} />
    <svelte:fragment slot="subtitle">
      {#if imageMetadataInfo.badges.length}
        <div class="flex flex-row">
          {#each imageMetadataInfo.badges as badge}
            <Badge color={badge.color} label={badge.label} />
          {/each}
        </div>
      {/if}
    </svelte:fragment>

    <!-- Add "actions" here in the future. -->
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ImageDetailsSummary image={imageMetadataInfo} />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
