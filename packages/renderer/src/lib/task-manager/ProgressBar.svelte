<style>
.progress-bar-indeterminate {
  animation: indeterminateAnimation 1s infinite linear;
  transform-origin: 0% 50%;
}
@keyframes indeterminateAnimation {
  0% {
    transform: translateX(0) scaleX(0);
  }
  40% {
    transform: translateX(0) scaleX(0.4);
  }
  100% {
    transform: translateX(100%) scaleX(0.5);
  }
}
.progress-bar-incremental {
  animation: incrementalAnimation 1s infinite linear;
}
@keyframes incrementalAnimation {
  20%,
  80% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>

<script lang="ts">
import type { HTMLAttributes } from 'svelte/elements';

interface Props extends HTMLAttributes<HTMLElement> {
  progress?: number;
  width?: string;
  height?: string;
}

let { progress, width = 'w-36', height = 'h-4', class: className, ...restProps }: Props = $props();
</script>

<div class="flex flex-row {className}" {...restProps} >
  <div class="{width} {height} rounded-full bg-[var(--pd-progressBar-bg)] progress-bar overflow-hidden">
    {#if progress !== undefined}
      <div
        class="{width} {height} bg-[var(--pd-progressBar-in-progress-bg)] rounded-full progress-bar-incremental"
        role="progressbar"
        style="width:{progress}%">
      </div>
    {:else}
      <div class="{width} {height} bg-[var(--pd-progressBar-in-progress-bg)] rounded-full progress-bar-indeterminate" role="progressbar"></div>
    {/if}
  </div>
  {#if progress !== undefined}
    <div class="ml-2 text-xs">{progress}%</div>
  {/if}
</div>
