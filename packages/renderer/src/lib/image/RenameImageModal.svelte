<script lang="ts">
import { onMount } from 'svelte';
import Modal from '../dialogs/Modal.svelte';

export let closeCallback: () => void;
export let imageInfoToRename: ImageInfoUI;

let selectedImageTag = '';
let imageTags: string[] = [];
onMount(async () => {
  const inspectInfo = await window.getImageInspect(imageInfoToRename.engineId, imageInfoToRename.id);

  imageTags = inspectInfo.RepoTags;
});
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
  </div>
</Modal>
