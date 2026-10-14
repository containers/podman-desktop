<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import type { KubernetesObject, V1Ingress } from '@kubernetes/client-node';
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
import { kubernetesCurrentContextIngresses } from '/@/stores/kubernetes-contexts-state';

import { IngressRouteUtils } from './ingress-route-utils';
import IngressRouteActions from './IngressRouteActions.svelte';
import ServiceDetailsSummary from './IngressRouteDetailsSummary.svelte';
import type { IngressUI } from './IngressUI';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

let ingressUI: IngressUI | undefined = $state(undefined);
let detailsPage: DetailsPage | undefined = $state(undefined);
let kubeIngress: V1Ingress | undefined = $state(undefined);
let kubeError: string | undefined = $state(undefined);

let listener: IDisposable | undefined;

onMount(async () => {
  const ingressRouteUtils = new IngressRouteUtils();

  listener = await listenResource({
    resourceName: 'ingresses',
    name,
    namespace,
    listenEvents: false,
    legacyResourceStore: kubernetesCurrentContextIngresses,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the ingress has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      ingressUI = ingressRouteUtils.getIngressUI(resource);
      if (isExperimental) {
        kubeIngress = resource;
      } else {
        loadIngressDetails().catch((err: unknown) => console.error(`Error getting ingress details ${name}`, err));
      }
    },
  });
});

onDestroy(() => {
  listener?.dispose();
});

async function loadIngressDetails(): Promise<void> {
  const getKubeIngress = await window.kubernetesReadNamespacedIngress(name, namespace);
  if (getKubeIngress) {
    kubeIngress = getKubeIngress;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${name}`;
  }
}
</script>

{#if ingressUI}
  <DetailsPage title={ingressUI.name} subtitle={ingressUI.namespace} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if ingressUI}<StatusIcon icon={IngressRouteIcon} size={24} status={ingressUI.status} />{/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if ingressUI}<IngressRouteActions ingressRoute={ingressUI} detailed={true} />{/if}
    {/snippet}
    {#snippet detailSnippet()}
      {#if ingressUI}
        <div class="flex py-2 w-full justify-end text-sm text-[var(--pd-content-text)]">
          <StateChange state={ingressUI.status} />
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
        <ServiceDetailsSummary ingressRoute={kubeIngress} kubeError={kubeError} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeIngress, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeIngress)} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
