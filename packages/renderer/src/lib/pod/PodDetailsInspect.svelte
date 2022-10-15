<script lang="ts">
import { onMount } from 'svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { PodInfoUI } from './PodInfoUI';

export let pod: PodInfoUI;

let inspectDetails: string;

onMount(async () => {
  // grab inspect result from the container
  const inspectResult = await window.getPodInspect(pod.engineId, pod.id);
  // remove engine* properties from the inspect result as it's more internal
  delete inspectResult.engineId;
  delete inspectResult.engineName;

  inspectDetails = JSON.stringify(inspectResult, null, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content="{inspectDetails}" language="json" />
{/if}
