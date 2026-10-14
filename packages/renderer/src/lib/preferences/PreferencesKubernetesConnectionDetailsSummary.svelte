<script lang="ts">
import type { ProviderKubernetesConnectionInfo } from '@desktop-framework/api';
import type { IConfigurationPropertyRecordedSchema } from '@desktop-framework/api/configuration';
import type { KubernetesProviderConnection } from '@desktop-framework/extension-api';

import type { IProviderConnectionConfigurationPropertyRecorded } from './Util';

interface Props {
  properties?: IConfigurationPropertyRecordedSchema[];
  providerInternalId?: string;
  kubernetesConnectionInfo?: ProviderKubernetesConnectionInfo;
}
let { properties = [], providerInternalId, kubernetesConnectionInfo }: Props = $props();

let tmpProviderContainerConfiguration: IProviderConnectionConfigurationPropertyRecorded[] = $derived(
  await Promise.all(
    properties.map(async configurationKey => {
      return {
        ...configurationKey,
        value: configurationKey.id
          ? await window.getConfigurationValue(
              configurationKey.id,
              kubernetesConnectionInfo as unknown as KubernetesProviderConnection,
            )
          : undefined,
        connection: kubernetesConnectionInfo?.name ?? '',
        providerId: providerInternalId ?? '',
      };
    }),
  ).catch((err: unknown) => {
    console.error('Error collecting providers', err);
    return [];
  }),
);

let providerConnectionConfiguration: IProviderConnectionConfigurationPropertyRecorded[] = $derived(
  tmpProviderContainerConfiguration.filter(configurationKey => configurationKey.value !== undefined),
);
</script>

<div class="h-full text-[var(--pd-table-body-text)]">
  {#if kubernetesConnectionInfo}
    <div class="flex pl-8 py-4 flex-col w-full text-sm">
      {#if kubernetesConnectionInfo.error}
        <div class="flex flex-row mt-5 text-[var(--pd-state-error)]" role="alert" aria-label="Connection error">
          <span class="font-semibold min-w-[150px]">Error</span>
          <span>{kubernetesConnectionInfo.error}</span>
        </div>
      {/if}
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Name</span>
        <span aria-label={kubernetesConnectionInfo.name}>{kubernetesConnectionInfo.name}</span>
      </div>
      {#each providerConnectionConfiguration as connectionSetting (connectionSetting.id)}
        <div class="flex flex-row mt-5">
          <span class="font-semibold min-w-[150px]">{connectionSetting.description}</span>
          <span>{connectionSetting.value}</span>
        </div>
      {/each}
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Type</span>
        <span aria-label="kubernetes">Kubernetes</span>
      </div>
      <div class="flex flex-row mt-5">
        <span class="font-semibold min-w-[150px]">Endpoint</span>
        <span aria-label={kubernetesConnectionInfo.endpoint.apiURL}>{kubernetesConnectionInfo.endpoint.apiURL}</span>
      </div>
    </div>
  {/if}
</div>
