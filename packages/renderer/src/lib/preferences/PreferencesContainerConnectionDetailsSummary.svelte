<script lang="ts">
import type { IProviderContainerConfigurationPropertyRecorded } from './Util';
import type { ProviderContainerConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import { filesize } from 'filesize';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import type { ContainerProviderConnection } from '@podman-desktop/api';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let providerInternalId: string = undefined;
export let containerConnectionInfo: ProviderContainerConnectionInfo = undefined;

let tmpProviderContainerConfiguration: IProviderContainerConfigurationPropertyRecorded[] = [];
$: Promise.all(
    properties.map(async configurationKey => {
    return {
        ...configurationKey,
        value: await window.getConfigurationValue(
        configurationKey.id,
        containerConnectionInfo as unknown as ContainerProviderConnection,
        ),
        container: containerConnectionInfo.name,
        providerId: providerInternalId,
    };
    }),
).then(value => (tmpProviderContainerConfiguration = value.flat()));

$: providerContainerConfiguration = tmpProviderContainerConfiguration
  .filter(configurationKey => configurationKey.value !== undefined);
</script>

<div class="h-full bg-zinc-900">
    {#if containerConnectionInfo}
    <div class="flex pl-8 py-4 flex-col w-full text-sm">
        <div class="flex flex-row mt-5">
            <span class="font-semibold min-w-[150px]">Name</span>
            <span>{containerConnectionInfo.name}</span>
        </div>
        {#each providerContainerConfiguration as connectionSetting} 
        <div class="flex flex-row mt-5">
            <span class="font-semibold min-w-[150px]">{connectionSetting.description}</span>   
            {#if connectionSetting.format === 'memory' || connectionSetting.format === 'diskSize'}            
            <span>{filesize(connectionSetting.value)}</span>
            {:else}
            <span>{connectionSetting.value}</span>
            {/if}
        </div>
        {/each}
        <div class="flex flex-row mt-5">  
            <span class="font-semibold min-w-[150px]">Endpoint</span>
            <span>{containerConnectionInfo.endpoint.socketPath}</span>
        </div>        
    </div>
    {/if}
</div>