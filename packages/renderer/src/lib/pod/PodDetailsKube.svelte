<script lang="ts">
import { onMount } from 'svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { PodInfoUI } from './PodInfoUI';
import { stringify } from 'yaml';
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
  <MonacoEditor content="{kubeDetails}" language="yaml" />
{/if}
