<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import type { TinroRouteMeta } from 'tinro';
import Tooltip from './Tooltip.svelte';
import { getContext, onDestroy, onMount } from 'svelte';
import type { Writable } from 'svelte/store';
/* eslint-disable import/no-duplicates */

export let href: string;
export let tooltip: string;
export let ariaLabel: string | undefined = undefined;
export let meta: TinroRouteMeta;
export let onClick: any = undefined;

let inSection: boolean = false;
let uri = encodeURI(href);
let selected: boolean;
$: selected = meta.url === uri || (uri !== '/' && meta.url.startsWith(uri));

const navItems: Writable<number> = getContext('nav-items');

onMount(() => {
  inSection = navItems !== undefined;
  navItems?.update(i => i + 1);
});
onDestroy(() => {
  navItems?.update(i => i - 1);
});
</script>

<a
  href="{onClick ? '#top' : uri}"
  class=""
  aria-label="{ariaLabel ? ariaLabel : tooltip}"
  on:click|preventDefault="{onClick}">
  <div
    class="flex py-3 justify-center items-center cursor-pointer"
    class:border-x-[4px]="{!inSection}"
    class:px-2="{inSection}"
    class:border-charcoal-800="{!inSection}"
    class:text-white="{!selected || !inSection}"
    class:text-purple-500="{selected && inSection}"
    class:border-l-purple-500="{selected && !inSection}"
    class:bg-charcoal-500="{selected && !inSection}"
    class:border-r-charcoal-500="{selected && !inSection}"
    class:border-l-charcoal-800="{!selected && !inSection}"
    class:hover:bg-charcoal-700="{!selected || inSection}"
    class:hover:border-charcoal-700="{!selected && !inSection}">
    <Tooltip tip="{tooltip}" right>
      <slot />
    </Tooltip>
  </div>
</a>
