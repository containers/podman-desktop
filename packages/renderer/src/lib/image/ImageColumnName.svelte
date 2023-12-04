<script lang="ts">
import { router } from 'tinro';
import type { ImageInfoUI } from './ImageInfoUI';

export let object: ImageInfoUI;

function openDetailsImage(image: ImageInfoUI) {
  router.goto(`/images/${image.id}/${image.engineId}/${image.base64RepoTag}/summary`);
}
</script>

<button class="flex flex-col" on:click="{() => openDetailsImage(object)}">
  <div class="text-sm text-gray-300">{object.name}</div>
  <div class="flex flex-row text-xs gap-1">
    <div class="text-violet-400">{object.shortId}</div>
    <div class="font-extra-light text-gray-400">{object.tag}</div>
  </div>
</button>
