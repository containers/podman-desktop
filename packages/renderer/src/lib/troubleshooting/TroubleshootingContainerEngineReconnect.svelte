<script lang="ts">
import ErrorMessage from '../ui/ErrorMessage.svelte';

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
    reconnectError = e;
    reconnectResult = 'Failed';
  } finally {
    reconnectInProgress = false;
  }
  const end = performance.now();
  reconnectResult = `Done in (${(end - start).toFixed(2)}ms)`;
}
</script>

<div class="flex flex-row items-center">
  <button
    disabled="{reconnectInProgress}"
    class="px-3 my-1 text-sm font-medium text-center text-white bg-violet-600 rounded-sm hover:bg-dustypurple-800 focus:ring-2 focus:outline-none focus:ring-dustypurple-700"
    title="Establish again connection to the socket of container engines"
    on:click="{() => reconnectContainerProviders()}">
    Reconnect providers
  </button>
  <div role="status" class="mx-2">{reconnectResult}</div>
  {#if reconnectError}
    <ErrorMessage class="mx-2" error="{reconnectError}" />
  {/if}
</div>
