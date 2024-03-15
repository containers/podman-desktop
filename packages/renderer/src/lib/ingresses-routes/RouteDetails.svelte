<script lang="ts">
import { onMount } from 'svelte';
import { stringify } from 'yaml';

import { kubernetesCurrentContextRoutes } from '/@/stores/kubernetes-contexts-state';

import type { V1Route } from '../../../../main/src/plugin/api/openshift-types';
import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import ServiceIcon from '../images/ServiceIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import StateChange from '../ui/StateChange.svelte';
import Tab from '../ui/Tab.svelte';
import { IngressRouteUtils } from './ingress-route-utils';
import IngressRouteActions from './IngressRouteActions.svelte';
import ServiceDetailsSummary from './IngressRouteDetailsSummary.svelte';
import type { RouteUI } from './RouteUI';

export let name: string;
export let namespace: string;

let routeUI: RouteUI;
let detailsPage: DetailsPage;
let kubeService: V1Route | undefined;
let kubeError: string;

onMount(() => {
  const ingressRouteUtils = new IngressRouteUtils();

  return kubernetesCurrentContextRoutes.subscribe(route => {
    const matchingRoute = route.find(srv => srv.metadata?.name === name && srv.metadata?.namespace === namespace);
    if (matchingRoute) {
      try {
        routeUI = ingressRouteUtils.getRouteUI(matchingRoute as V1Route);
        loadRouteDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the route has been deleted
      detailsPage.close();
    }
  });
});

async function loadRouteDetails() {
  const getKubeService = await window.kubernetesReadNamespacedRoute(routeUI.name, namespace);
  if (getKubeService) {
    kubeService = getKubeService;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${routeUI.name}`;
  }
}
</script>

{#if routeUI}
  <DetailsPage title="{routeUI.name}" subtitle="{routeUI.namespace}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{ServiceIcon}" size="{24}" status="{routeUI.status}" />
    <svelte:fragment slot="actions">
      <IngressRouteActions ingressRoute="{routeUI}" detailed="{true}" on:update="{() => (routeUI = routeUI)}" />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state="{routeUI.status}" />
    </div>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" url="summary" />
      <Tab title="Inspect" url="inspect" />
      <Tab title="Kube" url="kube" />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ServiceDetailsSummary ingressRoute="{kubeService}" kubeError="{kubeError}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content="{JSON.stringify(kubeService, undefined, 2)}" language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content="{stringify(kubeService)}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
