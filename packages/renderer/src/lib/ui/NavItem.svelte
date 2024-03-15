<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { getContext, onDestroy, onMount } from 'svelte';
import type { Writable } from 'svelte/store';
import type { TinroRouteMeta } from 'tinro';

import Tooltip from './Tooltip.svelte';
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
    class:border-[var(--pd-global-nav-bg)]="{!inSection}"
    class:text-[color:var(--pd-global-nav-icon)]="{!selected || !inSection}"
    class:text-[color:var(--pd-global-nav-icon-selected)]="{selected && inSection}"
    class:border-l-[var(--pd-global-nav-icon-selected-highlight)]="{selected && !inSection}"
    class:bg-[var(--pd-global-nav-icon-selected-bg)]="{selected && !inSection}"
    class:border-r-[var(--pd-global-nav-icon-selected-bg)]="{selected && !inSection}"
    class:border-l-[var(--pd-global-nav-bg)]="{!selected && !inSection}"
    class:hover:text-[color:var(--pd-global-nav-icon-hover)]="{!selected || inSection}"
    class:hover:bg-[var(--pd-global-nav-icon-hover-bg)]="{!selected || inSection}"
    class:hover:border-[var(--pd-global-nav-icon-hover-bg)]="{!selected && !inSection}">
    <Tooltip tip="{tooltip}" right>
      <slot />
    </Tooltip>
  </div>
</a>
