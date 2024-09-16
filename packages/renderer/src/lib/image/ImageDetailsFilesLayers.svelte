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
</script>

{#each layers as layer}
  <button
    on:click={() => onLayerSelected(layer)}
    role="row"
    aria-label={layer.id}
    class="rounded-lg mb-4 p-4 flex flex-col w-full text-left hover:bg-[var(--pd-content-card-hover-bg)]"
    class:bg-[var(--pd-content-card-bg)]={layer.id !== currentLayerId}
    class:bg-[var(--pd-content-card-selected-bg)]={layer.id === currentLayerId}>
    <div>
      <ImageDetailsFilesExpandableCommand command={layer.createdBy} />
      <div class="text-sm opacity-70">{layer.id}</div>
      <div class="text-sm opacity-70">
        <span>on disk: {new ImageUtils().getHumanSize(layer.sizeInArchive)}</span>
        <span> | </span>
        <span>contribute to FS: {signedHumanSize(layer.sizeInContainer)}</span>
        <span> | </span>
        <span>total FS: {new ImageUtils().getHumanSize(layer.stackTree.size)}</span>
      </div>
    </div>
  </button>
{/each}
