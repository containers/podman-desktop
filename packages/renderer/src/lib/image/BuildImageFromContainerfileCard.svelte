<script lang="ts">
import { faCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher, onMount, tick } from 'svelte';
import Fa from 'svelte-fa';

import Checkbox from '../ui/Checkbox.svelte';
import Tooltip from '../ui/Tooltip.svelte';

export let title: string = '';
export let badge: string = '';
export let isDefault: boolean = false;
export let checked: boolean = false;
export let value: string = '';
export let icon: any | undefined = '';
let iconType: 'fontAwesome' | 'unknown' | undefined = undefined;

export let additionalItem: boolean = false;
let additionalValue: string = '';

let displayValueFieldInput = false;

let inputHtmlElement: HTMLInputElement | undefined;

let badges: string[] = [];

const dispatch = createEventDispatcher();

function handleKeydownAdditionalField(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    dispatch('addcard', { value: additionalValue });
    displayValueFieldInput = false;
  }
}

function handleClick() {
  if (additionalItem) {
    // display the new field input
    displayValueFieldInput = true;
    additionalValue = '';

    // make focus on the input field
    tick().then(() => {
      if (inputHtmlElement) {
        inputHtmlElement.focus();
      }
    });
    return;
  }

  checked = !checked;

  if (checked) {
    dispatch('card', { mode: 'add', value: value });
  } else {
    dispatch('card', { mode: 'remove', value: value });
  }
}

onMount(() => {
  if (icon?.prefix?.startsWith('fa')) {
    iconType = 'fontAwesome';
  } else {
    iconType = 'unknown';
  }

  if (badge) {
    badges = [badge];
  }
  if (isDefault) {
    badges.push('Default');
  }

  if (isDefault) {
    dispatch('card', { mode: 'add', value: value });
  }
});
</script>

<button
  class="rounded-md bg-charcoal-700 p-2 min-w-48 w-48 min-h-24 cursor-pointer hover:bg-charcoal-500 {checked
    ? 'border-dustypurple-700'
    : 'border-charcoal-700'} border-2 flex flex-col"
  aria-label="{value}"
  on:click|preventDefault="{() => handleClick()}">
  <div class="flex flex-row">
    <div class="flex flex-col">
      {#if !additionalItem}
        <Checkbox bind:checked="{checked}" on:click="{() => handleClick()}" />
      {:else}
        <Fa class="text-dustypurple-700 cursor-pointer" icon="{faPlusCircle}" size="1.5x" />
      {/if}
    </div>
    <div class="ml-2 text-sm text-left break-normal w-36">{title}</div>
    {#if isDefault}
      <Tooltip tip="Default platform of your computer">
        <Fa size="0.5x" class="text-dustypurple-700 cursor-pointer" icon="{faCircle}" />
      </Tooltip>
    {/if}
  </div>
  <div class="flex flex-row grow w-full mt-2 items-end">
    <div class="flex">
      {#if badges.length > 0}
        {#each badges as badge}
          <div class="text-gray-700 border-gray-700 border text-xs font-medium me-2 px-2.5 py-0.5 rounded-xl">
            {badge}
          </div>
        {/each}
      {/if}
      {#if displayValueFieldInput}
        <input
          type="text"
          class="w-40 outline-none text-sm bg-dustypurple-900 rounded-xs text-gray-700 placeholder-gray-700"
          bind:value="{additionalValue}"
          bind:this="{inputHtmlElement}"
          on:keydown="{handleKeydownAdditionalField}" />
      {/if}
    </div>
    <div class="flex grow justify-end">
      {#if iconType === 'fontAwesome'}
        <Fa class="text-white cursor-pointer" icon="{icon}" size="1.5x" />
      {:else if iconType === 'unknown'}
        <svelte:component this="{icon}" class="text-gray-900 cursor-pointer" size="24" />
      {/if}
    </div>
  </div>
</button>
