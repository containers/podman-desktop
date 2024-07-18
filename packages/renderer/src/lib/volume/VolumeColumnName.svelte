<script lang="ts">
import { router } from 'tinro';

import type { VolumeInfoUI } from './VolumeInfoUI';

export let object: VolumeInfoUI;

function openDetailsVolume(volume: VolumeInfoUI): void {
  router.goto(`/volumes/${encodeURI(volume.name)}/${encodeURI(volume.engineId)}/summary`);
}
</script>

<button
  class="hover:cursor-pointer flex text-[var(--pd-table-body-text-highlight)] max-w-full overflow-hidden text-ellipsis"
  on:click={() => openDetailsVolume(object)}>
  {object.shortName}
</button>
