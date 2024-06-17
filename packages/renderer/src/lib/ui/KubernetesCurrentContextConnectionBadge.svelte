<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';

import { kubernetesCurrentContextState } from '/@/stores/kubernetes-contexts-state';

import type { ContextGeneralState } from '../../../../main/src/plugin/kubernetes-context-state';

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
  <div role="status" class="flex items-center bg-charcoal-500 p-1 rounded-md">
    <div class="w-2 h-2 {getClassColor($kubernetesCurrentContextState)} rounded-full mx-1"></div>
    <span class="text-xs capitalize mr-1">
      {#if $kubernetesCurrentContextState.error !== undefined}
        <Tooltip left tip="{$kubernetesCurrentContextState.error}">
          {text}
        </Tooltip>
      {:else}
        {text}
      {/if}
    </span>
  </div>
{/if}
