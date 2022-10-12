<script lang="ts">
import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import PreflightChecks from './PreflightChecks.svelte';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';

export let provider: ProviderInfo;
let providerToggleValue = false;

let runInProgress = false;

let runError: string | undefined = undefined;

let preflightChecks: CheckStatus[] = [];

async function runProvider() {
  runError = undefined;
  if (providerToggleValue) {
    runInProgress = true;
    try {
      await window.startProvider(provider.internalId);
      // wait that status is updated
      await new Promise<void>(resolve => {
        window.events.receive('provider-change', () => {
          resolve();
        });
      });
    } catch (error) {
      runError = error;
      providerToggleValue = false;
      console.error('Error while starting the provider', error);
    }
    runInProgress = false;
  }
}
</script>

<div class="p-2 flex flex-col bg-zinc-800 rounded-lg">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center">
    <p class="text-xl text-gray-300">
      {provider.name}
      {#if provider.version}
        v{provider.version}
      {/if}
      is stopped
    </p>
    <p class="text-base text-gray-400">
      To start working with containers, {provider.name}
      {#if provider.version}
        v{provider.version}
      {/if} needs to be started.
    </p>

    <label for="toggle-{provider.internalId}" class="inline-flex relative items-center my-5 cursor-pointer">
      <input
        type="checkbox"
        disabled="{runInProgress}"
        bind:checked="{providerToggleValue}"
        on:change="{() => runProvider()}"
        id="toggle-{provider.internalId}"
        class="sr-only peer" />
      <div
        class="w-9 h-5 peer-focus:ring-violet-800 rounded-full peer bg-zinc-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-violet-600">
      </div>
      <span class="ml-3 text-sm font-medium text-gray-300">Run {provider.name}</span>
    </label>
    {#if runInProgress}
      <div class="flex mt-2 flex-col">
        <div>Starting...Please Wait...</div>
        <div class="my-2">
          <i class="pf-c-button__progress">
            <span class="pf-c-spinner pf-m-md" role="progressbar">
              <span class="pf-c-spinner__clipper"></span>
              <span class="pf-c-spinner__lead-ball"></span>
              <span class="pf-c-spinner__tail-ball"></span>
            </span>
          </i>
        </div>
      </div>
    {/if}
    {#if runError}
      <div class="flex mt-2 flex-col">
        <div>Error:</div>
        <div class="my-2">
          <p class="text-sm text-red-500">{runError}</p>
        </div>
      </div>
    {/if}
  </div>
  {#if provider.updateInfo}
    <div class="mt-10 mb-1  w-full flex  justify-around">
      <ProviderUpdateButton onPreflightChecks="{checks => (preflightChecks = checks)}" provider="{provider}" />
    </div>
  {/if}
  <PreflightChecks preflightChecks="{preflightChecks}" />
  <div class="mt-10 mb-1  w-full flex  justify-around"></div>
  <ProviderLinks provider="{provider}" />
</div>
