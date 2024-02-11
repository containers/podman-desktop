<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte';
import type { FormDialogOptions } from './formdialog-input';

let title: string;

let display = false;

let inputElement: HTMLInputElement | undefined = undefined;
let messageBox: HTMLDivElement;

const showFormDialogCallback = (formDialogParameter: unknown) => {
  const options: FormDialogOptions | undefined = formDialogParameter as FormDialogOptions;
  title = options?.title || '';

  display = true;

  tick()
    .then(() => {
      if (display && inputElement) {
        inputElement.focus();
      }
    })
    .catch((error: unknown) => {
      console.error('Unable to focus on input element', error);
    });
};

onMount(() => {
  // handle the showMessageBox event
  window.events?.receive('showFormDialog:open', showFormDialogCallback);
});

onDestroy(() => {
  cleanup();
});

function cleanup() {
  display = false;
  title = '';
}

function handleKeydown(e: KeyboardEvent) {
  if (!display) {
    return;
  }

  if (e.key === 'Escape') {
    // if there is a cancel button use its id, otherwise undefined
    cleanup();
    e.preventDefault();
  }
}
</script>

<svelte:window on:keydown="{handleKeydown}" />

{#if display}
  <!-- Create overlay-->
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 bg-blend-multiply h-full grid z-50">
    <div
      class="flex flex-col place-self-center w-[550px] rounded-xl bg-charcoal-800 shadow-xl shadow-black"
      role="dialog"
      aria-labelledby="{title}"
      aria-label="{title}"
      bind:this="{messageBox}">
      <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-gray-400">
        <h1 class="grow text-lg font-bold capitalize">{title}</h1>
      </div>
    </div>
  </div>
{/if}
