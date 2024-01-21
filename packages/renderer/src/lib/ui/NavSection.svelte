<script lang="ts">
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import Tooltip from './Tooltip.svelte';
import Fa from 'svelte-fa';
import { cubicOut } from 'svelte/easing';

export let expanded: boolean = false;
export let tooltip: string;

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
</script>

<div class="flex flex-col justify-center items-center mx-1 bg-charcoal-600 rounded my-1">
  {#if expanded}
    <div class="inline-block pt-0.5">
      <div transition:fadeSlide="{{ duration: 500 }}">
        <slot />
      </div>
    </div>
  {/if}

  <button class="inline-block flex flex-col justify-center items-center" on:click="{() => (expanded = !expanded)}">
    <Tooltip class="flex flex-col justify-center items-center pb-1" tip="{tooltip}" right>
      {#if !expanded}
        <div class="pt-2 pb-2" transition:fadeSlide="{{ duration: 500 }}">
          <slot name="icon" />
        </div>
      {/if}
      <Fa size="12" icon="{expanded ? faChevronUp : faChevronDown}" />
    </Tooltip>
  </button>
</div>
