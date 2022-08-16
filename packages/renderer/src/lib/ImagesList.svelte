<script lang="ts">
import { filtered, searchPattern } from '../stores/images';
import { onMount } from 'svelte';
import ImageEmptyScreen from './image/ImageEmptyScreen.svelte';

import { router } from 'tinro';
import type { ImageInfoUI } from './image/ImageInfoUI';
import ImageActions from './image/ImageActions.svelte';
import type { ImageInfo } from '../../../main/src/plugin/api/image-info';
import Fa from 'svelte-fa/src/fa.svelte';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';
import NoContainerEngineEmptyScreen from './image/NoContainerEngineEmptyScreen.svelte';
import { providerInfos } from '../stores/providers';
import RunContainerModal from './image/RunContainerModal.svelte';
import PushImageModal from './image/PushImageModal.svelte';
import { ImageUtils } from './image/image-utils';
import NavPage from './ui/NavPage.svelte';

let searchTerm = '';
$: searchPattern.set(searchTerm);

let images: ImageInfoUI[] = [];
let multipleEngines = false;

let runContainerFromImageModal = false;
let runContainerFromImageInfo = undefined;
function handleRunContainerFromImageModal(imageInfo: ImageInfoUI) {
  runContainerFromImageInfo = imageInfo;
  runContainerFromImageModal = true;
}

let pushImageModal = false;
let pushImageModalImageInfo = undefined;
function handlePushImageModal(imageInfo: ImageInfoUI) {
  pushImageModalImageInfo = imageInfo;
  pushImageModal = true;
}

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

onMount(async () => {
  const imageUtils = new ImageUtils();
  filtered.subscribe(value => {
    images = value.map((imageInfo: ImageInfo) => imageUtils.getImagesInfoUI(imageInfo)).flat();

    // multiple engines ?
    const engineNamesArray = images.map(image => image.engineName);
    // remove duplicates
    const engineNames = [...new Set(engineNamesArray)];
    if (engineNames.length > 1) {
      multipleEngines = true;
    } else {
      multipleEngines = false;
    }
  });
});

function closeModals() {
  runContainerFromImageModal = false;
  pushImageModal = false;
}

function gotoBuildImage(): void {
  router.goto('/images/build');
}

function gotoPullImage(): void {
  router.goto('/images/pull');
}

function openDetailsImage(image: ImageInfoUI) {
  router.goto(`/images/${image.id}/${image.engineId}/${image.base64RepoTag}/summary`);
}
</script>

<NavPage
  bind:searchTerm
  title="images"
  subtitle="Hover over an image to view action buttons; click to open up full details.">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    <button on:click="{() => gotoPullImage()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-arrow-circle-down" aria-hidden="true"></i>
      </span>
      Pull Image
    </button>
    <button on:click="{() => gotoBuildImage()}" class="pf-c-button pf-m-primary" type="button">
      <span class="pf-c-button__icon pf-m-start">
        <i class="fas fa-cube" aria-hidden="true"></i>
      </span>
      Build Image
    </button>
  </div>

  <table slot="table" class="min-w-full divide-y divide-gray-800 border-t border-t-zinc-700">
    <tbody class="bg-zinc-800 divide-y divide-zinc-700">
      {#each images as image}
        <tr class="group h-12  hover:bg-zinc-700">
          <td class="px-4 whitespace-nowrap w-10 hover:cursor-pointer" on:click="{() => openDetailsImage(image)}">
            <div class="flex items-center">
              <div class="flex-shrink-0 w-3 py-3">
                <Fa class="text-gray-400" icon="{faLayerGroup}" />
              </div>
              <div class="ml-4">
                <div class="flex flex-row items-center">
                  <div class="text-sm text-gray-200">{image.name}</div>
                </div>
                <div class="flex flex-row items-center">
                  <div class="text-xs text-violet-400">{image.shortId}</div>
                  <div class="ml-1 text-xs font-extra-light text-gray-500">{image.tag}</div>
                </div>
                <div class="flex flex-row text-xs font-extra-light text-gray-500">
                  <!-- Hide in case of single engine-->
                  {#if multipleEngines}
                    <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-900 text-slate-400">
                      {image.engineName}
                    </div>
                  {/if}
                </div>
              </div>
            </div>
          </td>
          <td class="px-6 py-2 whitespace-nowrap w-10">
            <div class="flex items-center">
              <div class="ml-2 text-sm text-gray-200">{image.humanCreationDate}</div>
            </div>
          </td>
          <td class="px-6 py-2 whitespace-nowrap w-10">
            <div class="flex">
              <div class="w-full text-right text-sm text-gray-200">{image.humanSize}</div>
            </div>
          </td>
          <td class="px-6 whitespace-nowrap">
            <div class="flex opacity-0 flex-row justify-end group-hover:opacity-100">
              <ImageActions
                image="{image}"
                onPushImage="{handlePushImageModal}"
                onRunContainerImage="{handleRunContainerFromImageModal}" />
            </div>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div slot="empty" class="min-h-full">
    {#if providerConnections.length > 0}
      <ImageEmptyScreen images="{$filtered}" />
    {:else}
      <NoContainerEngineEmptyScreen />
    {/if}

    {#if runContainerFromImageModal}
      <RunContainerModal
        image="{runContainerFromImageInfo}"
        closeCallback="{() => {
          closeModals();
        }}" />
    {/if}

    {#if pushImageModal}
      <PushImageModal
        imageInfoToPush="{pushImageModalImageInfo}"
        closeCallback="{() => {
          closeModals();
        }}" />
    {/if}
  </div>
</NavPage>
