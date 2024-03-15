<script lang="ts">
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { onMount } from 'svelte';
import Fa from 'svelte-fa';

export let icon: any;
export let title = 'No title';
export let message = 'Message';
export let detail = '';
export let commandline = '';
export let hidden = false;

let fontAwesomeIcon = false;
let processed = false;

onMount(() => {
  if (icon?.prefix === 'fas') {
    fontAwesomeIcon = true;
  }
  processed = true;
});

function copyRunInstructionToClipboard() {
  const text = copyTextDivElement?.textContent;
  if (text) {
    window.clipboardWriteText(text);
  }
}

let copyTextDivElement: HTMLDivElement;
</script>

<div
  class="flex flex-row w-full h-full justify-center {$$props.class || ''}"
  class:hidden="{hidden}"
  style="{$$props.style}"
  aria-label="{$$props['aria-label']}">
  <div class="flex flex-col h-full justify-center text-center space-y-3">
    <div class="flex justify-center text-gray-700 py-2">
      {#if processed}
        {#if fontAwesomeIcon}
          <Fa icon="{icon}" size="4x" />
        {:else}
          <svelte:component this="{icon}" size="55" solid="{false}" />
        {/if}
      {/if}
    </div>
    <h1 class="text-xl">{title}</h1>
    <span class="text-gray-700">{message}</span>
    {#if detail}
      <span class="text-gray-700">{detail}</span>
    {/if}
    {#if commandline}
      <div class="flex flex-row bg-charcoal-900 items-center justify-between rounded-sm p-3 mt-4">
        <div class="font-mono text-gray-400" bind:this="{copyTextDivElement}" data-testid="copyTextDivElement">
          {commandline}
        </div>
        <button title="Copy To Clipboard" class="ml-5" on:click="{() => copyRunInstructionToClipboard()}"
          ><Fa class="h-5 w-5 cursor-pointer text-xl text-purple-500 hover:text-purple-600" icon="{faPaste}" /></button>
      </div>
    {/if}
    {#if $$slots}
      <div class="py-2">
        <slot />
      </div>
    {/if}
  </div>
</div>
