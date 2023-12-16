<script lang="ts">
import type { ReadEntry } from 'tar';
import type { ImageLayer } from '../../../../main/src/plugin/image-layers';
import type { ImageInfoUI } from './ImageInfoUI';
import { onMount } from 'svelte';

export let image: ImageInfoUI;

let layers: ImageLayer[];

onMount(async () => {
  layers = await window.getImageLayers(image.engineId, image.id);
});

function getModeString(mode: number): string {
  return (
    (mode & 0o400 ? 'r' : '-') +
    (mode & 0o200 ? 'w' : '-') +
    (mode & 0o100 ? 'x' : '-') +
    (mode & 0o040 ? 'r' : '-') +
    (mode & 0o020 ? 'w' : '-') +
    (mode & 0o010 ? 'x' : '-') +
    (mode & 0o004 ? 'r' : '-') +
    (mode & 0o002 ? 'w' : '-') +
    (mode & 0o001 ? 'x' : '-')
  );
}

function getHumanSize(size: number): string {
  let u = '';
  if (size > 1024) {
    size = Math.floor(size / 100) / 10;
    u = 'k';
  }
  if (size > 1024) {
    size = Math.floor(size / 100) / 10;
    u = 'M';
  }

  if (size > 99) {
    size = Math.floor(size);
  }
  return size + u;
}

function getLink(file: ReadEntry): string {
  if (file.type === 'SymbolicLink' || file.type === 'Link') {
    return ' → ' + file.linkpath;
  }
  return '';
}
</script>

{#if layers}
  <div class="w-full h-full overflow-y-auto">
    {#each layers as imageLayer}
      <div class="p-4 bg-charcoal-700">
        <div>{imageLayer.id}</div>
        <div>{imageLayer.history}</div>
      </div>
      <div class="px-4">
        {#each imageLayer.files as file}
          <div class="font-mono">
            {file.type === 'Directory' ? 'd' : '-'}{getModeString(file.mode ?? 0)}
            {file.uid}:{file.gid}
            {getHumanSize(file.size ?? 0)}
            {file.path}{getLink(file)}
          </div>
        {/each}
      </div>
    {/each}
  </div>
{/if}
