<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faCircleUp, faPlayCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import type { ImageInfoUI } from './ImageInfoUI';
import { router } from 'tinro';
import RunContainerModal from './RunContainerModal.svelte';
import { onMount } from 'svelte';
import PushImage from './PushImageModal.svelte';
import PushImageModal from './PushImageModal.svelte';
import Modal from '../dialogs/Modal.svelte';

export let hasModalCallback: (flag: boolean) => void;
export let image: ImageInfoUI;

const buttonStyle = 'p-1 mx-1 shadow-md shadow-gray-900  hover:bg-zinc-800';
const iconStyle = 'p-1 h-7 w-7 cursor-pointer rounded-full text-3xl text-violet-500 hover:text-violet-600';

let runContainerFromImageModal = false;
let pushImageModal = false;
let modalImageInfo: ImageInfoUI;
let errorMessage: string = undefined;

async function runImage(imageInfo: ImageInfoUI) {
  modalImageInfo = imageInfo;
  runContainerFromImageModal = true;
}

$: isAuthenticatedForThisImage = window.registry.hasAuthconfigForImage(image.name);
let imageInfoToPush = undefined;

async function deleteImage(imageInfo: ImageInfoUI): Promise<void> {
  try {
    await window.deleteImage(imageInfo.engineId, imageInfo.id);
    router.goto('/images/');
  } catch (error) {
    errorMessage = error;
  }
}

async function pushImage(imageInfo: ImageInfoUI): Promise<void> {
  imageInfoToPush = imageInfo;
  hasModalCallback(true);
  pushImageModal = true;
}
</script>

{#if isAuthenticatedForThisImage}
  <button title="Push Image" class="{buttonStyle}" on:click="{() => pushImage(image)}"
    ><Fa class="{iconStyle}" icon="{faCircleUp}" /></button>
{/if}
<button title="Run Image" class="{buttonStyle}" on:click="{() => runImage(image)}"
  ><Fa class="{iconStyle}" icon="{faPlayCircle}" /></button>
<button class="{buttonStyle}" title="Delete Image" on:click="{() => deleteImage(image)}">
  <Fa class="{iconStyle}" icon="{faTrash}" /></button>

{#if pushImageModal}
  <Modal
    on:close="{() => {
      pushImageModal = false;
    }}">
    <PushImageModal
      imageInfoToPush="{imageInfoToPush}"
      closeCallback="{() => {
        (pushImageModal = false), hasModalCallback(false);
      }}" />
  </Modal>
{/if}
{#if runContainerFromImageModal}
  <Modal
    on:close="{() => {
      runContainerFromImageModal = false;
    }}">
    <RunContainerModal
      image="{modalImageInfo}"
      closeCallback="{() => {
        runContainerFromImageModal = false;
      }}" />
  </Modal>
{/if}

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
