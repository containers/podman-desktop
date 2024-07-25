<script lang="ts">
import { faPlug } from '@fortawesome/free-solid-svg-icons';
import { Button, ErrorMessage } from '@podman-desktop/ui-svelte';

let reconnectInProgress = false;
let reconnectError = '';
let reconnectResult = '';

async function reconnectContainerProviders() {
  const start = performance.now();
  reconnectInProgress = true;
  reconnectError = '';
  reconnectResult = '...Waiting for response...';
  try {
    await window.reconnectContainerProviders();
  } catch (e) {
    reconnectError = String(e);
    reconnectResult = 'Failed';
  } finally {
    reconnectInProgress = false;
  }
  const end = performance.now();
  reconnectResult = `Done in (${(end - start).toFixed(2)}ms)`;
}
</script>

<div class="flex flex-row items-center">
  <Button
    class="my-1"
    bind:inProgress={reconnectInProgress}
    title="Re-establish connection to the container engine sockets"
    on:click={() => reconnectContainerProviders()}
    icon={faPlug}>
    Reconnect providers
  </Button>
  <div role="status" class="mx-2">{reconnectResult}</div>
  {#if reconnectError}
    <ErrorMessage class="mx-2" error={reconnectError} />
  {/if}
</div>
