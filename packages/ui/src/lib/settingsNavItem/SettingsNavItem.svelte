<script lang="ts">
import type { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import Fa from 'svelte-fa';

export let title: string;
export let href: string;
export let section = false;
export let expanded = false;
export let child = false;
export let selected: boolean = false;
export let icon: IconDefinition | undefined = undefined;

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
}
</script>

<a class="no-underline" href={href} aria-label={title} on:click={click}>
  <div
    class="flex w-full pr-1 py-2 justify-between items-center cursor-pointer border-l-[4px]"
    class:text-white={selected}
    class:pl-3={!child}
    class:pl-6={child}
    class:leading-none={child}
    class:text-lg={!child}
    class:font-semibold={!child}
    class:bg-[var(--pd-secondary-nav-selected-bg)]={selected}
    class:border-[var(--pd-secondary-nav-bg)]={!selected}
    class:border-[var(--pd-secondary-nav-selected-highlight)]={selected}
    class:text-[color:var(--pd-secondary-nav-text-selected)]={selected}
    class:text-[color:var(--pd-secondary-nav-text)]={!selected}
    class:hover:[color:var(--pd-secondary-nav-text-hover)]={!selected}
    class:hover:bg-[var(--pd-secondary-nav-text-hover-bg)]={!selected}
    class:hover:border-[var(--pd-secondary-nav-text-hover-bg)]={!selected}>
    <span class="group-hover:block flex flex-row items-center" class:capitalize={!child}>
      {#if icon}
        <Fa class="mr-4" icon={icon} />
      {/if}
      {title}
    </span>
    {#if section}
      <div class="px-2 relative w-4 h-4 [color:var(--pd-secondary-nav-expander)]">
        {#if expanded}
          <i
            class="fas fa-angle-down text-lg absolute left-0 top-0"
            aria-hidden="true"
            in:rotate={{ clockwise: false }}
            out:rotate={{ clockwise: false }}></i>
        {:else}
          <i class="fas fa-angle-right text-lg absolute left-0 top-0" aria-hidden="true" in:rotate={{}} out:rotate={{}}
          ></i>
        {/if}
      </div>
    {/if}
  </div>
</a>
