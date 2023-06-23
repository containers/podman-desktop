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
import DetailsPage from '../ui/DetailsPage.svelte';
import DetailsTab from '../ui/DetailsTab.svelte';

export let imageID: string;
export let engineId: string;
export let base64RepoTag: string;

let pushImageModal = false;
function handlePushImageModal() {
  pushImageModal = true;
}

function closeModals() {
  pushImageModal = false;
}

let image: ImageInfoUI;
onMount(() => {
  const imageUtils = new ImageUtils();
  // loading container info
  imagesInfos.subscribe(images => {
    const matchingImage = images.find(c => c.Id === imageID && c.engineId === engineId);
    if (matchingImage) {
      try {
        image = imageUtils.getImageInfoUI(matchingImage, base64RepoTag);
      } catch (err) {
        console.error(err);
      }
    }
  });
});
</script>

{#if image}
  <DetailsPage
    name="Image Details"
    title="{image.name}"
    titleDetail="{image.shortId}"
    subtitle="{image.tag}"
    parentName="Images"
    parentURL="/images">
    <StatusIcon slot="icon" icon="{ImageIcon}" status="{image.inUse ? 'USED' : 'UNUSED'}" />
    <div slot="actions" class="flex justify-end">
      <ImageActions image="{image}" onPushImage="{handlePushImageModal}" detailed="{true}" dropdownMenu="{false}" />
    </div>
    <div slot="tabs" class="pf-c-tabs__list">
      <DetailsTab title="Summary" url="summary" />
      <DetailsTab title="History" url="history" />
      <DetailsTab title="Inspect" url="inspect" />
    </div>
    <span slot="content">
      <Route path="/history" breadcrumb="History">
        <ImageDetailsHistory image="{image}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect">
        <ImageDetailsInspect image="{image}" />
      </Route>
      <Route path="/summary" breadcrumb="Summary">
        <ImageDetailsSummary image="{image}" />
      </Route>
    </span>
  </DetailsPage>
{/if}

{#if pushImageModal}
  <PushImageModal
    imageInfoToPush="{image}"
    closeCallback="{() => {
      closeModals();
    }}" />
{/if}
