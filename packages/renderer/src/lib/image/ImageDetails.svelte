<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import Route from '../../Route.svelte';
import { onMount } from 'svelte';
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

let image: ImageInfoUI;
let detailsPage: DetailsPage;

onMount(() => {
  const imageUtils = new ImageUtils();
  // loading image info
  return imagesInfos.subscribe(images => {
    const matchingImage = images.find(c => c.Id === imageID && c.engineId === engineId);
    if (matchingImage) {
      try {
        image = imageUtils.getImageInfoUI(matchingImage, base64RepoTag);
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the image has been deleted
      detailsPage.close();
    }
  });
});
</script>

{#if image}
  <DetailsPage title="{image.name}" titleDetail="{image.shortId}" subtitle="{image.tag}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{ImageIcon}" status="{image.inUse ? 'USED' : 'UNUSED'}" />
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
