<script lang="ts">
import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

export let provider: ProviderInfo;

export let onPreflightChecks: (status: CheckStatus[]) => void;

let installInProgress = false;

let checksStatus: CheckStatus[] = [];

let preflightChecksFailed = false;

async function performInstallation(provider: ProviderInfo) {
  installInProgress = true;
  checksStatus = [];
  let checkSuccess = false;
  let currentCheck: CheckStatus;
  try {
    checkSuccess = await window.runInstallPreflightChecks(provider.internalId, {
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
    await window.installProvider(provider.internalId);
    // reset checks
    onPreflightChecks([]);
  } else {
    preflightChecksFailed = true;
  }

  installInProgress = false;
}
</script>

{#if provider.installationSupport}
  <button
    disabled="{installInProgress || preflightChecksFailed}"
    on:click="{() => performInstallation(provider)}"
    class="pf-c-button pf-m-primary"
    type="button">
    <span class="pf-c-button__icon pf-m-start">
      {#if installInProgress}
        <div class="mr-20">
          <i class="pf-c-button__progress">
            <span class="pf-c-spinner pf-m-md" role="progressbar">
              <span class="pf-c-spinner__clipper"></span>
              <span class="pf-c-spinner__lead-ball"></span>
              <span class="pf-c-spinner__tail-ball"></span>
            </span>
          </i>
        </div>
      {:else}
        <i class="fas fa-rocket" aria-hidden="true"></i>
      {/if}
    </span>
    Install
  </button>
{/if}
