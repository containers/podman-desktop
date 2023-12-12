<script lang="ts">
import {
  faArrowUp,
  faLayerGroup,
  faPlay,
  faTrash,
  faEdit,
  faExclamationCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import type { ImageInfoUI } from './ImageInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { runImageInfo } from '../../stores/run-image-store';
import type { Menu } from '../../../../main/src/plugin/menu-registry';
import ContributionActions from '/@/lib/actions/ContributionActions.svelte';
import { ImageUtils } from './image-utils';
import { onDestroy, onMount } from 'svelte';
import { MenuContext } from '../../../../main/src/plugin/menu-registry';
import ActionsWrapper from './ActionsMenu.svelte';
import type { Unsubscriber } from 'svelte/motion';
import type { ContextUI } from '../context/context';
import { context } from '/@/stores/context';
import Fa from 'svelte-fa';
import Button from '../ui/Button.svelte';

export let onPushImage: (imageInfo: ImageInfoUI) => void;
export let onRenameImage: (imageInfo: ImageInfoUI) => void;
export let image: ImageInfoUI;
export let dropdownMenu = false;
export let detailed = false;

let errorTitle: string | undefined = undefined;
let errorMessage: string | undefined = undefined;
let isAuthenticatedForThisImage = false;
const imageUtils = new ImageUtils();

let contributions: Menu[] = [];
let globalContext: ContextUI;
let contextsUnsubscribe: Unsubscriber;

onMount(async () => {
  contributions = await window.getContributedMenus(MenuContext.DASHBOARD_IMAGE);
  contextsUnsubscribe = context.subscribe(value => {
    globalContext = value;
  });
});

onDestroy(() => {
  // unsubscribe from the store
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

async function runImage(imageInfo: ImageInfoUI) {
  runImageInfo.set(imageInfo);
  router.goto('/images/run/basic');
}

$: window.hasAuthconfigForImage(image.name).then(result => (isAuthenticatedForThisImage = result));

async function deleteImage(): Promise<void> {
  try {
    await imageUtils.deleteImage(image);
  } catch (error) {
    errorTitle = 'Error while deleting image';
    errorMessage = String(error);
  }
}

async function renameImage(imageInfo: ImageInfoUI): Promise<void> {
  onRenameImage(imageInfo);
}

async function pushImage(imageInfo: ImageInfoUI): Promise<void> {
  onPushImage(imageInfo);
}

async function showLayersImage(): Promise<void> {
  router.goto(`/images/${image.id}/${image.engineId}/${image.base64RepoTag}/history`);
}

function onError(error: string): void {
  errorTitle = 'Something went wrong.';
  errorMessage = error;
}
</script>

<ListItemButtonIcon title="Run Image" onClick="{() => runImage(image)}" detailed="{detailed}" icon="{faPlay}" />

<ListItemButtonIcon
  title="Delete Image"
  onClick="{() => deleteImage()}"
  detailed="{detailed}"
  icon="{faTrash}"
  enabled="{!image.inUse}" />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<ActionsWrapper
  dropdownMenu="{dropdownMenu}"
  onBeforeToggle="{() => {
    globalContext?.setValue('selectedImageId', image.id);
  }}">
  {#if isAuthenticatedForThisImage}
    <ListItemButtonIcon
      title="Push Image"
      onClick="{() => pushImage(image)}"
      menu="{dropdownMenu}"
      detailed="{detailed}"
      icon="{faArrowUp}" />
  {/if}

  <ListItemButtonIcon
    title="Edit Image"
    onClick="{() => renameImage(image)}"
    menu="{dropdownMenu}"
    detailed="{detailed}"
    icon="{faEdit}" />

  {#if !detailed}
    <ListItemButtonIcon
      title="Show History"
      onClick="{() => showLayersImage()}"
      menu="{dropdownMenu}"
      detailed="{detailed}"
      icon="{faLayerGroup}" />
  {/if}

  <ContributionActions
    args="{[image]}"
    dropdownMenu="{dropdownMenu}"
    contributions="{contributions}"
    contextPrefix="imageItem"
    detailed="{detailed}"
    onError="{onError}" />

  {#if errorMessage}
    <div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0 z-50" tabindex="-1">
      <div class="border-t-red-600 border-t-2 p-4 bg-charcoal-600" aria-label="Success alert">
        <div class="flex flex-row justify-center items-center pb-2">
          <Fa icon="{faExclamationCircle}" class="text-red-500 mr-2" />
          <div class="text-red-500 font-bold text-sm">
            {errorTitle}
          </div>
          <Fa
            icon="{faTimes}"
            class="text-gray-900 pl-2 cursor-pointer"
            on:click="{() => {
              errorMessage = undefined;
            }}" />
        </div>
        <div class="flex justify-center break-words whitespace-normal text-xs pb-2">
          {errorMessage}
        </div>

        <div class="flex flex-row justify-center">
          <Button
            type="link"
            on:click="{() => {
              errorMessage = undefined;
            }}">Ignore</Button>
        </div>
      </div>
    </div>
  {/if}
</ActionsWrapper>
