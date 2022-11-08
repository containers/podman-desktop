<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';

export let title: string;
export let icon: IconDefinition;
export let hidden: boolean = false;
export let onClick: () => void = () => {};
</script>

<div class="py-1" role="none">
  <a
    title="{title}"
    on:click="{onClick}"
    class="text-gray-300 group flex items-center px-4 py-2 text-sm hover:text-violet-600"
    role="menuitem"
    tabindex="-1"
    id="menu-item-1">
    <Fa class="h-4 w-4 text-xl mr-2" icon="{icon}" />
    {title}
  </a>
</div>
