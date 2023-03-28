<script lang="ts">
import { faArrowUpRightFromSquare, faPlay, faRotateRight, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
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
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import { ConnectionCallback, eventCollect, startTask } from './preferences-connection-rendering-task';
import { createConnectionsInfo } from '/@/stores/create-connections';
import type { IContainerStatus } from './Util';
import LoadingIcon from '../ui/LoadingIcon.svelte';
import LoadingIconButton from '../ui/LoadingIconButton.svelte';

interface IProviderContainerConfigurationPropertyRecorded extends IConfigurationPropertyRecordedSchema {
  value?: any;
  container: string;
  providerId: string;
}

interface IContainerRestart {
  provider: string;
  container: string;
  loggerHandlerKey: symbol;
}

export let properties: IConfigurationPropertyRecordedSchema[] = [];
let providers: ProviderInfo[] = [];
$: containerConnectionStatus = new Map<string, IContainerStatus>();

let isStatusUpdated = false;

let configurationKeys: IConfigurationPropertyRecordedSchema[];
let loggerHandlerKey: symbol | undefined;
let containersRestarting: IContainerRestart[] = [];

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
          !containerConnectionStatus.has(containerConnectionName) ||
          containerConnectionStatus.get(containerConnectionName).status !== container.status
        ) {
          isStatusUpdated = true;
          const restartContainer = isContainerRestarting(provider.internalId, container.name)
          if (restartContainer) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: container.status,
            });
            startContainerProvider(provider, container, restartContainer.loggerHandlerKey);
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: container.status,
            });
          }
        }
      });
    });
    if (isStatusUpdated) {
      isStatusUpdated = false;
      containerConnectionStatus = containerConnectionStatus;
    }
  });
});

function isContainerRestarting(provider: string, container: string): IContainerRestart {
  const containerToRestart = containersRestarting.filter(c => c.provider === provider && c.container === container)[0];
  if (containerToRestart) {
    containersRestarting = containersRestarting.filter(c => c.provider !== provider && c.container !== container);
  }
  return containerToRestart;
}

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

function getLoggerHandler(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): ConnectionCallback {
  return {
    log: () => {},
    warn: () => {},
    error: args => {
      setContainerStatusUpdateFailed(provider, containerConnectionInfo, 'start', args);
    },
    onEnd: () => {},
  };
}

async function startContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  loggerHandlerKey?: symbol
): Promise<void> {
  try {
    if (containerConnectionInfo.status === 'stopped') {
      if (!loggerHandlerKey) {
        setContainerStatusIsChanging(provider, 'start', containerConnectionInfo);
        loggerHandlerKey = startTask(
          `Start ${provider.name} ${containerConnectionInfo.name}`,
          `/preferences/resources`,
          getLoggerHandler(provider, containerConnectionInfo),
        );  
      }          
      await window.startProviderConnectionLifecycle(
        provider.internalId,
        containerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function stopContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  try {
    if (containerConnectionInfo.status === 'started') {      
      setContainerStatusIsChanging(provider, 'stop', containerConnectionInfo);
      const loggerHandlerKey = startTask(
        `Stop ${provider.name} ${containerConnectionInfo.name}`,
        `/preferences/resources`,
        getLoggerHandler(provider, containerConnectionInfo),
      );      
      await window.stopProviderConnectionLifecycle(
        provider.internalId,
        containerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

async function restartContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  if (containerConnectionInfo.status === 'started') {
    setContainerStatusIsChanging(provider, 'restart', containerConnectionInfo);  
    const loggerHandlerKey = startTask(
      `Restart ${provider.name} ${containerConnectionInfo.name}`,
      `/preferences/resources`,
      getLoggerHandler(provider, containerConnectionInfo),
    );
    await window.stopProviderConnectionLifecycle(
      provider.internalId, 
      containerConnectionInfo, 
      loggerHandlerKey,
      eventCollect,
    );
  }
}

async function deleteContainerProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): Promise<void> {
  try {
    if (containerConnectionInfo.status === 'stopped' || containerConnectionInfo.status === 'unknown') {
      setContainerStatusIsChanging(provider, 'delete', containerConnectionInfo);
      const loggerHandlerKey = startTask(
        `Delete ${provider.name} ${containerConnectionInfo.name}`,
        `/preferences/resources`,
        getLoggerHandler(provider, containerConnectionInfo),
      );
      await window.deleteProviderConnectionLifecycle(
        provider.internalId,
        containerConnectionInfo,
        loggerHandlerKey,
        eventCollect,
      );
    }
  } catch (e) {
    console.error(e);
  }
}

function setContainerStatusIsChanging(
  provider: ProviderInfo,
  action: string,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): void {
  containerConnectionStatus.set(getContainerConnectionName(provider, containerConnectionInfo), {
    inProgress: true,
    action: action,
    status: containerConnectionInfo.status,
  });
  containerConnectionStatus = containerConnectionStatus;
}

function setContainerStatusUpdateFailed(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  failedAction: string,
  error: string,
): void {
  const containerConnectionName = getContainerConnectionName(provider, containerConnectionInfo);
  const currentStatus = containerConnectionStatus.get(containerConnectionName);
  containerConnectionStatus.set(containerConnectionName, {
    ...currentStatus,
    failedAction,
    error,
  });
  containerConnectionStatus = containerConnectionStatus;
}

function getContainerConnectionName(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
): string {
  return `${provider.name}-${containerConnectionInfo.name}`;
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
              {#if provider.containerProviderConnectionCreation || provider.kubernetesProviderConnectionCreation}
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
                <ConnectionStatus status="{container.status}" />
                {#if containerConnectionStatus.has(getContainerConnectionName(provider, container))}
                  {@const status = containerConnectionStatus.get(getContainerConnectionName(provider, container))}
                  {#if status.error}
                    <button
                      class="ml-3 text-[9px] text-red-500 underline"
                      on:click="{() => window.events?.send('toggle-task-manager', '')}"
                      >{status.failedAction} failed</button>
                  {/if}
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
              {#if containerConnectionStatus.has(getContainerConnectionName(provider, container))}
                {@const state = containerConnectionStatus.get(getContainerConnectionName(provider, container))}
                {#if container.lifecycleMethods && container.lifecycleMethods.length > 0}
                  <div class="mt-2 relative">
                    <!-- TODO: see action available like machine infos -->
                    <div class="flex bg-zinc-900 w-fit rounded-lg m-auto">
                      {#if container.lifecycleMethods.includes('start')}
                        <div class="ml-2">
                          <LoadingIconButton
                            clickAction="{() => startContainerProvider(provider, container)}"
                            action="start"
                            icon="{faPlay}"
                            state="{state}"
                            leftPosition="left-[0.15rem]" />
                        </div>
                      {/if}
                      {#if container.lifecycleMethods.includes('start') && container.lifecycleMethods.includes('stop')}
                        <LoadingIconButton
                          clickAction="{() => restartContainerProvider(provider, container)}"
                          action="restart"
                          icon="{faRotateRight}"
                          state="{state}"
                          leftPosition="left-1.5" />
                      {/if}
                      {#if container.lifecycleMethods.includes('stop')}
                        <LoadingIconButton
                          clickAction="{() => stopContainerProvider(provider, container)}"
                          action="stop"
                          icon="{faStop}"
                          state="{state}"
                          leftPosition="left-[0.22rem]" />
                      {/if}
                      {#if container.lifecycleMethods.includes('delete')}
                        <div class="mr-2 text-sm">
                          <LoadingIconButton
                            clickAction="{() => deleteContainerProvider(provider, container)}"
                            action="delete"
                            icon="{faTrash}"
                            state="{state}"
                            leftPosition="left-1" />
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/if}
              <div class="mt-1.5 text-gray-500 text-[9px]">
                <div>{provider.name} {provider.version ? `v${provider.version}` : ''}</div>
              </div>
            </div>
          {/each}
          {#each provider.kubernetesConnections as kubeConnection}
            <div class="px-5 py-2 w-[240px]">
              <div class="text-sm">
                {kubeConnection.name}
              </div>
              <div class="flex mt-1">
                <ConnectionStatus status="{kubeConnection.status}" />
              </div>
              {#if kubeConnection.status === 'started'}
                <div class="mt-2">
                  <div class="text-gray-400 text-xs">Kubernetes endpoint</div>
                  <div class="mt-1">
                    <span class="my-auto text-xs">{kubeConnection.endpoint.apiURL}</span>
                  </div>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
