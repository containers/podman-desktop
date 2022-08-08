<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import { onMount } from 'svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';

export let image: ImageInfoUI;

let inspectDetails: string;

onMount(async () => {
  // grab inspect result from the container
  const inspectResult = await window.getImageInspect(image.engineId, image.id);

  // remove engine* properties from the inspect result as it's more internal
  delete inspectResult.engineId;
  delete inspectResult.engineName;

  inspectDetails = JSON.stringify(inspectResult, null, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content="{inspectDetails}" language="json" />
{/if}
