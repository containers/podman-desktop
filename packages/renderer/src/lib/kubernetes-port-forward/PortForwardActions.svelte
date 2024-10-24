<script lang="ts">
import { faSquareUpRight, faTrash } from '@fortawesome/free-solid-svg-icons';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import type { UserForwardConfig } from '/@api/kubernetes-port-forward-model';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

export let object: UserForwardConfig;

async function deletePortForward(): Promise<void> {
  await window.deleteKubernetesPortForward(object);
}

async function openExternal(): Promise<void> {
  return window.openExternal(`http://localhost:${object.forwards[0].localPort}`);
}
</script>

<ListItemButtonIcon
  title="Open port forward"
  onClick={openExternal.bind(undefined)}
  icon={faSquareUpRight} />
<ListItemButtonIcon
  title="Delete port forward"
  onClick={() => withConfirmation(deletePortForward, `delete port forward ${object.displayName}`)}
  icon={faTrash} />
