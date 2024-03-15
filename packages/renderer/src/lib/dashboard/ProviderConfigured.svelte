<script lang="ts">
import { onMount } from 'svelte';

import type { CheckStatus, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import Button from '../ui/Button.svelte';
import ErrorMessage from '../ui/ErrorMessage.svelte';
import Spinner from '../ui/Spinner.svelte';
import Steps from '../ui/Steps.svelte';
import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import { type InitializationContext, InitializationSteps, InitializeAndStartMode } from './ProviderInitUtils';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';

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

<ProviderCard provider="{provider}">
  <svelte:fragment slot="content">
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
        <div class="flex flex-col text-gray-700" aria-label="Transitioning State">
          <div>Starting</div>
          <div class="my-2">
            <Spinner />
          </div>
        </div>
      </div>
    {/if}

    {#if runError}
      <ErrorMessage class="flex flex-col mt-2 my-2 text-sm" error="{runError}" />
    {/if}

    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <div class="mt-5 mb-1 w-full flex justify-around">
        <ProviderUpdateButton onPreflightChecks="{checks => (preflightChecks = checks)}" provider="{provider}" />
      </div>
    {/if}
    <PreflightChecks preflightChecks="{preflightChecks}" />
  </svelte:fragment>
</ProviderCard>
