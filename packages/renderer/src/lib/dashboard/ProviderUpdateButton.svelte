<script lang="ts">
import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import Spinner from '../ui/Spinner.svelte';

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
  <button
    disabled="{updateInProgress || preflightChecksFailed}"
    on:click="{() => performUpdate(provider)}"
    class="pf-c-button pf-m-primary"
    type="button">
    <span class="pf-c-button__icon pf-m-start">
      {#if updateInProgress}
        <div class="mr-20">
          <Spinner />
        </div>
      {:else}
        <i class="fas fa-box-open" aria-hidden="true"></i>
      {/if}
    </span>
    Update to {provider.updateInfo.version}
  </button>
{/if}
