<script lang="ts">
import { kubernetesCurrentContextState } from '/@/stores/kubernetes-contexts-state';

import type { ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';
import Label from './Label.svelte';

function getText(state?: ContextGeneralState): string {
  if (state?.reachable) return 'Connected';
  return 'Cluster not reachable';
}

function getClassColor(state?: ContextGeneralState): string {
  if (state?.reachable) return 'bg-[var(--pd-status-connected)]';
  return 'bg-[var(--pd-status-disconnected)]';
}

$: text = getText($kubernetesCurrentContextState);
</script>

{#if $kubernetesCurrentContextState}
  <Label role="status" name={text} tip={$kubernetesCurrentContextState.error}
    ><div class="w-2 h-2 {getClassColor($kubernetesCurrentContextState)} rounded-full mx-1"></div></Label>
{/if}
