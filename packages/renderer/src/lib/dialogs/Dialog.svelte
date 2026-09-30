<script lang="ts">
import { ButtonRow, CloseButton, Modal } from '@podman-desktop/ui-svelte';
import type { Snippet } from 'svelte';

type InitialButtonFocus = 'first' | 'last' | 'none';

interface Props {
  title: string;
  onclose: () => void;
  icon?: Snippet;
  content?: Snippet;
  validation?: Snippet;
  buttons?: Snippet;
  initialButtonFocus?: InitialButtonFocus;
}

let { title, onclose, icon, content, validation, buttons, initialButtonFocus }: Props = $props();

function shouldFocusContainer(): boolean {
  return initialButtonFocus === 'none';
}
</script>

<Modal name={title} onclose={onclose} focusContainer={shouldFocusContainer()}>
  <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-[var(--pd-modal-header-text)]">
    {@render icon?.()}
    <h1 class="grow text-lg font-bold capitalize">{title}</h1>

    <CloseButton onclick={onclose} />
  </div>

  <div class="relative max-h-80 overflow-auto text-[var(--pd-modal-text)] px-10 py-4">
    {@render content?.()}
  </div>

  <div class="px-5 py-5 mt-2 flex flex-col w-full justify-start">
    {#if validation}
      <div class="grow">
        {@render validation?.()}
      </div>
    {/if}
    <ButtonRow initialFocus={initialButtonFocus}>
      {@render buttons?.()}
    </ButtonRow>
  </div>
</Modal>
