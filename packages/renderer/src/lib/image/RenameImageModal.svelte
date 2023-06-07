<script lang="ts">
import { onMount } from 'svelte';
import { router } from 'tinro';
import Modal from '../dialogs/Modal.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let closeCallback: () => void;
export let imageInfoToRename: ImageInfoUI;

let selectedImageTag = '';
let newImageTag = '';
let imageTags: string[] = [];
let renameComplete = false;
onMount(async () => {
  const inspectInfo = await window.getImageInspect(imageInfoToRename.engineId, imageInfoToRename.id);

  imageTags = inspectInfo.RepoTags;
  if (imageTags.length > 0) {
    selectedImageTag = imageTags[0];
  }
});

async function renameImage(imageTag: string, newImageTag: string) {
  await window.addImageTag(imageInfoToRename.engineId, imageTag, newImageTag, callback);
}

async function renameImageFinished() {
  closeCallback();
  router.goto('/images');
}

function callback() {
  renameComplete = true;
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
        <label for="modalImageTag" class="block my-2 text-sm font-medium text-gray-400 dark:text-gray-400"
          >Image Tag</label>
        <select
          class="border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 bg-charcoal-600 border-gray-900 placeholder-gray-700 text-white"
          name="imageChoice"
          bind:value="{selectedImageTag}">
          {#each imageTags as imageTag}
            <option value="{imageTag}">{imageTag}</option>
          {/each}
        </select>

        <label for="newImageTag" class="block my-2 text-sm font-bold text-gray-400">New Image Tag</label>
        <input
          type="text"
          bind:value="{newImageTag}"
          name="newImageTag"
          id="newImageTag"
          placeholder="Enter new image tag (e.g. quay.io/namespace/my-custom-image:latest)"
          class="w-full my-2 p-2 outline-none text-sm bg-charcoal-600 rounded-sm text-gray-700 placeholder-gray-700"
          required />
        {#if !renameComplete}
          <button
            class="pf-c-button pf-m-primary"
            type="button"
            on:click="{() => {
              renameImage(selectedImageTag, newImageTag);
            }}">
            Add Image Tag</button>
        {:else}
          <button class="pf-c-button pf-m-primary" type="button" on:click="{() => renameImageFinished()}"> Done</button>
        {/if}
      </div>
    </div>
  </div>
</Modal>
