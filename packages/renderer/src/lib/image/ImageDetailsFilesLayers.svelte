<script lang="ts">
import { createEventDispatcher } from 'svelte';

import { ImageUtils } from './image-utils';
import type { ImageFilesystemLayerUI } from './imageDetailsFiles';
import ImageDetailsFilesExpandableCommand from './ImageDetailsFilesExpandableCommand.svelte';
import { signedHumanSize } from './ImageDetailsFilesLayers';

const dispatch = createEventDispatcher();

export let layers: ImageFilesystemLayerUI[];
let currentLayerId: string | undefined;

function onLayerSelected(layer: ImageFilesystemLayerUI) {
  currentLayerId = layer.id;
  dispatch('selected', layer);
}

function getSizesText(layer: ImageFilesystemLayerUI): string {
  let parts: string[] = [];
  if (layer.addedCount) {
    parts.push(`${layer.addedCount} added (${signedHumanSize(layer.addedSize)})`);
  }
  if (layer.modifiedCount) {
    parts.push(`${layer.modifiedCount} modified (${signedHumanSize(layer.modifiedSize)})`);
  }
  if (layer.removedCount) {
    parts.push(`${layer.removedCount} removed (${signedHumanSize(layer.removedSize)})`);
  }
  if (!parts.length) {
    return '';
  }
  return `files: ${parts.join(' • ')}`;
}
</script>

{#each layers as layer}
  {@const sizesText = getSizesText(layer)}
  <button
    on:click={() => onLayerSelected(layer)}
    role="row"
    aria-label={layer.id}
    class="rounded-lg mb-4 p-4 flex flex-col w-full text-left hover:bg-[var(--pd-content-card-hover-bg)]"
    class:bg-[var(--pd-content-card-bg)]={layer.id !== currentLayerId}
    class:bg-[var(--pd-content-card-selected-bg)]={layer.id === currentLayerId}>
    <div>
      <div class="text-sm opacity-70">{new ImageUtils().getHumanSize(layer.sizeInArchive)} &bull; {layer.id}</div>
      <ImageDetailsFilesExpandableCommand command={layer.createdBy} />
      <div class="text-sm opacity-70">
        {sizesText}
      </div>
    </div>
  </button>
{/each}
