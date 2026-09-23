<script lang="ts">
import { Tooltip } from '@podman-desktop/ui-svelte';
import type { Snippet } from 'svelte';
import { getContext, onDestroy, onMount } from 'svelte';
import type { MouseEventHandler } from 'svelte/elements';
import type { Writable } from 'svelte/store';
import type { TinroRouteMeta } from 'tinro';

import { isNavItemSelected } from './nav-item-selection';

interface Props {
  href: string;
  tooltip: string;
  ariaLabel?: string;
  meta: TinroRouteMeta;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  counter?: number;
  expanded?: boolean;
  children?: Snippet;
}

let { href, tooltip, ariaLabel, meta = $bindable(), onClick, counter, expanded = false, children }: Props = $props();

const navItems: Writable<number> = getContext('nav-items');
const inSection = $navItems !== undefined;
let uri = $derived(encodeURI(href));
let selected = $derived(isNavItemSelected(meta.url, href));

let tooltipText = $derived(counter ? `${tooltip} (${counter})` : tooltip);

function handleClick(e: MouseEvent & { currentTarget: EventTarget & HTMLAnchorElement }): void {
  if (onClick) {
    e.preventDefault();
    onClick(e);
  }
}

onMount(() => {
  navItems?.update(i => i + 1);
});
onDestroy(() => {
  navItems?.update(i => i - 1);
});
</script>

<a
  href={onClick ? '#top' : uri}
  class="focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--pd-global-nav-icon-selected-highlight)]"
  aria-label={ariaLabel ?? tooltip}
  onclick={handleClick}>
  <div
    class="flex py-2 px-2.5 items-center cursor-pointer min-h-9"
    class:border-l-[4px]={!inSection}
    class:border-[var(--pd-global-nav-bg)]={!inSection}
    class:text-[color:var(--pd-global-nav-icon)]={!selected || !inSection}
    class:text-[color:var(--pd-global-nav-icon-selected)]={selected && inSection}
    class:border-l-[var(--pd-global-nav-icon-selected-highlight)]={selected && !inSection}
    class:bg-[var(--pd-global-nav-icon-selected-bg)]={selected && !inSection}
    class:border-l-[var(--pd-global-nav-bg)]={!selected && !inSection}
    class:hover:text-[color:var(--pd-global-nav-icon-hover)]={!selected || inSection}
    class:hover:bg-[var(--pd-global-nav-icon-hover-bg)]={!selected || inSection}
    class:hover:border-l-[var(--pd-global-nav-icon-hover-bg)]={!selected && !inSection}>
    <Tooltip right tip={expanded ? undefined : tooltipText} class="flex items-center w-full min-w-0" containerClass="relative w-full min-w-0">
      {@render children?.()}
    </Tooltip>
  </div>
</a>
