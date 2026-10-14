<script lang="ts">
import type { ImageInspectInfo } from '@desktop-framework/api';
import { onMount } from 'svelte';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { ImageInfoUI } from './ImageInfoUI';

interface Props {
  image: ImageInfoUI;
}

let { image }: Props = $props();

let inspectDetails: string | undefined = $state();

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
