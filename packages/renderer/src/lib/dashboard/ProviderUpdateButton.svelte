<script lang="ts">
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';

import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import Button from '../ui/Button.svelte';

export let provider: ProviderInfo;
let updateInProgress = false;

export let onPreflightChecks: (status: CheckStatus[]) => void;

let checksStatus: CheckStatus[] = [];

let preflightChecksFailed = false;

async function performUpdate(provider: ProviderInfo) {
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

{#if provider?.updateInfo?.version}
  <Button
    inProgress="{updateInProgress}"
    disabled="{preflightChecksFailed}"
    icon="{faBoxOpen}"
    on:click="{() => performUpdate(provider)}">
    Update to {provider.updateInfo.version}
  </Button>
{/if}
