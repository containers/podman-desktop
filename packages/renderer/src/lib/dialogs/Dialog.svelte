<script lang="ts">
import { CloseButton, Modal } from '@podman-desktop/ui-svelte';
import { createEventDispatcher } from 'svelte';

export let title: string;

const dispatch = createEventDispatcher();

export let onclose: () => void = () => {
  dispatch('close');
};
</script>

<Modal name={title} on:close={onclose}>
  <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-[var(--pd-modal-header-text)]">
    <slot name="icon" />
    <h1 class="grow text-lg font-bold capitalize">{title}</h1>

    <CloseButton on:click={() => onclose()} />
  </div>

  <div class="max-h-80 overflow-auto text-[var(--pd-modal-text)] px-10 py-4">
    <slot name="content" />
  </div>

  <div class="px-5 py-5 mt-2 flex flex-row w-full space-x-5">
    <div class="grow">
      <slot name="validation" />
    </div>
    <slot name="buttons" />
  </div>
</Modal>
