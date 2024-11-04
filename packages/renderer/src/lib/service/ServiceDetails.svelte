<script lang="ts">
import type { V1Service } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import { kubernetesCurrentContextEvents, kubernetesCurrentContextServices } from '/@/stores/kubernetes-contexts-state';

import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { EventUI } from '../events/EventUI';
import ServiceIcon from '../images/ServiceIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import StateChange from '../ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { ServiceUtils } from './service-utils';
import ServiceActions from './ServiceActions.svelte';
import ServiceDetailsSummary from './ServiceDetailsSummary.svelte';
import type { ServiceUI } from './ServiceUI';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

let service: ServiceUI | undefined = $state(undefined);
let detailsPage: DetailsPage | undefined = $state(undefined);
let kubeService: V1Service | undefined = $state(undefined);
let kubeError: string | undefined = $state(undefined);

let events: EventUI[] = $derived($kubernetesCurrentContextEvents.filter(ev => ev.involvedObject.uid === service?.uid));

onMount(() => {
  const serviceUtils = new ServiceUtils();
  // loading service info
  return kubernetesCurrentContextServices.subscribe(services => {
    const matchingService = services.find(srv => srv.metadata?.name === name && srv.metadata?.namespace === namespace);
    if (matchingService) {
      try {
        service = serviceUtils.getServiceUI(matchingService);
        loadDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the service has been deleted
      detailsPage.close();
    }
  });
});

async function loadDetails() {
  const getKubeService = await window.kubernetesReadNamespacedService(name, namespace);
  if (getKubeService) {
    kubeService = getKubeService;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${name}`;
  }
}
</script>

{#if service}
  <DetailsPage title={service.name} subtitle={service.namespace} bind:this={detailsPage}>
    <StatusIcon slot="icon" icon={ServiceIcon} size={24} status={service.status} />
    <svelte:fragment slot="actions">
      <ServiceActions service={service} detailed={true} on:update={() => (service = service)} />
    </svelte:fragment>
    <div slot="detail" class="flex py-2 w-full justify-end text-sm text-gray-700">
      <StateChange state={service.status} />
    </div>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ServiceDetailsSummary service={kubeService} kubeError={kubeError} events={events} />
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
