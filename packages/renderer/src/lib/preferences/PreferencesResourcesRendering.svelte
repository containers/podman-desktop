<script lang="ts">
import {
  faArrowUpRightFromSquare,
  faEllipsisVertical,
  faPlay,
  faRotateRight,
  faStop,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import { providerInfos } from '../../stores/providers';
import type { ProviderContainerConnectionInfo, ProviderInfo } from '../../../../main/src/plugin/api/provider-info';
import { onDestroy, onMount } from 'svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { configurationProperties } from '../../stores/configurationProperties';
import type { ContainerProviderConnection } from '@podman-desktop/api';
import type { Unsubscriber } from 'svelte/store';
import Tooltip from '../ui/Tooltip.svelte';
import { filesize } from 'filesize';
import { router } from 'tinro';
import SettingsPage from './SettingsPage.svelte';

interface IContainerStatus {
  status: string;
  inProgress: boolean;
}

interface IProviderContainerConfigurationPropertyRecorded extends IConfigurationPropertyRecordedSchema {
  value?: any;
  container: string;
  providerId: string;
}

export let properties: IConfigurationPropertyRecordedSchema[] = [];
let providers: ProviderInfo[] = [];
$: containerConnectionStatus = new Map<string, IContainerStatus>();

let configurationKeys: IConfigurationPropertyRecordedSchema[];

let providersUnsubscribe: Unsubscriber;
let configurationPropertiesUnsubscribe: Unsubscriber;
onMount(() => {
  configurationPropertiesUnsubscribe = configurationProperties.subscribe(value => {
    properties = value;
  });

  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    providers = providerInfosValue;
    providers.forEach(provider => {
      provider.containerConnections.forEach(container => {
        const containerConnectionName = getContainerConnectionName(provider, container);
        // update the map only if the container state is different from last time
        if (
          containerConnectionStatus.has(containerConnectionName) &&
          containerConnectionStatus.get(containerConnectionName).status !== container.status
        ) {
          containerConnectionStatus.set(containerConnectionName, {
            inProgress: false,
            status: container.status,
          });
        }
      });
    });
    containerConnectionStatus = containerConnectionStatus;
  });
});

onDestroy(() => {
  if (providersUnsubscribe) {
    providersUnsubscribe();
  }
  if (configurationPropertiesUnsubscribe) {
    configurationPropertiesUnsubscribe();
  }
});

$: configurationKeys = properties
  .filter(property => property.scope === 'ContainerConnection')
  .sort((a, b) => a.id.localeCompare(b.id));

let tmpProviderContainerConfiguration: IProviderContainerConfigurationPropertyRecorded[] = [];
$: Promise.all(
  providers.map(async provider => {
    const providerContainer = await Promise.all(
      provider.containerConnections.map(async container => {
        const containerConfigurations = await Promise.all(
          configurationKeys.map(async configurationKey => {
            return {
              ...configurationKey,
              value: await window.getConfigurationValue(
                configurationKey.id,
                container as unknown as ContainerProviderConnection,
              ),
              container: container.name,
              providerId: provider.internalId,
            };
          }),
        );
        return containerConfigurations;
      }),
    );
    return providerContainer.flat();
  }),
).then(value => (tmpProviderContainerConfiguration = value.flat()));

$: providerContainerConfiguration = tmpProviderContainerConfiguration
  .filter(configurationKey => configurationKey.value !== undefined)
  .reduce((map, value) => {
    const innerProviderContainerConfigurations = map.get(value.providerId) || [];
    innerProviderContainerConfigurations.push(value);
    map.set(value.providerId, innerProviderContainerConfigurations);
    return map;
  }, new Map<string, IProviderContainerConfigurationPropertyRecorded[]>());

async function startContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  if (containerConnectionInfo.status === 'stopped') {
    setContainerStatusIsChanging(provider, containerConnectionInfo);
    await window.startProviderConnectionLifecycle(provider.internalId, containerConnectionInfo);
  }
}

async function stopContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  if (containerConnectionInfo.status === 'started') {
    setContainerStatusIsChanging(provider, containerConnectionInfo);
    await window.stopProviderConnectionLifecycle(provider.internalId, containerConnectionInfo);
  }
}

async function restartContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  await stopContainerProvider(provider, containerConnectionInfo);
  await startContainerProvider(provider, containerConnectionInfo);
}

async function deleteContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  if (containerConnectionInfo.status === 'stopped' || containerConnectionInfo.status === 'unknown') {
    setContainerStatusIsChanging(provider, containerConnectionInfo);
    await window.deleteProviderConnectionLifecycle(provider.internalId, containerConnectionInfo);
  }
}

function setContainerStatusIsChanging(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): void {
  containerConnectionStatus.set(getContainerConnectionName(provider, containerConnectionInfo), {
    inProgress: true,
    status: containerConnectionInfo.status,
  });
  containerConnectionStatus = containerConnectionStatus;
}

function getContainerConnectionName(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): string {
  return `${provider.name}-${containerConnectionInfo.name}`;
}

function isContainerConnectionStatusInProgress(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): boolean {
  return (
    containerConnectionStatus.get(`${provider.name}-${containerConnectionInfo.name}`) &&
    containerConnectionStatus.get(`${provider.name}-${containerConnectionInfo.name}`).inProgress
  );
}
</script>

<SettingsPage title="Resources">
  <span slot="subtitle">
    Additional provider information is available under <a
      href="/preferences/extensions"
      class="text-gray-400 underline underline-offset-2">Extensions</a>
  </span>
  <div>
    {#each $providerInfos as provider}
      <div class="bg-zinc-800 mt-5 rounded-md p-3 divide-x divide-gray-600 flex">
        <div>
          <!-- left col - podman icon/name + "create new" button -->
          <div class="min-w-[150px] max-w-[200px]">
            <div class="flex">
              {#if provider.images.icon}
                {#if typeof provider.images.icon === 'string'}
                  <img src="{provider.images.icon}" alt="{provider.name}" class="max-w-[40px] h-full" />
                  <!-- TODO check theme used for image, now use dark by default -->
                {:else}
                  <img src="{provider.images.icon.dark}" alt="{provider.name}" class="max-w-[40px]" />
                {/if}
              {/if}
              <span class="my-auto text-gray-300 ml-3 break-words">{provider.name}</span>
            </div>
            <div class="text-center mt-10">
              {#if provider.containerProviderConnectionCreation}
                <!-- create new podman machine button -->
                <Tooltip tip="Create new {provider.name} machine" bottom>
                  <button
                    class="pf-c-button pf-m-primary"
                    aria-label="Create new {provider.name} machine"
                    type="button"
                    on:click="{() => router.goto(`/preferences/provider/${provider.internalId}`)}">
                    Create new ...
                  </button>
                </Tooltip>
              {/if}
            </div>
          </div>
        </div>
        <!-- podman machines columns -->
        <div class="grow flex flex-wrap divide-gray-600 ml-2">
          {#each provider.containerConnections as container}
            <div class="px-5 py-2 w-[240px]">
              <div class="float-right text-gray-700 cursor-not-allowed">
                <Fa icon="{faArrowUpRightFromSquare}" />
              </div>
              <div class="{container.status !== 'started' ? 'text-gray-500' : ''} text-sm">
                {container.name}
              </div>
              <div class="flex">
                {#if container.status === 'started'}
                  <div class="my-auto w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="my-auto text-green-500 ml-1 font-bold text-[9px]">RUNNING</span>
                {:else if container.status === 'starting'}
                  <div class="my-auto w-3 h-3 bg-green-500 rounded-full"></div>
                  <span class="my-auto text-green-500 ml-1 font-bold text-[9px]">STARTING</span>
                {:else if container.status === 'stopped'}
                  <div class="my-auto w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span class="my-auto text-gray-500 ml-1 font-bold text-[9px]">OFF</span>
                {:else}
                  <div class="my-auto w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span class="my-auto text-gray-500 ml-1 font-bold text-[9px]">{container.status.toUpperCase()}</span>
                {/if}
              </div>

              {#if providerContainerConfiguration.has(provider.internalId)}
                <div class="flex mt-3 {container.status !== 'started' ? 'text-gray-500' : ''}">
                  {#each providerContainerConfiguration
                    .get(provider.internalId)
                    .filter(conf => conf.container === container.name) as connectionSetting}
                    {#if connectionSetting.format === 'cpu'}
                      <div class="mr-4">
                        <div class="text-[9px]">{connectionSetting.description}</div>
                        <div class="text-xs">{connectionSetting.value}</div>
                      </div>
                    {:else if connectionSetting.format === 'memory' || connectionSetting.format === 'diskSize'}
                      <div class="mr-4">
                        <div class="text-[9px]">{connectionSetting.description}</div>
                        <div class="text-xs">{filesize(connectionSetting.value)}</div>
                      </div>
                    {:else}
                      {connectionSetting.description}: {connectionSetting.value}
                    {/if}
                  {/each}
                </div>
              {/if}
              {#if container.lifecycleMethods && container.lifecycleMethods.length > 0}
                <div class="mt-2 relative">
                  <!-- TODO: see action available like machine infos -->
                  <div class="flex bg-zinc-900 w-fit rounded-lg m-auto">
                    {#if container.lifecycleMethods.includes('start')}
                      <Tooltip tip="Start" bottom>
                        <button
                          aria-label="Start"
                          class="{container.status !== 'stopped' ||
                          isContainerConnectionStatusInProgress(provider, container)
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'hover:text-gray-400'}"
                          on:click="{() => startContainerProvider(provider, container)}">
                          <Fa class="ml-5 mr-2.5 my-2" icon="{faPlay}" />
                        </button>
                      </Tooltip>
                    {/if}
                    {#if container.lifecycleMethods.includes('start') && container.lifecycleMethods.includes('stop')}
                      <Tooltip tip="Restart" bottom>
                        <button
                          aria-label="Restart"
                          class="{container.status !== 'started' ||
                          isContainerConnectionStatusInProgress(provider, container)
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'hover:text-gray-400'}"
                          on:click="{() => restartContainerProvider(provider, container)}">
                          <Fa class="mx-2.5 my-2" icon="{faRotateRight}" />
                        </button>
                      </Tooltip>
                    {/if}
                    {#if container.lifecycleMethods.includes('stop')}
                      <Tooltip tip="Stop" bottom>
                        <button
                          aria-label="Stop"
                          class="{container.status !== 'started' ||
                          isContainerConnectionStatusInProgress(provider, container)
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'hover:text-gray-400'}"
                          on:click="{() => stopContainerProvider(provider, container)}">
                          <Fa class="mx-2.5 my-2" icon="{faStop}" />
                        </button>
                      </Tooltip>
                    {/if}
                    {#if container.lifecycleMethods.includes('delete')}
                      <Tooltip tip="Delete" bottom>
                        <button
                          aria-label="Delete"
                          class="{(container.status !== 'stopped' && container.status !== 'unknown') ||
                          isContainerConnectionStatusInProgress(provider, container)
                            ? 'text-gray-700 cursor-not-allowed'
                            : 'hover:text-gray-400'}"
                          on:click="{() => deleteContainerProvider(provider, container)}">
                          <Fa class="mx-2.5 mr-5 my-2" icon="{faTrash}" />
                        </button>
                      </Tooltip>
                    {/if}
                  </div>
                </div>
              {/if}
              <div class="mt-1.5 text-gray-500 text-[9px]">
                <div>{provider.name} {provider.version ? `v${provider.version}` : ''}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
