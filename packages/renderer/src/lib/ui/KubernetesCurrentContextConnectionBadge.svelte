<script lang="ts">
import Tooltip from '/@/lib/ui/Tooltip.svelte';
import { kubernetesCurrentContextState } from '/@/stores/kubernetes-contexts-state';

import type { ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';

function getText(state?: ContextGeneralState): string {
  if (state?.reachable) return 'Connected';
  return 'Cluster not reachable';
}

function getClassColor(state?: ContextGeneralState): string {
  if (state?.reachable) return 'bg-green-600';
  return 'bg-gray-900';
}

$: text = getText($kubernetesCurrentContextState);
</script>

{#if $kubernetesCurrentContextState}
  <div role="status" class="flex items-center bg-charcoal-500 p-1 rounded-md">
    <div class="w-2 h-2 {getClassColor($kubernetesCurrentContextState)} rounded-full mx-1"></div>
    <span class="text-xs capitalize mr-1">
      {#if $kubernetesCurrentContextState.error !== undefined}
        <Tooltip tip="{$kubernetesCurrentContextState.error}" left>{text}</Tooltip>
      {:else}
        {text}
      {/if}
    </span>
  </div>
{/if}
