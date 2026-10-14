<script lang="ts">
import { type ForwardConfig } from '@desktop-framework/api';
import { faSquareUpRight, faTrash } from '@fortawesome/free-solid-svg-icons';

import { withConfirmation } from '/@/lib/dialogs/messagebox-utils';
import ListItemButtonIcon from '/@/lib/ui/ListItemButtonIcon.svelte';
import { kubernetesCurrentContextPortForwards } from '/@/stores/kubernetes-contexts-state';

interface Props {
  object: ForwardConfig;
}
let { object }: Props = $props();

let userConfigForward: ForwardConfig | undefined = $derived(
  $kubernetesCurrentContextPortForwards.find(
    config =>
      config.kind === object.kind &&
      config.name === object.name &&
      config.namespace === object.namespace &&
      config.forward.remotePort === object.forward.remotePort &&
      config.forward.localPort === object.forward.localPort,
  ),
);

async function deletePortForward(): Promise<void> {
  if (!userConfigForward) return;

  await window.deleteKubernetesPortForward(userConfigForward);
}

async function openExternal(): Promise<void> {
  return window.openExternal(`http://localhost:${object.forward.localPort}`);
}
</script>

<ListItemButtonIcon
  title="Open forwarded port"
  onClick={openExternal.bind(undefined)}
  icon={faSquareUpRight} />
<ListItemButtonIcon
  title="Delete forwarded port"
  onClick={(): void => withConfirmation(deletePortForward, `Delete port forward`, { title: 'Delete Port Forward?', variant: 'delete' })}
  icon={faTrash} />
