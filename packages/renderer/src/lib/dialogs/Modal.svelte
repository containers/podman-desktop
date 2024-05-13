<script lang="ts">
import { createEventDispatcher, onDestroy } from 'svelte';

import { tabWithinParent } from './dialog-utils';

const dispatch = createEventDispatcher();
const close = () => dispatch('close');

let modal: HTMLDivElement;
export let name = '';

const handle_keydown = (e: any) => {
  if (e.key === 'Escape') {
    close();
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

<svelte:window on:keydown="{handle_keydown}" />

<div class="absolute w-full h-full flex justify-center items-center">
  <button
    aria-label="close"
    class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 bg-blend-multiply z-40"
    on:click="{close}"></button>

  <div
    class="bg-charcoal-800 z-50 rounded-xl overflow-auto w-[calc(200vw-4em)] h-fit translate-y-[-20%] max-w-[42em] max-h-[calc(100vh-4em)]"
    role="dialog"
    aria-label="{name}"
    aria-modal="true"
    bind:this="{modal}">
    <slot />
  </div>
</div>
