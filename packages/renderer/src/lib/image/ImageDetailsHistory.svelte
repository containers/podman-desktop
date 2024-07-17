<script lang="ts">
import { onMount } from 'svelte';

import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

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
  <MonacoEditor content={history} language="text" />
{/if}
