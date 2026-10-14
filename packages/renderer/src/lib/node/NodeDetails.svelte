<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import type { CoreV1Event, KubernetesObject, V1Node } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import type { EventUI } from '/@/lib/events/EventUI';
import NodeIcon from '/@/lib/images/NodeIcon.svelte';
import KubeEditYAML from '/@/lib/kube/KubeEditYAML.svelte';
import { listenResource } from '/@/lib/kube/resource-listen';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import { kubernetesCurrentContextEvents, kubernetesCurrentContextNodes } from '/@/stores/kubernetes-contexts-state';

import { NodeUtils } from './node-utils';
import NodeDetailsSummary from './NodeDetailsSummary.svelte';
import type { NodeUI } from './NodeUI';

interface Props {
  name: string;
}
let { name }: Props = $props();

let node: NodeUI | undefined = $state(undefined);
let detailsPage: DetailsPage | undefined = $state(undefined);
let kubeNode: V1Node | undefined = $state(undefined);
let kubeError: string | undefined = $state(undefined);

let events = $state<EventUI[]>([]);
let listener: IDisposable | undefined;

onMount(async () => {
  const nodeUtils = new NodeUtils();
  listener = await listenResource({
    resourceName: 'nodes',
    name,
    listenEvents: true,
    legacyResourceStore: kubernetesCurrentContextNodes,
    legacyEventsStore: kubernetesCurrentContextEvents,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the service has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      node = nodeUtils.getNodeUI(resource);
      if (isExperimental) {
        kubeNode = resource;
      } else {
        loadDetails().catch((err: unknown) => console.error(`Error getting node details ${node?.name}`, err));
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
  const getKubeNode = await window.kubernetesReadNode(name);
  if (getKubeNode) {
    kubeNode = getKubeNode;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${name}`;
  }
}
</script>

{#if node}
  <DetailsPage title={node.name} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if node}<StatusIcon icon={NodeIcon} size={24} status={node.status} />{/if}
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    {/snippet}
    {#snippet contentSnippet()}
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <NodeDetailsSummary node={kubeNode} kubeError={kubeError} events={events} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeNode, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeNode)} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
