<script lang="ts">
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

import {
  kubernetesContextsCheckingStateDelayed,
  kubernetesCurrentContextState,
} from '/@/stores/kubernetes-contexts-state';

import { kubernetesContexts } from '../../stores/kubernetes-contexts';

let currentContextName: string | undefined;
$: currentContextName = $kubernetesContexts.find(c => c.currentContext)?.name;

function refresh(): void {
  if (currentContextName) {
    window.kubernetesRefreshContextState(currentContextName);
  }
}
</script>
{#if currentContextName && !$kubernetesCurrentContextState.reachable}
  <Button 
    on:click={refresh}
    icon={faRefresh}
    inProgress={$kubernetesContextsCheckingStateDelayed?.get(currentContextName)}
    >Refresh</Button>
{/if}
