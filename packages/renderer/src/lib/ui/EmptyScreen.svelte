<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { onMount, SvelteComponent } from 'svelte';

export let icon: any;
export let title: string = 'No title';
export let message: string = 'Message';
export let commandline: string = '';
export let hidden: boolean = false;
export let style: string = '';

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
  window.clipboardWriteText(text);
}

let copyTextDivElement: HTMLDivElement;
</script>

<div class="h-full min-w-full flex flex-col" class:hidden="{hidden}" style="{style}">
  <div class="pf-c-empty-state h-full">
    <div class="pf-c-empty-state__content">
      <p class="pf-c-empty-state__body">
        {#if processed}
          {#if fontAwesomeIcon}
            <Fa
              icon="{icon}"
              size="55"
              class="cursor-pointer pf-c-empty-state__icon"
              style="display:inline-block; text-align: center" />
          {:else}
            <svelte:component
              this="{icon}"
              size="55"
              class="pf-c-empty-state__icon"
              style="display:inline-block; text-align: center" />
          {/if}
        {/if}
      </p>
      <h1 class="pf-c-title pf-m-lg">{title}</h1>
      <div class="pf-c-empty-state__body">{message}</div>
      {#if commandline.length > 0}
        <div class="flex flex-row bg-gray-800 w-full items-center p-2 mt-2">
          <div bind:this="{copyTextDivElement}" data-testid="copyTextDivElement">{commandline}</div>
          <button title="Copy To Clipboard" class="ml-5 mr-5" on:click="{() => copyRunInstructionToClipboard()}"
            ><Fa class="h-5 w-5 cursor-pointer rounded-full text-3xl text-sky-800" icon="{faPaste}" /></button>
        </div>
      {/if}
    </div>
  </div>
</div>
