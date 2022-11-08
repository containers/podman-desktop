<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let title: string;
export let icon: IconDefinition;
export let hidden: boolean = false;
export let onClick: () => void = () => {};
</script>

<button
  title="{title}"
  on:click="{onClick}"
  class="p-2 text-gray-300 hover:text-violet-600 font-medium rounded-lg text-sm inline-flex items-center text-center"
  class:hidden
  ><Fa class="h-4 w-4 text-xl" icon="{icon}" />
</button>
