<script lang="ts">
import { router } from 'tinro';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let object: VolumeInfoUI;

function openDetailsVolume(volume: VolumeInfoUI) {
  router.goto(`/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/summary`);
}
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="hover:cursor-pointer flex text-sm text-gray-300" on:click="{() => openDetailsVolume(object)}">
  {object.shortName}
</div>
