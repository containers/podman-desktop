<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte';
import Fa from 'svelte-fa/src/fa.svelte';
import {
  faCircleExclamation,
  faTriangleExclamation,
  faCircleInfo,
  faCircleQuestion,
} from '@fortawesome/free-solid-svg-icons';
import type { MessageBoxOptions } from './messagebox-input';

let currentId = 0;
let title;
let message;
let detail;
let buttons;
let type;
let cancelId = -1;
let defaultId;
let buttonOrder;

let display = false;

let inputElement: HTMLInputElement = undefined;

const showMessageBoxCallback = async (options?: MessageBoxOptions) => {
  currentId = options.id;
  title = options.title;
  message = options.message;
  if (options.detail) {
    detail = options.detail;
  }

  // use provided buttons, or a single 'OK' button if none are provided
  if (options.buttons && options.buttons.length > 0) {
    buttons = options.buttons;
  } else {
    buttons = ['OK'];
  }
  type = options.type;

  buttonOrder = Array.from(buttons, (value, index) => index);

  // use the provided cancel id, otherwise try to find a button labelled 'cancel'
  if (options.cancelId) {
    cancelId = options.cancelId;
  } else {
    cancelId = buttons.findIndex(b => b.toLowerCase() === 'cancel');
  }

  // use the provided default (primary) id, otherwise the first non-cancel button is the default
  if (options.defaultId) {
    defaultId = options.defaultId;
  } else {
    if (cancelId == 0) {
      defaultId = 1;
    } else {
      defaultId = 0;
    }
  }

  // move cancel button to the start/left and default button to the end/right
  buttonOrder.sort((a, b) => {
    if (a == cancelId || b == defaultId) {
      return -1;
    } else if (a == defaultId || b == cancelId) {
      return 1;
    } else {
      return a - b;
    }
  });

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
    // if there is a cancel button use its id, otherwise undefined
    window.sendShowMessageBoxOnSelect(currentId, cancelId >= 0 ? cancelId : undefined);
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
      <div class="flex items-center justify-between px-6 py-5 space-x-2">
        {#if type === 'error'}
          <Fa class="h-4 w-4" icon="{faCircleExclamation}" />
        {:else if type === 'warning'}
          <Fa class="h-4 w-4" icon="{faTriangleExclamation}" />
        {:else if type === 'info'}
          <Fa class="h-4 w-4" icon="{faCircleInfo}" />
        {:else if type === 'question'}
          <Fa class="h-4 w-4" icon="{faCircleQuestion}" />
        {/if}
        <h1 class="grow text-lg font-bold capitalize">{title}</h1>

        <button class="hover:text-gray-300 py-1" on:click="{() => clickButton(cancelId >= 0 ? cancelId : undefined)}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="px-10 py-4 text-sm leading-5">{message}</div>

      {#if detail}
        <div class="px-10 pb-4 text-sm leading-5">{detail}</div>
      {/if}

      <div class="px-6 py-5 mt-2 flex flex-row w-full justify-end space-x-5">
        {#each buttonOrder as i}
          {#if i == cancelId}
            <button aria-label="Cancel" class="text-xs hover:underline" on:click="{() => clickButton(i)}"
              >Cancel</button>
          {:else}
            <button
              class="pf-c-button transition ease-in-out delay-50 hover:cursor-pointer h-full rounded-md shadow hover:shadow-lg justify-center pb-1"
              class:pf-m-primary="{defaultId == i}"
              class:pf-m-secondary="{defaultId != i}"
              on:click="{() => clickButton(i)}">{buttons[i]}</button>
          {/if}
        {/each}
      </div>
    </div>
  </div>
{/if}
