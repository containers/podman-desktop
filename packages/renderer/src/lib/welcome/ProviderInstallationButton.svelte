<script lang="ts">
import type { ProviderInfo } from '../../../../main/src/plugin/api/provider-info';

export let provider: ProviderInfo;
let installInProgress = false;

async function performInstallation(provider: ProviderInfo) {
  installInProgress = true;

  await window.installProvider(provider.internalId);

  installInProgress = false;
}
</script>

{#if provider.installationSupport}
  <button
    disabled="{installInProgress}"
    on:click="{() => performInstallation(provider)}"
    class="pf-c-button pf-m-primary"
    type="button">
    <span class="pf-c-button__icon pf-m-start ">
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
