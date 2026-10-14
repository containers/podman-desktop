<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import type { CoreV1Event, KubernetesObject, V1Pod } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import type { EventUI } from '/@/lib/events/EventUI';
import PodIcon from '/@/lib/images/PodIcon.svelte';
import KubeEditYaml from '/@/lib/kube/KubeEditYAML.svelte';
import { listenResource } from '/@/lib/kube/resource-listen';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import StateChange from '/@/lib/ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { kubernetesCurrentContextEvents, kubernetesCurrentContextPods } from '/@/stores/kubernetes-contexts-state';

import KubernetesTerminalBrowser from './KubernetesTerminalBrowser.svelte';
import { PodUtils } from './pod-utils';
import PodActions from './PodActions.svelte';
import PodDetailsLogs from './PodDetailsLogs.svelte';
import PodDetailsSummary from './PodDetailsSummary.svelte';
import type { PodUI } from './PodUI';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

let pod = $state<PodUI>();
let detailsPage = $state<DetailsPage>();
let kubePod = $state<V1Pod>();
let kubeError = $state<string>();

let events = $state<EventUI[]>([]);
let listener: IDisposable | undefined;

onMount(async () => {
  const podUtils = new PodUtils();
  listener = await listenResource({
    resourceName: 'pods',
    name,
    namespace,
    listenEvents: true,
    legacyResourceStore: kubernetesCurrentContextPods,
    legacyEventsStore: kubernetesCurrentContextEvents,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the pod has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      pod = podUtils.getPodUI(resource);
      if (isExperimental) {
        kubePod = resource;
      } else {
        loadDetails().catch((err: unknown) => console.error(`Error getting pod details ${pod?.name}`, err));
      }
    },
    onEventsUpdated: (updatedEvents: CoreV1Event[]) => {
      events = updatedEvents;
    },
  });
});

onDestroy(() => {
  listener?.dispose();
});

async function loadDetails(): Promise<void> {
  const getKubePod = await window.kubernetesReadNamespacedPod(name, namespace);
  if (getKubePod) {
    kubePod = getKubePod;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${pod?.name}`;
  }
}
</script>

{#if pod}
  <DetailsPage title={pod.name} subtitle={pod.namespace} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if pod}<StatusIcon icon={PodIcon} size={24} status={pod.status} />{/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if pod}<PodActions pod={pod} detailed={true} />{/if}
    {/snippet}
    {#snippet detailSnippet()}
      <div class="flex py-2 w-full justify-end text-sm text-[var(--pd-content-text)]">
        {#if pod}<StateChange state={pod.status} />{/if}
      </div>
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Logs" selected={isTabSelected($router.path, 'logs')} url={getTabUrl($router.path, 'logs')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
      <Tab
          title="Terminal"
          selected={isTabSelected($router.path, 'k8s-terminal')}
          url={getTabUrl($router.path, 'k8s-terminal')} />
    {/snippet}
    {#snippet contentSnippet()}
      {#if pod}
        <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
          <PodDetailsSummary pod={kubePod} kubeError={kubeError} events={events} />
        </Route>
        <Route path="/logs" breadcrumb="Logs" navigationHint="tab">
          <PodDetailsLogs pod={pod} />
        </Route>
        <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
          <MonacoEditor content={JSON.stringify(kubePod, undefined, 2)} language="json" />
        </Route>
        <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
          <KubeEditYaml content={stringify(kubePod)} />
        </Route>
        <Route path="/k8s-terminal" breadcrumb="Terminal" navigationHint="tab">
          <KubernetesTerminalBrowser pod={pod} />
        </Route>
      {/if}
    {/snippet}
  </DetailsPage>
{/if}
