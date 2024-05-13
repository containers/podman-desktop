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
  transform: translate(100%, -50%);
  margin-top: -10px;
  margin-right: -8px;
}
.tooltip.top-left {
  left: 0;
  transform: translate(-80%, -100%);
  margin-top: -8px;
}
.tooltip.bottom-left {
  left: 0;
  bottom: 0;
  transform: translate(-80%, 100%);
  margin-top: -8px;
}
.tooltip.bottom-right {
  left: 0;
  bottom: 0;
  transform: translate(0%, 100%);
  margin-top: -8px;
}
.tooltip.top-right {
  left: 0;
  transform: translate(0%, -100%);
  margin-top: -8px;
}
.tooltip-slot:hover + .tooltip {
  opacity: 1;
  visibility: initial;
}
</style>

<script>
export let top = false;
export let topLeft = false;
export let topRight = false;
export let right = false;
export let bottom = false;
export let bottomLeft = false;
export let bottomRight = false;
export let left = false;
</script>

<div class="relative inline-block">
  <span class="group tooltip-slot {$$props.class}">
    <slot name="content" />
  </span>
  <div
    class="whitespace-nowrap absolute tooltip opacity-0 inline-block transition-opacity duration-150 ease-in-out pointer-events-none z-[10]"
    class:left="{left}"
    class:right="{right}"
    class:bottom="{bottom}"
    class:top="{top}"
    class:top-left="{topLeft}"
    class:top-right="{topRight}"
    class:bottom-left="{bottomLeft}"
    class:bottom-right="{bottomRight}">
    <slot name="tip" />
  </div>
</div>
