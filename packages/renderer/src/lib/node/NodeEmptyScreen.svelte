<script lang="ts">
import { EmptyScreen } from '@podman-desktop/ui-svelte';

import { kubernetesCurrentContextState } from '/@/stores/kubernetes-contexts-state';

import type { ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';
import NodeIcon from '../images/NodeIcon.svelte';

// If the current context is CONNECTED and we are on this empty screen
// say that you may not have permission to view the nodes on your cluster.
// otherwise just output the standard "Try switching" text.
function getText(state: ContextGeneralState | undefined): string {
  if (state?.reachable) {
    return 'You may not have permission to view the nodes on your cluster';
  }
  return 'Try switching to a different context or namespace';
}

$: text = getText($kubernetesCurrentContextState);
</script>

<EmptyScreen icon={NodeIcon} title="No nodes" message={text} />
