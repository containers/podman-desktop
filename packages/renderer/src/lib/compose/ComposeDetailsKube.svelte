<script lang="ts">
import { onMount } from 'svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { ComposeInfoUI } from './ComposeInfoUI';

export let compose: ComposeInfoUI;

let kubeDetails: string;

onMount(async () => {
  // Grab all the container ID's from compose.containers
  const containerIds = compose.containers.map(container => container.id);

  // Extracting the potential kubeGenerator from the query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const kubeGenerator = urlParams.has('kubeGenerator') ? urlParams.get('kubeGenerator') : undefined;

  // Generate the kube yaml using the generatePodmanKube function which
  // only has to take in the engineID and an array of container ID's to generate from
  kubeDetails = await window.generatePodmanKube(compose.engineId, containerIds, kubeGenerator);
});
</script>

{#if kubeDetails}
  <MonacoEditor content="{kubeDetails}" language="yaml" />
{/if}
