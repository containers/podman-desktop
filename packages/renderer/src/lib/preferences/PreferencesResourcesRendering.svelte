<script lang="ts">
import { faArrowUpRightFromSquare, faEllipsisVertical, faPlay, faRotateRight, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import { providerInfos } from '../../stores/providers';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { onMount } from 'svelte';

interface containerStatus {
    status: string;
    inProgress: boolean;
}

$: containerConnectionStatus = new Map<string, containerStatus>();

onMount(() => {
    providerInfos.subscribe(providers => {
        providers.forEach(provider => {
            provider.containerConnections.forEach(container => {
                // update the map only if the container state is different from last time
                if (containerConnectionStatus.has(`${provider.name}-${container.name}`) 
                    && containerConnectionStatus.get(`${provider.name}-${container.name}`).status !== container.status) {
                        containerConnectionStatus.set(`${provider.name}-${container.name}`, {
                            inProgress: false,
                            status: container.status,
                        });
                }
                
            });
        });
        containerConnectionStatus = containerConnectionStatus;
    });
})

async function startContainerProvider(provider: ProviderInfo, containerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> {
    if (containerConnectionInfo.status === 'stopped') {
        setContainerStatusIsChanging(provider, containerConnectionInfo);
        await window.startProviderConnectionLifecycle(provider.internalId, containerConnectionInfo);
    }    
}

async function stopContainerProvider(provider: ProviderInfo, containerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> {
    if (containerConnectionInfo.status === 'started') {
        setContainerStatusIsChanging(provider, containerConnectionInfo);
        await window.stopProviderConnectionLifecycle(provider.internalId, containerConnectionInfo);
    }    
}

async function restartContainerProvider(provider: ProviderInfo, containerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> {
    await stopContainerProvider(provider, containerConnectionInfo);
    await startContainerProvider(provider, containerConnectionInfo);
}

async function deleteContainerProvider(provider: ProviderInfo, containerConnectionInfo: ProviderContainerConnectionInfo): Promise<void> {
    if (containerConnectionInfo.status === 'stopped' || containerConnectionInfo.status === 'unknown') {
        setContainerStatusIsChanging(provider, containerConnectionInfo);
        await window.deleteProviderConnectionLifecycle(provider.internalId, containerConnectionInfo);
    }
}

function setContainerStatusIsChanging(provider: ProviderInfo, containerConnectionInfo: ProviderContainerConnectionInfo): void {
    containerConnectionStatus.set(
        `${provider.name}-${containerConnectionInfo.name}`, 
        {
            inProgress: true,
            status: containerConnectionInfo.status,
        }
    );
    containerConnectionStatus = containerConnectionStatus;
}
</script>

<div class="flex flex-1 flex-col p-2 bg-zinc-900">
    <div>
        <p class="capitalize text-xl">Resources</p>
        <p class="text-sm text-gray-400">
            Additional provider information is available under <a href="/preferences/extensions" class="text-gray-400 underline underline-offset-2">Extensions</a>
        </p>    
    </div>
    <div>
        {#each $providerInfos as provider}
            <div class="bg-zinc-800 mt-5 rounded-md p-3 divide-x divide-gray-600 flex">
                <div>
                    <!-- left col - podman icon/name + "create new" button -->
                    <div class="min-w-[150px]">
                        <div class="flex">
                            <img src="{provider.images.icon}" alt="{provider.name}" class="max-h-10" />
                            <span class="my-auto text-gray-300 ml-3">{provider.name}</span>
                        </div>
                        <div class="text-center mt-10">
                            <!-- create new podman machine button -->
                            <button
                                class="pf-c-button pf-m-primary "
                                title="Create new Podman machine"
                                type="button">
                                Create new ...
                            </button>
                        </div>
                    </div>                    
                </div>
                <!-- podman machines columns -->
                {#each provider.containerConnections as container}
                <div class="px-5 min-w-[230px]">
                    <div class="float-right">
                        <Fa icon="{faArrowUpRightFromSquare}" />
                    </div>
                    <div class="{container.status !== 'started' ? 'text-gray-500' : ''} text-sm">
                        {container.name}
                    </div>
                    <div class="flex">
                        {#if container.status === 'started'}
                        <div class="my-auto w-3 h-3 bg-green-500 rounded-full" />
                        <span class="my-auto text-green-500 ml-1 font-bold text-[9px]">RUNNING</span>
                        {:else if container.status === 'starting'}
                        <div class="my-auto w-3 h-3 bg-green-500 rounded-full" />
                        <span class="my-auto text-green-500 ml-1 font-bold text-[9px]">STARTING</span>
                        {:else if container.status === 'stopped'}
                        <div class="my-auto w-3 h-3 bg-gray-500 rounded-full" />
                        <span class="my-auto text-gray-500 ml-1 font-bold text-[9px]">OFF</span>
                        {:else}
                        <div class="my-auto w-3 h-3 bg-gray-500 rounded-full" />
                        <span class="my-auto text-gray-500 ml-1 font-bold text-[9px]">{container.status.toUpperCase()}</span>
                        {/if}
                    </div>
                    {#if container.machineInfo}
                    <div class="flex mt-3 {container.status !== 'started' ? 'text-gray-500' : ''}">
                        <div class="mr-4">
                            <div class="text-[9px]">vCPUs</div>
                            <div class="text-xs">{container.machineInfo.cpus}</div>
                        </div>
                        <div class="mr-4">
                            <div class="text-[9px]">MEMORY</div>
                            <div class="text-xs">{container.machineInfo.memory.toFixed(1)}MB</div>
                        </div>
                        <div class="mr-4">
                            <div class="text-[9px]">DISK LIMIT</div>
                            <div class="text-xs">{container.machineInfo.diskSize.toFixed(2)}GB</div>
                        </div>
                    </div>
                    {/if}
                    <div class="mt-2 relative">
                        <div class="flex bg-zinc-900 w-fit rounded-lg m-auto">
                            <button 
                                class="{
                                    container.status !== 'stopped' 
                                    || (containerConnectionStatus.get(`${provider.name}-${container.name}`) 
                                        && containerConnectionStatus.get(`${provider.name}-${container.name}`).inProgress) 
                                        ? 'text-gray-700 cursor-not-allowed' : ''}"
                                on:click="{() => startContainerProvider(provider, container)}">
                                <Fa class="ml-5 mr-2.5 my-2" icon="{faPlay}" />
                            </button>
                            <button 
                                class="{
                                container.status !== 'started'
                                || (containerConnectionStatus.get(`${provider.name}-${container.name}`) 
                                        && containerConnectionStatus.get(`${provider.name}-${container.name}`).inProgress)  ? 'text-gray-700 cursor-not-allowed' : ''}"
                                on:click="{() => restartContainerProvider(provider, container)}">
                                <Fa class="mx-2.5 my-2" icon="{faRotateRight}" />
                            </button>
                            <button 
                                class="{
                                container.status !== 'started' 
                                || (containerConnectionStatus.get(`${provider.name}-${container.name}`) 
                                        && containerConnectionStatus.get(`${provider.name}-${container.name}`).inProgress)  ? 'text-gray-700 cursor-not-allowed' : ''}"
                                on:click="{() => stopContainerProvider(provider, container)}">
                                <Fa class="mx-2.5 my-2" icon="{faStop}" />
                            </button>                            
                            <button 
                                class="{(container.status !== 'stopped' && container.status !== 'unknown') 
                                || (containerConnectionStatus.get(`${provider.name}-${container.name}`) 
                                        && containerConnectionStatus.get(`${provider.name}-${container.name}`).inProgress)  ? 'text-gray-700 cursor-not-allowed' : ''}"
                                on:click="{() => deleteContainerProvider(provider, container)}">
                                <Fa class="mx-2.5 my-2" icon="{faTrash}" />
                            </button>
                            <button>
                                <Fa class="ml-2.5 mr-5 my-2" icon="{faEllipsisVertical}" />
                            </button>
                        </div>
                    </div>
                    <div class="mt-1.5 text-gray-500 text-[9px]">
                        <div>{provider.name} v{provider.version}</div>
                    </div>
                </div>
                {/each}
            </div>            
        {/each}
    </div>
</div>
