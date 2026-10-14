<script lang="ts">
import type { ProviderContainerConnectionInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type { ContainerProviderConnection } from '@desktop-framework/extension-api';

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
    </div>
  {/if}
</div>
