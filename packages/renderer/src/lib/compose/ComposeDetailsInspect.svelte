<script lang="ts">
import type { ContainerInspectInfo } from '@desktop-framework/api';
import { onMount } from 'svelte';

import MonacoEditor from '/@/lib/editor/MonacoEditor.svelte';

import type { ComposeInfoUI } from './ComposeInfoUI';

interface Props {
  compose: ComposeInfoUI;
}

let { compose }: Props = $props();

let inspectDetails: string = $state('');

onMount(async () => {
  // Go through each container and grab the inspect result, add it to inspectDetails / stringify
  const mappedResults = await Promise.all(
    compose.containers.map(async container => {
      const inspectResult = (await window.getContainerInspect(
        container.engineId,
        container.id,
      )) as Partial<ContainerInspectInfo>;

      // remove engine* properties from the inspect result as it's more internal
      delete inspectResult.engineId;
      delete inspectResult.engineName;

      return inspectResult;
    }),
  );

  // stringify the results
  inspectDetails = JSON.stringify(mappedResults, undefined, 2);
});
</script>

{#if inspectDetails}
  <MonacoEditor content={inspectDetails} language="json" />
{/if}
