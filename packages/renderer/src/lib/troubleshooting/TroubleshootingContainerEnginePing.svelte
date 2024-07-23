<script lang="ts">
import { faSignal } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage } from '@podman-desktop/ui-svelte';
import { Buffer } from 'buffer';

import type { ProviderContainerConnectionInfo } from '/@api/provider-info';

export let providerContainerEngine: ProviderContainerConnectionInfo;

let pingResult = '';
let pingInProgress = false;
let pingError = '';

async function pingConnection() {
  const start = performance.now();
  pingInProgress = true;
  pingError = '';
  pingResult = '...Waiting for response...';
  try {
    const result = await window.pingContainerEngine(providerContainerEngine);
    pingResult = `Responded: ${Buffer.from(String(result)).toString()}`;
  } catch (e) {
    pingResult = 'Failed';
    pingError = String(e);
  } finally {
    pingInProgress = false;
  }
  const end = performance.now();
  pingResult += ` (${(end - start).toFixed(2)}ms)`;
}
</script>

<div class="flex flex-row items-center">
  <div class="w-36">
    <Button bind:inProgress={pingInProgress} class="my-1 w-full" on:click={() => pingConnection()} icon={faSignal}>
      Ping
    </Button>
  </div>
  <div role="status" class="mx-2">{pingResult}</div>
  {#if pingError}
    <ErrorMessage class="mx-2" error={pingError} />
  {/if}
</div>
