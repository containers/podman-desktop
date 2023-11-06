<script lang="ts">
import { filtered, searchPattern, imagesInfos } from '../../stores/images';
import { onDestroy, onMount } from 'svelte';
import ImageEmptyScreen from './ImageEmptyScreen.svelte';
import FilteredEmptyScreen from '../ui/FilteredEmptyScreen.svelte';

import { router } from 'tinro';
import type { ImageInfoUI } from './ImageInfoUI';
import ImageActions from './ImageActions.svelte';
import type { ImageInfo } from '../../../../main/src/plugin/api/image-info';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';
import { providerInfos } from '../../stores/providers';
import PushImageModal from './PushImageModal.svelte';
import RenameImageModal from './RenameImageModal.svelte';
import { ImageUtils } from './image-utils';
import NavPage from '../ui/NavPage.svelte';
import ImageIcon from '../images/ImageIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import type { Unsubscriber } from 'svelte/store';
import { containersInfos } from '../../stores/containers';
import type { ContainerInfo } from '../../../../main/src/plugin/api/container-info';
import moment from 'moment';
import Prune from '../engine/Prune.svelte';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import Checkbox from '../ui/Checkbox.svelte';
import Button from '../ui/Button.svelte';
import { faArrowCircleDown, faCube, faTrash } from '@fortawesome/free-solid-svg-icons';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let images: ImageInfoUI[] = [];
let multipleEngines = false;
let enginesList: EngineInfoUI[];

let pushImageModal = false;
let pushImageModalImageInfo: ImageInfoUI | undefined = undefined;
function handlePushImageModal(imageInfo: ImageInfoUI) {
  pushImageModalImageInfo = imageInfo;
  pushImageModal = true;
}

let renameImageModal = false;
let renameImageModalImageInfo: ImageInfoUI | undefined = undefined;
function handleRenameImageModal(imageInfo: ImageInfoUI) {
  renameImageModalImageInfo = imageInfo;
  renameImageModal = true;
}

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

// number of selected items in the list
$: selectedItemsNumber = images.filter(image => !image.inUse).filter(image => image.selected).length;

// do we need to unselect all checkboxes if we don't have all items being selected ?
$: selectedAllCheckboxes = images.filter(image => !image.inUse).every(image => image.selected);

const imageUtils = new ImageUtils();

function updateImages() {
  const computedImages = storeImages
    .map((imageInfo: ImageInfo) => imageUtils.getImagesInfoUI(imageInfo, storeContainers))
    .flat();

  // update selected items based on current selected items
  computedImages.forEach(image => {
    const matchingImage = images.find(
      currentImage => currentImage.id === image.id && currentImage.engineId === image.engineId,
    );
    if (matchingImage) {
      image.selected = matchingImage.selected;
    }
  });
  computedImages.sort((first, second) => second.createdAt - first.createdAt);
  images = computedImages;

  // Map engineName, engineId and engineType from currentContainers to EngineInfoUI[]
  const engines = images.map(container => {
    return {
      name: container.engineName,
      id: container.engineId,
    };
  });

  // Remove duplicates from engines by name
  const uniqueEngines = engines.filter((engine, index, self) => index === self.findIndex(t => t.name === engine.name));

  if (uniqueEngines.length > 1) {
    multipleEngines = true;
  } else {
    multipleEngines = false;
  }

  // Set the engines to the global variable for the Prune functionality button
  enginesList = uniqueEngines;

  // compute refresh interval
  const interval = computeInterval();
  refreshTimeouts.push(setTimeout(refreshAge, interval));
}

let imagesUnsubscribe: Unsubscriber;
let containersUnsubscribe: Unsubscriber;
let storeContainers: ContainerInfo[] = [];
let storeImages: ImageInfo[] = [];

onMount(async () => {
  containersUnsubscribe = containersInfos.subscribe(value => {
    storeContainers = value;
    updateImages();
  });

  imagesUnsubscribe = filtered.subscribe(value => {
    storeImages = value;
    updateImages();
  });
});

onDestroy(() => {
  // kill timers
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;

  // unsubscribe from the store
  if (imagesUnsubscribe) {
    imagesUnsubscribe();
  }
  if (containersUnsubscribe) {
    containersUnsubscribe();
  }
});

function closeModals() {
  pushImageModal = false;
  renameImageModal = false;
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

function toggleAllImages(checked: boolean) {
  const toggleImages = images;
  // filter out all images used by a container
  toggleImages.filter(image => !image.inUse).forEach(image => (image.selected = checked));
  images = toggleImages;
}

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedImages() {
  bulkDeleteInProgress = true;
  const selectedImages = images.filter(image => image.selected);
  await selectedImages.reduce((prev: Promise<void>, image) => {
    return prev
      .then(() => imageUtils.deleteImage(image))
      .catch((e: unknown) => console.log('error while removing image', e));
  }, Promise.resolve());
  bulkDeleteInProgress = false;
}

let refreshTimeouts: NodeJS.Timeout[] = [];
const SECOND = 1000;
function refreshAge() {
  images = images.map(imageInfo => {
    return { ...imageInfo, age: imageUtils.refreshAge(imageInfo) };
  });

  // compute new interval
  const newInterval = computeInterval();
  refreshTimeouts.forEach(timeout => clearTimeout(timeout));
  refreshTimeouts.length = 0;
  refreshTimeouts.push(setTimeout(refreshAge, newInterval));
}

function computeInterval(): number {
  // no images, no refresh
  if (images.length === 0) {
    return -1;
  }

  // do we have images that have been created in less than 1 minute
  // if so, need to update every second
  const imagesCreatedInLessThan1Mn = images.filter(image => moment().diff(moment.unix(image.createdAt), 'minutes') < 1);
  if (imagesCreatedInLessThan1Mn.length > 0) {
    return 2 * SECOND;
  }

  // every minute for images created less than 1 hour
  const imagesCreatedInLessThan1Hour = images.filter(image => moment().diff(moment.unix(image.createdAt), 'hours') < 1);
  if (imagesCreatedInLessThan1Hour.length > 0) {
    // every minute
    return 60 * SECOND;
  }

  // every hour for images created less than 1 day
  const imagesCreatedInLessThan1Day = images.filter(image => moment().diff(moment.unix(image.createdAt), 'days') < 1);
  if (imagesCreatedInLessThan1Day.length > 0) {
    // every hour
    return 60 * 60 * SECOND;
  }

  // every day
  return 60 * 60 * 24 * SECOND;
}
</script>

<NavPage bind:searchTerm="{searchTerm}" title="images">
  <div slot="additional-actions" class="space-x-2 flex flex-nowrap">
    {#if $imagesInfos.length > 0}
      <Prune type="images" engines="{enginesList}" />
    {/if}
    <Button on:click="{() => gotoPullImage()}" title="Pull Image From a Registry" icon="{faArrowCircleDown}">
      Pull
    </Button>
    <Button on:click="{() => gotoBuildImage()}" title="Build Image from Containerfile" icon="{faCube}">Build</Button>
  </div>

  <div slot="bottom-additional-actions" class="flex flex-row justify-start items-center w-full">
    {#if selectedItemsNumber > 0}
      <Button
        on:click="{() => deleteSelectedImages()}"
        title="Delete {selectedItemsNumber} selected items"
        bind:inProgress="{bulkDeleteInProgress}"
        icon="{faTrash}" />
      <span class="pl-2">On {selectedItemsNumber} selected items.</span>
    {/if}
  </div>

  <div class="flex min-w-full h-full" slot="content">
    <table class="mx-5 w-full h-fit" class:hidden="{images.length === 0}">
      <!-- title -->
      <thead class="sticky top-0 bg-charcoal-700 z-[2]">
        <tr class="h-7 uppercase text-xs text-gray-600">
          <th class="whitespace-nowrap w-5"></th>
          <th class="px-2 w-5">
            <Checkbox
              title="Toggle all"
              bind:checked="{selectedAllCheckboxes}"
              indeterminate="{selectedItemsNumber > 0 && !selectedAllCheckboxes}"
              on:click="{event => toggleAllImages(event.detail)}" />
          </th>
          <th class="text-center font-extrabold w-10 px-2">status</th>
          <th class="w-10">Name</th>
          <th class="px-6 whitespace-nowrap w-10">age</th>
          <th class="px-6 whitespace-nowrap text-end">size</th>
          <th class="text-right pr-2">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each images as image}
          <tr class="group h-12 bg-charcoal-800 hover:bg-zinc-700">
            <td class="rounded-tl-lg rounded-bl-lg w-5"> </td>
            <td class="px-2">
              <Checkbox
                title="Toggle image"
                bind:checked="{image.selected}"
                disabled="{image.inUse}"
                disabledTooltip="Image is used by a container" />
            </td>
            <td class="bg-charcoal-800 group-hover:bg-zinc-700 flex flex-row justify-center content-center h-12">
              <div class="grid place-content-center ml-3 mr-4">
                <StatusIcon icon="{ImageIcon}" status="{image.inUse ? 'USED' : 'UNUSED'}" />
              </div>
            </td>
            <td class="whitespace-nowrap w-10 hover:cursor-pointer" on:click="{() => openDetailsImage(image)}">
              <div class="flex items-center">
                <div class="">
                  <div class="flex flex-row items-center">
                    <div class="text-sm text-gray-300">{image.name}</div>
                  </div>
                  <div class="flex flex-row items-center">
                    <div class="text-xs text-violet-400">{image.shortId}</div>
                    <div class="ml-1 text-xs font-extra-light text-gray-400">{image.tag}</div>
                  </div>
                  <div class="flex flex-row text-xs font-extra-light text-gray-900">
                    <!-- Hide in case of single engine-->
                    {#if multipleEngines}
                      <div class="px-2 inline-flex text-xs font-extralight rounded-full bg-slate-800 text-slate-400">
                        {image.engineName}
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex items-center">
                <div class="text-sm text-gray-700">{image.age}</div>
              </div>
            </td>
            <td class="px-6 py-2 whitespace-nowrap w-10">
              <div class="flex">
                <div class="w-full text-right text-sm text-gray-700">{image.humanSize}</div>
              </div>
            </td>
            <td class="pl-6 text-right whitespace-nowrap rounded-tr-lg rounded-br-lg">
              <ImageActions
                image="{image}"
                onPushImage="{handlePushImageModal}"
                onRenameImage="{handleRenameImageModal}"
                dropdownMenu="{true}" />
            </td>
          </tr>
          <tr><td class="leading-[8px]">&nbsp;</td></tr>
        {/each}
      </tbody>
    </table>

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon="{ImageIcon}" kind="images" bind:searchTerm="{searchTerm}" />
      {:else}
        <ImageEmptyScreen />
      {/if}
    {/if}

    {#if pushImageModal && pushImageModalImageInfo}
      <PushImageModal
        imageInfoToPush="{pushImageModalImageInfo}"
        closeCallback="{() => {
          closeModals();
        }}" />
    {/if}
    {#if renameImageModal && renameImageModalImageInfo}
      <RenameImageModal
        imageInfoToRename="{renameImageModalImageInfo}"
        closeCallback="{() => {
          closeModals();
        }}" />
    {/if}
  </div>
</NavPage>
