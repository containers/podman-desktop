<script lang="ts">
import ImageActions from './ImageActions.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import PushImageModal from './PushImageModal.svelte';
import RenameImageModal from './RenameImageModal.svelte';

export let object: ImageInfoUI;

let pushImageModal = false;
let pushImageModalImageInfo: ImageInfoUI | undefined = undefined;
function handlePushImageModal(imageInfo: ImageInfoUI) {
  pushImageModalImageInfo = imageInfo;
  pushImageModal = true;
}

let renameImageModal = false;
let renameImageModalImageInfo: ImageInfoUI | undefined = undefined;
function handleRenameImageModal(imageInfo: ImageInfoUI) {
  renameImageModalImageInfo = imageInfo;
  renameImageModal = true;
}

function closeModals() {
  pushImageModal = false;
  renameImageModal = false;
}
</script>

<!-- There is no support for interacting with manifests yet, so do not show any manifest-related-image-actions. -->

{#if !object.isManifest}
  <ImageActions
    image={object}
    onPushImage={handlePushImageModal}
    onRenameImage={handleRenameImageModal}
    dropdownMenu={true}
    on:update />

  {#if pushImageModal && pushImageModalImageInfo}
    <PushImageModal
      imageInfoToPush={pushImageModalImageInfo}
      closeCallback={() => {
        closeModals();
      }} />
  {/if}
  {#if renameImageModal && renameImageModalImageInfo}
    <RenameImageModal
      imageInfoToRename={renameImageModalImageInfo}
      closeCallback={() => {
        closeModals();
      }} />
  {/if}
{/if}
