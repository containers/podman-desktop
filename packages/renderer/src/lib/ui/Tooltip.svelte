<style>
.tooltip.top {
  left: 50%;
  transform: translate(-50%, -100%);
  margin-top: -8px;
}
.tooltip.bottom {
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 100%);
  margin-bottom: -8px;
}
.tooltip.left {
  left: 0;
  transform: translateX(-100%);
  margin-left: -8px;
}
.tooltip.right {
  right: 0;
  transform: translateX(100%);
  margin-right: -8px;
}
.tooltip-slot:hover + .tooltip {
  opacity: 1;
  visibility: initial;
}
</style>

<script>
export let tip = '';
export let top = false;
export let right = false;
export let bottom = false;
export let left = false;
</script>

<div class="relative inline-block">
  <span class="group tooltip-slot">
    <slot />
  </span>
  <div
    class="whitespace-nowrap absolute tooltip opacity-0 inline-block transition-opacity duration-150 ease-in-out"
    class:left="{left}"
    class:right="{right}"
    class:bottom="{bottom}"
    class:top="{top}">
    {#if tip}
      <div class="inline-block py-2 px-4 rounded-md bg-zinc-900 text-xs">{tip}</div>
    {/if}
  </div>
</div>
