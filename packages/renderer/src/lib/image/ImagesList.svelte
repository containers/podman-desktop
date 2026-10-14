<script lang="ts">
import type { ImageInfo, ViewInfoUI } from '@desktop-framework/api';
import {
  faCircleArrowDown,
  faCloudDownload,
  faCube,
  faDownload,
  faTrash,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  FilteredEmptyScreen,
  NavPage,
  Table,
  TableColumn,
  TableDurationColumn,
  TableRow,
  TableSimpleColumn,
} from '@podman-desktop/ui-svelte';
import moment from 'moment';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import { withBulkConfirmation } from '/@/lib/actions/BulkActions';
import type { ContainerInfoUI } from '/@/lib/container/ContainerInfoUI';
import type { ContextUI } from '/@/lib/context/context';
import type { EngineInfoUI } from '/@/lib/engine/EngineInfoUI';
import Prune from '/@/lib/engine/Prune.svelte';
import ImageIcon from '/@/lib/images/ImageIcon.svelte';
import ContainerEngineEnvironmentColumn from '/@/lib/table/columns/ContainerEngineEnvironmentColumn.svelte';
import EnvironmentDropdown from '/@/lib/ui/EnvironmentDropdown.svelte';
import { IMAGE_LIST_VIEW_BADGES, IMAGE_LIST_VIEW_ICONS, IMAGE_VIEW_BADGES, IMAGE_VIEW_ICONS } from '/@/lib/view/views';
import { containersInfos } from '/@/stores/containers';
import { context } from '/@/stores/context';
import { filtered, imagesInfos, searchPattern } from '/@/stores/images';
import { providerInfos } from '/@/stores/providers';
import { saveImagesInfo } from '/@/stores/save-images-store';
import { viewsContributions } from '/@/stores/views';

import { ImageUtils } from './image-utils';
import ImageColumnActions from './ImageColumnActions.svelte';
import ImageColumnName from './ImageColumnName.svelte';
import ImageColumnStatus from './ImageColumnStatus.svelte';
import ImageEmptyScreen from './ImageEmptyScreen.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import NoContainerEngineEmptyScreen from './NoContainerEngineEmptyScreen.svelte';

interface Props {
  searchTerm?: string;
  imageEngineId?: string;
}

let { searchTerm = $bindable(''), imageEngineId = '' }: Props = $props();
$effect(() => {
  searchPattern.set(searchTerm);
});

let selectedEnvironment = $state('');
let images: ImageInfoUI[] = $state([]);

// Filter images by selected environment
let filteredImages = $derived.by(() => {
  if (!selectedEnvironment) return images;
  return images.filter(image => image.engineId === selectedEnvironment);
});
let enginesList: EngineInfoUI[] = $state([]);

let providerConnections = $derived(
  $providerInfos
    .map(provider => provider.containerConnections)
    .flat()
    .filter(providerContainerConnection => providerContainerConnection.status === 'started'),
);

const imageUtils = new ImageUtils();

let globalContext: ContextUI;
let viewContributions: ViewInfoUI[] = [];

function updateImages(globalContext: ContextUI): void {
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
  images = computedImages.toSorted((first, second) => second.createdAt - first.createdAt);

  // Go through each image and if it has a children, remove the "children" from images so they do not show up
  // in the table
  images.forEach(image => {
    if (image.children) {
      image.children.forEach(child => {
        const index = images.findIndex(computedImage => computedImage.id === child.id);
        if (index !== -1) {
          images.splice(index, 1);
        }
      });
    }
  });

  if (imageEngineId) {
    images = images.filter(image => image.engineId === imageEngineId);
  }

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
}

let imagesUnsubscribe: Unsubscriber;
let containersUnsubscribe: Unsubscriber;
let contextsUnsubscribe: Unsubscriber;
let viewsUnsubscribe: Unsubscriber;
let storeContainers: ContainerInfoUI[] = [];
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
let bulkDeleteInProgress = $state(false);
async function deleteSelectedImages(): Promise<void> {
  const selectedImages = filteredImages.filter(image => image.selected);
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
async function saveSelectedImages(): Promise<void> {
  const selectedImages = filteredImages.filter(image => image.selected);
  if (selectedImages.length === 0) {
    return;
  }

  saveImagesInfo.set(selectedImages);
  router.goto('/images/save');
}

let selectedItemsNumber: number | undefined = $state();

let statusColumn = new TableColumn<ImageInfoUI>('Status', {
  align: 'center',
  width: '70px',
  renderer: ImageColumnStatus,
  comparator: (a, b): number => b.status.localeCompare(a.status),
});

let nameColumn = new TableColumn<ImageInfoUI>('Name', {
  width: '4fr',
  renderer: ImageColumnName,
  comparator: (a, b): number => a.name.localeCompare(b.name),
});

let envColumn = new TableColumn<ImageInfoUI>('Environment', {
  renderer: ContainerEngineEnvironmentColumn,
  comparator: (a, b): number => a.engineId.localeCompare(b.engineId),
});

let ageColumn = new TableColumn<ImageInfoUI, Date>('Age', {
  renderMapping: (image): Date => moment.unix(image.createdAt).toDate(),
  renderer: TableDurationColumn,
  comparator: (a, b): number => moment().diff(moment.unix(a.createdAt)) - moment().diff(moment.unix(b.createdAt)),
});

let sizeColumn = new TableColumn<ImageInfoUI, string>('Size', {
  align: 'right',
  renderMapping: (image): string => image.humanSize,
  renderer: TableSimpleColumn,
  comparator: (a, b): number => b.size - a.size,
});

let archColumn = new TableColumn<ImageInfoUI, string>('Arch', {
  align: 'right',
  renderMapping: (image): string => image.arch,
  renderer: TableSimpleColumn,
  comparator: (a, b): number => a.arch.localeCompare(b.arch),
});

const columns = [
  statusColumn,
  nameColumn,
  envColumn,
  ageColumn,
  sizeColumn,
  archColumn,
  new TableColumn<ImageInfoUI>('Actions', {
    align: 'right',
    width: '150px',
    renderer: ImageColumnActions,
    overflow: true,
  }),
];

const row = new TableRow<ImageInfoUI>({
  // If it is a manifest, it is not selectable (no delete functionality yet)
  selectable: (image): boolean => image.status === 'UNUSED' && !image.isManifest,
  disabledText: 'Image is used by a container',
  children: (image): ImageInfoUI[] => {
    return image.children ?? [];
  },
});

/**
 * Utility function for the Table to get the key to use for each item
 */
function key(item: ImageInfoUI): string {
  return `${item.engineId}:${item.id}`;
}
/**
 * Utility function for the Table to get the label to use for each item
 */
function label(item: ImageInfoUI): string {
  return item.name;
}
</script>

<NavPage bind:searchTerm={searchTerm} title="images">
  {#snippet additionalActions()}
    {#if $imagesInfos.length > 0}
      <Prune type="images" engines={enginesList} />
    {/if}
    <Button
      type="secondary"
      on:click={loadImages}
      title="Load Images From Tar Archives"
      icon={faUpload}
      aria-label="Load Images">
      Load
    </Button>
    <Button
      type="secondary"
      on:click={importImage}
      title="Import Containers From Filesystem"
      icon={faCircleArrowDown}
      aria-label="Import Image">
      Import
    </Button>
    <Button type="secondary" on:click={gotoPullImage} title="Pull Image From a Registry" icon={faCloudDownload}>Pull</Button>
    <Button type="primary" on:click={gotoBuildImage} title="Build Image From Containerfile" icon={faCube}>Build</Button>
  {/snippet}

  {#snippet bottomAdditionalActions()}
    <EnvironmentDropdown bind:selectedEnvironment={selectedEnvironment} />
    {#if selectedItemsNumber && selectedItemsNumber > 0}
      <Button
        on:click={(): void => {
          if (selectedItemsNumber) {withBulkConfirmation(
            deleteSelectedImages,
            `delete ${selectedItemsNumber} image${selectedItemsNumber > 1 ? 's' : ''}`,
            { title: 'Delete Images?', variant:'delete' }
          );}}}
        title="Delete {selectedItemsNumber} selected items"
        inProgress={bulkDeleteInProgress}
        icon={faTrash} />
      <Button
        on:click={saveSelectedImages}
        title="Save {selectedItemsNumber} selected items"
        aria-label="Save images"
        icon={faDownload} />
      <span>On {selectedItemsNumber} selected items.</span>
    {/if}
  {/snippet}

  {#snippet content()}
  <div class="flex min-w-full grow">

    {#if providerConnections.length === 0}
      <NoContainerEngineEmptyScreen />
    {:else if $filtered.length === 0}
      {#if searchTerm}
        <FilteredEmptyScreen icon={ImageIcon} kind="images" bind:searchTerm={searchTerm} />
      {:else}
        <ImageEmptyScreen />
      {/if}
    {:else if filteredImages.length === 0 && selectedEnvironment}
      <FilteredEmptyScreen icon={ImageIcon} kind="images" searchTerm="selected environment" onResetFilter={(): void => { selectedEnvironment = ''; }} />
    {:else}
      <Table
        kind="image"
        bind:selectedItemsNumber={selectedItemsNumber}
        data={filteredImages}
        columns={columns}
        row={row}
        defaultSortColumn="Age"
        key={key}
        label={label}
        enableLayoutConfiguration={true}
        on:update={(): ImageInfoUI[] => (images = images)}>
      </Table>
    {/if}
  </div>
  {/snippet}
</NavPage>
