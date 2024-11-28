<script lang="ts">
import type { KubernetesObject } from '@kubernetes/client-node';
import { Link } from '@podman-desktop/ui-svelte';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import { containersInfos } from '/@/stores/containers';
import {
  kubernetesCurrentContextConfigMaps,
  kubernetesCurrentContextDeployments,
  kubernetesCurrentContextIngresses,
  kubernetesCurrentContextNodes,
  kubernetesCurrentContextPersistentVolumeClaims,
  kubernetesCurrentContextRoutes,
  kubernetesCurrentContextSecrets,
  kubernetesCurrentContextServices,
  kubernetesCurrentContextState,
} from '/@/stores/kubernetes-contexts-state';
import { NO_CURRENT_CONTEXT_ERROR } from '/@api/kubernetes-contexts-states';

import { kubernetesContexts } from '../../stores/kubernetes-contexts';
import ConfigMapSecretIcon from '../images/ConfigMapSecretIcon.svelte';
import DeploymentIcon from '../images/DeploymentIcon.svelte';
import IngressRouteIcon from '../images/IngressRouteIcon.svelte';
import NodeIcon from '../images/NodeIcon.svelte';
import PvcIcon from '../images/PVCIcon.svelte';
import ServiceIcon from '../images/ServiceIcon.svelte';
import { fadeSlide } from '../ui/animations';
import deployAndTestKubernetesImage from './DeployAndTestKubernetes.png';
import KubernetesDashboardGuideCard from './KubernetesDashboardGuideCard.svelte';
import KubernetesDashboardResourceCard from './KubernetesDashboardResourceCard.svelte';
import KubernetesEmptyPage from './KubernetesEmptyPage.svelte';
import shareYourLocalProdmanImagesWithTheKubernetesImage from './ShareYourLocalPodmanImagesWithTheKubernetes.png';
import workingWithKubernetesImage from './WorkingWithKubernetes.png';

interface ExtendedKubernetesObject extends KubernetesObject {
  spec: {
    replicas: number;
  };
}

let noContexts = $derived($kubernetesCurrentContextState.error === NO_CURRENT_CONTEXT_ERROR);
let currentContextName = $derived($kubernetesContexts.find(context => context.currentContext)?.name);
let nodeCount = $derived($kubernetesCurrentContextNodes.length);
let activeNodeCount = $derived(
  $containersInfos.filter(
    container =>
      container.State === 'running' &&
      container.Names?.some(name => $kubernetesCurrentContextNodes.some(node => name === `/${node.metadata?.name}`)),
  ).length,
);
let deploymentCount = $derived($kubernetesCurrentContextDeployments.length);
let activeDeploymentsCount = $derived(
  ($kubernetesCurrentContextDeployments as ExtendedKubernetesObject[]).filter(
    deployment => deployment.spec?.replicas > 0,
  ).length,
);
let serviceCount = $derived($kubernetesCurrentContextServices.length);
let ingressRouteCount = $derived($kubernetesCurrentContextIngresses.length + $kubernetesCurrentContextRoutes.length);
let pvcCount = $derived($kubernetesCurrentContextPersistentVolumeClaims.length);
let configMapSecretCount = $derived(
  $kubernetesCurrentContextConfigMaps.length + $kubernetesCurrentContextSecrets.length,
);
let expandedDetails: boolean = $state(true);
let expandedGuide: boolean = $state(true);

async function openKubernetesDocumentation(): Promise<void> {
  await window.openExternal('https://podman-desktop.io/docs/kubernetes');
}
</script>

<div class="flex flex-col w-full h-full">
  <div class="flex flex-col w-full h-full pt-4">
    {#if noContexts}
      <KubernetesEmptyPage />
    {:else}
      <!-- Details - collapsible -->
      <div class="flex flex-1 flex-col">
        <div class="flex flex-row w-full px-5 pb-2">
          <button onclick={() => (expandedDetails = !expandedDetails)}>
            <div class="flex flex-row space-x-2 items-center text-[var(--pd-content-card-header-text)]">
              <div class="flex w-full" role="region" aria-label="header">
                <h1 class="text-xl font-bold capitalize text-[var(--pd-content-header)]">
                  {#if expandedDetails}
                  <i class="fas fa-chevron-down"></i>
                {:else}
                  <i class="fas fa-chevron-right"></i>
                {/if}
                  Dashboard
                </h1>
              </div>
            </div>
          </button>
          <div class="flex grow justify-end">
            <KubernetesCurrentContextConnectionBadge />
          </div>
        </div>
      </div>
      <div class="flex flex-col pl-5 pr-5 border-[var(--pd-global-nav-bg-border)] border-b-[1px]">
        {#if expandedDetails}
          <div role="region" class="flex flex-col py-2">
            <div transition:fadeSlide={{ duration: 500 }} class="flex flex-col gap-4">
              <div>Here you can manage and interact with Kubernetes clusters with features like connecting to clusters, and
                viewing workloads like deployments and services.</div>
              <div>Get up and running by clicking one of the menu items!</div>
              <div><Link class="place-self-start" on:click={openKubernetesDocumentation}>Kubernetes documentation</Link></div>
            </div>
          </div>
        {/if}
      </div>

      <div class="flex w-full h-full overflow-auto">
        <div class="flex min-w-full h-full justify-center">
          <div class="flex flex-col space-y-4 min-w-full overflow-y-auto">
            <div class="flex flex-col gap-4 bg-[var(--pd-content-card-bg)] grow p-5">
              {#if currentContextName}
                <!-- Metrics - non-collapsible -->
                <div class="text-xl pt-2">Metrics</div>
                <div class="grid grid-cols-4 gap-4">
                    <KubernetesDashboardResourceCard type='Nodes' Icon={NodeIcon} activeCount={activeNodeCount} count={nodeCount} link='/kubernetes/nodes'/>
                    <KubernetesDashboardResourceCard type='Deployments' Icon={DeploymentIcon} activeCount={activeDeploymentsCount} count={deploymentCount} link='/kubernetes/deployments'/>
                    <KubernetesDashboardResourceCard type='Services' Icon={ServiceIcon} count={serviceCount} link='/kubernetes/services'/>
                    <KubernetesDashboardResourceCard type='Ingresses & Routes' Icon={IngressRouteIcon} count={ingressRouteCount} link='/kubernetes/ingressesRoutes'/>
                    <KubernetesDashboardResourceCard type='Persistent Volume Claims' Icon={PvcIcon} count={pvcCount} link='/kubernetes/persistentvolumeclaims'/>
                    <KubernetesDashboardResourceCard type='ConfigMaps & Secrets' Icon={ConfigMapSecretIcon} count={configMapSecretCount} link='/kubernetes/configmapsSecrets'/>
                </div>
                <!-- Graphs -->
                
              {/if}
              <!-- Articles and blog posts - collapsible -->
              <div class="flex flex-1 flex-col pt-2">
                <div>
                  <button onclick={() => (expandedGuide = !expandedGuide)}>
                    <div class="flex flex-row space-x-2 items-center text-[var(--pd-content-card-header-text)]">
                      {#if expandedGuide}
                        <i class="fas fa-chevron-down"></i>
                      {:else}
                        <i class="fas fa-chevron-right"></i>
                      {/if}
                      <p class="text-xl">Explore articles and blog posts</p>
                    </div>
                  </button>
                </div>
                {#if expandedGuide}
                  <div role="region" class="mt-5">
                    <div transition:fadeSlide={{ duration: 500 }}>
                      <div class="grid grid-cols-3 gap-4">
                        <KubernetesDashboardGuideCard title='Deploy and test Kubernetes containers using Podman Desktop' image={deployAndTestKubernetesImage} link='https://developers.redhat.com/articles/2023/06/09/deploy-and-test-kubernetes-containers-using-podman-desktop'/>
                        <KubernetesDashboardGuideCard title='Working with Kubernetes in Podman Desktop' image={workingWithKubernetesImage} link='https://developers.redhat.com/articles/2023/11/06/working-kubernetes-podman-desktop'/>
                        <KubernetesDashboardGuideCard title='Share your local podman images with the Kubernetes cluster' image={shareYourLocalProdmanImagesWithTheKubernetesImage} link='https://podman-desktop.io/blog/sharing-podman-images-with-kubernetes-cluster'/>
                      </div>
                    </div>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
