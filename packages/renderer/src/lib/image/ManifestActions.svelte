<script lang="ts">
import { faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';
import ActionsWrapper from './ActionsMenu.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let onPushManifest: (manifestInfo: ImageInfoUI) => void;
export let manifest: ImageInfoUI;
export let dropdownMenu = false;
export let detailed = false;

const dispatch = createEventDispatcher<{ update: ImageInfoUI }>();

async function pushManifest(): Promise<void> {
  onPushManifest(manifest);
}

async function deleteManifest(): Promise<void> {
  manifest.status = 'DELETING';
  dispatch('update', manifest);
  try {
    await window.removeManifest(manifest.engineId, manifest.name);
  } catch (error) {
    onError(`Error while deleting manifest: ${String(error)}`);
  }
}

function onError(error: string): void {
  window.showMessageBox({
    title: 'Something went wrong.',
    message: error,
    type: 'error',
  });
}
</script>

<ListItemButtonIcon
  title="Delete Manifest"
  onClick={() => withConfirmation(deleteManifest, `delete manifest ${manifest.name}`)}
  detailed={detailed}
  icon={faTrash}
  enabled={manifest.status === 'UNUSED'} />

<!-- If dropdownMenu is true, use it, otherwise just show the regular buttons -->
<ActionsWrapper dropdownMenu={dropdownMenu}>
  <ListItemButtonIcon
    title="Push Manifest"
    onClick={() => pushManifest()}
    menu={dropdownMenu}
    detailed={detailed}
    icon={faArrowUp} />
</ActionsWrapper>
