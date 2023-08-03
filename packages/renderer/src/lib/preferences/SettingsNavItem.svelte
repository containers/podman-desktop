<script lang="ts">
import type { TinroRouteMeta } from 'tinro';

export let title: string;
export let href: string;
export let meta: TinroRouteMeta;
export let section = false;
export let expanded = false;
export let child = false;

let selected: boolean;
$: selected = meta.url === href;
</script>

<a class="no-underline" href="{href}" aria-label="{title}" on:click="{() => (expanded = !expanded)}">
  <div
    class="flex w-full pr-1 justify-between items-center cursor-pointer border-l-[4px] border-charcoal-600"
    class:text-white="{selected}"
    class:py-3="{!child}"
    class:pl-3="{!child}"
    class:py-2="{child}"
    class:pl-4="{child}"
    class:leading-none="{child}"
    class:text-sm="{child}"
    class:font-extralight="{child}"
    class:font-semibold="{!child}"
    class:bg-charcoal-300="{selected}"
    class:border-purple-500="{selected}"
    class:text-gray-400="{!selected}"
    class:hover:text-gray-300="{!selected}"
    class:hover:bg-charcoal-500="{!selected}"
    class:hover:border-charcoal-500="{!selected}">
    <span class="block group-hover:block" class:capitalize="{!child}">{title}</span>
    {#if section}
      <i class="fas {expanded ? 'fa-angle-down' : 'fa-angle-right'} text-lg px-2" aria-hidden="true"></i>
    {/if}
  </div>
</a>
