<script lang="ts">
import { onDestroy, onMount, tick } from 'svelte';
import type { FormDialogOptions } from './formdialog-input';
import type { FormDialogInput } from '@podman-desktop/api';
import Button from '../ui/Button.svelte';

let currentId = 0;
let title: string;
let inputs: FormDialogInput[];
let display = false;

let inputElement: HTMLInputElement | undefined = undefined;
let formDialog: HTMLDivElement;

let result: string[];

const showFormDialogCallback = (formDialogParameter: unknown) => {
  const options: FormDialogOptions | undefined = formDialogParameter as FormDialogOptions;
  currentId = options?.id || 0;
  title = options?.title || '';
  inputs = options?.inputs || [];

  result = inputs.map(() => '');

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
  window.events?.receive('showFormDialog:open', showFormDialogCallback);
});

onDestroy(() => {
  cleanup();
});

function cleanup() {
  display = false;
  title = '';
  inputs = [];
}

function cancel() {
  cleanup();
}

function apply() {
  window.sendFormDialogResponse(currentId, result);
  cleanup();
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
      bind:this="{formDialog}">
      <div class="flex items-center justify-between pl-4 pr-3 py-3 space-x-2 text-gray-400">
        <h1 class="grow text-lg font-bold capitalize">{title}</h1>
        <button
          class="p-2 hover:text-gray-300 hover:bg-charcoal-500 rounded-full cursor-pointer"
          on:click="{() => cancel()}">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="overflow-auto">
        {#each inputs as input, index}
          {#if input.type === 'text'}
            <div class="px-10 py-4 text-sm text-gray-500 leading-5">
              <label for="{'input-' + index}">{input.title}</label>
              <input bind:value="{result[index]}" id="{'input-' + index}" />
            </div>
          {/if}
          {#if input.type === 'select'}
            <div class="px-10 py-4 text-sm text-gray-500 leading-5">
              <label for="{'input-' + index}">{input.title}</label>
              <select bind:value="{result[index]}" id="{'input-' + index}">
                <option></option>
                {#each input.options as option}
                  <option>{option}</option>
                {/each}
              </select>
            </div>
          {/if}
        {/each}
      </div>

      <div class="px-5 py-5 mt-2 flex flex-row w-full justify-end space-x-5">
        <Button type="primary" on:click="{() => apply()}">OK</Button>
      </div>
    </div>
  </div>
{/if}
