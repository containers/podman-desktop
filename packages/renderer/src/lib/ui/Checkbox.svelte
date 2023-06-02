<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { createEventDispatcher } from 'svelte';
import { faCheckSquare, faMinusSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare as faOutlineSquare } from '@fortawesome/free-regular-svg-icons';

export let checked: boolean = false;
export let disabled: boolean = false;
export let indeterminate: boolean = false;
export let disabledTooltip: string = '';

const dispatch = createEventDispatcher<{ click: boolean }>();

function onClick(checked: boolean) {
  dispatch('click', checked);
}
</script>

<label>
  <input
    type="checkbox"
    bind:checked="{checked}"
    disabled="{disabled}"
    indeterminate="{indeterminate}"
    class="sr-only"
    on:click="{event => onClick(event.currentTarget.checked)}" />
  <div
    class="grid place-content-center"
    title="{disabled ? disabledTooltip : ''}"
    class:cursor-pointer="{!disabled}"
    class:cursor-not-allowed="{disabled}">
    {#if disabled}
      <Fa size="18" icon="{faSquare}" class="text-charcoal-300" />
    {:else if indeterminate}
      <Fa size="18" icon="{faMinusSquare}" class="text-dustypurple-500" />
    {:else if checked}
      <Fa size="18" icon="{faCheckSquare}" class="text-purple-500" />
    {:else}
      <Fa size="18" icon="{faOutlineSquare}" class="text-gray-400" />
    {/if}
  </div>
</label>
