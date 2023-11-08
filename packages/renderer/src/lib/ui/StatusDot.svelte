<!-- StatusDot.svelte -->
<script lang="ts">
import Tooltip from './Tooltip.svelte';
import { getStatusColor } from './Dots';
import { capitalize } from './Util';

export let status: string;
export let name: string = '';
export let tooltip: string = '';
export let number: number = 0;

// If the tooltip is blank, use the container name and status
// as the tooltip / title
if (tooltip === '' && name !== '' && status !== '') {
  tooltip = `${name}: ${capitalize(status)}`;
}
// if text is not blank, make class 'mt-3' to keep it center
</script>

<Tooltip tip="{tooltip}" top>
  <div
    class="w-2.5 h-2.5 mr-0.5 rounded-full text-center {getStatusColor(status)} {number ? 'mt-3' : ''}"
    data-testid="status-dot"
    title="{tooltip}">
  </div>
  <!-- If text -->
  {#if number}
    <div class="text-xs text-bold text-gray-600 mr-0.5">{number}</div>
  {/if}
</Tooltip>
