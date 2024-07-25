<script lang="ts">
import type { V1Node } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import { kubernetesCurrentContextNodes } from '/@/stores/kubernetes-contexts-state';

import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import NodeIcon from '../images/NodeIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '../ui/Util';
import { NodeUtils } from './node-utils';
import NodeDetailsSummary from './NodeDetailsSummary.svelte';
import type { NodeUI } from './NodeUI';

export let name: string;

let node: NodeUI;
let detailsPage: DetailsPage;
let kubeNode: V1Node | undefined;
let kubeError: string;

onMount(() => {
  const nodeUtils = new NodeUtils();
  // loading node info
  return kubernetesCurrentContextNodes.subscribe(nodes => {
    const matchingNode = nodes.find(dep => dep.metadata?.name === name);
    if (matchingNode) {
      try {
        node = nodeUtils.getNodeUI(matchingNode);
        loadDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the node has been deleted
      detailsPage.close();
    }
  });
});

async function loadDetails() {
  const getKubeNode = await window.kubernetesReadNode(name);
  if (getKubeNode) {
    kubeNode = getKubeNode;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${node.name}`;
  }
}
</script>

{#if node}
  <DetailsPage title={node.name} bind:this={detailsPage}>
    <StatusIcon slot="icon" icon={NodeIcon} size={24} status={node.status} />
    <svelte:fragment slot="tabs">
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <NodeDetailsSummary node={kubeNode} kubeError={kubeError} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeNode, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeNode)} />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
