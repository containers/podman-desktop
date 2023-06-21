<script lang="ts">
import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';

import { Buffer } from 'buffer';
import ErrorMessage from '../ui/ErrorMessage.svelte';

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
    pingError = e;
  } finally {
    pingInProgress = false;
  }
  const end = performance.now();
  pingResult += ` (${(end - start).toFixed(2)}ms)`;
}
</script>

<div class="flex flex-row items-center">
  <div class="w-36">
    <button
      disabled="{pingInProgress}"
      class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700 w-full"
      title="Ping"
      on:click="{() => pingConnection()}">
      Ping
    </button>
  </div>
  <div role="status" class="mx-2">{pingResult}</div>
  {#if pingError}
    <ErrorMessage class="mx-2" error="{pingError}" />
  {/if}
</div>
