<script lang="ts">
import type { ProviderKubernetesConnectionInfo } from '../../../../main/src/plugin/api/provider-info';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';

export let properties: IConfigurationPropertyRecordedSchema[] = [];
export let kubernetesConnectionInfo: ProviderKubernetesConnectionInfo = undefined;
</script>

<div class="h-full bg-zinc-900">
    {#if kubernetesConnectionInfo}
    <div class="flex pl-8 py-4 flex-col w-full text-sm">
        <div class="flex flex-row mt-5">
            <span class="font-semibold min-w-[150px]">Name</span>
            <span>{kubernetesConnectionInfo.name}</span>
        </div>
        <div class="flex flex-row mt-5">  
            <span class="font-semibold min-w-[150px]">Endpoint</span>
            <span>{kubernetesConnectionInfo.endpoint.apiURL}</span>
        </div>        
    </div>
    {/if}
</div>