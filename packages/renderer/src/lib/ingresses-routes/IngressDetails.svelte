<script lang="ts">
import type { V1Ingress } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import { kubernetesCurrentContextIngresses } from '/@/stores/kubernetes-contexts-state';

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
import type { IngressUI } from './IngressUI';

export let name: string;
export let namespace: string;

let ingressUI: IngressUI;
let detailsPage: DetailsPage;
let kubeService: V1Ingress | undefined;
let kubeError: string;

onMount(() => {
  const ingressRouteUtils = new IngressRouteUtils();

  return kubernetesCurrentContextIngresses.subscribe(ingress => {
    const matchingIngress = ingress.find(srv => srv.metadata?.name === name && srv.metadata?.namespace === namespace);
    if (matchingIngress) {
      try {
        ingressUI = ingressRouteUtils.getIngressUI(matchingIngress);
        loadIngressDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the ingress has been deleted
      detailsPage.close();
    }
  });
});

async function loadIngressDetails() {
  const getKubeService = await window.kubernetesReadNamespacedIngress(ingressUI.name, namespace);
  if (getKubeService) {
    kubeService = getKubeService;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${ingressUI.name}`;
  }
}
</script>

{#if ingressUI}
  <DetailsPage title={ingressUI.name} subtitle={ingressUI.namespace} bind:this={detailsPage}>
    <StatusIcon slot="icon" icon={IngressRouteIcon} size={24} status={ingressUI.status} />
    <svelte:fragment slot="actions">
      <IngressRouteActions ingressRoute={ingressUI} detailed={true} on:update={() => (ingressUI = ingressUI)} />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state={ingressUI.status} />
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
