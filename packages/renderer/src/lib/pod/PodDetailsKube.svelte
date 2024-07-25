<script lang="ts">
import { onMount } from 'svelte';
import { stringify } from 'yaml';

import MonacoEditor from '../editor/MonacoEditor.svelte';
import KubeEditYAML from '../kube/KubeEditYAML.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI;

let kubeDetails: string;

onMount(async () => {
  // grab kube result from the pod
  if (pod.kind === 'podman') {
    const kubeResult = await window.generatePodmanKube(pod.engineId, [pod.id]);
    kubeDetails = kubeResult;
  } else {
    const ns = await window.kubernetesGetCurrentNamespace();
    if (ns) {
      const kubepod = await window.kubernetesReadNamespacedPod(pod.name, ns);
      if (kubepod) {
        kubeDetails = stringify(kubepod);
      }
    }
  }
});
</script>

{#if kubeDetails}
  {#if pod.kind === 'podman'}
    <MonacoEditor content={kubeDetails} language="yaml" />
  {:else}
    <KubeEditYAML content={kubeDetails} />
  {/if}
{/if}
