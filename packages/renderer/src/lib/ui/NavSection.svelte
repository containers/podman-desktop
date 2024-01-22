<script lang="ts">
/* eslint-disable import/no-duplicates */
// https://github.com/import-js/eslint-plugin-import/issues/1479
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Tooltip from './Tooltip.svelte';
import Fa from 'svelte-fa';
import { onMount, setContext } from 'svelte';
import { cubicOut } from 'svelte/easing';
import { writable, type Writable } from 'svelte/store';
/* eslint-disable import/no-duplicates */

export let expanded: boolean = true;
export let tooltip: string;

const count: Writable<number> = setContext('nav-items', writable(0));

function fadeSlide(node: any, { delay = 0, duration = 400, easing = cubicOut }) {
  const style = getComputedStyle(node);
  const opacity = +style.opacity;
  const height = parseFloat(style.height);
  const paddingTop = parseFloat(style.paddingTop);
  const paddingBottom = parseFloat(style.paddingBottom);

  return {
    delay,
    duration,
    easing,
    css: (t: number) =>
      `overflow: hidden;` +
      `opacity: ${Math.min(t, 1) * opacity};` +
      `height: ${t * height}px;` +
      `padding-top: ${t * paddingTop}px;` +
      `padding-bottom: ${t * paddingBottom}px;`,
  };
}

onMount(() => {
  // collapse by default if > 3 items
  if ($count > 3) {
    expanded = false;
  }
});
</script>

<div class="flex flex-col justify-center items-center mx-1 bg-charcoal-600 rounded my-1">
  {#if expanded}
    <div class="inline-block pt-0.5">
      <div transition:fadeSlide="{{ duration: 500 }}">
        <slot />
      </div>
    </div>
  {/if}

  <button
    class="inline-block flex flex-col justify-center items-center"
    on:click="{() => (expanded = !expanded)}"
    disabled="{expanded && $count < 2}">
    <Tooltip class="flex flex-col justify-center items-center pb-1" tip="{tooltip}" right>
      <div class="flex flex-col justify-center items-center" class:text-charcoal-50="{expanded && $count < 2}">
        {#if !expanded}
          <div class="py-3" transition:fadeSlide="{{ duration: 500 }}">
            <slot name="icon" />
          </div>
        {/if}
        <Fa size="12" icon="{expanded ? faChevronUp : faChevronDown}" />
      </div>
    </Tooltip>
  </button>
</div>
