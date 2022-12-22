<style>
.modal-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
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

button {
  display: block;
}
</style>

<script lang="ts">
import { createEventDispatcher, onDestroy } from 'svelte';

const dispatch = createEventDispatcher();
const close = () => dispatch('close');

let modal: HTMLDivElement;

const handle_keydown = e => {
  if (e.key === 'Escape') {
    close();
    return;
  }

  if (e.key === 'Tab') {
    // trap focus
    const nodes = modal.querySelectorAll<HTMLElement>('*');
    const tabbable = Array.from(nodes).filter(n => n.tabIndex >= 0);

    let index = tabbable.indexOf(document.activeElement as HTMLElement);
    if (index === -1 && e.shiftKey) index = 0;

    index += tabbable.length + (e.shiftKey ? -1 : 1);
    index %= tabbable.length;

    tabbable[index].focus();
    e.preventDefault();
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

<div class="modal-background" on:click="{close}"></div>

<div class="modal" role="dialog" aria-modal="true" bind:this="{modal}">
  <slot />
</div>
