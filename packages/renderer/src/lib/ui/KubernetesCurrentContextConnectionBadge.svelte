<script lang="ts">
import type { ContextGeneralState, ContextHealth } from '@desktop-framework/api';
import { Spinner } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';

import { isKubernetesExperimentalMode } from '/@/lib/kube/resources-listen';
import { kubernetesContextsHealths } from '/@/stores/kubernetes-context-health';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import {
  kubernetesContextsCheckingStateDelayed,
  kubernetesCurrentContextState,
} from '/@/stores/kubernetes-contexts-state';

import Label from './Label.svelte';

interface Info {
  text: string;
  classColor: string;
  tip?: string;
}

const currentContextName = $derived($kubernetesContexts?.find(c => c.currentContext)?.name);
let info = $state<Info>();

let unsubscriber: Unsubscriber | undefined;

onMount(async () => {
  const isExperimental = await isKubernetesExperimentalMode();
  if (isExperimental) {
    unsubscriber = kubernetesContextsHealths.subscribe(healths => {
      const health = healths.find(health => health.contextName === currentContextName);
      if (!health) {
        return;
      }
      info = {
        text: getTextExperimental(health),
        classColor: getClassColorExperimental(health),
        tip: getTipExperimental(health),
      };
    });
  } else {
    unsubscriber = kubernetesCurrentContextState.subscribe(state => {
      info = {
        text: getTextNonExperimental(state),
        classColor: getClassColorNonExperimental(state),
        tip: state?.error,
      };
    });
  }
});

onDestroy(() => {
  unsubscriber?.();
});

function getTextNonExperimental(state?: ContextGeneralState): string {
  if (state?.reachable) return 'Connected';
  return 'Cluster not reachable';
}

function getClassColorNonExperimental(state?: ContextGeneralState): string {
  if (state?.reachable) return 'bg-[var(--pd-status-connected)]';
  return 'bg-[var(--pd-status-disconnected)]';
}

function getTextExperimental(health: ContextHealth): string {
  if (health.offline) return 'Connection lost';
  if (health.reachable) return 'Connected';
  return 'Cluster not reachable';
}

function getClassColorExperimental(health: ContextHealth): string {
  if (health.offline) return 'bg-[var(--pd-status-paused)]';
  if (health.reachable) return 'bg-[var(--pd-status-connected)]';
  return 'bg-[var(--pd-status-disconnected)]';
}

function getTipExperimental(health: ContextHealth): string {
  if (health.offline) return 'connection lost, resources may be out of sync';
  if (health.reachable) return '';
  return 'health check not responding';
}
</script>

{#if !!info && currentContextName}
  <div class="flex items-center flex-row">
    {#if !!currentContextName && $kubernetesContextsCheckingStateDelayed?.get(currentContextName)}
      <div class="mr-1"><Spinner size="12px"></Spinner></div>
    {/if}
    <Label role="status" name={info.text} tip={info.tip}
      ><div class="w-2 h-2 {info.classColor} rounded-full mx-1"></div></Label>  
  </div>
{/if}
