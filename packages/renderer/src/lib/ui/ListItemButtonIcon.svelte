<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let title: string;
export let icon: IconDefinition;
export let hidden: boolean = false;
export let onClick: () => void = () => {};
export let backgroundColor: string = 'bg-zinc-800';
export let menu: boolean = false;
</script>

<!-- If menu = true, use the menu, otherwise implement the button -->
{#if menu}
  <!-- Use a div + onclick so there's no "blind spots" for when clicking-->
  <div class="p-3 hover:text-violet-600 text-gray-300 hover:cursor-pointer" role="none" on:click="{onClick}">
    <span title="{title}" class="group flex items-center text-sm no-underline" tabindex="-1">
      <Fa class="h-4 w-4 text-md mr-2" icon="{icon}" />
      {title}
    </span>
  </div>
{:else}
  <button
    title="{title}"
    on:click="{onClick}"
    class="text-gray-300 hover:text-violet-600 font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center"
    class:hidden
    ><Fa class="h-4 w-4 text-xl" icon="{icon}" />
  </button>
{/if}
