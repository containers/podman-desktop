<script lang="ts">
import type { V1Deployment } from '@kubernetes/client-node';
import { onMount } from 'svelte';
import { stringify } from 'yaml';

import { kubernetesCurrentContextDeployments } from '/@/stores/kubernetes-contexts-state';

import Route from '../../Route.svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import DeploymentIcon from '../images/DeploymentIcon.svelte';
import StatusIcon from '../images/StatusIcon.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import DetailsPage from '../ui/DetailsPage.svelte';
import Tab from '../ui/Tab.svelte';
import { DeploymentUtils } from './deployment-utils';
import DeploymentActions from './DeploymentActions.svelte';
import DeploymentDetailsSummary from './DeploymentDetailsSummary.svelte';
import type { DeploymentUI } from './DeploymentUI';

export let name: string;
export let namespace: string;

let deployment: DeploymentUI;
let detailsPage: DetailsPage;
let kubeDeployment: V1Deployment | undefined;
let kubeError: string;

onMount(() => {
  const deploymentUtils = new DeploymentUtils();
  // loading deployment info
  return kubernetesCurrentContextDeployments.subscribe(deployments => {
    const matchingDeployment = deployments.find(
      dep => dep.metadata?.name === name && dep.metadata?.namespace === namespace,
    );
    if (matchingDeployment) {
      try {
        deployment = deploymentUtils.getDeploymentUI(matchingDeployment);
        loadDetails();
      } catch (err) {
        console.error(err);
      }
    } else if (detailsPage) {
      // the deployment has been deleted
      detailsPage.close();
    }
  });
});

async function loadDetails() {
  const getKubeDeployment = await window.kubernetesReadNamespacedDeployment(name, namespace);
  if (getKubeDeployment) {
    kubeDeployment = getKubeDeployment;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${deployment.name}`;
  }
}
</script>

{#if deployment}
  <DetailsPage title="{deployment.name}" subtitle="{deployment.namespace}" bind:this="{detailsPage}">
    <StatusIcon slot="icon" icon="{DeploymentIcon}" size="{24}" status="{deployment.status}" />
    <svelte:fragment slot="actions">
      <DeploymentActions deployment="{deployment}" detailed="{true}" on:update="{() => (deployment = deployment)}" />
    </svelte:fragment>
    <svelte:fragment slot="tabs">
      <Tab title="Summary" url="summary" />
      <Tab title="Inspect" url="inspect" />
      <Tab title="Kube" url="kube" />
    </svelte:fragment>
    <svelte:fragment slot="content">
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <DeploymentDetailsSummary deployment="{kubeDeployment}" kubeError="{kubeError}" />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content="{JSON.stringify(kubeDeployment, undefined, 2)}" language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content="{stringify(kubeDeployment)}" />
      </Route>
    </svelte:fragment>
  </DetailsPage>
{/if}
