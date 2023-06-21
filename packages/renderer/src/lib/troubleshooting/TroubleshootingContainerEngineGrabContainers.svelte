<script lang="ts">
import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';

import ErrorMessage from '../ui/ErrorMessage.svelte';

export let providerContainerEngine: ProviderContainerConnectionInfo;

let listContainersResult = '';
let listInProgress = false;
let listError = '';

async function grabContainers() {
  const start = performance.now();
  listInProgress = true;
  listError = '';
  listContainersResult = '...Waiting for response...';
  try {
    const result = await window.listContainersFromEngine(providerContainerEngine);

    listContainersResult = `Responded: ${result.length} containers`;
  } catch (e) {
    listError = e;
  } finally {
    listInProgress = false;
  }
  const end = performance.now();
  listContainersResult += ` (${(end - start).toFixed(2)}ms)`;
}
</script>

<div class="flex flex-row items-center">
  <div class="w-36">
    <button
      disabled="{listInProgress}"
      class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700 w-full"
      title="Check containers"
      on:click="{() => grabContainers()}">
      Check containers
    </button>
  </div>
  <div role="status" class="mx-2">{listContainersResult}</div>
  {#if listError}
    <ErrorMessage class="mx-2" error="{listError}" />
  {/if}
</div>
