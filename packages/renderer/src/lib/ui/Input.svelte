<script lang="ts">
import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher, onMount } from 'svelte';
import Fa from 'svelte-fa';

export let placeholder: string | undefined = undefined;
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let value: string | undefined = undefined;
export let readonly: boolean = false;
export let required: boolean = false;
export let type: 'text' | 'search' | 'clear' | 'password' = 'text';
export let passwordHidden: boolean = true;

let element: HTMLInputElement;

const dispatch = createEventDispatcher();

onMount(() => {
  if (type === 'password') {
    element.type = 'password';
  }
});

// clear the value if the parent doesn't override
async function onClear() {
  if (dispatch('action', { cancelable: true })) {
    value = '';
  }
}

// show/hide if the parent doesn't override
async function onShowHide() {
  if (dispatch('action', { cancelable: true })) {
    passwordHidden = !passwordHidden;
    element.type = passwordHidden ? 'password' : 'text';
  }
}
</script>

<div
  class="flex flex-row items-center px-1 py-1 group bg-charcoal-500 border-[1px] border-charcoal-500 {$$props.class ||
    ''}"
  class:hover:bg-charcoal-900="{!readonly}"
  class:focus-within:bg-charcoal-900="{!readonly}"
  class:hover:rounded-md="{!readonly}"
  class:focus-within:rounded-md="{!readonly}"
  class:border-b-purple-500="{!readonly}"
  class:hover:border-purple-400="{!readonly}"
  class:focus-within:border-purple-500="{!readonly}"
  class:border-b-charcoal-100="{readonly}">
  {#if type === 'search'}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="w-4 h-4 mx-1 text-gray-700"
      class:group-hover:text-gray-900="{!readonly}"
      class:group-focus-within:text-gray-900="{!readonly}"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      role="img">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
    </svg>
  {/if}
  <input
    bind:this="{element}"
    on:input
    class="w-full px-1 outline-0 bg-charcoal-500 text-sm text-white placeholder:text-gray-700"
    class:group-hover:bg-charcoal-900="{!readonly}"
    class:group-focus-within:bg-charcoal-900="{!readonly}"
    class:group-hover-placeholder:text-gray-900="{!readonly}"
    name="{name}"
    type="text"
    readonly="{readonly}"
    required="{required}"
    placeholder="{placeholder}"
    id="{id}"
    aria-label="{$$props['aria-label']}"
    aria-invalid="{$$props['aria-invalid']}"
    bind:value="{value}" />
  {#if type === 'password'}
    <button
      class="px-1 cursor-pointer text-gray-700"
      class:group-hover:text-gray-900="{!readonly}"
      class:group-focus-within:text-gray-900="{!readonly}"
      class:hidden="{!value}"
      aria-label="show/hide"
      on:click="{onShowHide}"
      >{#if passwordHidden}
        <Fa icon="{faEye}" />
      {:else}
        <Fa icon="{faEyeSlash}" />
      {/if}
    </button>
  {:else if type === 'clear'}
    <button
      class="px-1 cursor-pointer text-gray-700"
      class:group-hover:text-gray-900="{!readonly}"
      class:group-focus-within:text-gray-900="{!readonly}"
      class:hidden="{!value || readonly}"
      aria-label="clear"
      on:click="{onClear}">
      <Fa icon="{faXmark}" />
    </button>
  {/if}
</div>
