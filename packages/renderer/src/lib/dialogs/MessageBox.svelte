<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte';

interface MessageBoxOptions {
  title: string;
  message: string;
  buttons: string[];
  id: number;
}

let currentId = 0;
let title = '';
let message = '';
let buttons = ['OK'];

let display = false;

let inputElement: HTMLInputElement = undefined;

const showMessageBoxCallback = async (options?: MessageBoxOptions) => {
  currentId = options.id;
  title = options.title;
  message = options.message;
  buttons = options.buttons;

  display = true;

  await tick();

  if (display && inputElement) {
    inputElement.focus();
  }
};

onMount(() => {
  // handle the showMessageBox event
  window.events?.receive('showMessageBox:open', showMessageBoxCallback);
});

onDestroy(() => {
  cleanup();
});

function cleanup() {
  display = false;
  title = '';
  message = '';
}

function clickButton(index: number) {
  window.sendShowMessageBoxOnSelect(currentId, index);
  cleanup();
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    window.sendShowMessageBoxOnSelect(currentId, undefined);
    cleanup();
    e.preventDefault();
    return;
  }
}
</script>

<svelte:window on:keydown="{handleKeydown}" />

{#if display}
  <!-- Create overlay-->
  <div class="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-60 h-full grid z-50">
    <div class="flex flex-col place-self-center w-[550px] rounded-xl bg-zinc-900 shadow-xl shadow-black">
      <div class="flex items-center justify-between px-6 py-4">
        <h1 class="text-lg font-bold capitalize">{title}</h1>

        <button class="hover:text-gray-200 py-1" on:click="{() => clickButton()}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="px-10 py-4 text-sm leading-5">{message}</div>

      <div class="px-10 py-4 mt-2 flex flex-row w-full justify-center space-x-5">
        {#each buttons as button, i}
          <button
            class="pf-c-button pf-m-primary transition ease-in-out delay-50 hover:cursor-pointer h-full rounded-md shadow hover:shadow-lg justify-center pb-1"
            on:click="{() => clickButton(i)}">{button}</button>
        {/each}
      </div>
    </div>
  </div>
{/if}
