<script lang="ts">
import { onMount } from 'svelte';

import type { ContainerInspectInfo } from '/@api/container-inspect-info';

import MonacoEditor from '../editor/MonacoEditor.svelte';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;

let inspectDetails: string;

onMount(async () => {
  // grab inspect result from the container
  const inspectResult = (await window.getContainerInspect(
    container.engineId,
    container.id,
  )) as Partial<ContainerInspectInfo>;
  // remove engine* properties from the inspect result as it's more internal
  delete inspectResult.engineId;
  delete inspectResult.engineName;

  inspectDetails = JSON.stringify(inspectResult, undefined, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content={inspectDetails} language="json" />
{/if}
