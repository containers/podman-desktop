<script lang="ts">
import { faSquare as faOutlineSquare } from '@fortawesome/free-regular-svg-icons';
import { faCheckSquare, faMinusSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';

export let checked = false;
export let disabled = false;
export let indeterminate = false;
export let disabledTooltip = '';
export let title = '';
export let id: string | undefined = undefined;
export let name: string | undefined = undefined;
export let required = false;

const dispatch = createEventDispatcher<{ click: boolean }>();

function onClick(
  event: MouseEvent & {
    currentTarget: EventTarget & HTMLInputElement;
  },
): void {
  const checked = event.currentTarget.checked;
  dispatch('click', checked);
}
</script>

<label class="relative p-1 {$$props.class || ''}">
  <div
    class="grid place-content-center absolute inset-0"
    title="{disabled ? disabledTooltip : title}"
    class:cursor-pointer="{!disabled}"
    class:cursor-not-allowed="{disabled}">
    {#if disabled}
      <Fa size="1.1x" icon="{faSquare}" class="text-charcoal-300" />
    {:else if indeterminate}
      <Fa size="1.1x" icon="{faMinusSquare}" class="text-dustypurple-500" />
    {:else if checked}
      <Fa size="1.1x" icon="{faCheckSquare}" class="text-purple-500" />
    {:else}
      <Fa size="1.1x" icon="{faOutlineSquare}" class="text-gray-400" />
    {/if}
  </div>
  <input
    aria-label="{title}"
    type="checkbox"
    id="{id}"
    name="{name}"
    bind:checked="{checked}"
    disabled="{disabled}"
    required="{required}"
    class="opacity-0 absolute"
    on:click="{onClick}" />
</label>
