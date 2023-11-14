<script lang="ts">
import SettingsPage from './SettingsPage.svelte';
import EngineIcon from '../ui/EngineIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import { onMount } from 'svelte';
import type { KubeContextUI } from '../kube/KubeContextUI';
import { getKubeUIContexts } from '../kube/KubeContextUI';
import Link from '../ui/Link.svelte';
import type { Cluster } from '@kubernetes/client-node';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import ListItemButtonIcon from '../ui/ListItemButtonIcon.svelte';

let contexts: KubeContextUI[] = [];
let k8sClusters: Cluster[] = [];

$: contexts;

onMount(async () => {
  // Retrieve both the contexts and clusters
  let k8sContexts = await window.kubernetesGetContexts();
  k8sClusters = await window.kubernetesGetClusters();

  // Convert them to KubeContextUI so we can safely render them.
  contexts = getKubeUIContexts(k8sContexts, k8sClusters);
});

async function handleDeleteContext(contextName: string) {
  try {
    const newK8sContexts = await window.kubernetesDeleteContext(contextName);
    contexts = getKubeUIContexts(newK8sContexts, k8sClusters);
  } catch (e) {
    console.log(' ==> error', e);
  }
}
</script>

<SettingsPage title="Kubernetes Contexts">
  <div class="h-full" role="table" aria-label="contexts">
    <!-- Use KubernetesIcon in the future / not EngineIcon -->
    <EmptyScreen
      aria-label="no-resource-panel"
      icon="{EngineIcon}"
      title="No Kubernetes contexts found"
      message="Check that $HOME/.kube/config exists or KUBECONFIG environment variable has been set correctly."
      hidden="{contexts.length > 0}" />
    {#each contexts as context}
      <div role="row" class="bg-charcoal-600 mb-5 rounded-md p-3 flex-nowrap">
        <div class="pb-2">
          <div class="flex">
            {#if context?.icon}
              {#if typeof context.icon === 'string'}
                <img
                  src="{context.icon}"
                  aria-label="context-logo"
                  alt="{context.name} logo"
                  class="max-w-[40px] h-full" />
              {/if}
            {/if}
            <span id="{context.name}" class="my-auto text-gray-400 ml-3 break-words flex-auto" aria-label="context-name"
              >{context.name}</span>
            <ListItemButtonIcon
              title="Delete Context"
              icon="{faTrash}"
              onClick="{() => handleDeleteContext(context.name)}"></ListItemButtonIcon>
          </div>
        </div>
        <div class="grow flex-column divide-gray-900 text-gray-400">
          <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
            <span class="my-auto font-bold col-span-1 text-right">CLUSTER</span>
            <span class="my-auto col-span-5 text-left pl-0.5 ml-3" aria-label="context-cluster">{context.cluster}</span>
          </div>

          {#if context.clusterInfo !== undefined}
            <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
              <span class="my-auto font-bold col-span-1 text-right">SERVER</span>
              <span class="my-auto col-span-5 text-left ml-3">
                <Link class="text-xs" externalRef="{context.clusterInfo.server}">
                  {context.clusterInfo.server}
                </Link>
              </span>
            </div>
          {/if}

          <div class="text-xs bg-charcoal-800 p-2 rounded-lg mt-1 grid grid-cols-6">
            <span class="my-auto font-bold col-span-1 text-right">USER</span>
            <span class="my-auto col-span-5 text-left pl-0.5 ml-3" aria-label="context-user">{context.user}</span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
