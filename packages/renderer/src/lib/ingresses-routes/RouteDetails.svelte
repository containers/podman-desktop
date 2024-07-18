<script lang="ts">
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import { kubernetesCurrentContextRoutes } from '/@/stores/kubernetes-contexts-state';
import type { V1Route } from '/@api/openshift-types';

import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import StateChange from '../ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
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
  <DetailsPage title={routeUI.name} subtitle={routeUI.namespace} bind:this={detailsPage}>
    <StatusIcon slot="icon" icon={IngressRouteIcon} size={24} status={routeUI.status} />
    <svelte:fragment slot="actions">
      <IngressRouteActions ingressRoute={routeUI} detailed={true} on:update={() => (routeUI = routeUI)} />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state={routeUI.status} />
    </div>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ServiceDetailsSummary ingressRoute={kubeService} kubeError={kubeError} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeService, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeService)} />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
