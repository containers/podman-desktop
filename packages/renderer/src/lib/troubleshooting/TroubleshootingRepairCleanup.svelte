<script lang="ts">
import { faBroom, faWarning } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';
import Fa from 'svelte-fa';

import type { ProviderInfo } from '/@api/provider-info';

export let providers: ProviderInfo[] = [];
let providerIdsWithCleanup: string[] = [];
$: providerIdsWithCleanup = providers.filter(provider => provider.cleanupSupport).map(provider => provider.internalId);

let cleanupInProgress = false;

let cleanupFailures: string[] = [];

async function openCleanupDialog(): Promise<void> {
  let message = 'This action may delete data. Proceed ?';

  const result = await window.showMessageBox({
    title: 'Cleanup',
    message: message,
    buttons: ['Yes', 'Cancel'],
  });

  if (result?.response === 0) {
    cleanup();
  }
}

async function cleanup() {
  try {
    cleanupInProgress = true;
    cleanupFailures = [];
    await window.cleanupProviders(providerIdsWithCleanup, Symbol('cleanup-provider'), (_key, _eventName, args) => {
      // log into the console as no UI is available to display logs
      console.log('cleanup event', args);
    });
  } catch (e) {
    console.error(e);
    cleanupFailures.push(String(e));
    cleanupFailures = [...cleanupFailures];
  } finally {
    cleanupInProgress = false;
  }
}
</script>

<div class="flex flex-row items-center">
  <div>
    <div class="text-gray-700 flex flex-row items-center">Clean / Purge data</div>
    <div class="text-gray-900 text-sm flex flex-row items-center pt-1">
      <Fa class="pr-1" size="0.8x" icon={faWarning} />Proceeding with this action may result in data loss, including
      existing volumes, containers, images, etc.
    </div>
  </div>

  <div class="flex flex-1 justify-end">
    <Button
      type="danger"
      on:click={() => openCleanupDialog()}
      inProgress={cleanupInProgress}
      aria-label="Cleanup"
      icon={faBroom}>Cleanup / Purge data</Button>
  </div>

  <div>
    {#if cleanupFailures.length > 0}
      <div class="text-red-500 text-xs flex flex-row items-center" role="alert" aria-label="error">
        <Fa class="pr-1" size="1x" icon={faWarning} />{cleanupFailures.length} failures
      </div>
    {/if}
  </div>
</div>
