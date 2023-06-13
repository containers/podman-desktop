<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte';
import { router } from 'tinro';
import App from './App.svelte';
import SealRocket from './lib/images/SealRocket.svelte';

let systemReady = false;

let toggle = false;

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

    const extensionsStarted = await window.extensionSystemIsExtensionsStarted();
    if (extensionsStarted) {
      window.dispatchEvent(new CustomEvent('extensions-already-started', {}));
    }
  } catch (error) {}
});

onDestroy(() => {
  if (loadingSequence) {
    clearInterval(loadingSequence);
  }
});

// receive events from main process to install a new extension
window.events?.receive('install-extension:from-id', extensionId => {
  const action = async () => {
    const redirectPage = `/preferences/extensions/install-from-id/${extensionId}`;
    // need to open the extension page
    await tick();
    router.goto(redirectPage);
  };

  if (!systemReady) {
    // need to wait for the system to be ready, so we delay the install
    window.addEventListener('system-ready', () => {
      action();
    });
  } else {
    action();
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
          <SealRocket />
          <h1 class="pf-c-title pf-m-lg">Initializing...</h1>
        </div>
      </div>
    </div>
  </main>
{:else}
  <App />
{/if}
