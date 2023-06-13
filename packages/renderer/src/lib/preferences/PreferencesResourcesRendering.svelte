<script lang="ts">
import { faArrowUpRightFromSquare, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import Fa from 'svelte-fa/src/fa.svelte';
import { providerInfos } from '../../stores/providers';
import type {
  CheckStatus,
  ProviderContainerConnectionInfo,
  ProviderInfo,
  ProviderKubernetesConnectionInfo,
} from '../../../../main/src/plugin/api/provider-info';
import { onDestroy, onMount } from 'svelte';
import type { IConfigurationPropertyRecordedSchema } from '../../../../main/src/plugin/configuration-registry';
import { configurationProperties } from '../../stores/configurationProperties';
import type { ContainerProviderConnection, ProviderDetectionCheck, provider } from '@podman-desktop/api';
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
import Modal from '../dialogs/Modal.svelte';
import ProviderLogo from '../dashboard/ProviderLogo.svelte';

interface IProviderContainerConfigurationPropertyRecorded extends IConfigurationPropertyRecordedSchema {
  value?: any;
  container: string;
  providerId: string;
}

export let properties: IConfigurationPropertyRecordedSchema[] = [];
let providers: ProviderInfo[] = [];
$: containerConnectionStatus = new Map<string, IConnectionStatus>();
$: providerInstallationInProgress = new Map<string, boolean>();

let isStatusUpdated = false;
let displayInstallModal = false;
let installModalProvider: { provider: ProviderInfo, displayName: string };
let doExecuteAfterInstallation: () => void;
$: preflightChecks = [];

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
      if (installModalProvider 
          && doExecuteAfterInstallation 
          && provider.name === installModalProvider.provider.name 
          && (provider.status === 'ready' || provider.status === 'installed')) {
        installModalProvider = undefined;
        doExecuteAfterInstallation();
      }

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

async function doCreateNew(provider: ProviderInfo, displayName: string) {
  displayInstallModal = false;
  if (provider.status == 'not-installed') {
    providerInstallationInProgress.set(provider.name, true);
    providerInstallationInProgress = providerInstallationInProgress;
    installModalProvider = { provider, displayName };
    doExecuteAfterInstallation = () => router.goto(`/preferences/provider/${provider.internalId}`);
    performInstallation(provider);
  } else {
    router.goto(`/preferences/provider/${provider.internalId}`);
  }
}

async function performInstallation(provider: ProviderInfo) {
  const checksStatus = [];
  let checkSuccess = false;
  let currentCheck: CheckStatus;
  try {
    checkSuccess = await window.runInstallPreflightChecks(provider.internalId, {
      endCheck: status => {
        if (currentCheck) {
          currentCheck = status;
        } else {
          return;
        }
        if (currentCheck.successful === false) {
          checksStatus.push(currentCheck);
          preflightChecks = checksStatus;
        }
      },
      startCheck: status => {
        currentCheck = status;
        if (currentCheck.successful === false) {
          preflightChecks = [...checksStatus, currentCheck];
        }        
      },
    });
  } catch (err) {
    console.error(err);
  }
  if (checkSuccess) {
    await window.installProvider(provider.internalId);
    // reset checks
    preflightChecks = [];
  } else {
    displayInstallModal = true;
  }
  providerInstallationInProgress.set(provider.name, false);
  providerInstallationInProgress = providerInstallationInProgress;
}

function hideInstallModal() {
  displayInstallModal = false;
}

function openLink(e: MouseEvent, url: string): void {
  e.preventDefault();
  e.stopPropagation();
  window.openExternal(url);
}
</script>

<SettingsPage title="Resources">
  <span slot="subtitle" class="{providers.length > 0 ? '' : 'hidden'}">
    Additional provider information is available under <a
      href="/preferences/extensions"
      class="text-gray-700 underline underline-offset-2">Extensions</a>
  </span>
  <div>
    {#if providers.length === 0}
      <div aria-label="no-resource-panel">
        <EmptyScreen
          icon="{EngineIcon}"
          title="No resources found"
          message="Start an extension that manages containers or Kubernetes engines"
          class="bg-charcoal-600 mt-5 pb-10" />
      </div>
    {:else}
      {#each providers as provider}
        <div class="bg-charcoal-600 mt-5 rounded-md p-3 divide-x divide-gray-900 flex">
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
                      on:click="{() => doCreateNew(provider, providerDisplayName)}">                      
                        {#if providerInstallationInProgress.get(provider.name) === true}                        
                          <i class="pf-c-button__progress">
                            <span class="pf-c-spinner pf-m-md" role="progressbar">
                              <span class="pf-c-spinner__clipper"></span>
                              <span class="pf-c-spinner__lead-ball"></span>
                              <span class="pf-c-spinner__tail-ball"></span>
                            </span>
                          </i>
                        {/if}                      
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
                        on:click="{() => window.events?.send('toggle-task-manager', '')}"
                        >{status.action} failed</button>
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
    {/if}
  </div>
  {#if displayInstallModal && installModalProvider}
  <Modal on:close="{() => hideInstallModal()}">
    <div
      class="inline-block w-full overflow-hidden text-left transition-all transform bg-charcoal-600 z-50 rounded-xl shadow-xl shadow-neutral-900">
      
        <div class="flex items-center justify-between px-5 py-4 mb-4">
          <h1 class="text-md font-semibold">Create a new {installModalProvider.displayName}</h1>
  
          <button class="hover:text-gray-300 px-2 py-1" on:click="{() => hideInstallModal()}">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
        </div>
      <div class="overflow-y-auto px-4 pb-4">        
        <div class="flex flex-col rounded-lg">
          <div class="mx-auto max-w-[250px] mb-5">
            <ProviderLogo provider="{installModalProvider.provider}" />
          </div>
          <div class="flex flex-row mx-auto text-md">
            Some system requirements are missing.
          </div>
          <div class="flex flex-col min-h-[150px] mt-5 mx-auto py-4 px-10 rounded-md bg-charcoal-800">
            {#each preflightChecks as preCheck}
              <div class="flex flex-row mb-2 mx-auto">
                <Fa icon="{faCircleXmark}" class="text-red-500 mt-0.5" />
                <div class="flex flex-col ml-1 text-sm">
                  {#if preCheck.description}                  
                    <span class="w-full">{preCheck.description}</span>
                    {#if preCheck.docLinks}
                      <div class="flex flex-row mt-0.5">
                        <span class="mr-1">See:</span>
                        {#each preCheck.docLinks as link}
                          <a href="{link.url}" target="_blank" class="mr-1" on:click="{e => openLink(e, link.url)}">{link.title}</a>
                        {/each}
                      </div>              
                    {/if}
                  
                  {:else}
                    {preCheck.name}          
                {/if}

                </div>
                
              </div>
            {/each}
          </div>
          <div class="text-xs text-gray-800 mt-2  text-center">
            Be sure that your system fulfills all the requirements above before proceeding
          </div>
          <div class="flex flex-row justify-end w-full pt-2">
            <button aria-label="Cancel" class="text-xs hover:underline mr-3" on:click="{() => hideInstallModal()}"
              >Cancel</button>
            <button
              class="pf-c-button pf-m-primary"
              type="button"
              on:click="{() => doCreateNew(installModalProvider.provider, installModalProvider.displayName)}">Next</button>
          </div>
        </div>        
      </div>
    </div>
  </Modal>
  {/if}

</SettingsPage>
