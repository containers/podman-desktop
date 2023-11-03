<!-- StatusDot.svelte -->
<script lang="ts">
import type { PodInfoContainerUI } from '../pod/PodInfoUI';
import Tooltip from './Tooltip.svelte';

export let container: PodInfoContainerUI;

// All the possible statuses that will appear for both Pods and Kubernetes
const colors: Record<string, string> = {
  // Podman & Kubernetes
  running: 'bg-green-500', // Green for running

  // Kubernetes-only
  terminated: 'bg-red-500', // Red for terminated
  waiting: 'bg-amber-500', // Amber for waiting

  // Podman-only
  stopped: 'bg-gray-500', // Gray indicated dormancy / inactivity
  paused: 'bg-amber-500', // Equivilant to "waiting" in Kubernetes
  exited: 'bg-red-300', // Light red for exited, but dark red for dead
  dead: 'bg-red-500', // Dark red for dead
  created: 'bg-green-300', // Blue indicates "freshness", so would be good for 'created'
  degraded: 'bg-amber-700', // Dark amber indicating "degrading" state / "unhealthy"
};

// Returns the color for the status and if it cant, it'll use gray
const getColor = (status: string): string => colors[status] || 'bg-gray-500';
</script>

<Tooltip tip="{container.Names}: {container.Status}" top
  ><div
    class="w-2 h-2 rounded-full mr-1 text-center {getColor(container.Status)}"
    data-testid="status-dot"
    title="{container.Names}: {container.Status}">
  </div></Tooltip>
