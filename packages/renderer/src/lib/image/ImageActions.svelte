<script lang="ts">
import { faCircleUp, faLayerGroup, faPlayCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ImageInfoUI } from './ImageInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import { runImageInfo } from '../../stores/run-image-store';

export let onPushImage: (imageInfo: ImageInfoUI) => void;

export let image: ImageInfoUI;
export let backgroundColor = 'bg-zinc-800';

let errorMessage: string = undefined;
let isAuthenticatedForThisImage: boolean = false;

async function runImage(imageInfo: ImageInfoUI) {
  runImageInfo.set(imageInfo);
  router.goto('/images/run');
}

$: window.hasAuthconfigForImage(image.name).then(result => (isAuthenticatedForThisImage = result));

async function deleteImage(): Promise<void> {
  try {
    await window.deleteImage(image.engineId, image.id);
    router.goto('/images/');
  } catch (error) {
    errorMessage = error;
  }
}

async function pushImage(imageInfo: ImageInfoUI): Promise<void> {
  onPushImage(imageInfo);
}

async function showLayersImage(): Promise<void> {
  router.goto(`/images/${image.id}/${image.engineId}/${image.base64RepoTag}/history`);
}
</script>

{#if isAuthenticatedForThisImage}
  <ListItemButtonIcon
    title="Push Image"
    onClick="{() => pushImage(image)}"
    backgroundColor="{backgroundColor}"
    icon="{faCircleUp}" />
{/if}
<ListItemButtonIcon
  title="Run Image"
  onClick="{() => runImage(image)}"
  backgroundColor="{backgroundColor}"
  icon="{faPlayCircle}" />
{#if !image.inUse}
  <ListItemButtonIcon
    title="Delete Image"
    onClick="{() => deleteImage()}"
    backgroundColor="{backgroundColor}"
    icon="{faTrash}" />
{/if}
<ListItemButtonIcon
  title="Show History"
  onClick="{() => showLayersImage()}"
  backgroundColor="{backgroundColor}"
  icon="{faLayerGroup}" />

{#if errorMessage}
  <div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0 z-50" tabindex="{0}">
    <div class="pf-c-alert pf-m-danger pf-m-inline" aria-label="Success alert">
      <div class="pf-c-alert__icon">
        <i class="fas fa-fw fa-exclamation-circle" aria-hidden="true"></i>
      </div>
      <p class="pf-c-alert__title">
        <span class="pf-screen-reader">Error:</span>
        Error while deleting image
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
