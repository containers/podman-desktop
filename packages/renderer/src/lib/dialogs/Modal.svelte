<style>
.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

.modal {
  position: absolute;
  left: 50%;
  top: 50%;
  width: calc(200vw - 4em);
  max-width: 42em;
  max-height: calc(100vh - 4em);
  overflow: auto;
  transform: translate(-50%, -50%);
  padding: 1em;
  border-radius: 0.2em;
  z-index: 50;
}
</style>

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

<button class="modal-background" on:click="{close}"></button>

<div class="modal" role="dialog" aria-label="{name}" aria-modal="true" bind:this="{modal}">
  <slot />
</div>
