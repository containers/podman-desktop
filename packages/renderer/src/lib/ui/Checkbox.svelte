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

function onClick(checked: boolean) {
  dispatch('click', checked);
}
</script>

<label class="{$$props.class || ''}">
  <input
    aria-label="{title}"
    type="checkbox"
    id="{id}"
    name="{name}"
    bind:checked="{checked}"
    disabled="{disabled}"
    required="{required}"
    class="sr-only"
    on:click="{event => onClick(event.currentTarget.checked)}" />
  <div
    class="grid place-content-center"
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
</label>
