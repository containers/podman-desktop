<script lang="ts">
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type { ContainerProviderConnection } from '@desktop-framework/extension-api';
import humanizeDuration from 'humanize-duration';
import moment from 'moment';
import { onDestroy } from 'svelte';

import Donut from '/@/lib/donut/Donut.svelte';

import { extractConnectionResourceMetrics, RESOURCE_FORMATS, toDisplayMetrics } from './connection-resource-metrics';
import type { IProviderConnectionConfigurationPropertyRecorded } from './Util';

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  providerInternalId?: string;
  containerConnectionInfo?: ProviderContainerConnectionInfo;
}

const { properties = [], providerInternalId, containerConnectionInfo }: Props = $props();

let providerContainerConfiguration: IProviderConnectionConfigurationPropertyRecorded[] = $state([]);
let resourceMetrics = $derived(extractConnectionResourceMetrics(providerContainerConfiguration));
let displayMetrics = $derived(resourceMetrics ? toDisplayMetrics(resourceMetrics) : []);
let nonResourceConfigs = $derived(
  providerContainerConfiguration.filter(conf => !RESOURCE_FORMATS.has(conf.format ?? '') && !conf.hidden),
);

let duration: string = $state('');
let refreshTimeout: ReturnType<typeof setTimeout> | undefined;

/**
 * Calculates the next refresh interval based on current uptime.
 *
 * @param uptimeInMs Current uptime in milliseconds
 * @returns Milliseconds until the next timer tick
 */
function computeInterval(uptimeInMs: number): number {
  const SECOND = 1000;
  const MINUTE = SECOND * 60;
  const HOUR = MINUTE * 60;
  const DAY = HOUR * 24;

  if (uptimeInMs < MINUTE - 2 * SECOND) {
    return 2 * SECOND;
  }
  if (uptimeInMs < HOUR) {
    return Math.ceil((uptimeInMs + 1) / MINUTE) * MINUTE - uptimeInMs;
  }
  if (uptimeInMs < DAY) {
    return Math.ceil((uptimeInMs + 1) / HOUR) * HOUR - uptimeInMs;
  }
  return Math.ceil((uptimeInMs + 1) / DAY) * DAY - uptimeInMs;
}

/** Updates the displayed uptime and schedules its next refresh when started. */
function refreshDuration(): void {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
    refreshTimeout = undefined;
  }
  if (!containerConnectionInfo?.started || containerConnectionInfo.status !== 'started') {
    duration = '';
    return;
  }
  const uptimeInMs = moment().diff(containerConnectionInfo.started);
  if (!Number.isFinite(uptimeInMs)) {
    duration = '';
    return;
  }
  if (uptimeInMs < 0) {
    duration = '';
    refreshTimeout = setTimeout(refreshDuration, Math.min(-uptimeInMs, 2_147_483_647));
    return;
  }
  duration = humanizeDuration(uptimeInMs, { largest: 1 });
  const interval = computeInterval(uptimeInMs);
  refreshTimeout = setTimeout(refreshDuration, interval);
}

$effect(() => {
  if (containerConnectionInfo?.status === 'started' && containerConnectionInfo?.started) {
    refreshDuration();
  } else {
    duration = '';
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = undefined;
    }
  }
});

onDestroy(() => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
});

let startedTime = $derived.by(() => {
  const started = containerConnectionInfo?.started;
  if (started === undefined || started === null || !Number.isFinite(started)) {
    return '';
  }
  const date = new Date(started);
  const time = date.getTime();
  if (!Number.isFinite(time)) {
    return '';
  }
  return date.toLocaleString();
});

$effect(() => {
  Promise.all(
    properties.map(async configurationKey => ({
      ...configurationKey,
      value: configurationKey.id
        ? await window.getConfigurationValue(
            configurationKey.id,
            $state.snapshot(containerConnectionInfo) as unknown as ContainerProviderConnection,
          )
        : undefined,
      connection: containerConnectionInfo?.name ?? '',
      providerId: providerInternalId ?? '',
    })),
  )
    .then(result => {
      providerContainerConfiguration = result.filter(configurationKey => configurationKey.value !== undefined);
    })
    .catch((err: unknown) => console.error('Error collecting providers', err));
});
</script>

<div class="h-full text-[var(--pd-details-body-text)]">
  {#if containerConnectionInfo}
    <div class="flex pl-8 py-4 flex-col w-full text-sm">
      {#if containerConnectionInfo.error}
        <div class="flex flex-row mt-5 text-[var(--pd-state-error)]" role="alert" aria-label="Connection error">
          <span class="font-semibold min-w-[150px]">Error</span>
          <span>{containerConnectionInfo.error}</span>
        </div>
      {/if}
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Name</span>
        <span aria-label={containerConnectionInfo.name}>{containerConnectionInfo.name}</span>
      </div>
      {#each displayMetrics as metric (metric.title)}
        <div class="flex flex-row mt-5">
          <span class="font-semibold min-w-[150px]">{metric.title}</span>
          <Donut title={metric.title} value={metric.value} percent={metric.percent} />
        </div>
      {/each}
      {#each nonResourceConfigs as connectionSetting (connectionSetting.id)}
        <div class="flex flex-row mt-5">
          <span class="font-semibold min-w-[150px]">{connectionSetting.description}</span>
          <span>{connectionSetting.value}</span>
        </div>
      {/each}
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Type</span>
        <span aria-label={containerConnectionInfo.type}
          >{#if containerConnectionInfo.type === 'docker'}Docker{:else if containerConnectionInfo.type === 'podman'}Podman{/if}</span>
      </div>
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Endpoint</span>
        <span aria-label={containerConnectionInfo.endpoint.socketPath}
          >{containerConnectionInfo.endpoint.socketPath}</span>
      </div>
      {#if containerConnectionInfo.status === 'started' && containerConnectionInfo.started}
        <div class="flex flex-row mt-5">
          <span class="font-semibold min-w-[150px]">Uptime</span>
          <span aria-label="Uptime">{duration}</span>
        </div>
        <div class="flex flex-row mt-5">
          <span class="font-semibold min-w-[150px]">Started at</span>
          <span aria-label="Started at">{startedTime}</span>
        </div>
      {/if}
    </div>
  {/if}
</div>
