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
export let progress: number | undefined;
export let width: string = 'w-36';
export let height: string = 'h-4';
</script>

<div class="flex flex-row">
  <div class="{width} {height} rounded-full bg-gray-900 progress-bar overflow-hidden">
    {#if progress !== undefined}
      <div
        class="{width} {height} bg-purple-600 rounded-full progress-bar-incremental"
        role="progressbar"
        style="width:{progress}%">
      </div>
    {:else}
      <div class="{width} {height} bg-purple-600 rounded-full progress-bar-indeterminate" role="progressbar"></div>
    {/if}
  </div>
  {#if progress !== undefined}
    <div class="ml-2 text-xs">{progress}%</div>
  {/if}
</div>
