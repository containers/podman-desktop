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

<button class="fixed top-0 left-0 w-full h-full bg-black bg-opacity-60 bg-blend-multiply z-40" on:click="{close}"
></button>

<div
  class="absolute top-1/2 left-1/2 z-50 rounded translate-x-[-50%] translate-y-[-50%] overflow-auto w-[calc(200vw-4em)] max-w-[42em] max-h-[calc(100vh-4em)]"
  role="dialog"
  aria-label="{name}"
  aria-modal="true"
  bind:this="{modal}">
  <slot />
</div>
