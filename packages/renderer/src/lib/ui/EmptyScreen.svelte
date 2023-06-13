<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { onMount, SvelteComponent } from 'svelte';

export let icon: any;
export let title = 'No title';
export let message = 'Message';
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
  window.clipboardWriteText(text);
}

let copyTextDivElement: HTMLDivElement;
</script>

<div class="h-full min-w-full flex flex-col ${$$props.class || ''}" class:hidden="{hidden}" style="{$$props.style}">
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
        <div class="flex flex-row bg-charcoal-900 w-full items-center justify-between rounded-sm p-3 mt-4">
          <div class="font-mono text-gray-400" bind:this="{copyTextDivElement}" data-testid="copyTextDivElement">
            {commandline}
          </div>
          <button title="Copy To Clipboard" class="ml-5" on:click="{() => copyRunInstructionToClipboard()}"
            ><Fa
              class="h-5 w-5 cursor-pointer text-xl text-purple-500 hover:text-purple-600"
              icon="{faPaste}" /></button>
        </div>
      {/if}
    </div>
  </div>
</div>
