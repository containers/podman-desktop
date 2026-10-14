<script lang="ts">
import type { IDisposable } from '@desktop-framework/api';
import type { CoreV1Event, KubernetesObject, V1Deployment } from '@kubernetes/client-node';
import { StatusIcon, Tab } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import { router } from 'tinro';
import { stringify } from 'yaml';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';
import type { EventUI } from '/@/lib/events/EventUI';
import DeploymentIcon from '/@/lib/images/DeploymentIcon.svelte';
import KubeEditYAML from '/@/lib/kube/KubeEditYAML.svelte';
import { listenResource } from '/@/lib/kube/resource-listen';
import DetailsPage from '/@/lib/ui/DetailsPage.svelte';
import { getTabUrl, isTabSelected } from '/@/lib/ui/Util';
import Route from '/@/Route.svelte';
import {
  kubernetesCurrentContextDeployments,
  kubernetesCurrentContextEvents,
} from '/@/stores/kubernetes-contexts-state';

import { DeploymentUtils } from './deployment-utils';
import DeploymentActions from './DeploymentActions.svelte';
import DeploymentDetailsSummary from './DeploymentDetailsSummary.svelte';
import type { DeploymentUI } from './DeploymentUI';

interface Props {
  name: string;
  namespace: string;
}
let { name, namespace }: Props = $props();

let deployment: DeploymentUI | undefined = $state(undefined);
let detailsPage: DetailsPage | undefined = $state(undefined);
let kubeDeployment: V1Deployment | undefined = $state(undefined);
let kubeError: string | undefined = $state(undefined);

let events = $state<EventUI[]>([]);
let listener: IDisposable | undefined;

onMount(async () => {
  const deploymentUtils = new DeploymentUtils();
  listener = await listenResource({
    resourceName: 'deployments',
    name,
    namespace,
    listenEvents: true,
    legacyResourceStore: kubernetesCurrentContextDeployments,
    legacyEventsStore: kubernetesCurrentContextEvents,
    onResourceNotFound: () => {
      if (detailsPage) {
        // the deployment has been deleted
        detailsPage.close();
      }
    },
    onResourceUpdated: (resource: KubernetesObject, isExperimental: boolean) => {
      deployment = deploymentUtils.getDeploymentUI(resource);
      if (isExperimental) {
        kubeDeployment = resource;
      } else {
        loadDetails().catch((err: unknown) => console.error(`Error getting deployment details ${name}`, err));
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
  const getKubeDeployment = await window.kubernetesReadNamespacedDeployment(name, namespace);
  if (getKubeDeployment) {
    kubeDeployment = getKubeDeployment;
  } else {
    kubeError = `Unable to retrieve Kubernetes details for ${name}`;
  }
}
</script>

{#if deployment}
  <DetailsPage title={deployment.name} subtitle={deployment.namespace} bind:this={detailsPage}>
    {#snippet iconSnippet()}
      {#if deployment}<StatusIcon icon={DeploymentIcon} size={24} status={deployment.status} />{/if}
    {/snippet}
    {#snippet actionsSnippet()}
      {#if deployment}<DeploymentActions deployment={deployment} detailed={true} />{/if}
    {/snippet}
    {#snippet tabsSnippet()}
      <Tab title="Summary" selected={isTabSelected($router.path, 'summary')} url={getTabUrl($router.path, 'summary')} />
      <Tab title="Inspect" selected={isTabSelected($router.path, 'inspect')} url={getTabUrl($router.path, 'inspect')} />
      <Tab title="Kube" selected={isTabSelected($router.path, 'kube')} url={getTabUrl($router.path, 'kube')} />
    {/snippet}
    {#snippet contentSnippet()}
      <Route path="/summary" breadcrumb="Summary" navigationHint="tab">
        <DeploymentDetailsSummary deployment={kubeDeployment} kubeError={kubeError} events={events} />
      </Route>
      <Route path="/inspect" breadcrumb="Inspect" navigationHint="tab">
        <MonacoEditor content={JSON.stringify(kubeDeployment, undefined, 2)} language="json" />
      </Route>
      <Route path="/kube" breadcrumb="Kube" navigationHint="tab">
        <KubeEditYAML content={stringify(kubeDeployment)} />
      </Route>
    {/snippet}
  </DetailsPage>
{/if}
