<script lang="ts">
import { onMount } from 'svelte';

import type { VolumeInspectInfo } from '/@api/volume-info';

import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { VolumeInfoUI } from './VolumeInfoUI';

export let volume: VolumeInfoUI;

let inspectDetails: string;

onMount(async () => {
  // grab inspect result from the container
  const inspectResult = (await window.getVolumeInspect(volume.engineId, volume.name)) as Partial<VolumeInspectInfo>;

  // remove engine* properties from the inspect result as it's more internal
  delete inspectResult.engineId;
  delete inspectResult.engineName;

  inspectDetails = JSON.stringify(inspectResult, undefined, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content={inspectDetails} language="json" />
{/if}
