<script lang="ts">
import Tooltip from '../ui/Tooltip.svelte';

export let percent = 0;
export let size = 64;
export let title = '';
export let value: unknown;

// describes an arc with the given radius, centered at an x,y position matching the radius
function describeArc(radius: number, endAngle: number) {
  const angleInDegrees = endAngle >= 360 ? 359.9 : endAngle;
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;

  const start = {
    x: radius + radius * Math.cos(angleInRadians),
    y: radius + radius * Math.sin(angleInRadians),
  };

  const largeArcFlag = endAngle <= 180 ? '0' : '1';

  return ['M', start.x, start.y, 'A', radius, radius, 0, largeArcFlag, 0, radius, 0].join(' ');
}

$: stroke = percent < 0 ? '' : percent < 50 ? 'stroke-green-500' : percent < 75 ? 'stroke-amber-500' : 'stroke-red-500';

$: tooltip = percent ? percent.toFixed(0) + '% ' + title + ' usage' : '';
</script>

<Tooltip tip="{tooltip}" bottom>
  <svg viewBox="-4 -4 {size + 8} {size + 8}" height="{size}" width="{size}">
    <circle fill="none" class="stroke-charcoal-300" stroke-width="1" r="{size / 2}" cx="{size / 2}" cy="{size / 2}"
    ></circle>
    <path
      fill="none"
      class="{stroke}"
      stroke-width="3.5"
      d="{describeArc(size / 2, (percent * 360) / 100)}"
      data-testid="arc"></path>
    <text x="{size / 2}" y="38%" text-anchor="middle" font-size="{size / 5.5}" class="fill-gray-800">{title}</text>
    <text
      x="{size / 2}"
      y="52%"
      text-anchor="middle"
      font-size="{size / 4.5}"
      dominant-baseline="central"
      class="fill-gray-400">{value !== undefined ? value : ''}</text>
  </svg>
</Tooltip>
