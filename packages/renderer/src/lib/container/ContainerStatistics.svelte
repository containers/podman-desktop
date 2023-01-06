<script lang="ts">
import { onMount, onDestroy } from 'svelte';
import type { ContainerStatsInfo } from '../../../../main/src/plugin/api/container-stats-info';
import type { ContainerInfoUI } from './ContainerInfoUI';
import { ContainerUtils } from './container-utils';

export let container: ContainerInfoUI;

const WARNING_PERCENTAGE = 70;
const DANGER_PERCENTAGE = 90;

const GREEN_COLOR = '#16a34a';
const ORANGE_COLOR = '#F97316';
const RED_COLOR = '#cb4d3e';

const containerUtils = new ContainerUtils();

$: cpuColor =
  cpuUsagePercentage < WARNING_PERCENTAGE
    ? GREEN_COLOR
    : cpuUsagePercentage < DANGER_PERCENTAGE
    ? ORANGE_COLOR
    : RED_COLOR;
$: memoryColor =
  memoryUsagePercentage < WARNING_PERCENTAGE
    ? GREEN_COLOR
    : memoryUsagePercentage < DANGER_PERCENTAGE
    ? ORANGE_COLOR
    : RED_COLOR;

// percentage
let cpuUsagePercentage: number = -1;
let memoryUsagePercentage: number = -1;
let usedMemory;

// id to cancel the streaming
let fetchStatsId: number;

// need two samples to compute stats
let firstIteration = true;

// title to use on
let cpuUsagePercentageTitle;
let cpuUsageTitle;
let memoryUsagePercentageTitle;
let memoryUsageTitle;

async function updateStatistics(containerStats: ContainerStatsInfo) {
  // we need enough data to compute the CPU usage
  if (firstIteration) {
    firstIteration = false;
    return;
  }

  //
  usedMemory = containerStats.memory_stats.usage - (containerStats.memory_stats.stats?.cache || 0);
  const availableMemory = containerStats.memory_stats.limit;
  memoryUsagePercentage = (usedMemory / availableMemory) * 100.0;
  memoryUsagePercentageTitle = containerUtils.getMemoryPercentageUsageTitle(memoryUsagePercentage, usedMemory);
  memoryUsageTitle = containerUtils.getMemoryUsageTitle(usedMemory);

  const cpuDelta = containerStats.cpu_stats.cpu_usage.total_usage - containerStats.precpu_stats.cpu_usage.total_usage;
  const systemCpuDelta =
    containerStats.cpu_stats.system_cpu_usage - (containerStats.precpu_stats?.system_cpu_usage || 0);
  const numberCpus =
    containerStats.cpu_stats.online_cpus || containerStats.cpu_stats.cpu_usage?.percpu_usage?.length || 1.0;
  cpuUsagePercentage = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;
  cpuUsagePercentageTitle = `${cpuUsagePercentage.toFixed(2)}% of ${numberCpus}CPUs`;
  cpuUsageTitle = `${cpuUsagePercentage.toFixed(2)}%`;
}

onMount(async () => {
  if (container.state !== 'RUNNING') {
    return;
  }
  // grab stats result from the container
  fetchStatsId = await window.getContainerStats(container.engineId, container.id, updateStatistics);
});

onDestroy(async () => {
  // unsubscribe from the store
  if (fetchStatsId) {
    await window.stopContainerStats(fetchStatsId);
  }
});
</script>

{#if container.state === 'RUNNING'}
  <div class="mt-2 px-1 mx-2 border border-zinc-700 w-[240px] flex flex-row">
    <svg class="mr-1 text-zinc-400" width="70px" height="40px">
      <g class="bars">
        <text text-anchor="end" x="63" y="16" font-size="12px" fill="currentColor">MEMORY </text>
        <text text-anchor="end" x="63" y="34" font-size="12px" fill="currentColor">CPU</text>
      </g>
    </svg>
    <svg width="100px" height="40px">
      <g class="bars">
        <rect fill="currentColor" width="100%" x="0" y="5" height="12"><title>{memoryUsagePercentageTitle}</title></rect
        >;
        {#if memoryUsagePercentage >= 0}
          <rect fill="{memoryColor}" width="{memoryUsagePercentage}%" x="0" y="5" height="12"
            ><title>{memoryUsagePercentageTitle}</title></rect>
        {/if}
        <rect fill="currentColor" width="100%" x="0" y="23" height="12"><title>{cpuUsagePercentageTitle}</title></rect>;

        {#if cpuUsagePercentage >= 0}
          <rect fill="{cpuColor}" width="{cpuUsagePercentage}%" x="0" y="23" height="12"
            ><title>{cpuUsagePercentageTitle}</title></rect>
        {/if}
        {#if memoryUsagePercentage === -1}
          <rect fill="#888" width="100%" x="0" y="5" height="12"></rect>;
          <text text-anchor="end" x="90" y="14" font-size="8px" fill="#DDD">Initializing... </text>
          <rect fill="#888" width="100%" x="0" y="23" height="12"></rect>;
          <text text-anchor="end" x="90" y="32" font-size="8px" fill="#DDD">Initializing... </text>
        {/if}
      </g>
    </svg>
    <svg class="mr-1 text-zinc-400" width="80px" height="40px">
      <g class="bars">
        {#if memoryUsageTitle}
          <text text-anchor="start" x="2" y="16" font-size="12px" fill="currentColor">{memoryUsageTitle} </text>
        {/if}
        {#if cpuUsageTitle}
          <text text-anchor="start" x="2" y="34" font-size="12px" fill="currentColor">{cpuUsageTitle}</text>
        {/if}
      </g>
    </svg>
  </div>
{/if}
