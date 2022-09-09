<script lang="ts">
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons';
import { faStopCircle } from '@fortawesome/free-solid-svg-icons';
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import type { VolumeInfoUI } from './VolumeInfoUI';
import { router } from 'tinro';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

export let volume: VolumeInfoUI;
export let backgroundColor = 'bg-zinc-800';

async function removeVolume(): Promise<void> {
  await window.removeVolume(volume.engineId, volume.name);
  router.goto('/volumes/');
}
</script>

{#if !volume.inUse}
  <ListItemButtonIcon
    title="Delete Volume"
    onClick="{() => removeVolume()}"
    backgroundColor="{backgroundColor}"
    icon="{faTrash}" />
{/if}
