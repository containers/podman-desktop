<script lang="ts">
import type { VolumeInspectInfo } from '@desktop-framework/api';
import { onMount } from 'svelte';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { VolumeInfoUI } from './VolumeInfoUI';

interface Props {
  volume: VolumeInfoUI;
}

let { volume }: Props = $props();

let inspectDetails: string = $state('');

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
