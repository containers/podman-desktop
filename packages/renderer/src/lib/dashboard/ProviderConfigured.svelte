<script lang="ts">
import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import PreflightChecks from './PreflightChecks.svelte';
import ProviderLinks from './ProviderLinks.svelte';
import ProviderLogo from './ProviderLogo.svelte';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';
import Steps from '../ui/Steps.svelte';

import { onMount } from 'svelte';
import { InitializeAndStartMode, InitializationSteps, type InitializationContext } from './ProviderInitUtils';
import Spinner from '../ui/Spinner.svelte';
import Button from '../ui/Button.svelte';

export let provider: ProviderInfo;
export let initializationContext: InitializationContext;

let runAtStart = initializationContext.mode === InitializeAndStartMode;
let runInProgress = false;

let runError: string | undefined = undefined;

let preflightChecks: CheckStatus[] = [];

async function runProvider() {
  runError = undefined;
  runInProgress = true;
  runAtStart = false;
  try {
    await window.startProvider(provider.internalId);
    await new Promise<void>(resolve => {
      window.events.receive('provider-change', () => {
        resolve();
      });
    });
  } catch (error) {
    runError = String(error);
    console.error('Error while starting the provider', error);
  }
  runInProgress = false;
}

onMount(() => {
  if (runAtStart) {
    runProvider();
  }
});
</script>

<div class="p-2 flex flex-col bg-charcoal-800 rounded-lg">
  <ProviderLogo provider="{provider}" />
  <div class="flex flex-col items-center text-center">
    <p class="text-xl text-gray-400">
      {provider.name}
      {#if provider.version}
        v{provider.version}
      {/if}
      is stopped
    </p>
    <p class="text-base text-gray-700">
      To start working with containers, {provider.name}
      {#if provider.version}
        v{provider.version}
      {/if} needs to be started.
    </p>

    {#if !runAtStart && !runInProgress}
      <div class="mt-5">
        <Button on:click="{() => runProvider()}">
          Run {provider.name}
        </Button>
      </div>
    {/if}
    {#if runAtStart || runInProgress}
      <div class="mt-5">
        {#if initializationContext.mode === InitializeAndStartMode}
          <Steps steps="{InitializationSteps}" current="{1}" />
        {/if}
        <div class="flex flex-col text-gray-700">
          <div>Starting</div>
          <div class="my-2 pr-5 relative">
            <Spinner />
          </div>
        </div>
      </div>
    {/if}

    {#if runError}
      <ErrorMessage class="flex flex-col mt-2 my-2 text-sm" error="{runError}" />
    {/if}
  </div>
  {#if provider.version !== provider.updateInfo?.version}
    <div class="mt-10 mb-1 w-full flex justify-around">
      <ProviderUpdateButton onPreflightChecks="{checks => (preflightChecks = checks)}" provider="{provider}" />
    </div>
  {/if}
  <PreflightChecks preflightChecks="{preflightChecks}" />
  <div class="mt-10 mb-1 w-full flex justify-around"></div>
  <ProviderLinks provider="{provider}" />
</div>
