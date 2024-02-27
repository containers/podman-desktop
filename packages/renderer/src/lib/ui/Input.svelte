<script lang="ts">
import { faCircleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';

export let placeholder: string | undefined = undefined;
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let value: string | undefined = undefined;
export let readonly: boolean = false;
export let required: boolean = false;
export let clearable: boolean = false;
export let disabled: boolean = false;
export let error: string | undefined = undefined;

export let element: HTMLInputElement | undefined = undefined;

let enabled: boolean = true;
$: enabled = !readonly && !disabled;

const dispatch = createEventDispatcher();

// clear the value if the parent doesn't override
async function onClear() {
  if (dispatch('action', { cancelable: true })) {
    value = '';
    if (element) {
      // need to trigger normal input event for on:input listeners
      element.value = value;
      element.dispatchEvent(new InputEvent('input'));
    }
  }
}
</script>

<div class="flex flex-col w-full">
  <div
    class="flex flex-row w-full items-center px-1 py-1 group bg-transparent border-[1px] border-transparent {$$props.class ||
      ''}"
    class:hover:bg-charcoal-900="{enabled}"
    class:focus-within:bg-charcoal-900="{enabled}"
    class:hover:rounded-md="{enabled}"
    class:focus-within:rounded-md="{enabled}"
    class:border-b-purple-500="{enabled && !error}"
    class:border-b-red-500="{enabled && error}"
    class:hover:border-purple-400="{enabled && !error}"
    class:hover:border-red-400="{enabled && error}"
    class:focus-within:border-purple-500="{enabled && !error}"
    class:focus-within:border-red-500="{enabled && error}"
    class:border-b-charcoal-100="{readonly || disabled}">
    <slot name="left" />
    <input
      bind:this="{element}"
      on:input
      class="grow px-1 outline-0 text-sm bg-transparent placeholder:text-gray-700 overflow-hidden"
      class:text-white="{!disabled}"
      class:text-gray-700="{disabled}"
      class:group-hover:bg-charcoal-900="{enabled}"
      class:group-focus-within:bg-charcoal-900="{enabled}"
      class:group-hover-placeholder:text-gray-900="{enabled}"
      name="{name}"
      type="text"
      disabled="{disabled}"
      readonly="{readonly}"
      required="{required}"
      placeholder="{placeholder}"
      id="{id}"
      aria-label="{$$props['aria-label']}"
      aria-invalid="{$$props['aria-invalid']}"
      bind:value="{value}" />
    {#if error}
      <span class="px-1 text-red-500" aria-label="error">
        <Fa icon="{faCircleExclamation}" />
      </span>
    {/if}
    {#if clearable}
      <button
        class="px-1 cursor-pointer text-gray-700 group-hover:text-gray-900 group-focus-within:text-gray-900"
        class:hidden="{!value || readonly || disabled}"
        aria-label="clear"
        on:click="{onClear}">
        <Fa icon="{faXmark}" />
      </button>
    {/if}
    <slot name="right" />
  </div>
  {#if error && error.length > 0}
    <span class="text-sm text-red-500">{error}</span>
  {/if}
</div>
