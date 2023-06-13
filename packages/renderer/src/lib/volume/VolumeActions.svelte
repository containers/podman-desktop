<script lang="ts">
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { faStop } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { VolumeInfoUI } from './VolumeInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

export let volume: VolumeInfoUI;
export let detailed = false;

async function removeVolume(): Promise<void> {
  await window.removeVolume(volume.engineId, volume.name);
  router.goto('/volumes/');
}
</script>

{#if !volume.inUse}
  <ListItemButtonIcon title="Delete Volume" onClick="{() => removeVolume()}" detailed="{detailed}" icon="{faTrash}" />
{/if}
