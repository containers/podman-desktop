<script lang="ts">
import type { WelcomeMessages } from '@desktop-framework/api';
import { Button } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { router } from 'tinro';

import DesktopIcon from '/@/lib/images/DesktopIcon.svelte';
import OnboardingWelcomeTelemetry from '/@/lib/onboarding/OnboardingWelcomeTelemetry.svelte';
import OnboardingExtensionCard from '/@/lib/onboarding/wizard/OnboardingExtensionCard.svelte';
import { onboardingList } from '/@/stores/onboarding';
import { providerInfos } from '/@/stores/providers';

import bgImage from './background.png';
import type { OnboardingInfoWithAdditionalInfo } from './welcome-utils';
import { WelcomeUtils } from './welcome-utils';

interface Props {
  showWelcome?: boolean;
}

let { showWelcome = false }: Props = $props();

const welcomeUtils = new WelcomeUtils();
let podmanDesktopVersion = $state<string>();

let welcomeMessages = $state<WelcomeMessages>();

// User selection is kept outside of the derived value below: the derived is recomputed on every
// onboardingList/providerInfos emission (a provider status change or an extension starting is
// enough), which would otherwise discard whatever the user checked or unchecked
const selectionOverrides = new SvelteMap<string, boolean>();

let onboardingProviders: OnboardingInfoWithAdditionalInfo[] = $derived(
  welcomeUtils
    .getSortedOnboardingExtensions($onboardingList, $providerInfos)
    .map(provider => ({ ...provider, selected: selectionOverrides.get(provider.name) ?? provider.selected })),
);

onMount(async () => {
  const result = await welcomeUtils.enforceFirstRun();
  podmanDesktopVersion = result.version;
  showWelcome = result.firstRun;
  router.goto('/');
  welcomeMessages = await window.getWelcomeMessages();
});

async function closeWelcome(): Promise<void> {
  showWelcome = false;
}

// Function to toggle provider selection
function toggleOnboardingSelection(providerName: string): void {
  const current = onboardingProviders.find(provider => provider.name === providerName)?.selected ?? true;
  selectionOverrides.set(providerName, !current);
}

function startOnboardingQueue(): void {
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
    <div class="flex flex-row flex-none backdrop-blur-sm p-6 mt-10">
      <div class="flex flex-auto text-lg font-bold">{welcomeMessages?.getStartedMessage}</div>
    </div>

    <!-- Body -->
    <div class="flex flex-col justify-center content-center flex-auto backdrop-blur-sm p-2 overflow-y-auto">
      <div class="flex justify-center p-2"><DesktopIcon /></div>
      <div class="flex justify-center text-lg font-bold p-2">
        {welcomeMessages?.welcomeMessage} v{podmanDesktopVersion}!
      </div>
      {#if onboardingProviders && onboardingProviders.length > 0}
        <div class="flex flex-row justify-center">
          <div class="bg-[var(--pd-content-card-inset-bg)] px-4 pb-4 pt-2 rounded-sm">
            <div class="flex justify-center text-sm text-[var(--pd-content-card-text)] pb-2">
              <div>Choose the extensions to include:</div>
            </div>
            <div aria-label="providerList" class="grid grid-cols-3 gap-3">
              {#each onboardingProviders as onboarding, index (index)}
                <OnboardingExtensionCard
                  icon={onboarding.icon}
                  displayName={onboarding.displayName}
                  description={onboarding.description}
                  checked={onboarding.selected ?? true}
                  onToggle={(): void => toggleOnboardingSelection(onboarding.name)} />
              {/each}
            </div>
          </div>
        </div>
        <div class="flex justify-center p-2 text-sm items-center">
          Configure these and more under Settings.
        </div>
      {/if}
    </div>

    <!-- Telemetry -->
    <OnboardingWelcomeTelemetry />

    <!-- Footer - button bar -->
    <div class="flex justify-end flex-none bg-[var(--pd-content-bg)] p-8">
      <div class="flex flex-row">
        <!-- If Providers have any onboarding elements selected, create a button that says "Start onboarding" rather than Skip -->
        {#if onboardingProviders && onboardingProviders.filter(o => o.selected).length > 0}
          <!-- We will "always" show the "Skip" button
          in-case anything were to happen with the Start onboarding button / sequence not working correctly.
          we do not want the user to not be able to continue. -->
          <Button
            type="secondary"
            on:click={closeWelcome}>Skip</Button>
          <Button
            class="ml-2"
            on:click={async (): Promise<void> => {
              await closeWelcome();
              startOnboardingQueue();
            }}>Start onboarding</Button>
        {:else}
          <Button
            on:click={closeWelcome}>Skip</Button>
        {/if}
      </div>
    </div>
  </div>
{/if}
