<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';

export let title: string = 'No title';
export let message: string = 'Message';
export let commandline: string = '';
export let hidden: boolean = false;

function copyRunInstructionToClipboard() {
  const text = copyText?.innerText;
  navigator.clipboard.writeText(text);
}

let copyText;

onMount(async () => {
  copyText = document.getElementById('CommandLine') as HTMLElement;
});
</script>

<div class="h-full min-w-full flex flex-col" class:hidden="{hidden}">
  <div class="pf-c-empty-state h-full">
    <div class="pf-c-empty-state__content">
      <p class="pf-c-empty-state__body" style="display: flex; justify-content: center;">
        <slot name="icon">Icon goes here!</slot>
      </p>
      <h1 class="pf-c-title pf-m-lg">{title}</h1>
      <div class="pf-c-empty-state__body">{message}</div>
      {#if commandline.length > 0}
        <div class="flex flex-row bg-gray-800 w-full items-center p-2 mt-2">
          <div id="CommandLine">{commandline}</div>
          <button title="Copy To Clipboard" class="ml-5 mr-5" on:click="{() => copyRunInstructionToClipboard()}"
            ><Fa class="h-5 w-5 cursor-pointer rounded-full text-3xl text-sky-800" icon="{faPaste}" /></button>
        </div>
      {/if}
    </div>
  </div>
</div>
