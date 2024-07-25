<script lang="ts">
export let size = '1em';
export let solid = false;

let boxStyle = 'fill: currentColor;';
if (!solid) {
  boxStyle = 'stroke: currentColor;';
}
</script>

<svg
  width={size}
  height={size}
  class={$$props.class}
  style={$$props.style}
  version="1.1"
  xml:space="preserve"
  viewBox="-0.5 -0.5 20.03 15">
  <!-- four boxes -->
  <g class:fill-none={!solid} style={boxStyle}>
    <path d="M5.472,0.000L13.558,0.000L13.558,3.531L5.472,3.531Z"></path>
    <path d="M0.000,10.469L5.103,10.469L5.103,14.000L0.000,14.000Z"></path>
    <path d="M6.964,10.469L12.067,10.469L12.067,14.000L6.964,14.000Z"></path>
    <path d="M13.927,10.469L19.030,10.469L19.030,14.000L13.927,14.000Z"></path>
  </g>
  <!-- lines -->
  <g class="fill-none stroke-[0.7]" style="stroke-linejoin: round; stroke: currentColor;">
    <path d="M9.515,3.531L9.515,7.000L2.555,7.000L2.555,10.464"></path>
    <path d="M9.515,3.531L9.515,7.000L16.475,7.000L16.475,10.464"></path>
    <path d="M9.500,3.534L9.500,7.002L9.530,7.002L9.530,10.466"></path>
  </g>
</svg>
