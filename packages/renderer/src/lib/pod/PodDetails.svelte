<script lang="ts">
import { onMount } from 'svelte';
import { router } from 'tinro';

import Route from '../../Route.svelte';
import { podsInfos } from '../../stores/pods';
import PodIcon from '../images/PodIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import StateChange from '../ui/StateChange.svelte';
import Tab from '../ui/Tab.svelte';
import KubernetesTerminalBrowser from './KubernetesTerminalBrowser.svelte';
import { PodUtils } from './pod-utils';
import PodActions from './PodActions.svelte';
import PodDetailsInspect from './PodDetailsInspect.svelte';
import PodDetailsKube from './PodDetailsKube.svelte';
import PodDetailsLogs from './PodDetailsLogs.svelte';
import PodDetailsSummary from './PodDetailsSummary.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let podName: string;
export let engineId: string;
export let kind: string;

let pod: PodInfoUI;
let detailsPage: DetailsPage;

// update current route scheme
let currentRouterPath: string;

onMount(() => {
  const podUtils = new PodUtils();

  router.subscribe(route => {
    currentRouterPath = route.path;
  });

  // loading pod info
  return podsInfos.subscribe(pods => {
    const matchingPod = pods.find(
      podInPods => podInPods.Name === podName && podInPods.engineId === engineId && kind === podInPods.kind,
    );
    if (matchingPod) {
      try {
        pod = podUtils.getPodInfoUI(matchingPod);

        if (currentRouterPath.endsWith('/')) {
          router.goto(`${currentRouterPath}logs`);
        }
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the pod has been deleted
      detailsPage.close();
    }
  });
});
</script>

{#if pod}
  <DetailsPage title="{pod.name}" subtitle="{pod.shortId}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{PodIcon}" size="{24}" status="{pod.status}" />
    <svelte:fragment slot="actions">
      <div class="flex items-center w-5">
        {#if pod.actionError}
          <ErrorMessage error="{pod.actionError}" icon />
        {:else}
          <div>&nbsp;</div>
        {/if}
      </div>
      <PodActions pod="{pod}" detailed="{true}" on:update="{() => (pod = pod)}" />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state="{pod.status}" />
    </div>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" url="summary" />
      <Tab title="Logs" url="logs" />
      <Tab title="Inspect" url="inspect" />
      <Tab title="Kube" url="kube" />
      {#if pod.kind === 'kubernetes'}
        <Tab title="Terminal" url="k8s-terminal" />
      {/if}
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <PodDetailsSummary pod="{pod}" />
      </Route>
      <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
        <PodDetailsLogs pod="{pod}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <PodDetailsInspect pod="{pod}" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <PodDetailsKube pod="{pod}" />
      </Route>
      <Route path="/k8s-terminal" breadcrumb="Terminal" navigationHint="tab">
        <KubernetesTerminalBrowser pod="{pod}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
