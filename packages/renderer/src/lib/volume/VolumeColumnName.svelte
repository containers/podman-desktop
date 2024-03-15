<script lang="ts">
import { router } from 'tinro';

import type { VolumeInfoUI } from './VolumeInfoUI';

export let object: VolumeInfoUI;

function openDetailsVolume(volume: VolumeInfoUI): void {
  router.goto(`/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/summary`);
}
</script>

<button class="hover:cursor-pointer flex text-sm text-gray-300" on:click="{() => openDetailsVolume(object)}">
  {object.shortName}
</button>
