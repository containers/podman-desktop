<script lang="ts">
import { Link, NavPage } from '@podman-desktop/ui-svelte';

import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
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
import KubernetesDashboardGuideCard from './KubernetesDashboardGuideCard.svelte';
import KubernetesDashboardResourceCard from './KubernetesDashboardResourceCard.svelte';
import KubernetesEmptyPage from './KubernetesEmptyPage.svelte';

let noContexts = $derived($kubernetesCurrentContextState.error === NO_CURRENT_CONTEXT_ERROR);
let currentContextName = $derived($kubernetesContexts.find(context => context.currentContext)?.name);

let nodeCount = $derived($kubernetesCurrentContextNodes.length);
let deploymentCount = $derived($kubernetesCurrentContextDeployments.length);
let serviceCount = $derived($kubernetesCurrentContextServices.length);
let ingressRouteCount = $derived($kubernetesCurrentContextIngresses.length + $kubernetesCurrentContextRoutes.length);
let pvcCount = $derived($kubernetesCurrentContextPersistentVolumeClaims.length);
let configMapSecretCount = $derived(
  $kubernetesCurrentContextConfigMaps.length + $kubernetesCurrentContextSecrets.length,
);

async function openKubernetesDocumentation(): Promise<void> {
  await window.openExternal('https://podman-desktop.io/docs/kubernetes');
}
</script>

<NavPage searchEnabled={false}  title="Dashboard">
  <svelte:fragment slot="bottom-additional-actions">
    <div class="flex grow justify-end">
      <KubernetesCurrentContextConnectionBadge />
    </div>
  </svelte:fragment>

  <div class="flex min-w-full h-full justify-center" slot="content">
    {#if noContexts}
        <KubernetesEmptyPage />
    {:else}
        <div class="flex flex-col space-y-4 min-w-full overflow-y-auto">
            <div class="flex flex-col gap-4 p-5 pb-2">
                <span>Here you can manage and interact with Kubernetes clusters with features like connecting to clusters, and
                viewing workloads like deployments and services.</span>

                <span>Get up and running by clicking one of the menu items!</span>

                <Link class="place-self-start" on:click={openKubernetesDocumentation}>Kubernetes documentation</Link>
            </div>

            <div class="flex flex-col gap-4 bg-[var(--pd-content-card-bg)] grow p-5">
                {#if currentContextName}
                    <div class="text-xl pt-2">Metrics</div>
                    <div class="grid grid-cols-4 gap-4">
                        <KubernetesDashboardResourceCard type='Nodes' Icon={NodeIcon} count={nodeCount} link='/kubernetes/nodes'/>
                        <KubernetesDashboardResourceCard type='Deployments' Icon={DeploymentIcon} count={deploymentCount} link='/kubernetes/deployments'/>
                        <KubernetesDashboardResourceCard type='Services' Icon={ServiceIcon} count={serviceCount} link='/kubernetes/services'/>
                        <KubernetesDashboardResourceCard type='Ingresses & Routes' Icon={IngressRouteIcon} count={ingressRouteCount} link='/kubernetes/ingressesRoutes'/>
                        <KubernetesDashboardResourceCard type='Persistent Volume Claims' Icon={PvcIcon} count={pvcCount} link='/kubernetes/persistentvolumeclaims'/>
                        <KubernetesDashboardResourceCard type='ConfigMaps & Secrets' Icon={ConfigMapSecretIcon} count={configMapSecretCount} link='/kubernetes/configmapsSecrets'/>
                    </div>
                {/if}

                <div class="text-xl pt-2">Explore articles and blog posts</div>
                <div class="grid grid-cols-3 gap-4">
                    <KubernetesDashboardGuideCard title='Deploy and test Kubernetes containers using Podman Desktop' link='https://developers.redhat.com/articles/2023/06/09/deploy-and-test-kubernetes-containers-using-podman-desktop'/>
                    <KubernetesDashboardGuideCard title='Working with Kubernetes in Podman Desktop' link='https://developers.redhat.com/articles/2023/11/06/working-kubernetes-podman-desktop'/>
                    <KubernetesDashboardGuideCard title='Share your local podman images with the Kubernetes cluster' link='https://podman-desktop.io/blog/sharing-podman-images-with-kubernetes-cluster'/>
                </div>
            </div>
        </div>
    {/if}
  </div>
</NavPage>
