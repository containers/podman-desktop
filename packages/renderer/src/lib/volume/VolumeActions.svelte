<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let volume: VolumeInfoUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: VolumeInfoUI }>();

async function removeVolume(): Promise<void> {
  volume.status = 'DELETING';
  dispatch('update', volume);

  await window.removeVolume(volume.engineId, volume.name);
}
</script>

{#if volume.status === 'UNUSED'}
  <ListItemButtonIcon
    title="Delete Volume"
    onClick={() => withConfirmation(removeVolume, `delete volume ${volume.name}`)}
    detailed={detailed}
    icon={faTrash} />
{/if}
