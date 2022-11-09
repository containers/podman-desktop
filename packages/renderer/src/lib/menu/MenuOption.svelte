<script lang="ts">
import { getContext } from 'svelte';
import { key } from './menu.ts';

export let isDisabled = false;
export let text = '';

import { createEventDispatcher } from 'svelte';
const dispatch = createEventDispatcher();

const { dispatchClick } = getContext(key);

const handleClick = event => {
  if (isDisabled) return;

  dispatch('click');
  dispatchClick();
};
</script>

<div
  class:disabled="{isDisabled}"
  on:click="{event => handleClick(event)}"
  class="text-white block px-4 py-1 text-sm w-full text-left hover:bg-zinc-700 hover:no-underline">
  {#if text}
    {text}
  {:else}
    <slot />
  {/if}
</div>
