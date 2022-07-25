<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faCircleUp, faPlayCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ImageInfoUI } from './ImageInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

export let onRunContainerImage: (imageInfo: ImageInfoUI) => void;
export let onPushImage: (imageInfo: ImageInfoUI) => void;

export let image: ImageInfoUI;

let errorMessage: string = undefined;
let isAuthenticatedForThisImage: boolean = false;

async function runImage(imageInfo: ImageInfoUI) {
  onRunContainerImage(imageInfo);
}

$: window.hasAuthconfigForImage(image.name).then(result => (isAuthenticatedForThisImage = result));

async function deleteImage(imageInfo: ImageInfoUI): Promise<void> {
  try {
    await window.deleteImage(imageInfo.engineId, imageInfo.id);
    router.goto('/images/');
  } catch (error) {
    errorMessage = error;
  }
}

async function pushImage(imageInfo: ImageInfoUI): Promise<void> {
  onPushImage(imageInfo);
}
</script>

{#if isAuthenticatedForThisImage}
  <ListItemButtonIcon title="Push Image" onClick="{() => pushImage(image)}" icon="{faCircleUp}" />
{/if}
<ListItemButtonIcon title="Run Image" onClick="{() => runImage(image)}" icon="{faPlayCircle}" />
<ListItemButtonIcon title="Delete Image" onClick="{() => deleteImage(image)}" icon="{faTrash}" />

{#if errorMessage}
  <div class="modal fixed w-full h-full top-0 left-0 flex items-center justify-center p-8 lg:p-0" tabindex="{0}">
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
