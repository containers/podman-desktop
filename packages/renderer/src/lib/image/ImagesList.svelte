<script lang="ts">
import { faArrowCircleDown, faCube, faDownload, faTrash, faUpload } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableRow,
  TableSimpleColumn,
} from '@podman-desktop/ui-svelte';
import moment from 'moment';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import { saveImagesInfo } from '/@/stores/save-images-store';
import { viewsContributions } from '/@/stores/views';
import type { ContainerInfo } from '/@api/container-info';
import type { ImageInfo } from '/@api/image-info';
import type { ViewInfoUI } from '/@api/view-info';

import { containersInfos } from '../../stores/containers';
import { context } from '../../stores/context';
import { filtered, imagesInfos, searchPattern } from '../../stores/images';
import { providerInfos } from '../../stores/providers';
import { withBulkConfirmation } from '../actions/BulkActions';
import type { ContextUI } from '../context/context';
import type { EngineInfoUI } from '../engine/EngineInfoUI';
import Prune from '../engine/Prune.svelte';
import ImageIcon from '../images/ImageIcon.svelte';
import { IMAGE_LIST_VIEW_BADGES, IMAGE_LIST_VIEW_ICONS, IMAGE_VIEW_BADGES, IMAGE_VIEW_ICONS } from '../view/views';
import { ImageUtils } from './image-utils';
import ImageColumnActions from './ImageColumnActions.svelte';
import ImageColumnEnvironment from './ImageColumnEnvironment.svelte';
import ImageColumnName from './ImageColumnName.svelte';
import ImageColumnStatus from './ImageColumnStatus.svelte';
import ImageEmptyScreen from './ImageEmptyScreen.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';

export let searchTerm = '';
$: searchPattern.set(searchTerm);

let images: ImageInfoUI[] = [];
let enginesList: EngineInfoUI[];

$: providerConnections = $providerInfos
  .map(provider => provider.containerConnections)
  .flat()
  .filter(providerContainerConnection => providerContainerConnection.status === 'started');

const imageUtils = new ImageUtils();

let globalContext: ContextUI;
let viewContributions: ViewInfoUI[] = [];

function updateImages(globalContext: ContextUI) {
  const computedImages = storeImages
    .map((imageInfo: ImageInfo) =>
      imageUtils.getImagesInfoUI(imageInfo, storeContainers, globalContext, viewContributions, storeImages),
    )
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

  // Go through each image and if it has a children, remove the "children" from computedImages so they do not show up
  // in the table
  computedImages.forEach(image => {
    if (image.children) {
      image.children.forEach(child => {
        const index = computedImages.findIndex(computedImage => computedImage.id === child.id);
        if (index !== -1) {
          computedImages.splice(index, 1);
        }
      });
    }
  });

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

  // Set the engines to the global variable for the Prune functionality button
  enginesList = uniqueEngines;

  // compute refresh interval
  const interval = computeInterval();
  refreshTimeouts.push(setTimeout(refreshAge, interval));
}

let imagesUnsubscribe: Unsubscriber;
let containersUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;
let viewsUnsubscribe: Unsubscriber;
let storeContainers: ContainerInfo[] = [];
let storeImages: ImageInfo[] = [];

onMount(async () => {
  containersUnsubscribe = containersInfos.subscribe(value => {
    storeContainers = value;
    updateImages(globalContext);
  });

  imagesUnsubscribe = filtered.subscribe(value => {
    storeImages = value;
    updateImages(globalContext);
  });

  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
    if (images.length > 0) {
      updateImages(globalContext);
    }
  });

  viewsUnsubscribe = viewsContributions.subscribe(value => {
    viewContributions =
      value.filter(
        view =>
          view.viewId === IMAGE_LIST_VIEW_ICONS ||
          view.viewId === IMAGE_VIEW_ICONS ||
          view.viewId === IMAGE_LIST_VIEW_BADGES ||
          view.viewId === IMAGE_VIEW_BADGES,
      ) || [];
    if (images.length > 0) {
      updateImages(globalContext);
    }
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
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
  if (viewsUnsubscribe) {
    viewsUnsubscribe();
  }
});

function gotoBuildImage(): void {
  router.goto('/images/build');
}

function gotoPullImage(): void {
  router.goto('/images/pull');
}

function importImage(): void {
  router.goto('/images/import');
}

function loadImages(): void {
  router.goto('/images/load');
}

// delete the items selected in the list
let bulkDeleteInProgress = false;
async function deleteSelectedImages() {
  const selectedImages = images.filter(image => image.selected);
  if (selectedImages.length === 0) {
    return;
  }

  // mark images for deletion
  bulkDeleteInProgress = true;
  selectedImages.forEach(image => (image.status = 'DELETING'));
  images = images;

  await selectedImages.reduce((prev: Promise<void>, image) => {
    return prev
      .then(() => imageUtils.deleteImage(image))
      .catch((e: unknown) => console.error('error while removing image', e));
  }, Promise.resolve());
  bulkDeleteInProgress = false;
}

// save the items selected in the list
async function saveSelectedImages() {
  const selectedImages = images.filter(image => image.selected);
  if (selectedImages.length === 0) {
    return;
  }

  saveImagesInfo.set(selectedImages);
  router.goto('/images/save');
}

let refreshTimeouts: NodeJS.Timeout[] = [];
const SECOND = 1000;
function refreshAge() {
  for (const imageInfo of images) {
    imageInfo.age = imageUtils.refreshAge(imageInfo);
  }
  images = images;

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

let selectedItemsNumber: number;
let table: Table;

let statusColumn = new TableColumn<ImageInfoUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: ImageColumnStatus,
  comparator: (a, b) => b.status.localeCompare(a.status),
});

let nameColumn = new TableColumn<ImageInfoUI>('Name', {
  width: '4fr',
  renderer: ImageColumnName,
  comparator: (a, b) => a.name.localeCompare(b.name),
});

let envColumn = new TableColumn<ImageInfoUI>('Environment', {
  renderer: ImageColumnEnvironment,
  comparator: (a, b) => a.engineName.localeCompare(b.engineName),
});

let ageColumn = new TableColumn<ImageInfoUI, string>('Age', {
  renderMapping: image => image.age,
  renderer: TableSimpleColumn,
  comparator: (a, b) => moment().diff(moment.unix(a.createdAt)) - moment().diff(moment.unix(b.createdAt)),
});

let sizeColumn = new TableColumn<ImageInfoUI, string>('Size', {
  align: 'right',
  renderMapping: image => image.humanSize,
  renderer: TableSimpleColumn,
  comparator: (a, b) => b.size - a.size,
});

const columns = [
  statusColumn,
  nameColumn,
  envColumn,
  ageColumn,
  sizeColumn,
  new TableColumn<ImageInfoUI>('Actions', {
    align: 'right',
    width: '150px',
    renderer: ImageColumnActions,
    overflow: true,
  }),
];

const row = new TableRow<ImageInfoUI>({
  // If it is a manifest, it is not selectable (no delete functionality yet)
  selectable: image => image.status === 'UNUSED' && !image.isManifest,
  disabledText: 'Image is used by a container',
  children: image => {
    return image.children ?? [];
  },
});
</script>

<NavPage bind:searchTerm={searchTerm} title="images">
  <svelte:fragment slot="additional-actions">
    {#if $imagesInfos.length > 0}
      <Prune type="images" engines={enginesList} />
    {/if}
    <Button
      on:click={() => loadImages()}
      title="Load Images From Tar Archives"
      icon={faUpload}
      aria-label="Load Images">
      Load
    </Button>
    <Button
      on:click={() => importImage()}
      title="Import Containers From Filesystem"
      icon={faArrowCircleDown}
      aria-label="Import Image">
      Import
    </Button>
    <Button on:click={() => gotoPullImage()} title="Pull Image From a Registry" icon={faArrowCircleDown}>Pull</Button>
    <Button on:click={() => gotoBuildImage()} title="Build Image From Containerfile" icon={faCube}>Build</Button>
  </svelte:fragment>

  <svelte:fragment slot="bottom-additional-actions">
    {#if selectedItemsNumber > 0}
      <Button
        on:click={() =>
          withBulkConfirmation(
            deleteSelectedImages,
            `delete ${selectedItemsNumber} image${selectedItemsNumber > 1 ? 's' : ''}`,
          )}
        title="Delete {selectedItemsNumber} selected items"
        bind:inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <Button
        on:click={() => saveSelectedImages()}
        title="Save {selectedItemsNumber} selected items"
        aria-label="Save images"
        icon={faDownload} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  </svelte:fragment>

  <div class="flex min-w-full h-full" slot="content">
    <Table
      kind="image"
      bind:this={table}
      bind:selectedItemsNumber={selectedItemsNumber}
      data={images}
      columns={columns}
      row={row}
      defaultSortColumn="Age"
      on:update={() => (images = images)}>
    </Table>

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon={ImageIcon} kind="images" bind:searchTerm={searchTerm} />
      {:else}
        <ImageEmptyScreen />
      {/if}
    {/if}
  </div>
</NavPage>
