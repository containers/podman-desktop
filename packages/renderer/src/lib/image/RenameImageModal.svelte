<script lang="ts">
import { Button, ErrorMessage, Input } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';

import Dialog from '../dialogs/Dialog.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let closeCallback: () => void;
export let detailed = false;
export let imageInfoToRename: ImageInfoUI;

let imageName = '';
let imageTag = '';
onMount(async () => {
  imageName = imageInfoToRename.name;
  imageTag = imageInfoToRename.tag;
});

function disableSave(name: string, tag: string): boolean {
  const inputName = `${name}:${tag}`;
  const currentName = `${imageInfoToRename.name}:${imageInfoToRename.tag}`;

  return name.trim() === '' || tag.trim() === '' || inputName === currentName;
}

let imageNameErrorMessage = '';
function validateImageName(event: any): void {
  let inputName = event.target.value;
  if (inputName === undefined || inputName.trim() === '') {
    imageNameErrorMessage = 'Please enter a value';
  } else {
    imageNameErrorMessage = '';
  }
}

let imageTagErrorMessage = '';
function validateImageTag(event: any): void {
  let inputName = event.target.value;
  if (inputName === undefined || inputName.trim() === '') {
    imageTagErrorMessage = 'Please enter a value';
  } else {
    imageTagErrorMessage = '';
  }
}

async function renameImage(imageName: string, imageTag: string) {
  const currentImageNameTag = `${imageInfoToRename.name}:${imageInfoToRename.tag}`;

  try {
    await window.tagImage(imageInfoToRename.engineId, currentImageNameTag, imageName, imageTag);
    await window.deleteImage(imageInfoToRename.engineId, currentImageNameTag);
    closeCallback();
  } catch (error: any) {
    imageNameErrorMessage = error.message;
  }

  if (detailed) {
    router.goto('/images');
  }
}
</script>

<Dialog
  title="Edit Image"
  on:close={() => {
    closeCallback();
  }}>
  <div slot="content" class="w-full">
    <label for="imageName" class="block my-2 text-sm font-bold text-[var(--pd-modal-text)]">Image Name</label>
    <Input
      bind:value={imageName}
      name="imageName"
      id="imageName"
      placeholder="Enter image name (e.g. quay.io/namespace/my-image-name)"
      on:input={event => validateImageName(event)}
      aria-invalid={imageNameErrorMessage !== ''}
      aria-label="imageName"
      required />
    {#if imageNameErrorMessage}
      <ErrorMessage error={imageNameErrorMessage} />
    {/if}

    <label for="imageTag" class="block my-2 text-sm font-bold text-[var(--pd-modal-text)]">Image Tag</label>
    <Input
      bind:value={imageTag}
      name="imageTag"
      id="imageTag"
      placeholder="Enter image tag (e.g. latest)"
      on:input={event => validateImageTag(event)}
      aria-invalid={imageTagErrorMessage !== ''}
      aria-label="imageTag"
      required />
    {#if imageTagErrorMessage}
      <ErrorMessage error={imageTagErrorMessage} />
    {/if}
  </div>
  <svelte:fragment slot="buttons">
    <Button
      class="pcol-start-3"
      type="link"
      on:click={() => {
        closeCallback();
      }}>Cancel</Button>
    <Button
      class="col-start-4"
      disabled={disableSave(imageName, imageTag)}
      on:click={() => {
        renameImage(imageName, imageTag);
      }}>Save</Button>
  </svelte:fragment>
</Dialog>
