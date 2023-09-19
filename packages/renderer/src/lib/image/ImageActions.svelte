<script lang="ts">
import { faArrowUp, faLayerGroup, faPlay, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import type { ImageInfoUI } from './ImageInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import DropdownMenu from '../ui/DropdownMenu.svelte';
import FlatMenu from '../ui/FlatMenu.svelte';
import { runImageInfo } from '../../stores/run-image-store';
import type { Menu } from '../../../../main/src/plugin/menu-registry';
import ContributionActions from '/@/lib/actions/ContributionActions.svelte';

export let onPushImage: (imageInfo: ImageInfoUI) => void;
export let onRenameImage: (imageInfo: ImageInfoUI) => void;
export let image: ImageInfoUI;
export let dropdownMenu = false;
export let detailed = false;
export let contributions: Menu[] = [];

let errorTitle: string | undefined = undefined;
let errorMessage: string | undefined = undefined;
let isAuthenticatedForThisImage = false;

async function runImage(imageInfo: ImageInfoUI) {
  runImageInfo.set(imageInfo);
  router.goto('/images/run/basic');
}

$: window.hasAuthconfigForImage(image.name).then(result => (isAuthenticatedForThisImage = result));

async function deleteImage(): Promise<void> {
  try {
    await window.deleteImage(image.engineId, image.id);
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

// If dropdownMenu = true, we'll change style to the imported dropdownMenu style
// otherwise, leave blank.
let actionsStyle: typeof DropdownMenu | typeof FlatMenu;
if (dropdownMenu) {
  actionsStyle = DropdownMenu;
} else {
  actionsStyle = FlatMenu;
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
<svelte:component this="{actionsStyle}">
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
    onError="{onError}" />

  {#if errorMessage}
    <div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0 z-50" tabindex="-1">
      <div class="pf-c-alert pf-m-danger pf-m-inline" aria-label="Success alert">
        <div class="pf-c-alert__icon">
          <i class="fas fa-fw fa-exclamation-circle" aria-hidden="true"></i>
        </div>
        <p class="pf-c-alert__title">
          <span class="pf-screen-reader">Error:</span>
          {errorTitle}
        </p>
        <div class="pf-c-alert__action">
          <button
            class="pf-c-button pf-m-plain"
            type="button"
            on:click="{() => {
              errorMessage = undefined;
            }}">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
        <div class="pf-c-alert__description">
          <p class="flex break-words whitespace-normal">{errorMessage}</p>
        </div>
        <div class="pf-c-alert__action-group">
          <button
            class="pf-c-button pf-m-link pf-m-inline"
            type="button"
            on:click="{() => {
              errorMessage = undefined;
            }}">Ignore</button>
        </div>
      </div>
    </div>
  {/if}
</svelte:component>
