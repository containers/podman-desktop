<script lang="ts">
import { onMount } from 'svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';

import type { PodInfoUI } from './PodInfoUI';
export let pod: PodInfoUI;

let kubeDetails: string;

onMount(async () => {
  // grab kube result from the pod
  const kubeResult = await window.generatePodmanKube(pod.engineId, [pod.id]);
  kubeDetails = kubeResult;
});
</script>

{#if kubeDetails}
  <MonacoEditor content="{kubeDetails}" language="yaml" />
{/if}
