<script lang="ts">
import { Spinner } from '@podman-desktop/ui-svelte';

import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import {
  kubernetesContextsCheckingStateDelayed,
  kubernetesCurrentContextState,
} from '/@/stores/kubernetes-contexts-state';
import type { ContextGeneralState } from '/@api/kubernetes-contexts-states';

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
$: currentContextName = $kubernetesContexts.find(c => c.currentContext)?.name;
</script>

{#if $kubernetesCurrentContextState}
  <div class="flex items-center flex-row">
    {#if !!currentContextName && $kubernetesContextsCheckingStateDelayed?.get(currentContextName)}
      <div class="mr-1"><Spinner size="12px"></Spinner></div>
    {/if}
    <Label role="status" name={text} tip={$kubernetesCurrentContextState.error}
      ><div class="w-2 h-2 {getClassColor($kubernetesCurrentContextState)} rounded-full mx-1"></div></Label>  
  </div>
{/if}
