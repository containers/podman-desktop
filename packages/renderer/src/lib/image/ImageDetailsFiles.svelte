<script lang="ts">
import type { ImageLayer } from '../../../../main/src/plugin/image-layers';
import type { ImageInfoUI } from './ImageInfoUI';
import { onMount } from 'svelte';
import TreeView from '../ui/TreeView.svelte';
import { ImageUtils } from './image-utils';

export let image: ImageInfoUI;
let layers: ImageLayer[];
let currentLayerId: string;
$: currentRoot = layers ? layers[0].tree.root : undefined;

onMount(async () => {
  layers = await window.getImageLayers(image.engineId, image.id);
  currentLayerId = layers[0].id;
});

function onLayerSelected(layer: ImageLayer) {
  currentRoot = layer.tree.root;
  currentLayerId = layer.id;
}
</script>

{#if layers}
  <div class="flex flex-col w-full h-full p-8 pr-0">
    <div class="pr-4">
      <slot name="header-info" />
    </div>
    <div class="mb-2 flex flex-row pr-12 pb-2">
      <span class="grow">Layers</span>
    </div>
    <div class="h-full flex flex-row space-x-8">
      <div class="h-full overflow-y-auto w-3/4">
        {#each layers as layer}
          <button
            on:click="{() => onLayerSelected(layer)}"
            role="row"
            class="rounded-lg mb-4 p-4 flex flex-col w-full text-left truncate"
            class:bg-charcoal-700="{layer.id !== currentLayerId}"
            class:bg-charcoal-400="{layer.id === currentLayerId}">
            <div>
              <div class="text-sm">{layer.history}</div>
              <div class="text-xs text-gray-700">{layer.id}</div>
              <div class="text-xs text-gray-700">{new ImageUtils().getHumanSize(layer.tree.size)}</div>
            </div>
          </button>
        {/each}
      </div>
      <div class="h-full w-full pr-4 overflow-y-scroll pb-16">
        {#if currentRoot}
          <div class="text-xs grid grid-cols-[90px_60px_70px_1fr]">
            <TreeView tree="{currentRoot}" />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}
