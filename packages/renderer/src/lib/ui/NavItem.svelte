<script lang="ts">
import type { TinroRouteMeta } from 'tinro';
import Tooltip from './Tooltip.svelte';

export let href: string;
export let tooltip: string;
export let meta: TinroRouteMeta;
export let onClick: any = undefined;

let selected: boolean;
$: selected = meta.url === href;
</script>

<a href="{onClick ? '#top' : href}" aria-label="{tooltip}" on:click|preventDefault="{onClick}">
  <div
    class="flex w-full py-3 justify-center items-center border-x-[4px] border-charcoal-800 text-white cursor-pointer"
    class:border-l-purple-500="{selected}"
    class:bg-charcoal-500="{selected}"
    class:border-r-charcoal-500="{selected}"
    class:border-l-charcoal-800="{!selected}"
    class:hover:bg-charcoal-700="{!selected}"
    class:hover:border-charcoal-700="{!selected}">
    <Tooltip tip="{tooltip}" right>
      <slot />
    </Tooltip>
  </div>
</a>
