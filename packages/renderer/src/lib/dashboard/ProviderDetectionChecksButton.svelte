<script lang="ts">
import { faList } from '@fortawesome/free-solid-svg-icons';
import type { ProviderDetectionCheck } from '@podman-desktop/api';
import { Button } from '@podman-desktop/ui-svelte';

import type { ProviderInfo } from '/@api/provider-info';

export let provider: ProviderInfo;
export let onDetectionChecks = (_detectionChecks: ProviderDetectionCheck[]) => {};
let viewInProgress = false;

let mode: 'view' | 'hide' = 'view';

async function toggleDetectionChecks(provider: ProviderInfo) {
  let detectionChecks: ProviderDetectionCheck[] = [];
  if (mode === 'view') {
    viewInProgress = true;
    // needs to ask the provider why it didn't find provider being installed
    detectionChecks = await window.getProviderDetectionChecks(provider.internalId);
  } else {
    detectionChecks = [];
  }
  onDetectionChecks(detectionChecks);
  viewInProgress = false;

  if (mode === 'view') {
    mode = 'hide';
  } else {
    mode = 'view';
  }
}
</script>

{#if provider.detectionChecks.length > 0}
  <Button
    on:click={() => toggleDetectionChecks(provider)}
    inProgress={viewInProgress}
    icon={faList}
    title="Why {provider.name} is not found.">
    {mode === 'view' ? 'View' : 'Hide'} detection checks
  </Button>
{/if}
