<script lang="ts">
import { Button, Checkbox, Link, Tooltip } from '@podman-desktop/ui-svelte';
import { onDestroy, onMount } from 'svelte';
import type { Unsubscriber } from 'svelte/store';
import { router } from 'tinro';

import { onboardingList } from '/@/stores/onboarding';
import type { OnboardingInfo } from '/@api/onboarding';

import IconImage from '../appearance/IconImage.svelte';
import DesktopIcon from '../images/DesktopIcon.svelte';
import bgImage from './background.png';
import { WelcomeUtils } from './welcome-utils';

export let showWelcome = false;
export let showTelemetry = false;

let telemetry = true;

// Global context related
let contextsUnsubscribe: Unsubscriber;

let onboardingsUnsubscribe: Unsubscriber;
const welcomeUtils = new WelcomeUtils();
let podmanDesktopVersion: string;

// Extend ProviderInfo to have a selected property
interface OnboardingInfoWithSelected extends OnboardingInfo {
  selected?: boolean;
}

let onboardingProviders: OnboardingInfoWithSelected[] = [];

onMount(async () => {
  const ver = await welcomeUtils.getVersion();
  if (!ver) {
    welcomeUtils.updateVersion('initial');
    showWelcome = true;
  }
  router.goto('/');

  const telemetryPrompt = await welcomeUtils.havePromptedForTelemetry();
  if (!telemetryPrompt) {
    showTelemetry = true;
  }
  podmanDesktopVersion = await window.getPodmanDesktopVersion();

  onboardingsUnsubscribe = onboardingList.subscribe(value => {
    // Add "selected" property to each provider and add to onboardingEnabledProviders
    onboardingProviders = value.map(provider => {
      return {
        ...provider,
        selected: true,
      };
    });
  });
});

onDestroy(() => {
  if (onboardingsUnsubscribe) {
    onboardingsUnsubscribe();
  }
  if (contextsUnsubscribe) {
    contextsUnsubscribe();
  }
});

function closeWelcome() {
  showWelcome = false;
  if (showTelemetry) {
    welcomeUtils.setTelemetry(telemetry);
  }
}

// Function to toggle provider selection
function toggleOnboardingSelection(providerName: string) {
  // Go through providers, find the provider name and toggle the selected value
  // then update providers
  onboardingProviders = onboardingProviders.map(provider => {
    if (provider.name === providerName) {
      provider.selected = !provider.selected;
    }
    return provider;
  });
}

function startOnboardingQueue() {
  const selectedProviders = onboardingProviders.filter(provider => provider.selected);
  const extensionIds = selectedProviders.map(provider => provider.extension);
  const queryParams = new URLSearchParams({ ids: extensionIds.join(',') }).toString();
  router.goto(`/global-onboarding?${queryParams}`);
}
</script>

{#if showWelcome}
  <div
    class="flex flex-col flex-auto fixed top-0 left-0 right-0 bottom-0 bg-[var(--pd-content-card-bg)] bg-no-repeat z-50"
    style="background-image: url({bgImage}); background-position: 50% -175%; background-size: 100% 75%">
    <!-- Header -->
    <div class="flex flex-row flex-none backdrop-blur p-6 mt-10">
      <div class="flex flex-auto text-lg font-bold">Get started with Podman Desktop</div>
    </div>

    <!-- Body -->
    <div class="flex flex-col justify-center content-center flex-auto backdrop-blur p-2 overflow-y-auto">
      <div class="flex justify-center p-2"><DesktopIcon /></div>
      <div class="flex justify-center text-lg font-bold p-2">
        <span class="mr-2">🎉</span>Welcome to Podman Desktop v{podmanDesktopVersion} !
      </div>
      <div class="flex flex-row justify-center">
        <div class="bg-[var(--pd-content-card-inset-bg)] px-4 pb-4 pt-2 rounded">
          {#if onboardingProviders && onboardingProviders.length > 0}
            <div class="flex justify-center text-sm text-[var(--pd-content-card-text)] pb-2">
              <div>Click below to start the onboarding for the following extensions:</div>
            </div>
            <div aria-label="providerList" class="grid grid-cols-3 gap-3">
              {#each onboardingProviders as onboarding}
                <div
                  class="rounded-md bg-[var(--pd-content-card-bg)] flex flex-row justify-between border-2 p-4 {onboarding.selected
                    ? 'border-[var(--pd-content-card-border-selected)]'
                    : 'border-[var(--pd-content-card-border)]'}">
                  <div class="place-items-top flex flex-col flex-1">
                    <div class="flex flex-row place-items-left flex-1">
                      <IconImage image={onboarding.icon} class="max-h-12 h-auto w-auto" alt="{onboarding.name} logo" />
                      <div
                        class="flex flex-1 mx-2 underline decoration-2 decoration-dotted underline-offset-2 cursor-default justify-left text-capitalize">
                        <Tooltip top tip={onboarding.description}>
                          {onboarding.displayName}
                        </Tooltip>
                      </div>
                    </div>
                  </div>

                  <Checkbox
                    title="{onboarding.displayName} checkbox"
                    name="{onboarding.displayName} checkbox"
                    bind:checked={onboarding.selected}
                    on:click={() => toggleOnboardingSelection(onboarding.name)}
                    class="text-xl" />
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      <div class="flex justify-center p-2 text-sm items-center">
        Configure these and more under <Link
          on:click={() => {
            closeWelcome();
            router.goto('/preferences');
          }}>Settings</Link
        >.
      </div>
    </div>

    <!-- Telemetry -->
    {#if showTelemetry}
      <div class="flex flex-col justify-end flex-none p-4">
        <div class="flex flex-row justify-center items-start p-1 text-sm">
          <Checkbox
            id="toggle-telemetry"
            bind:checked={telemetry}
            name="Enable telemetry"
            class="text-lg px-2"
            title="Enable telemetry"><div class="text-base font-medium">Telemetry:</div></Checkbox>
          <div class="w-2/5 text-[var(--pd-content-card-text)]">
            Help Red Hat improve Podman Desktop by allowing anonymous usage data to be collected.
            <Link
              on:click={() => {
                window.openExternal('https://developers.redhat.com/article/tool-data-collection');
              }}>Read our privacy statement</Link>
          </div>
        </div>
        <div class="flex justify-center p-1 text-sm text-[var(--pd-content-card-text)]">
          <div>
            You can always modify this preference later in <Link
              on:click={() => {
                closeWelcome();
                router.goto('/preferences/default/preferences.telemetry');
              }}>Settings &gt; Preferences</Link>
          </div>
        </div>
      </div>
    {/if}

    <!-- Footer - button bar -->
    <div class="flex justify-end flex-none bg-[var(--pd-content-bg)] p-8">
      <div class="flex flex-row">
        <!-- If Providers have any onboarding elements selected, create a button that says "Start onboarding" rather than Go to Podman Desktop -->
        {#if onboardingProviders && onboardingProviders.filter(o => o.selected).length > 0}
          <!-- We will "always" show the "Go to Podman Desktop" button
          in-case anything were to happen with the Start onboarding button / sequence not working correctly.
          we do not want the user to not be able to continue. -->
          <Button
            type="secondary"
            on:click={() => {
              closeWelcome();
            }}>Go to Podman Desktop</Button>
          <Button
            class="ml-2"
            on:click={() => {
              closeWelcome();
              startOnboardingQueue();
            }}>Start onboarding</Button>
        {:else}
          <Button
            on:click={() => {
              closeWelcome();
            }}>Go to Podman Desktop</Button>
        {/if}
      </div>
    </div>
  </div>
{/if}
