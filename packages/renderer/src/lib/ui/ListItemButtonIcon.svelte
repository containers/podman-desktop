<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let title: string;
export let icon: IconDefinition;
export let hidden: boolean = false;
export let onClick: () => void = () => {};
export let backgroundColor: string = 'bg-zinc-800';
</script>

<button
  title="{title}"
  on:click="{onClick}"
  class="mx-2 text-gray-300 {backgroundColor}  hover:text-violet-600 font-medium rounded-lg text-sm inline-flex items-center px-3 py-2 text-center"
  class:hidden
  ><Fa class="h-5 w-5 text-xl" icon="{icon}" />
</button>
