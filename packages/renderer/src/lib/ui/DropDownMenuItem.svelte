<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let title: string;
export let icon: IconDefinition;
export let hidden: boolean = false;
export let onClick: () => void = () => {};
</script>

{#if !hidden}
  <!-- Use a div + onclick so there's no "blind spots" for when clicking-->
  <div
    class="p-3 hover:bg-black hover:text-purple-500 hover:rounded-md text-gray-400 hover:cursor-pointer"
    role="none"
    on:click="{onClick}">
    <span title="{title}" class="group flex items-center text-sm no-underline whitespace-nowrap" tabindex="-1">
      <Fa class="h-4 w-4 text-md mr-2" icon="{icon}" />
      {title}
    </span>
  </div>
{/if}
