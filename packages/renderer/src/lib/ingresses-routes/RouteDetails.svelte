<script lang="ts">
import type { IDisposable, V1Route } from '@desktop-framework/api';
import type { KubernetesObject } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import IngressRouteIcon from '/@/lib/images/IngressRouteIcon.svelte';
import KubeEditYAML from '/@/lib/kube/KubeEditYAML.svelte';
import { listenResource } from '/@/lib/kube/resource-listen';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import StateChange from '/@/lib/ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { kubernetesCurrentContextRoutes } from '/@/stores/kubernetes-contexts-state';

import { IngressRouteUtils } from './ingress-route-utils';
import IngressRouteActions from './IngressRouteActions.svelte';
import ServiceDetailsSummary from './IngressRouteDetailsSummary.svelte';
import type { RouteUI } from './RouteUI';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

let routeUI: RouteUI | undefined = $state(undefined);
let detailsPage: DetailsPage | undefined = $state(undefined);
let kubeRoute: V1Route | undefined = $state(undefined);
let kubeError: string | undefined = $state(undefined);

let listener: IDisposable | undefined;

onMount(async () => {
  const ingressRouteUtils = new IngressRouteUtils();
  listener = await listenResource({
    resourceName: 'routes',
    name,
    namespace,
    listenEvents: false,
    legacyResourceStore: kubernetesCurrentContextRoutes,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the route has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      routeUI = ingressRouteUtils.getRouteUI(resource as V1Route);
      if (isExperimental) {
        kubeRoute = resource as V1Route;
      } else {
        loadRouteDetails().catch((err: unknown) => console.error(`Error getting route details ${name}`, err));
      }
    },
  });
});

async function loadRouteDetails(): Promise<void> {
  const getKubeRoute = await window.kubernetesReadNamespacedRoute(name, namespace);
  if (getKubeRoute) {
    kubeRoute = getKubeRoute;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${name}`;
  }
}

onDestroy(() => {
  listener?.dispose();
});
</script>

{#if routeUI}
  <DetailsPage title={routeUI.name} subtitle={routeUI.namespace} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if routeUI}<StatusIcon icon={IngressRouteIcon} size={24} status={routeUI.status} />{/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if routeUI}<IngressRouteActions ingressRoute={routeUI} detailed={true} />{/if}
    {/snippet}
    {#snippet detailSnippet()}
      {#if routeUI}
        <div class="flex py-2 w-full justify-end text-sm text-[var(--pd-content-text)]">
          <StateChange state={routeUI.status} />
        </div>
      {/if}
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    {/snippet}
    {#snippet contentSnippet()}
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ServiceDetailsSummary ingressRoute={kubeRoute} kubeError={kubeError} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeRoute, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeRoute)} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
