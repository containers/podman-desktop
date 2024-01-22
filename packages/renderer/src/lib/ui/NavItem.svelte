<script lang="ts">
import type { TinroRouteMeta } from 'tinro';
import Tooltip from './Tooltip.svelte';

export let href: string;
export let tooltip: string;
export let ariaLabel: string | undefined = undefined;
export let meta: TinroRouteMeta;
export let onClick: any = undefined;
export let inSection: boolean = false;

let uri = encodeURI(href);
let selected: boolean;
$: selected = meta.url === uri || (uri !== '/' && meta.url.startsWith(uri));
</script>

<a
  href="{onClick ? '#top' : uri}"
  class=""
  aria-label="{ariaLabel ? ariaLabel : tooltip}"
  on:click|preventDefault="{onClick}">
  <div
    class="flex py-3 justify-center items-center border-x-[4px] cursor-pointer"
    class:border-charcoal-800="{!inSection}"
    class:border-charcoal-600="{inSection}"
    class:text-white="{!selected || !inSection}"
    class:text-purple-500="{selected && inSection}"
    class:border-l-purple-500="{selected && !inSection}"
    class:bg-charcoal-500="{selected && !inSection}"
    class:border-r-charcoal-500="{selected && !inSection}"
    class:border-l-charcoal-800="{!selected && !inSection}"
    class:hover:bg-charcoal-700="{!selected}"
    class:hover:border-charcoal-700="{!selected}">
    <Tooltip tip="{tooltip}" right>
      <slot />
    </Tooltip>
  </div>
</a>
