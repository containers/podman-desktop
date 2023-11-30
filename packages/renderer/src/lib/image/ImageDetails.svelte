<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import Route from '../../Route.svelte';
import { onDestroy, onMount } from 'svelte';
import { imagesInfos } from '../../stores/images';
import ImageIcon from '../images/ImageIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import ImageActions from './ImageActions.svelte';
import { ImageUtils } from './image-utils';
import ImageDetailsInspect from './ImageDetailsInspect.svelte';
import ImageDetailsHistory from './ImageDetailsHistory.svelte';
import ImageDetailsSummary from './ImageDetailsSummary.svelte';
import PushImageModal from './PushImageModal.svelte';
import RenameImageModal from './RenameImageModal.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import Tab from '../ui/Tab.svelte';
import { containersInfos } from '/@/stores/containers';
import ImageDetailsCheck from './ImageDetailsCheck.svelte';
import { imageCheckerProviders } from '/@/stores/image-checker-providers';
import type { Unsubscriber } from 'svelte/motion';
import type { ImageInfo } from '@podman-desktop/api';

export let imageID: string;
export let engineId: string;
export let base64RepoTag: string;

let pushImageModal = false;
function handlePushImageModal() {
  pushImageModal = true;
}

let renameImageModal = false;
function handleRenameImageModal() {
  renameImageModal = true;
}

function closeModals() {
  pushImageModal = false;
  renameImageModal = false;
}

let imageInfo: ImageInfo | undefined;
let image: ImageInfoUI;
let detailsPage: DetailsPage;

let showCheckTab: boolean = false;
let providersUnsubscribe: Unsubscriber;

onMount(() => {
  providersUnsubscribe = imageCheckerProviders.subscribe(providers => {
    showCheckTab = providers.length > 0;
  });

  const imageUtils = new ImageUtils();
  // loading image info
  return imagesInfos.subscribe(images => {
    imageInfo = images.find(c => c.Id === imageID && c.engineId === engineId);
    let tempImage;
    if (imageInfo) {
      tempImage = imageUtils.getImageInfoUI(imageInfo, base64RepoTag, $containersInfos);
    }
    if (tempImage) {
      image = tempImage;
    } else {
      // the image has been deleted
      detailsPage.close();
    }
  });
});

onDestroy(() => {
  // unsubscribe from the store
  providersUnsubscribe?.();
});
</script>

{#if image}
  <DetailsPage title="{image.name}" titleDetail="{image.shortId}" subtitle="{image.tag}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{ImageIcon}" size="{24}" status="{image.inUse ? 'USED' : 'UNUSED'}" />
    <ImageActions
      slot="actions"
      image="{image}"
      onPushImage="{handlePushImageModal}"
      onRenameImage="{handleRenameImageModal}"
      detailed="{true}"
      dropdownMenu="{false}" />
    <svelte:fragment slot="tabs">
      <Tab title="Summary" url="summary" />
      <Tab title="History" url="history" />
      <Tab title="Inspect" url="inspect" />
      {#if showCheckTab}
        <Tab title="Check" url="check" />
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ImageDetailsSummary image="{image}" />
      </Route>
      <Route path="/history" breadcrumb="History" navigationHint="tab">
        <ImageDetailsHistory image="{image}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <ImageDetailsInspect image="{image}" />
      </Route>
      <Route path="/check" breadcrumb="Check" navigationHint="tab">
        <ImageDetailsCheck imageInfo="{imageInfo}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}

{#if pushImageModal}
  <PushImageModal
    imageInfoToPush="{image}"
    closeCallback="{() => {
      closeModals();
    }}" />
{/if}
{#if renameImageModal}
  <RenameImageModal
    imageInfoToRename="{image}"
    detailed="{true}"
    closeCallback="{() => {
      closeModals();
    }}" />
{/if}
