<script lang="ts">
import { Button, ErrorMessage, Spinner } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import type { CheckStatus, ProviderInfo } from '/@api/provider-info';

import Steps from '../ui/Steps.svelte';
import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import {
  type InitializationContext,
  InitializationSteps,
  InitializeAndStartMode,
  InitializeOnlyMode,
} from './ProviderInitUtils';
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
    // we reset the mode bc the provider has to be started only after the initialization.
    // Otherwise if the user stops the provider, this component will mount again and will start the provider everytime
    initializationContext.mode = InitializeOnlyMode;
    runProvider();
  }
});
</script>

<ProviderCard provider={provider}>
  <svelte:fragment slot="content">
    {#if !runAtStart && !runInProgress}
      <p class="text-gray-700 text-center w-2/3">
        To start working with containers, {provider.name}
        {#if provider.version}
          v{provider.version}
        {/if} needs to be started.
      </p>
      <div class="w-1/3 flex justify-center">
        <Button on:click={() => runProvider()}>
          Run {provider.name}
        </Button>
      </div>
    {/if}
    {#if runAtStart || runInProgress}
      <div class="flex flex-col w-full lg:w-2/3 justify-center items-center">
        {#if initializationContext.mode === InitializeAndStartMode}
          <Steps steps={InitializationSteps} current={1} />
        {/if}
        <div class="flex flex-col text-gray-700 items-center" aria-label="Transitioning State">
          <div>Starting</div>
          <div class="my-2">
            <Spinner />
          </div>
        </div>
      </div>
    {/if}

    {#if runError}
      <ErrorMessage class="flex flex-col mt-2 my-2" error={runError} />
    {/if}

    <PreflightChecks preflightChecks={preflightChecks} />
  </svelte:fragment>
  <svelte:fragment slot="update">
    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <ProviderUpdateButton onPreflightChecks={checks => (preflightChecks = checks)} provider={provider} />
    {/if}
  </svelte:fragment>
</ProviderCard>
