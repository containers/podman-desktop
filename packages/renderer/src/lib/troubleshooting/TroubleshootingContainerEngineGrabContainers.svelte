<script lang="ts">
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import { faSignal } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage } from '@podman-desktop/ui-svelte';

interface Props {
  providerContainerEngine: ProviderContainerConnectionInfo;
}

let { providerContainerEngine }: Props = $props();

let listContainersResult = $state('');
let listInProgress = $state(false);
let listError = $state('');

async function grabContainers(): Promise<void> {
  const start = performance.now();
  listInProgress = true;
  listError = '';
  listContainersResult = 'Waiting for response...';
  try {
    const result = await window.listContainersFromEngine($state.snapshot(providerContainerEngine));
    listContainersResult = `Responded: ${result.length} containers`;
  } catch (e) {
    listError = String(e);
    listContainersResult = 'Failed';
  } finally {
    listInProgress = false;
  }
  const end = performance.now();
  listContainersResult += ` (${(end - start).toFixed(2)}ms)`;
}
</script>

<div class="flex flex-row items-center">
  <div class="w-36">
    <Button inProgress={listInProgress} class="my-1 w-full" on:click={grabContainers} icon={faSignal}>
      Check containers
    </Button>
  </div>
  <div role="status" class="mx-2">{listContainersResult}</div>
  {#if listError}
    <ErrorMessage class="mx-2" error={listError} />
  {/if}
</div>
