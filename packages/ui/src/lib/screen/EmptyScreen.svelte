<script lang="ts">
import { faPaste } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher, onMount } from 'svelte';
import Fa from 'svelte-fa';

import Button from '../button/Button.svelte';
import { isFontAwesomeIcon } from '../utils/icon-utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export let icon: any;
export let title = 'No title';
export let message = 'Message';
export let detail = '';
export let commandline = '';
export let hidden = false;

let fontAwesomeIcon = false;
let processed = false;

const dispatch = createEventDispatcher<{ click: string }>();
export let onClick: (text: string) => void = text => {
  dispatch('click', text);
};

onMount(() => {
  if (isFontAwesomeIcon(icon)) {
    fontAwesomeIcon = true;
  }
  processed = true;
});

function handleClick(): void {
  const text = copyTextDivElement?.textContent;
  if (text) {
    onClick(text);
  }
}

let copyTextDivElement: HTMLDivElement;
</script>

<div
  class="flex flex-row w-full h-full justify-center {$$props.class || ''}"
  class:hidden={hidden}
  style={$$props.style}
  aria-label={$$props['aria-label']}>
  <div class="flex flex-col h-full justify-center text-center space-y-3">
    <div class="flex justify-center text-[var(--pd-details-empty-icon)] py-2">
      {#if processed}
        {#if fontAwesomeIcon}
          <Fa icon={icon} size="4x" />
        {:else}
          <svelte:component this={icon} size="55" />
        {/if}
      {/if}
    </div>
    <h1 class="text-xl text-[var(--pd-details-empty-header)]">{title}</h1>
    <span class="text-[var(--pd-details-empty-sub-header)] max-w-[800px] text-pretty mx-2">{message}</span>
    {#if detail}
      <span class="text-[var(--pd-details-empty-sub-header)]">{detail}</span>
    {/if}
    {#if commandline}
      <div
        class="flex flex-row bg-[var(--pd-details-empty-cmdline-bg)] items-center justify-between rounded-sm p-3 mt-4">
        <div
          class="font-mono text-[var(--pd-details-empty-cmdline-text)]"
          bind:this={copyTextDivElement}
          data-testid="copyTextDivElement">
          {commandline}
        </div>
        <Button title="Copy To Clipboard" class="ml-5" on:click={handleClick} type="link"
          ><Fa class="h-5 w-5 cursor-pointer text-xl text-purple-500 hover:text-purple-600" icon={faPaste} /></Button>
      </div>
    {/if}
    {#if $$slots}
      <div class="py-2">
        <slot />
      </div>
    {/if}
  </div>
</div>
