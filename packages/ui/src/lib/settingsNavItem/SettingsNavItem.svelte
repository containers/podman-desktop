<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import type { Component } from 'svelte';
import Fa from 'svelte-fa';

import { isFontAwesomeIcon } from '../utils/icon-utils';

interface Props {
  title: string;
  href: string;
  section?: boolean;
  expanded?: boolean;
  child?: boolean;
  selected?: boolean;
  icon?: IconDefinition | Component;
  onClick?: () => void;
}

let {
  title,
  href,
  section = false,
  expanded = $bindable(),
  child = false,
  selected = false,
  icon = undefined,
  onClick = (): void => {},
}: Props = $props();

function rotate(
  node: unknown,
  { clockwise = true },
): {
  duration: number;
  css: (t: unknown, u: number) => string;
} {
  return {
    duration: 200,
    css: (t: unknown, u: number): string => {
      if (!clockwise) u = -u;
      return `
        transform: rotate(${u * 90}deg);
        transform-origin: center center;`;
    },
  };
}

function click(): void {
  expanded = !expanded;
  onClick();
}
</script>

<a class="no-underline" href={href} aria-label={title} onclick={click}>
  <div
    class="flex w-full pr-1 py-2 justify-between items-center cursor-pointer border-l-[4px]"
    class:pl-3={!child}
    class:pl-6={child}
    class:leading-none={child}
    class:text-md={!child}
    class:font-medium={!child}
    class:bg-[var(--pd-secondary-nav-selected-bg)]={selected}
    class:border-[var(--pd-secondary-nav-bg)]={!selected}
    class:border-[var(--pd-secondary-nav-selected-highlight)]={selected}
    class:text-[color:var(--pd-secondary-nav-text-selected)]={selected}
    class:text-[color:var(--pd-secondary-nav-text)]={!selected}
    class:hover:text-[color:var(--pd-secondary-nav-text-hover)]={!selected}
    class:hover:bg-[var(--pd-secondary-nav-text-hover-bg)]={!selected}
    class:hover:border-[var(--pd-secondary-nav-text-hover-bg)]={!selected}>
    <span class="group-hover:block flex flex-row items-center" class:capitalize={!child}>
      {#if icon}
        {#if isFontAwesomeIcon(icon)}
          <Fa class="mr-4" {icon} />
        {:else}
          {@const Icon = icon}
          <div class="mr-4">
            <Icon size="14" />
          </div>
        {/if}
      {/if}
      {title}
    </span>
    {#if section}
      <div class="px-2 relative w-4 h-4 text-[color:var(--pd-secondary-nav-expander)]">
        {#if expanded}
          <i
            class="fas fa-angle-down text-md absolute left-0 top-0.5"
            aria-hidden="true"
            in:rotate={{ clockwise: false }}
            out:rotate={{ clockwise: false }}></i>
        {:else}
          <i class="fas fa-angle-right text-md absolute left-0 top-0.5" aria-hidden="true" in:rotate={{}} out:rotate={{}}
          ></i>
        {/if}
      </div>
    {/if}
  </div>
</a>
