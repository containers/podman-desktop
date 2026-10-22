<script lang="ts">
import type { TelemetryMessages } from '@desktop-framework/api';
import { ButtonRow, Link } from '@podman-desktop/ui-svelte';
import { onMount, type Snippet } from 'svelte';

interface Props {
  content?: Snippet;
  validation?: Snippet;
  buttons?: Snippet;
}

let { content, validation, buttons }: Props = $props();

let telemetryMessages: TelemetryMessages | undefined = $state();

onMount(async () => {
  telemetryMessages = await window.getTelemetryMessages();
});
</script>
<div>
  <div class="relative max-h-80 overflow-auto text-[var(--pd-modal-text)] px-10 pb-4" aria-label="content">
    {@render content?.()}

    {#if telemetryMessages?.privacy}
      {@const privacy = telemetryMessages.privacy}
      <div class="pt-6">
        <Link
          onclick={async (): Promise<void> => {
          await window.openExternal(privacy?.url ?? '');
          }}>{privacy?.link}</Link>
      </div>
    {/if}
  </div>

  <div class="px-5 py-5 mt-2 flex flex-row w-full" aria-label="validation and buttons">
    <div class="grow" aria-label="validation">
      {@render validation?.()}
    </div>
    <ButtonRow>
      {@render buttons?.()}
    </ButtonRow>
  </div>
</div>
