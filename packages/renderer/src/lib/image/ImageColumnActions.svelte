<script lang="ts">
import ImageActions from './ImageActions.svelte';
import type { ImageInfoUI } from './ImageInfoUI';
import ManifestActions from './ManifestActions.svelte';
import PushImageModal from './PushImageModal.svelte';
import PushManifestModal from './PushManifestModal.svelte';
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

let pushManifestModal = false;
let pushManifestModalInfo: ImageInfoUI | undefined = undefined;
function handlePushManifestModal(imageInfo: ImageInfoUI) {
  pushManifestModalInfo = imageInfo;
  pushManifestModal = true;
}

function closeModals() {
  pushImageModal = false;
  renameImageModal = false;
  pushManifestModal = false;
}
</script>

<!-- There is no support for interacting with manifests yet, so do not show any manifest-related-image-actions. -->

{#if object.isManifest}
  <ManifestActions manifest={object} onPushManifest={handlePushManifestModal} dropdownMenu={true} on:update />

  {#if pushManifestModal && pushManifestModalInfo}
    <PushManifestModal
      manifestInfoToPush={pushManifestModalInfo}
      closeCallback={() => {
        closeModals();
      }} />
  {/if}
{:else}
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
