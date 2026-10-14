<script lang="ts">
import type { ProviderInfo } from '@desktop-framework/api';
import type { ProviderDetectionCheck } from '@desktop-framework/extension-api';
import { faList } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

interface Props {
  provider: ProviderInfo;
  onDetectionChecks?: (detectionChecks: ProviderDetectionCheck[]) => void;
}
let { provider, onDetectionChecks = (_detectionChecks: ProviderDetectionCheck[]): void => {} }: Props = $props();
let viewInProgress = $state(false);

let mode: 'view' | 'hide' = $state('view');

async function toggleDetectionChecks(provider: ProviderInfo): Promise<void> {
  let detectionChecks: ProviderDetectionCheck[];
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
    on:click={(): Promise<void> => toggleDetectionChecks(provider)}
    inProgress={viewInProgress}
    icon={faList}
    title="Why {provider.name} is not found.">
    {mode === 'view' ? 'View' : 'Hide'} detection checks
  </Button>
{/if}
