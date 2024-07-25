<script lang="ts">
import type { V1Pod } from '@kubernetes/client-node';
import { onMount } from 'svelte';

import KubePodDetailsSummary from '../kube/KubePodDetailsSummary.svelte';
import type { PodInfoUI } from './PodInfoUI';
import PodmanPodDetailsSummary from './PodmanPodDetailsSummary.svelte';

export let pod: PodInfoUI;
let kubePod: V1Pod | undefined;
let getKubePodError: string;

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
ass KubePodDetailsSummary will automatically add a 'Loading ... ' section -->
{#if pod.kind === 'kubernetes'}
  <KubePodDetailsSummary pod={kubePod} />
{:else}
  <!-- Still show pod information in case the Kubernetes pod retrieval errors out -->
  <PodmanPodDetailsSummary pod={pod} />
{/if}
