<script lang="ts">
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import type { PVCUI } from './PVCUI';

export let pvc: PVCUI;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: PVCUI }>();

async function deletePVC(): Promise<void> {
  pvc.status = 'DELETING';
  dispatch('update', pvc);

  await window.kubernetesDeletePersistentVolumeClaim(pvc.name);
}
</script>

<ListItemButtonIcon
  title="Delete PersistentVolumeClaim"
  onClick="{() => withConfirmation(deletePVC, `delete pvc ${pvc.name}`)}"
  detailed="{detailed}"
  icon="{faTrash}" />
