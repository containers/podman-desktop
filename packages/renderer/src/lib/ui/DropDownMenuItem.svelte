<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa';

export let title: string;
export let icon: IconDefinition;
export let enabled = true;
export let hidden = false;
export let onClick: () => void = () => {};

const enabledClasses = 'hover:bg-black hover:text-purple-500 hover:rounded-md text-gray-400 hover:cursor-pointer';
const disabledClasses = 'text-gray-900 bg-charcoal-800';
</script>

{#if !hidden}
  <!-- Use a div + onclick so there's no "blind spots" for when clicking-->
  <div class="{`p-3 ${enabled ? enabledClasses : disabledClasses}`}" role="none" on:click="{onClick}">
    <span title="{title}" class="group flex items-center text-sm no-underline whitespace-nowrap" tabindex="-1">
      <Fa class="h-4 w-4 text-md" icon="{icon}" />
      {#if title}<span class="ml-2">{title}</span>{/if}
    </span>
  </div>
{/if}
