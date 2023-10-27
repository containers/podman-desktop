<script lang="ts">
import { router } from 'tinro';
import type { PodInfoUI } from './PodInfoUI';
import type { V1Pod } from '@kubernetes/client-node';
import { onMount } from 'svelte';
import KubeDetailsSummary from '../kube/KubeDetailsSummary.svelte';

export let pod: PodInfoUI;
let kubePod: V1Pod | undefined;
let getKubePodError: string;

function openContainer(containerID: string) {
  router.goto(`/containers/${containerID}/logs`);
}

onMount(async () => {
  // If this is a kubernetes kind, let's retrieve the pod information and display it in the summary
  if (pod.kind === 'kubernetes') {
    const ns = await window.kubernetesGetCurrentNamespace();
    if (ns) {
      const getKubePod = await window.kubernetesReadNamespacedPod(pod.name, ns);
      if (getKubePod) {
        kubePod = getKubePod;
      } else {
        getKubePodError = `Unable to retrieve Kubernetes pod details for ${pod.name}`;
      }
    }
  }
});
</script>

<!-- Show the kube pod error if we're unable to retrieve the data correctly, but we still want to show the 
basic pod information -->
{#if getKubePodError}
  <p class="text-red-500 font-medium">{getKubePodError}</p>
{/if}

<!-- Load the Kubernetes information, pass in kubePod regardless if it's undefined
ass KubeDetailsSummary will automatically add a 'Loading ... ' section -->
{#if pod.kind === 'kubernetes'}
  <KubeDetailsSummary pod="{kubePod}" />
{:else}
  <!-- Still show pod information in case the Kubernetes pod retrieval errors out -->
  <div class="flex px-5 py-4 flex-col h-full overflow-auto">
    <div class="w-full">
      <table>
        <tr>
          <td class="pt-2 pr-2">Name:</td>
          <td class="pt-2 pr-2">{pod.name}</td>
        </tr>
        <tr>
          <td class="pt-2 pr-2">Id:</td>
          <td class="pt-2 pr-2">{pod.id}</td>
        </tr>
      </table>
    </div>
    {#if pod.containers.length > 0}
      <div class="w-full mt-12">
        <span>Containers using this pod:</span>
        <table>
          {#each pod.containers as container}
            <tr class="cursor-pointer" on:click="{() => openContainer(container.Id)}">
              <td class="pt-2 pr-2">{container.Names}</td>
              <td class="pt-2 pr-2">{container.Id}</td>
            </tr>
          {/each}
        </table>
      </div>
    {/if}
  </div>
{/if}
