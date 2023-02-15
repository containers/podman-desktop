<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import DropdownMenuItem from './DropDownMenuItem.svelte';
import Fa from 'svelte-fa/src/fa.svelte';

export let title: string;
export let icon: IconDefinition;
export let hidden: boolean = false;
export let enabled: boolean = true;
export let onClick: () => void = () => {};
export let menu: boolean = false;
export let detailed: boolean = false;

const buttonDetailedClass: string =
  'mx-1 text-gray-300 bg-zinc-900 hover:text-violet-600 font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center';
const buttonDetailedDisabledClass: string =
  'mx-1 text-gray-700 bg-zinc-900 font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center';
const buttonClass: string =
  'm-0.5 text-gray-300 hover:bg-zinc-800 hover:text-violet-600 font-medium rounded-full inline-flex items-center px-2 py-2 text-center';
const buttonDisabledClass: string =
  'm-0.5 text-gray-700 font-medium rounded-full inline-flex items-center px-2 py-2 text-center';

$: handleClick = enabled ? onClick : () => {};
$: styleClass = detailed
  ? enabled
    ? buttonDetailedClass
    : buttonDetailedDisabledClass
  : enabled
  ? buttonClass
  : buttonDisabledClass;
</script>

<!-- If menu = true, use the menu, otherwise implement the button -->
{#if menu}
  <!-- enabled menu -->
  <DropdownMenuItem title="{title}" icon="{icon}" hidden="{hidden}" onClick="{handleClick}" />
{:else}
  <!-- enabled button -->
  <button title="{title}" on:click="{handleClick}" class="{styleClass}" class:hidden="{hidden}">
    <Fa class="h-4 w-4" icon="{icon}" />
  </button>
{/if}
