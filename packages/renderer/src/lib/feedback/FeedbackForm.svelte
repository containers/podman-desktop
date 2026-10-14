<script lang="ts">
import type { TelemetryMessages } from '@desktop-framework/api';
import { ButtonRow, Link } from '@podman-desktop/ui-svelte';
import { onMount } from 'svelte';

let telemetryMessages: TelemetryMessages;

onMount(async () => {
  telemetryMessages = await window.getTelemetryMessages();
});
</script>
<div>
  <div class="relative max-h-80 overflow-auto text-[var(--pd-modal-text)] px-10 pb-4" aria-label="content">
    <slot name="content" />

    {#if telemetryMessages?.privacy}
      <div class="pt-6">
        <Link
          on:click={async (): Promise<void> => {
          await window.openExternal(telemetryMessages.privacy?.url ?? '');
          }}>{telemetryMessages?.privacy.link}</Link>
      </div>
    {/if}
  </div>

  <div class="px-5 py-5 mt-2 flex flex-row w-full" aria-label="validation and buttons">
    <div class="grow" aria-label="validation">
      <slot name="validation" />
    </div>
    <ButtonRow>
      <slot name="buttons"/>
    </ButtonRow>
  </div>
</div>
