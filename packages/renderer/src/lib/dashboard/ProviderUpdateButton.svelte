<script lang="ts">
import type { CheckStatus, ProviderInfo } from '@desktop-framework/api';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@podman-desktop/ui-svelte';

interface Props {
  provider: ProviderInfo;
  onPreflightChecks: (status: CheckStatus[]) => void;
}

let { provider, onPreflightChecks }: Props = $props();

let updateInProgress = $state(false);

let checksStatus: CheckStatus[] = $state([]);

let preflightChecksFailed = $state(false);

async function performUpdate(provider: ProviderInfo): Promise<void> {
  updateInProgress = true;

  checksStatus = [];
  let checkSuccess = false;
  let currentCheck: CheckStatus;
  try {
    checkSuccess = await window.runUpdatePreflightChecks(provider.internalId, {
      endCheck: status => {
        if (currentCheck) {
          currentCheck = status;
        } else {
          return;
        }
        checksStatus.push(currentCheck);
        onPreflightChecks(checksStatus);
      },
      startCheck: status => {
        currentCheck = status;
        onPreflightChecks([...checksStatus, currentCheck]);
      },
    });
  } catch (err) {
    console.error(err);
  }
  if (checkSuccess) {
    await window.updateProvider(provider.internalId);
    // reset checks
    onPreflightChecks([]);
  } else {
    preflightChecksFailed = true;
  }

  updateInProgress = false;
}
</script>

{#if provider?.version && provider?.updateInfo?.version && provider.version !== provider.updateInfo.version}
  <Button
    inProgress={updateInProgress}
    disabled={preflightChecksFailed || provider.status === 'starting'}
    icon={faBoxOpen}
    padding="px-3 py-0.5"
    on:click={(): Promise<void> => performUpdate(provider)}>
    Update to {provider.updateInfo.version}
  </Button>
{/if}
