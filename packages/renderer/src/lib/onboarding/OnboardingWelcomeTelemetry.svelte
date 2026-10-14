<script lang="ts">
import type { TelemetryMessages } from '@desktop-framework/api';
import { Checkbox, Link } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

import { WelcomeUtils } from '/@/lib/welcome/welcome-utils';

const welcomeUtils = new WelcomeUtils();
let telemetry = $state(true);
let showTelemetry = $state(false);
let telemetryMessages: TelemetryMessages | undefined = $state(undefined);

onMount(async () => {
  const alreadyPrompted = await welcomeUtils.havePromptedForTelemetry();
  if (!alreadyPrompted) {
    telemetryMessages = await window.getTelemetryMessages();
    await welcomeUtils.setTelemetry(telemetry);
    showTelemetry = true;
  }
});

async function toggleTelemetry(): Promise<void> {
  telemetry = !telemetry;
  await welcomeUtils.setTelemetry(telemetry);
}
</script>

{#if showTelemetry}
  <div class="flex flex-col justify-end flex-none p-4">
    <div class="flex flex-row justify-center items-start p-1 text-sm">
      <Checkbox
        id="onboarding-telemetry"
        checked={telemetry}
        class="text-lg px-2"
        title="Enable telemetry"
        onclick={toggleTelemetry}>
        <div class="text-base font-medium">Telemetry:</div>
      </Checkbox>
      <div class="w-2/5 text-[var(--pd-content-card-text)]">
        {#if telemetryMessages}
          {telemetryMessages.acceptMessage}
          {#if telemetryMessages.info}
            <Link
              onclick={async (): Promise<void> => { await window.openExternal(telemetryMessages?.info?.url ?? ''); }}>
              {telemetryMessages.info.link}
            </Link>
          {/if}
        {:else}
          Help us improve by allowing anonymous usage data to be collected.
        {/if}
      </div>
    </div>
    <div class="flex justify-center p-1 text-sm text-[var(--pd-content-card-text)]">
      <div>
        You can always modify this preference later in Settings &gt; Preferences
      </div>
    </div>
  </div>
{/if}
