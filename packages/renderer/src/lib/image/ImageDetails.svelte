<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import { Route } from 'tinro';
import { onMount } from 'svelte';
import { imagesInfos } from '../../stores/images';
import ImageActions from './ImageActions.svelte';
import { ImageUtils } from './image-utils';
import ImageDetailsInspect from './ImageDetailsInspect.svelte';
import ImageDetailsHistory from './ImageDetailsHistory.svelte';
import ImageDetailsSummary from './ImageDetailsSummary.svelte';
import RunContainerModal from './RunContainerModal.svelte';
import PushImageModal from './PushImageModal.svelte';

export let imageID: string;
export let engineId: string;
export let base64RepoTag: string;

let runContainerFromImageModal = false;
function handleRunContainerFromImageModal() {
  runContainerFromImageModal = true;
}

let pushImageModal = false;
function handlePushImageModal() {
  pushImageModal = true;
}

function closeModals() {
  runContainerFromImageModal = false;
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
  <Route path="/*" let:meta>
    <div class="w-full h-full">
      <div class="flex h-full flex-col">
        <div class="flex w-full flex-row">
          <div class="w-full  px-5 pt-5">
            <div class="flex flew-row items-center">
              <a class="text-violet-400 text-base hover:no-underline" href="/images" title="Go back to images list"
                >Images</a>
              <div class="text-xl mx-2 text-gray-400">></div>
              <div class="text-sm font-extralight text-gray-400">Image Details</div>
            </div>
            <div class="text-lg flex flex-row items-center">
              <p class="mx-2">{image.name}</p>
              <div class="text-base text-violet-400">{image.shortId}</div>
            </div>
            <div class="mx-2 pb-4 text-small text-gray-500">{image.tag}</div>

            <section class="pf-c-page__main-tabs pf-m-limit-width">
              <div class="pf-c-page__main-body">
                <div class="pf-c-tabs pf-m-page-insets" id="open-tabs-example-tabs-list">
                  <ul class="pf-c-tabs__list">
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/images/${image.id}/${encodeURI(image.engineId)}/${image.base64RepoTag}/summary`}">
                      <a
                        href="/images/{image.id}/${image.engineId}/{image.base64RepoTag}/summary"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-details-panel"
                        id="open-tabs-example-tabs-list-details-link">
                        <span class="pf-c-tabs__item-text">Summary</span>
                      </a>
                    </li>
                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/images/${image.id}/${encodeURI(image.engineId)}/${image.base64RepoTag}/history`}">
                      <a
                        href="/images/{image.id}/${image.engineId}/{image.base64RepoTag}/history"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-details-panel"
                        id="open-tabs-example-tabs-list-details-link">
                        <span class="pf-c-tabs__item-text">History</span>
                      </a>
                    </li>

                    <li
                      class="pf-c-tabs__item"
                      class:pf-m-current="{meta.url ===
                        `/images/${image.id}/${encodeURI(image.engineId)}/${image.base64RepoTag}/inspect`}">
                      <a
                        href="/images/{image.id}/${image.engineId}/{image.base64RepoTag}/inspect"
                        class="pf-c-tabs__link"
                        aria-controls="open-tabs-example-tabs-list-yaml-panel"
                        id="open-tabs-example-tabs-list-yaml-link">
                        <span class="pf-c-tabs__item-text">Inspect</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
          <div class="flex flex-row-reverse w-full  px-5 pt-5">
            <div class="flex h-10">
              <ImageActions
                image="{image}"
                backgroundColor="bg-neutral-900"
                onPushImage="{handlePushImageModal}"
                onRunContainerImage="{handleRunContainerFromImageModal}" />
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

{#if runContainerFromImageModal}
  <RunContainerModal
    image="{image}"
    closeCallback="{() => {
      closeModals();
    }}" />
{/if}

{#if pushImageModal}
  <PushImageModal
    imageInfoToPush="{image}"
    closeCallback="{() => {
      closeModals();
    }}" />
{/if}
