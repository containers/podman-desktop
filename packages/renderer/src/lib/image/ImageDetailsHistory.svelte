<script lang="ts">
import type { ImageInfoUI } from './ImageInfoUI';
import { onMount } from 'svelte';
import MonacoEditor from '../editor/MonacoEditor.svelte';

export let image: ImageInfoUI;

let history: string;

onMount(async () => {
  // grab inspect result from the container
  const historyResult = await window.getImageHistory(image.engineId, image.id);
  // keep only instructions
  const instructions = historyResult.map(item => item.CreatedBy || 'None');
  history = instructions.join('\n');
});
</script>

{#if history}
  <MonacoEditor content="{history}" language="text" />
{/if}
