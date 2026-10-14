<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import type { CoreV1Event, KubernetesObject, V1Service } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import type { EventUI } from '/@/lib/events/EventUI';
import ServiceIcon from '/@/lib/images/ServiceIcon.svelte';
import KubeEditYAML from '/@/lib/kube/KubeEditYAML.svelte';
import { listenResource } from '/@/lib/kube/resource-listen';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import StateChange from '/@/lib/ui/StateChange.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { kubernetesCurrentContextEvents, kubernetesCurrentContextServices } from '/@/stores/kubernetes-contexts-state';

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

let events = $state<EventUI[]>([]);
let listener: IDisposable | undefined;

onMount(async () => {
  const serviceUtils = new ServiceUtils();
  listener = await listenResource({
    resourceName: 'services',
    name,
    namespace,
    listenEvents: true,
    legacyResourceStore: kubernetesCurrentContextServices,
    legacyEventsStore: kubernetesCurrentContextEvents,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the service has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      service = serviceUtils.getServiceUI(resource);
      if (isExperimental) {
        kubeService = resource;
      } else {
        loadDetails().catch((err: unknown) => console.error(`Error getting service details: ${service?.name}`, err));
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
    {#snippet iconSnippet()}
      {#if service}<StatusIcon icon={ServiceIcon} size={24} status={service.status} />{/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if service}<ServiceActions service={service} detailed={true} />{/if}
    {/snippet}
    {#snippet detailSnippet()}
      <div class="flex py-2 w-full justify-end text-sm text-[var(--pd-content-text)]">
        {#if service}<StateChange state={service.status} />{/if}
      </div>
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    {/snippet}
    {#snippet contentSnippet()}
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <ServiceDetailsSummary service={kubeService} kubeError={kubeError} events={events} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeService, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeService)} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
