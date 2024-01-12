<script lang="ts">
import { faSun } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';
import Checkbox from '../ui/Checkbox.svelte';
import Tooltip from '../ui/Tooltip.svelte';
import { onMount, tick, createEventDispatcher } from 'svelte';

export let title: string = '';
export let badge: string = '';
export let isDefault: boolean = false;
export let checked: boolean = false;
export let value: string = '';
export let icon: any;
let iconType: 'fontAwesome' | 'unknown' | undefined = undefined;

export let additionalItem: boolean = false;
let additionalValue: string = '';

let displayValueFieldInput = false;

let inputHtmlElement: HTMLInputElement | undefined;

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

  if (isDefault) {
    dispatch('card', { mode: 'add', value: value });
  }
});
</script>

<button
  class="rounded-md p-2 min-w-32 w-32 cursor-pointer hover:bg-charcoal-700 {checked
    ? 'border-dustypurple-700'
    : 'border-gray-700'} border-2 flex flex-row"
  aria-label="{value}"
  on:click|preventDefault="{() => handleClick()}">
  <div>
    {#if !additionalItem}
      <Checkbox bind:checked="{checked}" on:click="{() => handleClick()}" />
    {:else}
      <div>&nbsp;</div>
    {/if}
  </div>
  <div class="mr-2 text-gray-700">
    <div class="flex flex-row">
      <div class="ml-1">
        {#if iconType === 'fontAwesome'}
          <Fa class="text-gray-700 cursor-pointer" icon="{icon}" size="24" />
        {:else if iconType === 'unknown'}
          <svelte:component this="{icon}" class="text-gray-700 cursor-pointer" size="24" />
        {/if}
      </div>

      {#if isDefault}
        <Tooltip tip="Default platform of your computer">
          <Fa size="14" class="text-dustypurple-700 cursor-pointer" icon="{faSun}" />
        </Tooltip>
      {/if}
    </div>
    <div class="text-sm text-left truncate w-24">{title}</div>
    <div class="flex">
      {#if badge}
        <div class="bg-dustypurple-700 text-white text-xs font-medium me-2 px-2.5 py-0.5 rounded">{badge}</div>
      {/if}
      {#if displayValueFieldInput}
        <input
          type="text"
          class="w-24 outline-none text-sm bg-dustypurple-900 rounded-sm text-gray-700 placeholder-gray-700"
          bind:value="{additionalValue}"
          bind:this="{inputHtmlElement}"
          on:keydown="{handleKeydownAdditionalField}" />
      {/if}
    </div>
  </div>
</button>
