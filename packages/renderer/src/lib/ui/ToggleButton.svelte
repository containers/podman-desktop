<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { createEventDispatcher } from 'svelte';
import Fa from 'svelte-fa';

export let icon: IconDefinition;
export let selected: boolean = false;
export let disabled: boolean = false;
export let iconClass: string = '';

$: displayedIconClass = disabled ? '' : iconClass;

const dispatch = createEventDispatcher();

function onclick(): void {
  selected = !selected;
  dispatch('click', selected);
}
</script>

<button
  disabled={disabled}
  class="first:rounded-l last:rounded-r"
  class:bg-charcoal-500={!disabled && !selected}
  class:hover:bg-charcoal-300={!disabled && !selected}
  class:bg-charcoal-200={!disabled && selected}
  class:hover:bg-charcoal-100={!disabled && selected}
  class:bg-charcoal-700={disabled}
  class:hover:bg-charcoal-700={disabled}
  class:text-gray-900={disabled}
  class:cursor-not-allowed={disabled}
  on:click={onclick}>
  <div class="flex flex-row items-center space-x-2 px-2 py-1 text-xs">
    {#if icon}
      <Fa icon={icon} class={displayedIconClass} />
    {/if}
    <span><slot /></span>
  </div>
</button>
