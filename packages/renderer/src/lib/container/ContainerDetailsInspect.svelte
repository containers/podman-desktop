<script lang="ts">
import type { ContainerInspectInfo } from '@desktop-framework/api';
import { onMount } from 'svelte';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { ContainerInfoUI } from './ContainerInfoUI';

interface Props {
  container: ContainerInfoUI;
}

let { container }: Props = $props();

let inspectDetails: string = $state('');

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
