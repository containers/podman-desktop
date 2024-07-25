<script lang="ts">
import { onMount } from 'svelte';

import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;

let kubeDetails: string;

onMount(async () => {
  // grab kube result from the container
  const kubeResult = await window.generatePodmanKube(container.engineId, [container.id]);
  kubeDetails = kubeResult;
});
</script>

{#if kubeDetails}
  <MonacoEditor content={kubeDetails} language="yaml" />
{/if}
