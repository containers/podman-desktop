<script lang="ts">
import { onDestroy, onMount } from 'svelte';

import type { ContainerStatsInfo } from '/@api/container-stats-info';

import Donut from '../donut/Donut.svelte';
import { ContainerUtils } from './container-utils';
import type { ContainerInfoUI } from './ContainerInfoUI';

export let container: ContainerInfoUI;

const containerUtils = new ContainerUtils();

// percentage
let cpuUsagePercentage = -1;
let memoryUsagePercentage = -1;

// id to cancel the streaming
let fetchStatsId: number;

// need two samples to compute stats
let firstIteration = true;

// title to use on
let cpuUsage: string;
let memoryUsage: string;

export async function updateStatistics(containerStats: ContainerStatsInfo) {
  // we need enough data to compute the CPU usage
  if (firstIteration) {
    firstIteration = false;
    return;
  }

  const usedMemory = containerStats.memory_stats.usage - (containerStats.memory_stats.stats?.cache || 0);
  const availableMemory = containerStats.memory_stats.limit;
  memoryUsagePercentage = (usedMemory / availableMemory) * 100.0;
  memoryUsage = containerUtils.getMemoryUsageTitle(usedMemory);

  const cpuDelta = containerStats.cpu_stats.cpu_usage.total_usage - containerStats.precpu_stats.cpu_usage.total_usage;
  const systemCpuDelta =
    containerStats.cpu_stats.system_cpu_usage - (containerStats.precpu_stats?.system_cpu_usage || 0);
  const numberCpus =
    containerStats.cpu_stats.online_cpus || containerStats.cpu_stats.cpu_usage?.percpu_usage?.length || 1.0;
  cpuUsagePercentage = (cpuDelta / systemCpuDelta) * numberCpus * 100.0;
  cpuUsage = cpuUsagePercentage.toFixed(1) + '%';
}

onMount(async () => {
  if (container.state !== 'RUNNING') {
    return;
  }
  // grab stats result from the container
  fetchStatsId = await window.getContainerStats(container.engineId, container.id, containerStats => {
    updateStatistics(containerStats);
  });
});

onDestroy(async () => {
  // unsubscribe from the store
  if (fetchStatsId) {
    await window.stopContainerStats(fetchStatsId);
  }
});
</script>

{#if container.state === 'RUNNING'}
  <div class="flex flex-row gap-1">
    <Donut title="vCPUs" size={45} value={cpuUsage} percent={cpuUsagePercentage} />
    <Donut title="MEM" size={45} value={memoryUsage} percent={memoryUsagePercentage} />
  </div>
{/if}
