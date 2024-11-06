<script lang="ts">
import { faSquareUpRight, faTrash } from '@fortawesome/free-solid-svg-icons';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import type { PortForwardRow } from '/@/lib/kubernetes-port-forward/port-forward-row';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';
import { type UserForwardConfig } from '/@api/kubernetes-port-forward-model';

import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

interface Props {
  object: PortForwardRow;
}
let { object }: Props = $props();

let userConfigForward: UserForwardConfig | undefined = $derived(
  $kubernetesCurrentContextPortForwards.find(
    config =>
      config.kind === object.kind &&
      config.name === object.name &&
      config.namespace === object.namespace &&
      config.forward.remotePort === object.mapping.remotePort &&
      config.forward.localPort === object.mapping.localPort,
  ),
);

async function deletePortForward(): Promise<void> {
  if (!userConfigForward) return;

  await window.deleteKubernetesPortForward(userConfigForward);
}

async function openExternal(): Promise<void> {
  return window.openExternal(`http://localhost:${object.mapping.localPort}`);
}
</script>

<ListItemButtonIcon
  title="Open forwarded port"
  onClick={openExternal.bind(undefined)}
  icon={faSquareUpRight} />
<ListItemButtonIcon
  title="Delete forwarded port"
  onClick={() => withConfirmation(deletePortForward, `Delete port forward`)}
  icon={faTrash} />
