<script lang="ts">
import type { TinroRouteMeta } from 'tinro';
import Tooltip from './Tooltip.svelte';

export let href: string;
export let tooltip: string;
export let ariaLabel: string | undefined = undefined;
export let meta: TinroRouteMeta;
export let onClick: any = undefined;

let uri = encodeURI(href);
let selected: boolean;
$: selected = meta.url === uri || (uri !== '/' && meta.url.startsWith(uri));
</script>

<a href="{onClick ? '#top' : uri}" aria-label="{ariaLabel ? ariaLabel : tooltip}" on:click|preventDefault="{onClick}">
  <div
    class="flex w-full py-3 justify-center items-center border-x-[4px] border-gray-200 dark:border-charcoal-800 text-charcoal-900 dark:text-white cursor-pointer"
    class:border-l-purple-700="{selected}"
    class:dark:border-l-purple-500="{selected}"
    class:bg-gray-800="{selected}"
    class:dark:bg-charcoal-500="{selected}"
    class:border-r-gray-800="{selected}"
    class:dark:border-r-charcoal-500="{selected}"
    class:border-l-gray-200="{!selected}"
    class:dark:border-l-charcoal-800="{!selected}"
    class:hover:bg-gray-700="{!selected}"
    class:hover:dark:bg-charcoal-700="{!selected}"
    class:hover:border-gray-700="{!selected}"
    class:dark:hover:border-charcoal-700="{!selected}">
    <Tooltip tip="{tooltip}" right>
      <slot />
    </Tooltip>
  </div>
</a>
