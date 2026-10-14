<script lang="ts">
import type { ProviderContainerConnectionInfo, ProviderInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type { ContainerProviderConnection } from '@desktop-framework/extension-api';
import { ProgressBar } from '@podman-desktop/ui-svelte';
import { filesize } from 'filesize';

import { extractConnectionResourceMetrics } from '/@/lib/preferences/connection-resource-metrics';
import type { IProviderConnectionConfigurationPropertyRecorded } from '/@/lib/preferences/Util';
import { configurationProperties } from '/@/stores/configurationProperties';

interface Props {
  provider: ProviderInfo;
  connection: ProviderContainerConnectionInfo;
}

let { provider, connection }: Props = $props();

type ResourceData = {
  name: string;
  cpu: { value: string; percent: number };
  memory: { value: string; percent: number };
  disk: { value: string; percent: number };
};

let configurationKeys: IConfigurationPropertyRecordedSchema[] = $derived(
  $configurationProperties
    .filter(property => property.scope === 'ContainerConnection')
    .toSorted((a, b) => (a?.id ?? '').localeCompare(b?.id ?? '')),
);

let resourceConfig = $state<IProviderConnectionConfigurationPropertyRecorded[]>([]);

$effect(() => {
  if (!connection || configurationKeys.length === 0) {
    resourceConfig = [];
    return;
  }

  Promise.all(
    configurationKeys.map(async configKey => {
      return {
        ...configKey,
        value: configKey.id
          ? await window.getConfigurationValue(configKey.id, connection as unknown as ContainerProviderConnection)
          : undefined,
        connection: connection.name,
        providerId: provider.internalId,
      };
    }),
  )
    .then(value => {
      resourceConfig = value;
    })
    .catch((err: unknown) => console.error('Error fetching resource usage:', err));
});

let resourceData = $derived.by((): ResourceData | undefined => {
  const metrics = extractConnectionResourceMetrics(resourceConfig);
  if (!metrics) return undefined;

  const cpuUsed = metrics.cpu && metrics.cpu.used > 0 ? metrics.cpu.used.toFixed(1) : '0';

  return {
    name: connection?.displayName,
    cpu: {
      value: `${cpuUsed}/${metrics.cpu?.total ?? 0} cores`,
      percent: metrics.cpu?.usagePercent ?? 0,
    },
    memory: {
      value: `${filesize(metrics.memory?.used ?? 0)}/${filesize(metrics.memory?.total ?? 0)}`,
      percent: metrics.memory?.usagePercent ?? 0,
    },
    disk: {
      value: `${filesize(metrics.disk?.used ?? 0)} / ${filesize(metrics.disk?.total ?? 0)}`,
      percent: metrics.disk?.usagePercent ?? 0,
    },
  };
});
</script>

{#if resourceData}
  <div class="flex flex-col gap-1 text-xs">
    <div class="flex items-center gap-1.5">
      <span class="w-7 text-right text-[10px] text-[var(--pd-content-text-sub)]">CPU</span>
      <ProgressBar progress={resourceData.cpu.percent} width="w-12" height="h-1.5" class="items-center" aria-label="CPU usage" />
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-7 text-right text-[10px] text-[var(--pd-content-text-sub)]">Mem</span>
      <ProgressBar progress={resourceData.memory.percent} width="w-12" height="h-1.5" class="items-center" aria-label="Mem usage" />
    </div>
    <div class="flex items-center gap-1.5">
      <span class="w-7 text-right text-[10px] text-[var(--pd-content-text-sub)]">Disk</span>
      <ProgressBar progress={resourceData.disk.percent} width="w-12" height="h-1.5" class="items-center" aria-label="Disk usage" />
    </div>
  </div>
{/if}
