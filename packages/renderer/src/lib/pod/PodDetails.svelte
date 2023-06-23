<script lang="ts">
import Route from '../../Route.svelte';
import { onDestroy, onMount } from 'svelte';
import type { PodInfoUI } from './PodInfoUI';
import { PodUtils } from './pod-utils';
import type { Unsubscriber } from 'svelte/store';
import { podsInfos } from '../../stores/pods';
import PodIcon from '../images/PodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import PodActions from './PodActions.svelte';
import PodDetailsSummary from './PodDetailsSummary.svelte';
import PodDetailsInspect from './PodDetailsInspect.svelte';
import PodDetailsKube from './PodDetailsKube.svelte';
import PodDetailsLogs from './PodDetailsLogs.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import DetailsTab from '../ui/DetailsTab.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';

export let podName: string;
export let engineId: string;
export let kind: string;

let pod: PodInfoUI;
let podUnsubscribe: Unsubscriber;

onMount(() => {
  const podUtils = new PodUtils();
  // loading volume info
  podUnsubscribe = podsInfos.subscribe(pods => {
    const matchingPod = pods.find(
      podInPods => podInPods.Name === podName && podInPods.engineId === engineId && kind === podInPods.kind,
    );
    if (matchingPod) {
      try {
        pod = podUtils.getPodInfoUI(matchingPod);
      } catch (err) {
        console.error(err);
      }
    }
  });
});

onDestroy(() => {
  if (podUnsubscribe) {
    podUnsubscribe();
  }
});

function inProgressCallback(inProgress: boolean, state: string): void {
  pod.actionInProgress = inProgress;
  if (state && inProgress) {
    pod.status = 'STARTING';
  }
}

function errorCallback(errorMessage: string): void {
  pod.actionError = errorMessage;
  pod.status = 'ERROR';
}
</script>

{#if pod}
  <DetailsPage name="Pod Details" title="{pod.name}" subtitle="{pod.shortId}" parentName="Pods" parentURL="/pods">
    <StatusIcon slot="icon" icon="{PodIcon}" status="{pod.status}" />
    <div slot="actions" class="flex justify-end">
      <div class="flex items-center w-5">
        {#if pod.actionError}
          <ErrorMessage error="{pod.actionError}" icon />
        {:else}
          <div>&nbsp;</div>
        {/if}
      </div>
      <PodActions
        pod="{pod}"
        inProgressCallback="{(flag, state) => inProgressCallback(flag, state)}"
        errorCallback="{error => errorCallback(error)}"
        detailed="{true}" />
    </div>
    <div slot="tabs" class="pf-c-tabs__list">
      <DetailsTab title="Summary" url="summary" />
      <DetailsTab title="Logs" url="logs" />
      <DetailsTab title="Inspect" url="inspect" />
      <DetailsTab title="Kube" url="kube" />
    </div>
    <span slot="content">
      <Route path="/summary" breadcrumb="Summary">
        <PodDetailsSummary pod="{pod}" />
      </Route>
      <Route path="/logs" breadcrumb="Logs">
        <PodDetailsLogs pod="{pod}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect">
        <PodDetailsInspect pod="{pod}" />
      </Route>
      <Route path="/kube" breadcrumb="Kube">
        <PodDetailsKube pod="{pod}" />
      </Route>
    </span>
  </DetailsPage>
{/if}
