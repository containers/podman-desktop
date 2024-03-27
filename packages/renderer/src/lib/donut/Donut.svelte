<script lang="ts">
import Tooltip from '../ui/Tooltip.svelte';

export let percent = 0;
export let size = 64;
export let title = '';
export let value: unknown;
export let loading: boolean = false;

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

function getStroke(loading: boolean, percent: number): string {
  if (loading) return 'stroke-purple-500';

  if (percent < 0) return '';

  if (percent < 50) return 'stroke-green-500';

  if (percent < 75) return 'stroke-amber-500';

  return 'stroke-red-500';
}

function getShape(): string {
  if (loading) return describeArc(size / 2, 72); // 20%
  return describeArc(size / 2, (percent * 360) / 100);
}

function getTooltip(loading: boolean, title: string, percent: number): string {
  if (loading) return `Loading ${title}...`;
  return percent ? percent.toFixed(0) + '% ' + title + ' usage' : '';
}

$: stroke = getStroke(loading, percent);

$: tooltip = getTooltip(loading, title, percent);
</script>

<Tooltip tip="{tooltip}" bottom>
  <svg viewBox="-4 -4 {size + 8} {size + 8}" height="{size}" width="{size}">
    <g class:animate-spin="{loading}" class:origin-[50%_50%]="{loading}" style="transform-box: fill-box;">
      <circle fill="none" class="stroke-charcoal-300" stroke-width="1" r="{size / 2}" cx="{size / 2}" cy="{size / 2}"
      ></circle>
      <path fill="none" class="{stroke}" stroke-width="3.5" d="{getShape()}" data-testid="arc"></path>
    </g>
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
