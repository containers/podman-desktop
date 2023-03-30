<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import App from './App.svelte';

let systemReady: boolean = false;

let toggle: boolean = false;

let loadingSequence;

onMount(async () => {
  loadingSequence = setInterval(() => {
    toggle = !toggle;
  }, 100);
  // check if the server side is ready
  try {
    const isReady = await window.extensionSystemIsReady();
    systemReady = isReady;
    if (systemReady) {
      window.dispatchEvent(new CustomEvent('system-ready', {}));
    }
  } catch (error) {}
});

onDestroy(() => {
  if (loadingSequence) {
    clearInterval(loadingSequence);
  }
});

// Wait that the server-side is ready
window.events.receive('starting-extensions', (value: string) => {
  systemReady = value === 'true';
  if (systemReady) {
    window.dispatchEvent(new CustomEvent('system-ready', {}));
  }
  clearInterval(loadingSequence);
});
</script>

{#if !systemReady}
  <main class="min-h-screen flex flex-col h-screen">
    <div class="min-h-full min-w-full flex flex-col">
      <div class="pf-c-empty-state h-full">
        <div class="pf-c-empty-state__content">
          <i
            class:text-zinc-700="{toggle}"
            class:text-zinc-600="{!toggle}"
            class="fas fa-layer-group m-4 text-8xl"
            aria-hidden="true"></i>
          <h1 class="pf-c-title pf-m-lg">Initializing...</h1>
        </div>
      </div>
    </div>
  </main>
{:else}
  <App />
{/if}
