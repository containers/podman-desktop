<script lang="ts">
import { onMount } from 'svelte';

import type { ImageInspectInfo } from '/@api/image-inspect-info';

import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { ImageInfoUI } from './ImageInfoUI';

export let image: ImageInfoUI;

let inspectDetails: string;

onMount(async () => {
  // grab inspect result from the container
  const inspectResult = (await window.getImageInspect(image.engineId, image.id)) as Partial<ImageInspectInfo>;

  // remove engine* properties from the inspect result as it's more internal
  delete inspectResult.engineId;
  delete inspectResult.engineName;

  inspectDetails = JSON.stringify(inspectResult, undefined, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content={inspectDetails} language="json" />
{/if}
