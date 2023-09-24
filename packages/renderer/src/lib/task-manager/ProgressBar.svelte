<style>
.progress-bar-indeterminate {
  background-color: rgb(109 72 191);
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
</style>

<script lang="ts">
export let progress: number | undefined;
</script>

<div class="w-32">
  <div class="w-full h-4 mb-4 rounded-full bg-gray-900 progress-bar overflow-hidden">
    {#if progress !== undefined}
      <div class="h-4 bg-purple-500 rounded-full" role="progressbar" style="width {progress}%"></div>
    {:else}
      <div class="h-4 bg-purple-500 rounded-full progress-bar-indeterminate" role="progressbar"></div>
    {/if}
  </div>
</div>
{#if progress !== undefined}
  <div class="ml-2 text-xs">{progress}%</div>
{/if}
