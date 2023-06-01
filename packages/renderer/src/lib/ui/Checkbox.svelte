<script lang="ts">
import Fa from 'svelte-fa/src/fa.svelte';
import { faCheckSquare, faMinusSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare as faOutlineSquare } from '@fortawesome/free-regular-svg-icons';

export let selected: boolean = false;
export let disabled: boolean = false;
export let indeterminate: boolean = false;
export let disabledTooltip: string = '';
</script>

<label>
  <input
    type="checkbox"
    bind:checked="{selected}"
    disabled="{disabled}"
    indeterminate="{indeterminate}"
    class="sr-only"
    on:click />
  <div
    class="grid place-content-center"
    title="{disabled ? disabledTooltip : ''}"
    class:cursor-pointer="{!disabled}"
    class:cursor-not-allowed="{disabled}">
    {#if disabled}
      <Fa size="18" icon="{faSquare}" class="text-charcoal-300" />
    {:else if indeterminate}
      <Fa size="18" icon="{faMinusSquare}" class="text-dustypurple-500" />
    {:else if selected}
      <Fa size="18" icon="{faCheckSquare}" class="text-purple-500" />
    {:else}
      <Fa size="18" icon="{faOutlineSquare}" class="text-gray-400" />
    {/if}
  </div>
</label>
