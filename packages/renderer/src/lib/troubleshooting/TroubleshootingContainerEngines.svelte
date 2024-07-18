<script lang="ts">
import { ContainerIcon } from '@podman-desktop/ui-svelte/icons';

import type { ProviderInfo } from '/@api/provider-info';

import TroubleshootingContainerEngine from './TroubleshootingContainerEngine.svelte';
import TroubleshootingContainerEngineReconnect from './TroubleshootingContainerEngineReconnect.svelte';

export let providers: ProviderInfo[] = [];
$: containerEngines = providers.map(provider => provider.containerConnections).flat();
$: containerEnginesRunning = containerEngines.filter(containerEngine => containerEngine.status === 'started');
</script>

<div class="flex flex-col w-full bg-charcoal-600 p-4 rounded-lg">
  <div class="flex flex-row align-middle items-center">
    <ContainerIcon size="40" solid={true} class="pr-3 text-gray-700" />
    <div role="status" aria-label="container connections" class="text-xl">
      Container connections: {containerEngines.length} ({containerEnginesRunning.length} running)
    </div>
  </div>

  {#if containerEnginesRunning.length > 0}
    <div class="mt-4">Running:</div>
    {#each containerEnginesRunning as containerEngineRunning}
      <TroubleshootingContainerEngine containerEngineRunning={containerEngineRunning} />
    {/each}

    <div class="flex flex-row align-middle items-center">
      <p class="mr-2 italic">In case of connection failures, connections to the sockets can be recreated:</p>
      <TroubleshootingContainerEngineReconnect />
    </div>
  {/if}
</div>
