<script lang="ts">
import { onMount } from 'svelte';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
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

async function renameImage(imageName: string, imageTag: string) {
  const currentImageNameTag = `${imageInfoToRename.name}:${imageInfoToRename.tag}`;

  await window.tagImage(imageInfoToRename.engineId, currentImageNameTag, imageName, imageTag);
  await window.deleteImage(imageInfoToRename.engineId, currentImageNameTag);

  if (detailed) {
    router.goto('/images');
  }
  closeCallback();
}
</script>

<Modal
  on:close="{() => {
    closeCallback();
  }}">
  <div class="modal flex flex-col place-self-center bg-charcoal-800 shadow-xl shadow-black">
    <div class="flex items-center justify-between px-6 py-5 space-x-2">
      <h1 class="grow text-lg font-bold capitalize">Rename Image</h1>

      <button class="hover:text-gray-300 py-1" on:click="{() => closeCallback()}">
        <i class="fas fa-times" aria-hidden="true"></i>
      </button>
    </div>
    <div class="flex flex-col px-10 py-4 text-sm leading-5 space-y-5">
      <div>
        <label for="imageName" class="block my-2 text-sm font-bold text-gray-400">Image Name</label>
        <input
          type="text"
          bind:value="{imageName}"
          name="imageName"
          id="imageName"
          placeholder="Enter image name (e.g. quay.io/namespace/my-image-name)"
          class="w-full my-2 p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
          required />
        <label for="imageTag" class="block my-2 text-sm font-bold text-gray-400">Image Tag</label>
        <input
          type="text"
          bind:value="{imageTag}"
          name="imageTag"
          id="imageTag"
          placeholder="Enter Image name (e.g. quay.io/namespace/my-image-name)"
          class="w-full my-2 p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
          required />
        <button
          class="pf-c-button pf-m-primary"
          type="button"
          name="Save"
          disabled="{disableSave(imageName, imageTag)}"
          on:click="{() => {
            renameImage(imageName, imageTag);
          }}">
          Save
        </button>
      </div>
    </div>
  </div>
</Modal>
