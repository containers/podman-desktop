<script lang="ts">
import Fa from 'svelte-fa';
import { createEventDispatcher } from 'svelte';
import { faCheckSquare, faMinusSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare as faOutlineSquare } from '@fortawesome/free-regular-svg-icons';

export let checked = false;
export let disabled = false;
export let indeterminate = false;
export let disabledTooltip = '';
export let title = '';

const dispatch = createEventDispatcher<{ click: boolean }>();

function onClick(checked: boolean) {
  dispatch('click', checked);
}
</script>

<label>
  <input
    aria-label="{title}"
    type="checkbox"
    bind:checked="{checked}"
    disabled="{disabled}"
    class="sr-only"
    on:click="{event => onClick(event.currentTarget.checked)}" />
  <div
    class="grid place-content-center"
    title="{disabled ? disabledTooltip : title}"
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
