<script lang="ts">
import { faArrowUpRightFromSquare } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import { providerInfos } from '../../stores/providers';
import type {
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '../../../../main/src/plugin/api/provider-info';
import { onDestroy, onMount } from 'svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { configurationProperties } from '../../stores/configurationProperties';
import type { ContainerProviderConnection, provider } from '@podman-desktop/api';
import type { Unsubscriber } from 'svelte/store';
import Tooltip from '../ui/Tooltip.svelte';
import { filesize } from 'filesize';
import { router } from 'tinro';
import SettingsPage from './SettingsPage.svelte';
import ConnectionStatus from '../ui/ConnectionStatus.svelte';
import { eventCollect } from './preferences-connection-rendering-task';
import { getProviderConnectionName, type IConnectionRestart, type IConnectionStatus } from './Util';
import EngineIcon from '../ui/EngineIcon.svelte';
import EmptyScreen from '../ui/EmptyScreen.svelte';
import PreferencesConnectionActions from './PreferencesConnectionActions.svelte';
import PreferencesConnectionsEmptyRendering from './PreferencesConnectionsEmptyRendering.svelte';

interface IProviderContainerConfigurationPropertyRecorded extends IConfigurationPropertyRecordedSchema {
  value?: any;
  container: string;
  providerId: string;
}

export let properties: IConfigurationPropertyRecordedSchema[] = [];
let providers: ProviderInfo[] = [];
$: containerConnectionStatus = new Map<string, IConnectionStatus>();

let isStatusUpdated = false;

let configurationKeys: IConfigurationPropertyRecordedSchema[];
let restartingQueue: IConnectionRestart[] = [];

let providersUnsubscribe: Unsubscriber;
let configurationPropertiesUnsubscribe: Unsubscriber;
onMount(() => {
  configurationPropertiesUnsubscribe = configurationProperties.subscribe(value => {
    properties = value;
  });

  providersUnsubscribe = providerInfos.subscribe(providerInfosValue => {
    providers = providerInfosValue;
    const connectionNames = [];
    providers.forEach(provider => {
      provider.containerConnections.forEach(container => {
        const containerConnectionName = getProviderConnectionName(provider, container);
        connectionNames.push(containerConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(containerConnectionName) ||
          containerConnectionStatus.get(containerConnectionName).status !== container.status
        ) {
          isStatusUpdated = true;
          const containerToRestart = getContainerRestarting(provider.internalId, container.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: container.status,
            });
            startConnectionProvider(provider, container, containerToRestart.loggerHandlerKey);
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: container.status,
            });
          }
        }
      });
      provider.kubernetesConnections.forEach(connection => {
        const containerConnectionName = getProviderConnectionName(provider, connection);
        connectionNames.push(containerConnectionName);
        // update the map only if the container state is different from last time
        if (
          !containerConnectionStatus.has(containerConnectionName) ||
          containerConnectionStatus.get(containerConnectionName).status !== connection.status
        ) {
          isStatusUpdated = true;
          const containerToRestart = getContainerRestarting(provider.internalId, connection.name);
          if (containerToRestart) {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: true,
              action: 'restart',
              status: connection.status,
            });
            startConnectionProvider(provider, connection, containerToRestart.loggerHandlerKey);
          } else {
            containerConnectionStatus.set(containerConnectionName, {
              inProgress: false,
              action: undefined,
              status: connection.status,
            });
          }
        }
      });
    });
    // if a machine has been deleted we need to clean its old stored status
    containerConnectionStatus.forEach((v, k) => {
      if (!connectionNames.find(name => name === k)) {
        containerConnectionStatus.delete(k);
      }
    });
    if (isStatusUpdated) {
      isStatusUpdated = false;
      containerConnectionStatus = containerConnectionStatus;
    }
  });
});

function getContainerRestarting(provider: string, container: string): IConnectionRestart {
  const containerToRestart = restartingQueue.filter(c => c.provider === provider && c.container === container)[0];
  if (containerToRestart) {
    restartingQueue = restartingQueue.filter(c => c.provider !== provider && c.container !== container);
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

function updateContainerStatus(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo,
  action?: string,
  error?: string,
  inProgress?: boolean,
): void {
  const containerConnectionName = getProviderConnectionName(provider, containerConnectionInfo);
  if (error) {
    const currentStatus = containerConnectionStatus.get(containerConnectionName);
    containerConnectionStatus.set(containerConnectionName, {
      ...currentStatus,
      inProgress: false,
      error,
    });
  } else if (action) {
    containerConnectionStatus.set(containerConnectionName, {
      inProgress: inProgress === undefined ? true : inProgress,
      action: action,
      status: containerConnectionInfo.status,
    });
  }
  containerConnectionStatus = containerConnectionStatus;
}

function addConnectionToRestartingQueue(connection: IConnectionRestart) {
  restartingQueue.push(connection);
}

async function startConnectionProvider(
  provider: ProviderInfo,
  containerConnectionInfo: ProviderContainerConnectionInfo | ProviderKubernetesConnectionInfo,
  loggerHandlerKey: symbol,
) {
  await window.startProviderConnectionLifecycle(
    provider.internalId,
    containerConnectionInfo,
    loggerHandlerKey,
    eventCollect,
  );
}
</script>

<SettingsPage title="Resources">
  <span slot="subtitle" class:hidden="{providers.length === 0}">
    Additional provider information is available under <a
      href="/preferences/extensions"
      class="text-gray-700 underline underline-offset-2">Extensions</a>
  </span>
  <div class="w-full h-full">
    <EmptyScreen
      aria-label="no-resource-panel"
      icon="{EngineIcon}"
      title="No resources found"
      message="Start an extension that manages containers or Kubernetes engines"
      hidden="{providers.length > 0}" />
    {#each providers as provider}
      <div class="bg-charcoal-600 mb-5 rounded-md p-3 divide-x divide-gray-900 flex">
        <div>
          <!-- left col - provider icon/name + "create new" button -->
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
              <span class="my-auto text-gray-400 ml-3 break-words">{provider.name}</span>
            </div>
            <div class="text-center mt-10">
              {#if provider.containerProviderConnectionCreation || provider.kubernetesProviderConnectionCreation}
                {@const providerDisplayName =
                  (provider.containerProviderConnectionCreation
                    ? provider.containerProviderConnectionCreationDisplayName || undefined
                    : provider.kubernetesProviderConnectionCreation
                    ? provider.kubernetesProviderConnectionCreationDisplayName
                    : undefined) || provider.name}
                {@const buttonTitle =
                  (provider.containerProviderConnectionCreation
                    ? provider.containerProviderConnectionCreationButtonTitle || undefined
                    : provider.kubernetesProviderConnectionCreation
                    ? provider.kubernetesProviderConnectionCreationButtonTitle
                    : undefined) || 'Create new'}
                <!-- create new provider button -->
                <Tooltip tip="Create new {providerDisplayName}" bottom>
                  <button
                    class="pf-c-button pf-m-primary"
                    aria-label="Create new {providerDisplayName}"
                    type="button"
                    on:click="{() => router.goto(`/preferences/provider/${provider.internalId}`)}">
                    {buttonTitle} ...
                  </button>
                </Tooltip>
              {/if}
            </div>
          </div>
        </div>
        <!-- providers columns -->
        <div class="grow flex flex-wrap divide-gray-900 ml-2">
          <PreferencesConnectionsEmptyRendering
            message="{provider.emptyConnectionMarkdownDescription}"
            hidden="{provider.containerConnections.length > 0 || provider.kubernetesConnections.length > 0}" />
          {#each provider.containerConnections as container}
            <div class="px-5 py-2 w-[240px]">
              <div class="float-right text-gray-900 cursor-not-allowed">
                <Fa icon="{faArrowUpRightFromSquare}" />
              </div>
              <div class="{container.status !== 'started' ? 'text-gray-900' : ''} text-sm">
                {container.name}
              </div>
              <div class="flex">
                <ConnectionStatus status="{container.status}" />
                {#if containerConnectionStatus.has(getProviderConnectionName(provider, container))}
                  {@const status = containerConnectionStatus.get(getProviderConnectionName(provider, container))}
                  {#if status.error}
                    <button
                      class="ml-3 text-[9px] text-red-500 underline"
                      on:click="{() => window.events?.send('toggle-task-manager', '')}">{status.action} failed</button>
                  {/if}
                {/if}
              </div>

              {#if providerContainerConfiguration.has(provider.internalId)}
                <div class="flex mt-3 {container.status !== 'started' ? 'text-gray-900' : ''}">
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
              <PreferencesConnectionActions
                provider="{provider}"
                connection="{container}"
                connectionStatuses="{containerConnectionStatus}"
                updateConnectionStatus="{updateContainerStatus}"
                addConnectionToRestartingQueue="{addConnectionToRestartingQueue}" />
              <div class="mt-1.5 text-gray-900 text-[9px]">
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
              <div class="mt-2">
                <div class="text-gray-700 text-xs">Kubernetes endpoint</div>
                <div class="mt-1">
                  <span class="my-auto text-xs" class:text-gray-900="{kubeConnection.status !== 'started'}"
                    >{kubeConnection.endpoint.apiURL}</span>
                </div>
              </div>
              <PreferencesConnectionActions
                provider="{provider}"
                connection="{kubeConnection}"
                connectionStatuses="{containerConnectionStatus}"
                updateConnectionStatus="{updateContainerStatus}"
                addConnectionToRestartingQueue="{addConnectionToRestartingQueue}" />
            </div>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</SettingsPage>
