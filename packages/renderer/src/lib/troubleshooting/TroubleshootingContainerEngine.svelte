<script lang="ts">
import type { ProviderContainerConnectionInfo } from '/@api/provider-info';

import TroubleshootingContainerEngineGrabContainers from './TroubleshootingContainerEngineGrabContainers.svelte';
import TroubleshootingContainerEnginePing from './TroubleshootingContainerEnginePing.svelte';

export let containerEngineRunning: ProviderContainerConnectionInfo;
</script>

<div class="flex flex-col bg-charcoal-800 border-zinc-600 m-4 p-4 text-sm">
  <h6 aria-label="name">Name: {containerEngineRunning.name}</h6>
  <div class="mx-4">
    <h6 aria-label="status">Status: {containerEngineRunning.status}</h6>
    <h6 aria-label="socket path">Socket path: {containerEngineRunning.endpoint.socketPath}</h6>
  </div>
  <div>Actions:</div>
  <div class="mx-4">
    <TroubleshootingContainerEnginePing providerContainerEngine={containerEngineRunning} />
    <TroubleshootingContainerEngineGrabContainers providerContainerEngine={containerEngineRunning} />
  </div>
</div>
