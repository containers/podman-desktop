<script lang="ts">
import type { ProviderDetectionCheck } from '@podman-desktop/api';

import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

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
  <button
    on:click="{() => toggleDetectionChecks(provider)}"
    class="pf-c-button pf-m-primary"
    disabled="{viewInProgress}"
    type="button"
    title="Why {provider.name} is not found.">
    <span class="pf-c-button__icon pf-m-start">
      {#if viewInProgress}
        <div class="mr-44">
          <i class="pf-c-button__progress">
            <span class="pf-c-spinner pf-m-md" role="progressbar">
              <span class="pf-c-spinner__clipper"></span>
              <span class="pf-c-spinner__lead-ball"></span>
              <span class="pf-c-spinner__tail-ball"></span>
            </span>
          </i>
        </div>
      {:else}
        <i class="fas fa-list" aria-hidden="true"></i>
      {/if}
    </span>
    {mode === 'view' ? 'View' : 'Hide'} detection checks
  </button>
{/if}
