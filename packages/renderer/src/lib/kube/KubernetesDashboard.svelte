<script lang="ts">
import type { IDisposable, ResourceCount } from '@desktop-framework/api';
import type { KubernetesObject } from '@kubernetes/client-node';
import { Expandable, Link } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';

import { listenActiveResourcesCount } from '/@/lib/kube/active-resources-count-listen';
import KubernetesCurrentContextConnectionBadge from '/@/lib/ui/KubernetesCurrentContextConnectionBadge.svelte';
import { containersInfos } from '/@/stores/containers';
import { kubernetesContextsPermissions } from '/@/stores/kubernetes-context-permission';
import { kubernetesContexts } from '/@/stores/kubernetes-contexts';
import {
  kubernetesCurrentContextConfigMaps,
  kubernetesCurrentContextCronJobs,
  kubernetesCurrentContextDeployments,
  kubernetesCurrentContextIngresses,
  kubernetesCurrentContextJobs,
  kubernetesCurrentContextNodes,
  kubernetesCurrentContextPersistentVolumeClaims,
  kubernetesCurrentContextPods,
  kubernetesCurrentContextRoutes,
  kubernetesCurrentContextSecrets,
  kubernetesCurrentContextServices,
} from '/@/stores/kubernetes-contexts-state';
import { isKubernetesExperimentalModeStore } from '/@/stores/kubernetes-experimental';
import { kubernetesNoCurrentContext } from '/@/stores/kubernetes-no-current-context';
import { kubernetesResourcesCount } from '/@/stores/kubernetes-resources-count';

import deployAndTestKubernetesImage from './DeployAndTestKubernetes.png';
import KubernetesDashboardGuideCard from './KubernetesDashboardGuideCard.svelte';
import KubernetesDashboardResourceCard from './KubernetesDashboardResourceCard.svelte';
import KubernetesEmptyPage from './KubernetesEmptyPage.svelte';
import NamespaceDropdown from './NamespaceDropdown.svelte';
import shareYourLocalProdmanImagesWithTheKubernetesImage from './ShareYourLocalPodmanImagesWithTheKubernetes.png';
import workingWithKubernetesImage from './WorkingWithKubernetes.png';

interface ExtendedKubernetesObject extends KubernetesObject {
  spec: {
    replicas: number;
  };
}

let currentContextName = $derived($kubernetesContexts.find(context => context.currentContext)?.name);

// Stores and states for non-experimental mode
let nodeCount = $derived($kubernetesCurrentContextNodes.length);
let activeNodeCount = $derived(
  $containersInfos.filter(
    container =>
      // the UI state is uppercased by ContainerUtils.getState; comparing against the raw
      // lowercase value would make this count silently zero
      container.state === 'RUNNING' &&
      container.names.some(name => $kubernetesCurrentContextNodes.some(node => name === `/${node.metadata?.name}`)),
  ).length,
);
let deploymentCount = $derived($kubernetesCurrentContextDeployments.length);
let activeDeploymentsCount = $derived(
  ($kubernetesCurrentContextDeployments as ExtendedKubernetesObject[]).filter(
    deployment => deployment.spec?.replicas > 0,
  ).length,
);
let podCount = $derived($kubernetesCurrentContextPods.length);
let serviceCount = $derived($kubernetesCurrentContextServices.length);
let ingressCount = $derived($kubernetesCurrentContextIngresses.length);
let routeCount = $derived($kubernetesCurrentContextRoutes.length);
let pvcCount = $derived($kubernetesCurrentContextPersistentVolumeClaims.length);
let configMapCount = $derived($kubernetesCurrentContextConfigMaps.length);
let secretCount = $derived($kubernetesCurrentContextSecrets.length);
let cronjobCount = $derived($kubernetesCurrentContextCronJobs.length);
let jobCount = $derived($kubernetesCurrentContextJobs.length);

// state for experimental mode
let kubernetesActiveResourcesCountExperimental = $state<ResourceCount[]>([]);

let disposable: IDisposable | undefined;

// permissions - experimental mode only
// we check for *not* permitted resources, to support legacy mode
// condition may be inverted when legacy mode is removed
const notPermittedResources = $derived(
  !$isKubernetesExperimentalModeStore
    ? []
    : $kubernetesContextsPermissions
        .filter(p => p.contextName === currentContextName)
        .filter(p => p.permitted === false)
        .map(p => p.resourceName),
);

function isPermitted(notPermittedResources: string[], resourceName: string): boolean {
  return !notPermittedResources.includes(resourceName);
}

onMount(async () => {
  // listen active resources for experimental mode
  disposable = await listenActiveResourcesCount((activeResourcesCounts: ResourceCount[]): void => {
    kubernetesActiveResourcesCountExperimental = activeResourcesCounts;
  });
});

onDestroy(() => {
  disposable?.dispose();
});

// get data in compatible format, from experimental mode data
function getCountsForContext(
  contextName: string | undefined,
  storeValue: ResourceCount[],
  initialValue: { [key: string]: number },
): { [key: string]: number } {
  return storeValue.reduce(
    (acc, resourceCount) => {
      if (resourceCount.contextName === contextName) {
        acc[resourceCount.resourceName] = resourceCount.count;
      }
      return acc;
    },
    { ...initialValue },
  );
}

// common to experimental and non-experimental modes
const initialCounts: { [key: string]: number } = {
  nodes: 0,
  deployments: 0,
  pods: 0,
  services: 0,
  ingresses: 0,
  routes: 0,
  persistentvolumeclaims: 0,
  configmaps: 0,
  secrets: 0,
  jobs: 0,
  cronjobs: 0,
};

const counts = $derived.by(() => {
  if ($isKubernetesExperimentalModeStore === undefined) {
    return initialCounts;
  } else if ($isKubernetesExperimentalModeStore) {
    return getCountsForContext(currentContextName, $kubernetesResourcesCount, initialCounts);
  } else {
    return {
      nodes: nodeCount,
      deployments: deploymentCount,
      pods: podCount,
      services: serviceCount,
      ingresses: ingressCount,
      routes: routeCount,
      persistentvolumeclaims: pvcCount,
      configmaps: configMapCount,
      secrets: secretCount,
      jobs: jobCount,
      cronjobs: cronjobCount,
    };
  }
});

const initialActiveCounts: { [key: string]: number } = {
  nodes: 0,
  deployments: 0,
};

const activeCounts = $derived.by(() => {
  if ($isKubernetesExperimentalModeStore === undefined) {
    return initialActiveCounts;
  } else if ($isKubernetesExperimentalModeStore) {
    return getCountsForContext(currentContextName, kubernetesActiveResourcesCountExperimental, initialActiveCounts);
  } else {
    return {
      nodes: activeNodeCount,
      deployments: activeDeploymentsCount,
    };
  }
});

async function openKubernetesDocumentation(): Promise<void> {
  await window.openExternal('https://podman-desktop.io/docs/kubernetes');
}
</script>

<div class="flex flex-col w-full h-full">
  <div class="flex flex-col w-full h-full pt-4">
    {#if $kubernetesNoCurrentContext}
      <KubernetesEmptyPage />
    {:else}
      <!-- Details - collapsible -->
      <div class="flex flex-row w-full px-5 pb-2">
        <Expandable>
          <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
          {#snippet title()}
            <div class="flex flex-row w-full items-center">
              <div class="text-xl font-bold capitalize text-[var(--pd-content-header)]">Dashboard</div>
              <div class="flex grow justify-end"><KubernetesCurrentContextConnectionBadge /></div>
            </div>
          {/snippet}
          <div class="flex flex-col gap-4">
            <div>Here you can manage and interact with Kubernetes clusters with features like connecting to clusters, and
              viewing workloads like deployments and services.</div>
            <div>Get up and running by clicking one of the menu items!</div>
            <div><Link class="place-self-start" on:click={openKubernetesDocumentation}>Kubernetes documentation</Link></div>
          </div>
        </Expandable>
       </div>

      <div class="flex w-full h-full overflow-auto">
        <div class="flex min-w-full h-full justify-center">
          <div class="flex flex-col space-y-4 min-w-full overflow-y-auto">
            <div class="flex flex-col gap-4 bg-[var(--pd-content-card-bg)] grow p-5">
              {#if currentContextName}
                <!-- Metrics - non-collapsible -->
                <div class="flex flex-row">
                  <div class="text-xl pt-2 grow">Metrics</div>
                  <div class="justify-end"><NamespaceDropdown/></div>
                </div>
                <div class="grid grid-cols-4 gap-4">
                    <KubernetesDashboardResourceCard type='Nodes' activeCount={activeCounts.nodes} count={counts.nodes} permitted={isPermitted(notPermittedResources, 'nodes')} kind='Node'/>
                    <KubernetesDashboardResourceCard type='Deployments' activeCount={activeCounts.deployments} count={counts.deployments} permitted={isPermitted(notPermittedResources, 'deployments')} kind='Deployment'/>
                    <KubernetesDashboardResourceCard type='Pods' count={counts.pods} permitted={isPermitted(notPermittedResources, 'pods')} kind='Pod'/>
                    <KubernetesDashboardResourceCard type='Services' count={counts.services} permitted={isPermitted(notPermittedResources, 'services')} kind='Service'/>
                    <KubernetesDashboardResourceCard type='Ingresses & Routes' count={counts.ingresses + counts.routes} permitted={isPermitted(notPermittedResources, 'ingresses') || isPermitted(notPermittedResources, 'routes')} kind='Ingress'/>
                    <KubernetesDashboardResourceCard type='Persistent Volume Claims' count={counts.persistentvolumeclaims} permitted={isPermitted(notPermittedResources, 'persistentvolumeclaims')} kind='PersistentVolumeClaim'/>
                    <KubernetesDashboardResourceCard type='ConfigMaps & Secrets' count={counts.configmaps + counts.secrets} permitted={isPermitted(notPermittedResources, 'configmaps') || isPermitted(notPermittedResources, 'secrets')} kind='ConfigMap'/>
                    <KubernetesDashboardResourceCard type='Jobs' count={counts.jobs} permitted={isPermitted(notPermittedResources, 'jobs')} kind='Job'/>
                    <KubernetesDashboardResourceCard type='CronJobs' count={counts.cronjobs} permitted={isPermitted(notPermittedResources, 'cronjobs')} kind='CronJob'/>
                </div>
                <!-- Graphs -->
                
              {/if}
              <!-- Articles and blog posts - collapsible -->
              <div class="flex flex-1 flex-col pt-2">
                <Expandable>
                  <!-- eslint-disable-next-line sonarjs/no-unused-vars -->
                  {#snippet title()}<div class="text-xl">Explore articles and blog posts</div>{/snippet}
                  <div class="grid grid-cols-3 gap-4 pt-2">
                    <KubernetesDashboardGuideCard title='Deploy and test Kubernetes containers using Podman Desktop' image={deployAndTestKubernetesImage} link='https://developers.redhat.com/articles/2023/06/09/deploy-and-test-kubernetes-containers-using-podman-desktop'/>
                    <KubernetesDashboardGuideCard title='Working with Kubernetes in Podman Desktop' image={workingWithKubernetesImage} link='https://developers.redhat.com/articles/2023/11/06/working-kubernetes-podman-desktop'/>
                    <KubernetesDashboardGuideCard title='Share your local podman images with the Kubernetes cluster' image={shareYourLocalProdmanImagesWithTheKubernetesImage} link='https://podman-desktop.io/blog/sharing-podman-images-with-kubernetes-cluster'/>
                  </div>
                </Expandable>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
