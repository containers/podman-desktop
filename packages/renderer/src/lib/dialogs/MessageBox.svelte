<script lang="ts">
import { faCircle, faCircleQuestion } from '@fortawesome/free-regular-svg-icons';
import { faCircleExclamation, faInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { onDestroy, onMount } from 'svelte';
import Fa from 'svelte-fa';

import CloseButton from '/@/lib/ui/CloseButton.svelte';

import type { ButtonType } from '../ui/Button';
import Button from '../ui/Button.svelte';
import { tabWithinParent } from './dialog-utils';
import type { MessageBoxOptions } from './messagebox-input';

let currentId = 0;
let title: string;
let message: string;
let detail: string | undefined;
let buttons: string[];
let type: string | undefined;
let cancelId = -1;
let defaultId: number;
let buttonOrder: number[];

let display = false;

let messageBox: HTMLDivElement;

const showMessageBoxCallback = (messageBoxParameter: unknown) => {
  const options: MessageBoxOptions | undefined = messageBoxParameter as MessageBoxOptions;
  currentId = options?.id || 0;
  title = options?.title || '';
  message = options?.message || '';
  if (options?.detail) {
    detail = options.detail;
  } else {
    detail = undefined;
  }

  // use provided buttons, or a single 'OK' button if none are provided
  if (options?.buttons && options.buttons.length > 0) {
    buttons = options.buttons;
  } else {
    buttons = ['OK'];
  }
  type = options?.type;

  buttonOrder = Array.from(buttons, (value, index) => index);

  // use the provided cancel id, otherwise try to find a button labelled 'cancel'
  if (options?.cancelId) {
    cancelId = options.cancelId;
  } else {
    cancelId = buttons.findIndex(b => b.toLowerCase() === 'cancel');
  }

  // use the provided default (primary) id, otherwise the first non-cancel button is the default
  if (options?.defaultId) {
    defaultId = options.defaultId;
  } else {
    if (cancelId === 0) {
      defaultId = 1;
    } else {
      defaultId = 0;
    }
  }

  // move cancel button to the start/left and default button to the end/right
  buttonOrder.sort((a, b) => {
    if (a === cancelId || b === defaultId) {
      return -1;
    } else if (a === defaultId || b === cancelId) {
      return 1;
    } else {
      return a - b;
    }
  });

  display = true;
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

function clickButton(index?: number) {
  window.sendShowMessageBoxOnSelect(currentId, index);
  cleanup();
}

function handleKeydown(e: KeyboardEvent) {
  if (!display) {
    return;
  }

  if (e.key === 'Escape') {
    // if there is a cancel button use its id, otherwise undefined
    window.sendShowMessageBoxOnSelect(currentId, cancelId >= 0 ? cancelId : undefined);
    cleanup();
    e.preventDefault();
  }

  if (e.key === 'Tab') {
    tabWithinParent(e, messageBox);
  }
}

function getButtonType(b: boolean): ButtonType {
  if (b) {
    return 'primary';
  } else {
    return 'secondary';
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
        {#if type === 'error'}
          <Fa class="h-4 w-4 text-red-500" icon="{faCircleExclamation}" />
        {:else if type === 'warning'}
          <Fa class="h-4 w-4 text-amber-400" icon="{faTriangleExclamation}" />
        {:else if type === 'info'}
          <div class="flex">
            <Fa class="h-4 w-4 place-content-center" icon="{faCircle}" />
            <Fa class="h-4 w-4 place-content-center -ml-4 mt-px text-xs" icon="{faInfo}" />
          </div>
        {:else if type === 'question'}
          <Fa class="h-4 w-4" icon="{faCircleQuestion}" />
        {/if}
        <h1 class="grow text-lg font-bold capitalize">{title}</h1>

        <CloseButton on:click="{() => clickButton(cancelId >= 0 ? cancelId : undefined)}" />
      </div>

      <div class="max-h-80 overflow-auto">
        <div class="px-10 py-4 text-sm text-gray-500 leading-5" aria-label="Dialog Message">{message}</div>

        {#if detail}
          <div class="px-10 pb-4 text-sm text-gray-500 leading-5" aria-label="Dialog Details">{detail}</div>
        {/if}
      </div>

      <div class="px-5 py-5 mt-2 flex flex-row w-full justify-end space-x-5">
        {#each buttonOrder as i}
          {#if i === cancelId}
            <Button type="link" aria-label="Cancel" on:click="{() => clickButton(i)}">Cancel</Button>
          {:else}
            <Button type="{getButtonType(defaultId === i)}" on:click="{() => clickButton(i)}">{buttons[i]}</Button>
          {/if}
        {/each}
      </div>
    </div>
  </div>
{/if}
