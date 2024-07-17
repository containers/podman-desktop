<script lang="ts">
import { createEventDispatcher, onDestroy } from 'svelte';

import { tabWithinParent } from '../utils/dialog-utils';

const dispatch = createEventDispatcher();

let modal: HTMLDivElement;
export let name = '';
export let top: boolean = false;
export let onclose: () => void = () => {
  dispatch('close');
};

const handle_keydown = (e: KeyboardEvent): void => {
  if (e.key === 'Escape') {
    onclose();
    return;
  }

  if (e.key === 'Tab') {
    tabWithinParent(e, modal);
  }
};

const previously_focused = typeof document !== 'undefined' && (document.activeElement as HTMLElement);

if (previously_focused) {
  onDestroy(() => {
    previously_focused.focus();
  });
}
</script>

<svelte:window on:keydown={handle_keydown} />

<div class:items-center={!top} class="fixed top-0 left-0 right-0 bottom-0 w-full h-full flex justify-center z-50">
  <button
    aria-label="close"
    class="fixed top-0 left-0 w-full h-full bg-[var(--pd-modal-fade)] bg-blend-multiply opacity-60 z-40 cursor-default"
    on:click={onclose}></button>

  <div
    class:translate-y-[-20%]={!top}
    class:my-[32px]={top}
    class="bg-[var(--pd-modal-bg)] z-50 rounded-xl overflow-auto w-[calc(200vw-4em)] h-fit max-w-[42em] max-h-[calc(100vh-4em)] border-[1px] border-[var(--pd-modal-border)]"
    role="dialog"
    aria-label={name}
    aria-modal="true"
    bind:this={modal}>
    <slot />
  </div>
</div>
