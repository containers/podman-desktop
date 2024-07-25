<script lang="ts">
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

import type { CombinedExtensionInfoUI } from '/@/stores/all-installed-extensions';

import LoadingIconButton from '../ui/LoadingIconButton.svelte';

export let extension: CombinedExtensionInfoUI;

let inProgress = false;

async function deleteExtension(): Promise<void> {
  inProgress = true;
  if (extension.type === 'dd') {
    await window.ddExtensionDelete(extension.id);
  } else {
    await window.removeExtension(extension.id);
  }
  inProgress = false;
}
</script>

<div class="text-sm">
  <LoadingIconButton
    clickAction={() => deleteExtension()}
    action="delete"
    icon={faTrashCan}
    state={{ status: extension.type === 'dd' ? 'stopped' : extension.removable ? extension.state : '', inProgress }}
    leftPosition="" />
</div>
