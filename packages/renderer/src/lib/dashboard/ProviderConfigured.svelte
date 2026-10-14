<script lang="ts">
import type { CheckStatus, ProviderInfo } from '@desktop-framework/api';
import { Button, ErrorMessage, Spinner } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import Steps from '/@/lib/ui/Steps.svelte';

import PreflightChecks from './PreflightChecks.svelte';
import ProviderCard from './ProviderCard.svelte';
import {
  type InitializationContext,
  InitializationSteps,
  InitializeAndStartMode,
  InitializeOnlyMode,
} from './ProviderInitUtils';
import ProviderUpdateButton from './ProviderUpdateButton.svelte';
import ProviderWarnings from './ProviderWarnings.svelte';

interface Props {
  provider: ProviderInfo;
  initializationContext: InitializationContext;
}
let { provider, initializationContext }: Props = $props();

let runAtStart = $derived(initializationContext.mode === InitializeAndStartMode);
let runInProgress = $state(false);

let runError: string | undefined = $state();

let preflightChecks: CheckStatus[] = $state([]);

async function runProvider(): Promise<void> {
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

onMount(async () => {
  if (runAtStart) {
    // we reset the mode bc the provider has to be started only after the initialization.
    // Otherwise if the user stops the provider, this component will mount again and will start the provider everytime
    initializationContext.mode = InitializeOnlyMode;
    await runProvider();
  }
});
</script>

<ProviderCard provider={provider}>
  {#snippet content()}
    {#if !runAtStart && !runInProgress}
      <p class="text-[var(--pd-content-text)] text-center w-2/3">
        To start working with containers, {provider.name}
        {#if provider.version}
          v{provider.version}
        {/if} needs to be started.
      </p>
      <ProviderWarnings provider={provider} />
      <div class="w-1/3 flex justify-center">
        <Button on:click={runProvider}>
          Run {provider.name}
        </Button>
      </div>
    {/if}
    {#if runAtStart || runInProgress}
      <div class="flex flex-col w-full lg:w-2/3 justify-center items-center">
        {#if initializationContext.mode === InitializeAndStartMode}
          <Steps steps={InitializationSteps} current={1} />
        {/if}
        <div class="flex flex-col text-[var(--pd-content-text)] items-center" aria-label="Transitioning State">
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
  {/snippet}
  {#snippet update()}
    {#if provider.updateInfo?.version && provider.version !== provider.updateInfo?.version}
      <ProviderUpdateButton onPreflightChecks={(checks): CheckStatus[] => (preflightChecks = checks)} provider={provider} />
    {/if}
  {/snippet}
</ProviderCard>
