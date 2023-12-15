<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import { onMount } from 'svelte';

export let image: ImageInfoUI;

let layers: Map<string, string[]>;

onMount(async () => {
  layers = await window.getImageLayers(image.engineId, image.id);
});
</script>

{#if layers}
  <div class="w-full h-full overflow-y-auto">
    {#each layers as [id, files]}
      <div class="p-4 bg-charcoal-700">{id}</div>
      <div class="px-4">
        {#each files as file}
          <div>{file}</div>
        {/each}
      </div>
    {/each}
  </div>
{/if}
