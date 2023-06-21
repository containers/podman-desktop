<script lang="ts">
import ContainerIcon from '/@/lib/images/ContainerIcon.svelte';
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import TroubleshootingContainerEngine from './TroubleshootingContainerEngine.svelte';
import TroubleshootingContainerEngineReconnect from './TroubleshootingContainerEngineReconnect.svelte';

export let providers: ProviderInfo[] = [];
$: containerEngines = providers.map(provider => provider.containerConnections).flat();
$: containerEnginesRunning = containerEngines.filter(containerEngine => containerEngine.status === 'started');
</script>

<div class="flex flex-col bg-zinc-700 m-4 p-4">
  <div class="flex flex-row align-middle items-center">
    <ContainerIcon />
    <div role="status" aria-label="container connections" class="m-4 text-xl">
      Container connections: {containerEngines.length} ({containerEnginesRunning.length} running)
    </div>
  </div>

  {#if containerEnginesRunning.length > 0}
    <div class="mt-4">Running:</div>
    {#each containerEnginesRunning as containerEngineRunning}
      <TroubleshootingContainerEngine containerEngineRunning="{containerEngineRunning}" />
    {/each}

    <div class="flex flex-row align-middle items-center">
      <p class="mr-2 italic">In case of connection failures, connections to the sockets can be recreated:</p>
      <TroubleshootingContainerEngineReconnect />
    </div>
  {/if}
</div>
