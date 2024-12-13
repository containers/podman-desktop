<script lang="ts">
import { faRefresh } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import {
  kubernetesContextsCheckingStateDelayed,
  kubernetesCurrentContextState,
} from '/@/stores/kubernetes-contexts-state';

let currentContextName = $derived($kubernetesContexts.find(c => c.currentContext)?.name);
let error = $state('');

async function refresh(): Promise<void> {
  error = '';
  if (currentContextName) {
    await window.telemetryTrack('kubernetes.monitoring.start.current');
    window.kubernetesRefreshContextState(currentContextName).catch((err: unknown) => {
      error = String(err);
    });
  }
}
</script>

{#if currentContextName && !$kubernetesCurrentContextState.reachable}
  <Button 
    on:click={refresh}
    icon={faRefresh}
    inProgress={$kubernetesContextsCheckingStateDelayed?.get(currentContextName)}
    >Refresh</Button>
  {#if error}<div class="p-2 text-[var(--pd-state-error)]">{error}</div>{/if}
{/if}
