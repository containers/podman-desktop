<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import { Route } from 'tinro';
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
  <Route path="/*">
    <div class="w-full h-full">
      <div class="flex h-full flex-col">
        <div class="flex w-full flex-row">
          <div class="w-full px-5 pt-5">
            <div class="flex flew-row items-center">
              <a class="text-violet-400 text-base hover:no-underline" href="/images" title="Go back to images list"
                >Images</a>
              <div class="text-xl mx-2 text-gray-400">></div>
              <div class="text-sm font-extralight text-gray-400">Image Details</div>
            </div>
            <div class="flex flex-row items-start pt-1">
              <div class="pr-3 pt-1">
                <StatusIcon icon="{ImageIcon}" status="{image.inUse ? 'USED' : 'UNUSED'}" />
              </div>
              <div class="text-lg flex flex-col">
                <div class="flex flex-row">
                  <div class="mr-2">{image.name}</div>
                  <div class="text-base text-violet-400">{image.shortId}</div>
                </div>
                <div class="mr-2 pb-4 text-small text-gray-500">{image.tag}</div>
              </div>
            </div>

            <section class="pf-c-page__main-tabs pf-m-limit-width">
              <div class="pf-c-page__main-body">
                <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
                  <ul class="pf-c-tabs__list">
                    <DetailsTab title="Summary" url="summary" />
                    <DetailsTab title="History" url="history" />
                    <DetailsTab title="Inspect" url="inspect" />
                  </ul>
                </div>
              </div>
            </section>
          </div>
          <div class="flex flex-col w-full px-5 pt-5">
            <div class="flex justify-end">
              <ImageActions
                image="{image}"
                onPushImage="{handlePushImageModal}"
                detailed="{true}"
                dropdownMenu="{false}" />
            </div>
          </div>
          <a href="/containers" title="Close Details" class="mt-2 mr-2 text-gray-500"
            ><i class="fas fa-times" aria-hidden="true"></i></a>
        </div>
        <Route path="/history">
          <ImageDetailsHistory image="{image}" />
        </Route>
        <Route path="/inspect">
          <ImageDetailsInspect image="{image}" />
        </Route>
        <Route path="/summary">
          <ImageDetailsSummary image="{image}" />
        </Route>
      </div>
    </div>
  </Route>
{/if}

{#if pushImageModal}
  <PushImageModal
    imageInfoToPush="{image}"
    closeCallback="{() => {
      closeModals();
    }}" />
{/if}
